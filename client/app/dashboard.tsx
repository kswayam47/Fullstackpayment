import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Platform, Animated, Easing } from 'react-native';
import { getStats, getPayments, getToken } from '../services/api';
import * as SecureStore from 'expo-secure-store';
import { BarChart } from 'react-native-chart-kit';
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { Card, Title, Paragraph, Surface, Button, Text, ActivityIndicator, Avatar, Chip } from 'react-native-paper';
import { Colors } from '../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { logout } from '../utils/auth';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

const DashboardScreen = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [recent, setRecent] = useState<any[]>([]);
  const [revenueAnim] = useState(new Animated.Value(0));
  const [paymentsAnim] = useState(new Animated.Value(0));
  const [failedAnim] = useState(new Animated.Value(0));
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(Dimensions.get('window').width <= 600);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getStats();
      setStats(res.data);
      Animated.timing(revenueAnim, { toValue: res.data.totalRevenue, duration: 1000, useNativeDriver: false, easing: Easing.out(Easing.exp) }).start();
      Animated.timing(paymentsAnim, { toValue: res.data.totalPayments, duration: 1000, useNativeDriver: false, easing: Easing.out(Easing.exp) }).start();
      Animated.timing(failedAnim, { toValue: res.data.failedCount, duration: 1000, useNativeDriver: false, easing: Easing.out(Easing.exp) }).start();
    } catch (e) {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecent = async () => {
    try {
      const res = await getPayments({ page: 1, limit: 5 });
      setRecent(res.data.data);
    } catch {
      setRecent([]);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchStats();
      await fetchRecent();
    })();
    (async () => {
      const token = await getToken();
      if (token) {
        const payload = parseJwt(token);
        setRole(payload.role || '');
        setUsername(payload.username || '');
      }
    })();
    // Real-time updates for dashboard
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socket.on('paymentCreated', () => {
      fetchStats();
      fetchRecent();
      if (Platform.OS === 'web') {
        alert('Dashboard updated: new payment!');
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const onChange = ({ window }: { window: any }) => {
      setIsMobile(window.width <= 600);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove && subscription.remove();
  }, []);

  if (loading || !stats) return <ActivityIndicator style={{ flex: 1, marginTop: 64 }} size="large" />;

  const barChartData = {
    labels: stats.dailyRevenue.map((d: any) => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        data: stats.dailyRevenue.map((d: any) => Number(d.revenue)),
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.gradientBg}>
      <Surface style={styles.header} elevation={4}>
        <Avatar.Icon size={48} icon="account-circle" style={{ backgroundColor: Colors.light.tint, marginRight: 16 }} />
        <View style={{ flex: 1 }}>
          <Title style={styles.headerTitle}>Welcome, {username || 'User'}</Title>
          <Paragraph style={styles.roleText}>{role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}</Paragraph>
        </View>
        <Button mode="contained" style={styles.sendBtn} icon="send" onPress={() => router.push('/add-payment')}>Send Money</Button>
        {!isMobile && (
          <Button mode="outlined" style={styles.logoutBtn} icon="logout" onPress={() => router.replace('/login')}>Logout</Button>
        )}
      </Surface>
      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Paragraph style={styles.metricLabel}>Total Revenue</Paragraph>
            <Text style={styles.metricValue}>${stats.totalRevenue.toFixed(2)}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Paragraph style={styles.metricLabel}>Total Payments</Paragraph>
            <Text style={styles.metricValue}>{stats.totalPayments}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Paragraph style={styles.metricLabel}>Failed</Paragraph>
            <Text style={[styles.metricValue, { color: '#e53935' }]}>{stats.failedCount}</Text>
          </Card.Content>
        </Card>
      </View>
      <Card style={styles.chartCard}>
        <Card.Title title="Revenue (last 7 days)" left={(props: any) => <Icon {...props} name="chart-line" size={24} color={Colors.light.tint} />} />
        <Card.Content>
          <LineChart
            data={barChartData}
            width={Dimensions.get('window').width - 48}
            height={220}
            chartConfig={{
              backgroundColor: Colors.light.surface,
              backgroundGradientFrom: Colors.light.card,
              backgroundGradientTo: Colors.light.background,
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
              labelColor: (opacity = 1) => Colors.light.text,
              propsForBackgroundLines: { stroke: Colors.light.gray200, strokeDasharray: '4' },
              propsForLabels: { fontWeight: 'bold' },
              style: { borderRadius: 8 },
              propsForDots: { r: '6', strokeWidth: '2', stroke: Colors.light.primary },
            }}
            bezier
            withInnerLines
            withVerticalLabels
            withHorizontalLabels
            segments={5}
            yAxisSuffix=""
            yAxisInterval={1}
            yAxisLabel=""
            style={{ borderRadius: 12, marginTop: 8 }}
          />
        </Card.Content>
      </Card>
      <Title style={styles.sectionTitle}>Recent Activity</Title>
      <View style={styles.activityFeed}>
        {recent.length === 0 ? (
          <Text style={styles.emptyText}>No recent payments.</Text>
        ) : recent.map((item, idx) => (
          <Card key={item.id} style={styles.activityCard}>
            <Card.Content style={styles.activityContent}>
              <Avatar.Text size={36} label={item.sender?.username?.[0]?.toUpperCase() || '?'} style={{ backgroundColor: Colors.light.tint, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>{item.sender?.username} ➔ {item.receiver?.username}</Text>
                <Text style={styles.activitySubtitle}>${item.amount} • {item.status} • {new Date(item.createdAt).toLocaleString()}</Text>
              </View>
              <Chip style={[styles.statusChip, { backgroundColor: item.status === 'success' ? '#43a047' : item.status === 'failed' ? '#e53935' : '#fbc02d' }]} textStyle={{ color: '#fff' }}>{item.status}</Chip>
            </Card.Content>
          </Card>
        ))}
      </View>
      <View style={styles.navRow}>
        <Card style={[styles.navCard, isMobile && styles.navCardMobile]} onPress={() => router.push('/payments')}>
          <Card.Content style={styles.navCardContent}>
            <Icon name="format-list-bulleted" size={28} color={Colors.light.tint} style={{ marginRight: 12 }} />
            <Text style={styles.navText}>View Payments</Text>
          </Card.Content>
        </Card>
        {role === 'admin' && (
          <Card style={styles.navCard} onPress={() => router.push('/users')}>
            <Card.Content style={styles.navCardContent}>
              <Icon name="account-group" size={28} color={Colors.light.tint} style={{ marginRight: 12 }} />
              <Text style={styles.navText}>Manage Users</Text>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    flexGrow: 1,
    padding: 0,
    backgroundColor: 'linear-gradient(180deg, #e3f2fd 0%, #f5fafd 100%)',
    minHeight: '100%',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, padding: 16, borderRadius: 16, backgroundColor: '#fff', elevation: 4, marginTop: 16, marginHorizontal: 12 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: Colors.light.tint },
  roleText: { color: Colors.light.icon, fontSize: 15 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, marginHorizontal: 12 },
  metricCard: { flex: 1, marginHorizontal: 6, borderRadius: 16, backgroundColor: '#f5fafd', elevation: 2 },
  metricLabel: { color: Colors.light.icon, fontSize: 15 },
  metricValue: { fontSize: 28, fontWeight: 'bold', color: Colors.light.text, marginTop: 4 },
  chartCard: { borderRadius: 16, marginBottom: 24, backgroundColor: '#fff', marginHorizontal: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 20, marginBottom: 8, color: Colors.light.tint },
  activityFeed: { marginHorizontal: 12, marginBottom: 24 },
  activityCard: { borderRadius: 14, backgroundColor: '#fff', marginBottom: 10, elevation: 2 },
  activityContent: { flexDirection: 'row', alignItems: 'center' },
  activityTitle: { fontWeight: 'bold', fontSize: 16, color: Colors.light.text },
  activitySubtitle: { color: Colors.light.icon, fontSize: 13 },
  statusChip: { marginLeft: 8, minWidth: 70, justifyContent: 'center' },
  navRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8, marginHorizontal: 12 },
  navCard: { flexBasis: '48%', marginBottom: 12, borderRadius: 14, backgroundColor: '#fff', elevation: 2 },
  navCardContent: { flexDirection: 'row', alignItems: 'center' },
  navText: { fontSize: 16, fontWeight: 'bold', color: Colors.light.tint },
  sendBtn: { marginLeft: 'auto', backgroundColor: Colors.light.tint, marginRight: 12 },
  logoutBtn: { backgroundColor: Colors.light.background, borderColor: Colors.light.tint, borderWidth: 1 },
  emptyText: { textAlign: 'center', color: Colors.light.icon, marginTop: 32 },
  logoutBtnMobile: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    borderColor: Colors.light.tint,
    borderWidth: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minWidth: 44,
    minHeight: 44,
  },
  // --- Mobile nav row/button tweaks ---
  navCardMobile: {
    flex: 1,
    marginRight: 8,
    height: 56,
    justifyContent: 'center',
  },
  sendBtnMobile: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    marginLeft: 0,
    marginRight: 0,
    alignSelf: 'stretch',
    justifyContent: 'center',
    elevation: 2,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    zIndex: 20,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  logoutBtnTopBar: {
    borderColor: Colors.light.tint,
    borderWidth: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minWidth: 44,
    minHeight: 44,
    marginLeft: 8,
  },
});

export default DashboardScreen; 