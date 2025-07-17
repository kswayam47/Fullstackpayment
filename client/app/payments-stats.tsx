import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { getStats } from '../services/api';
import { LineChart } from 'react-native-chart-kit';
import { Card, Title, Paragraph, Surface, Button, Text, ActivityIndicator, Avatar } from 'react-native-paper';
import { Colors } from '../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

const PaymentsStatsScreen = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(Dimensions.get('window').width <= 600);
  React.useEffect(() => {
    const onChange = ({ window }: { window: { width: number; height: number } }) => setIsMobile(window.width <= 600);
    const sub = Dimensions.addEventListener('change', onChange);
    return () => sub?.remove && sub.remove();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getStats();
        setStats(res.data);
      } catch (e) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1, marginTop: 64 }} size="large" />;
  if (!stats) return <Text style={{ color: 'red', textAlign: 'center', marginTop: 64 }}>Failed to load stats</Text>;

  const chartData = {
    labels: stats.dailyRevenue.map((d: any) => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        data: stats.dailyRevenue.map((d: any) => Number(d.revenue)),
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isMobile ? (
        <Surface style={styles.headerMobile} elevation={4}>
          <View style={styles.headerMobileTop}>
            <Avatar.Icon size={40} icon="chart-line" style={{ backgroundColor: Colors.light.tint, marginRight: 12, marginBottom: 8 }} />
            <Title style={styles.headerTitleMobile}>Payments Stats</Title>
          </View>
          <View style={styles.headerMobileBtnRow}>
            <Button mode="outlined" icon="view-dashboard" style={styles.headerMobileBtn} onPress={() => router.push('/dashboard')}>Dashboard</Button>
            <Button mode="outlined" icon="logout" style={styles.headerMobileBtn} onPress={() => router.replace('/login')}>Logout</Button>
          </View>
        </Surface>
      ) : (
        <Surface style={styles.header} elevation={4}>
          <Avatar.Icon size={40} icon="chart-line" style={{ backgroundColor: Colors.light.tint, marginRight: 12 }} />
          <Title style={styles.headerTitle}>Payments Stats</Title>
          <View style={{ flexDirection: 'row', marginLeft: 'auto', gap: 12 }}>
            <Button mode="outlined" style={styles.logoutBtn} icon="view-dashboard" onPress={() => router.push('/dashboard')}>Dashboard</Button>
            <Button mode="outlined" style={styles.logoutBtn} icon="logout" onPress={() => router.replace('/login')}>Logout</Button>
          </View>
        </Surface>
      )}
      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Paragraph style={styles.metricLabel}>Total Payments</Paragraph>
            <Title style={styles.metricValue}>{stats.totalPayments}</Title>
          </Card.Content>
        </Card>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Paragraph style={styles.metricLabel}>Total Revenue</Paragraph>
            <Title style={styles.metricValue}>${stats.totalRevenue.toFixed(2)}</Title>
          </Card.Content>
        </Card>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Paragraph style={styles.metricLabel}>Failed</Paragraph>
            <Title style={[styles.metricValue, { color: '#e53935' }]}>{stats.failedCount}</Title>
          </Card.Content>
        </Card>
      </View>
      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Paragraph style={styles.metricLabel}>Average Payment</Paragraph>
            <Title style={styles.metricValue}>${(stats.totalRevenue / (stats.totalPayments || 1)).toFixed(2)}</Title>
          </Card.Content>
        </Card>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Paragraph style={styles.metricLabel}>Most Common Method</Paragraph>
            <Title style={styles.metricValue}>{stats.mostCommonMethod || 'N/A'}</Title>
          </Card.Content>
        </Card>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Paragraph style={styles.metricLabel}>Success Rate</Paragraph>
            <Title style={styles.metricValue}>{stats.totalPayments ? (((stats.totalPayments - stats.failedCount) / stats.totalPayments) * 100).toFixed(1) + '%' : 'N/A'}</Title>
          </Card.Content>
        </Card>
      </View>
      <Card style={styles.chartCard}>
        <Card.Title title="Revenue (last 7 days)" left={(props: any) => <Icon {...props} name="chart-line" size={24} color={Colors.light.tint} />} />
        <Card.Content>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 64}
            height={260}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#f5fafd',
              backgroundGradientTo: '#e3f2fd',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(44, 62, 80,${opacity})`,
              propsForDots: { r: '6', strokeWidth: '2', stroke: '#1976d2' },
              propsForBackgroundLines: { stroke: '#e0e0e0', strokeDasharray: '4' },
              propsForLabels: { fontWeight: 'bold' },
              style: { borderRadius: 8 },
              fillShadowGradient: '#2196f3',
              fillShadowGradientOpacity: 0.18,
            }}
            bezier
            withShadow
            withInnerLines
            withVerticalLabels
            withHorizontalLabels
            segments={5}
            yAxisSuffix=""
            yAxisInterval={1}
            fromZero
            style={{ borderRadius: 12, marginTop: 8 }}
          />
        </Card.Content>
      </Card>
      <Card style={[styles.chartCard, { marginTop: 16, backgroundColor: '#f5fafd' }]}> 
        <Card.Content>
          <Title style={{ fontSize: 18, color: Colors.light.primary, marginBottom: 8 }}>Trend Analysis</Title>
          <Paragraph style={{ color: Colors.light.icon, fontSize: 15 }}>
            {stats.dailyRevenue && stats.dailyRevenue.length > 1
              ? (() => {
                  const first = stats.dailyRevenue[0].revenue;
                  const last = stats.dailyRevenue[stats.dailyRevenue.length - 1].revenue;
                  if (last > first) return 'Revenue is trending up this week.';
                  if (last < first) return 'Revenue is trending down this week.';
                  return 'Revenue is stable this week.';
                })()
              : 'Not enough data for trend analysis.'}
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: Colors.light.background },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, padding: 16, borderRadius: 12, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.light.tint },
  roleText: { color: Colors.light.icon, fontSize: 14 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  metricCard: { flex: 1, marginHorizontal: 4, borderRadius: 12, backgroundColor: '#f5fafd' },
  metricLabel: { color: Colors.light.icon, fontSize: 14 },
  metricValue: { fontSize: 22, fontWeight: 'bold', color: Colors.light.text },
  chartCard: { borderRadius: 12, marginBottom: 24, backgroundColor: '#fff' },
  logoutBtn: { marginLeft: 'auto', backgroundColor: Colors.light.background, borderColor: Colors.light.tint, borderWidth: 1 },
  // --- Mobile header styles ---
  headerMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  headerMobileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleMobile: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginBottom: 2,
  },
  headerMobileBtnRow: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 8,
  },
  headerMobileBtn: {
    width: '100%',
    borderRadius: 24,
    marginBottom: 0,
    alignSelf: 'stretch',
    minHeight: 44,
    fontWeight: '600',
  },
});

export default PaymentsStatsScreen; 