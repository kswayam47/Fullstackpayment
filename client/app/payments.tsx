import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { getPayments, getToken } from '../services/api';
import { useRouter } from 'expo-router';
import { Card, Text, Button, Chip, ActivityIndicator, Surface, Title, Paragraph, Avatar, Snackbar, FAB } from 'react-native-paper';
import { Colors } from '../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { logout } from '../utils/auth';
import io from 'socket.io-client';
import axios from 'axios';
import { TextInput } from 'react-native-gesture-handler';
import DatePicker from 'expo-datepicker';
// @ts-ignore
const ReactDatePicker = Platform.OS === 'web' ? require('react-datepicker').default : null;
if (Platform.OS === 'web') {
  require('react-datepicker/dist/react-datepicker.css');
}

const statusOptions = ['success', 'failed', 'pending'];
const methodOptions = ['card', 'bank', 'wallet'];
const statusColors: Record<string, string> = {
  success: '#43a047',
  failed: '#e53935',
  pending: '#fbc02d',
};
const SOCKET_URL = 'http://localhost:3000';

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

const PaymentsScreen = () => {
  // --- State ---
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', method: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [role, setRole] = useState<string>('');
  const [snackbar, setSnackbar] = useState('');
  const router = useRouter();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDateObj, setStartDateObj] = useState(filters.startDate ? new Date(filters.startDate) : null);
  const [endDateObj, setEndDateObj] = useState(filters.endDate ? new Date(filters.endDate) : null);
  const [filtered, setFiltered] = useState(false);
  const [isMobile, setIsMobile] = useState(Dimensions.get('window').width <= 600);

  useEffect(() => {
    const onChange = ({ window }: { window: { width: number; height: number } }) => setIsMobile(window.width <= 600);
    const sub = Dimensions.addEventListener('change', onChange);
    return () => sub?.remove && sub.remove();
  }, []);

  // --- Mobile renderItem for FlatList ---
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.paymentCardMobile}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/payment/[id]', params: { id: item.id, payment: item } })}
    >
      <View style={styles.paymentContentMobile}>
        <View style={styles.avatarMobile}>
          <Text style={styles.avatarTextMobile}>{item.sender?.username?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.paymentTitleMobile}>{item.sender?.username} ➔ {item.receiver?.username}</Text>
          <Text style={styles.paymentSubtitleMobile}>${item.amount} • {item.method} • {new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </View>
      <View style={[styles.statusChipMobile, { backgroundColor: statusColors[item.status] || '#ccc' }]}>
        <Text style={styles.statusChipTextMobile}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  // --- Fetch all payments on mount and when page changes (not on filter change) ---
  useEffect(() => { fetchData(); }, [page]);

  const fetchData = async (customFilters = filters) => {
    setLoading(true);
    try {
      const res = await getPayments({ ...customFilters, page, limit: 10 });
      setPayments(res.data.data);
      setTotal(res.data.total);
    } catch (e) {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Filter logic ---
  // --- Fix date filter logic ---
  const handleFilter = () => {
    setFiltered(true);
    setPage(1);
    // Debug: log filters before sending
    console.log('Filter button pressed. Filters:', filters);
    // Always send startDate as 00:00:00 and endDate as 23:59:59.999
    const customFilters = { ...filters };
    if (customFilters.startDate) {
      customFilters.startDate = customFilters.startDate + 'T00:00:00.000Z';
    }
    if (customFilters.endDate) {
      customFilters.endDate = customFilters.endDate + 'T23:59:59.999Z';
    }
    fetchData(customFilters);
  };

  const handleClear = () => {
    setFilters({ status: '', method: '', startDate: '', endDate: '' });
    setFiltered(false);
    setPage(1);
    fetchData({ status: '', method: '', startDate: '', endDate: '' });
  };

  const handleExportCSV = async () => {
    try {
      const params = { ...filters, page: 1, limit: 1000 };
      const token = await getToken();
      const response = await axios.get('http://localhost:3000/payments/export', {
        params,
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      if (Platform.OS === 'web') {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'payments.csv');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        setSnackbar('CSV export is only supported on web in this demo.');
      }
    } catch (e) {
      setSnackbar('Failed to export CSV.');
    }
  };

  // --- Fix date picker off-by-one bug for web (timezone) ---
  const handleDateChange = (type: 'startDate' | 'endDate', date: Date | null) => {
    if (!date) {
      setFilters(f => ({ ...f, [type]: '' }));
      return;
    }
    // Always use local date (not UTC) for display and filter
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    setFilters(f => ({ ...f, [type]: `${yyyy}-${mm}-${dd}` }));
  };

  // --- UI rendering ---
  return (
    <View style={styles.gradientBg}>
      {/* Header + Top Buttons */}
      {isMobile ? (
        <Surface style={styles.headerMobile} elevation={4}>
          <View style={styles.headerMobileTop}>
            <Avatar.Icon size={48} icon="credit-card-outline" style={{ backgroundColor: Colors.light.tint, marginRight: 12, marginBottom: 8 }} />
            <View style={{ flex: 1 }}>
              <Title style={styles.headerTitleMobile}>Payments</Title>
              <Paragraph style={styles.roleTextMobile}>All your recent payments</Paragraph>
            </View>
          </View>
          <View style={styles.headerMobileBtnRow}>
            <Button mode="contained" icon="view-dashboard" style={styles.headerMobileBtn} onPress={() => router.push('/dashboard')}>Dashboard</Button>
            <Button mode="contained" icon="chart-bar" style={styles.headerMobileBtn} onPress={() => router.push('/payments-stats')}>Stats</Button>
            <Button mode="contained" icon="plus" style={styles.headerMobileBtn} onPress={() => router.push('/add-payment')}>Add Payment</Button>
            <Button mode="outlined" style={styles.headerMobileBtnOutline} icon="logout" onPress={() => router.replace('/login')}>Logout</Button>
          </View>
        </Surface>
      ) : (
        <Surface style={styles.header} elevation={4}>
          <Avatar.Icon size={48} icon="credit-card-outline" style={{ backgroundColor: Colors.light.tint, marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <Title style={styles.headerTitle}>Payments</Title>
            <Paragraph style={styles.roleText}>All your recent payments</Paragraph>
          </View>
          <Button mode="contained" icon="view-dashboard" style={[styles.primaryBtn, { marginRight: 12 }]} onPress={() => router.push('/dashboard')}>Dashboard</Button>
          <Button mode="contained" icon="chart-bar" style={[styles.primaryBtn, { marginRight: 12 }]} onPress={() => router.push('/payments-stats')}>Stats</Button>
          <Button mode="contained" icon="plus" style={styles.primaryBtn} onPress={() => router.push('/add-payment')}>Add Payment</Button>
          <Button mode="outlined" style={styles.logoutBtn} icon="logout" onPress={() => router.replace('/login')}>Logout</Button>
        </Surface>
      )}
      {/* Filters */}
      <View style={Platform.OS === 'web' ? styles.stickyFilters : styles.filtersCard}>
        <Text style={styles.filterLabel}>Status:</Text>
        <View style={styles.row}>
          {statusOptions.map(opt => (
            <Chip
              key={opt}
              style={[styles.filterChip, filters.status === opt && { backgroundColor: Colors.light.tint, color: '#fff' }]}
              selected={filters.status === opt}
              onPress={() => setFilters(f => ({ ...f, status: f.status === opt ? '' : opt }))}
              textStyle={{ color: filters.status === opt ? '#fff' : Colors.light.text }}
            >
              {opt}
            </Chip>
          ))}
        </View>
        <Text style={styles.filterLabel}>Method:</Text>
        <View style={styles.row}>
          {methodOptions.map(opt => (
            <Chip
              key={opt}
              style={[styles.filterChip, filters.method === opt && { backgroundColor: Colors.light.tint, color: '#fff' }]}
              selected={filters.method === opt}
              onPress={() => setFilters(f => ({ ...f, method: f.method === opt ? '' : opt }))}
              textStyle={{ color: filters.method === opt ? '#fff' : Colors.light.text }}
              icon={opt === 'card' ? 'credit-card' : opt === 'bank' ? 'bank' : 'wallet'}
            >
              {opt}
            </Chip>
          ))}
        </View>
        <View style={styles.row}>
          {Platform.OS === 'web' ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 12, width: 320 }}>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={e => handleDateChange('startDate', e.target.value ? new Date(e.target.value) : null)}
                  style={{ borderRadius: 8, border: `1px solid ${Colors.light.tint}`, padding: '6px 10px', background: '#f5fafd', fontSize: 15, width: '50%' }}
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={e => handleDateChange('endDate', e.target.value ? new Date(e.target.value) : null)}
                  style={{ borderRadius: 8, border: `1px solid ${Colors.light.tint}`, padding: '6px 10px', background: '#f5fafd', fontSize: 15, width: '50%' }}
                  placeholder="End Date"
                />
              </div>
            </>
          ) : (
            <>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowStartPicker(true)}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Start Date (YYYY-MM-DD)"
                  value={filters.startDate}
                  editable={false}
                  pointerEvents="none"
                  placeholderTextColor={Colors.light.icon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, marginLeft: 8 }} onPress={() => setShowEndPicker(true)}>
                <TextInput
                  style={[styles.input, { flex: 1, marginLeft: 8 }]}
                  placeholder="End Date (YYYY-MM-DD)"
                  value={filters.endDate}
                  editable={false}
                  pointerEvents="none"
                  placeholderTextColor={Colors.light.icon}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {Platform.OS === 'web' ? (
            <>
              <button
                style={{ flex: 1, background: Colors.light.tint, color: '#fff', border: 'none', borderRadius: 24, padding: '8px 0', fontSize: 16, fontWeight: 600, marginRight: 8, cursor: 'pointer', minWidth: 120, maxWidth: 220 }}
                onClick={handleFilter}
              >
                <Icon name="filter" size={18} color="#fff" style={{ marginRight: 6 }} /> Filter
              </button>
              <button
                style={{ flex: 1, background: '#fff', color: Colors.light.tint, border: `2px solid ${Colors.light.tint}`, borderRadius: 24, padding: '8px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer', minWidth: 120, maxWidth: 220 }}
                onClick={handleClear}
              >
                Clear
              </button>
            </>
          ) : (
            <>
              <Button mode="contained" icon="filter" onPress={handleFilter} style={[styles.filterBtn, { flex: 1, marginRight: 8, borderRadius: 24, height: 40, minWidth: 120, maxWidth: 220 }]}>Filter</Button>
              <Button mode="outlined" onPress={handleClear} style={[styles.filterBtn, { flex: 1, borderRadius: 24, height: 40, minWidth: 120, maxWidth: 220 }]}>Clear</Button>
            </>
          )}
        </View>
      </View>
      {/* Payments List - regular div for web, FlatList for native */}
      {Platform.OS === 'web' ? (
        <div style={{ width: '100%' }}>
          {payments.length === 0 ? (
            <Text style={styles.emptyText}>No payments found.</Text>
          ) : payments.map((item, idx) => (
            <div key={item.id} style={{ transition: 'box-shadow 0.2s', boxShadow: '0 2px 12px rgba(33,150,243,0.08)', borderRadius: 16, background: '#fff', marginBottom: 16, marginLeft: 12, marginRight: 12, padding: 0, cursor: 'pointer', border: '1px solid #e3f2fd' }}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(33,150,243,0.18)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(33,150,243,0.08)'}
              onClick={() => {
                if (Platform.OS === 'web') {
                  router.push({ pathname: '/payment/[id]', params: { id: item.id } });
                  window.history.replaceState({ payment: item }, 'Payment Details');
                } else {
                  router.push({ pathname: '/payment/[id]', params: { id: item.id, payment: item } });
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', padding: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: 24, background: Colors.light.tint, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, marginRight: 18 }}>{item.sender?.username?.[0]?.toUpperCase() || '?'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: Colors.light.text }}>{item.sender?.username} ➔ {item.receiver?.username}</div>
                  <div style={{ color: Colors.light.icon, fontSize: 14, marginTop: 2 }}>${item.amount} • {item.method} • {new Date(item.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ marginLeft: 12, minWidth: 80, textAlign: 'center', borderRadius: 16, background: statusColors[item.status] || '#ccc', color: '#fff', fontWeight: 600, padding: '6px 16px' }}>{item.status}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        loading ? <ActivityIndicator style={{ marginTop: 32 }} /> : (
          <FlatList
            data={payments}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={<Text style={styles.emptyText}>No payments found.</Text>}
            style={{ marginBottom: 16 }}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )
      )}
      {/* Pagination */}
      <View style={styles.pagination}>
        <Button mode="outlined" onPress={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} icon="chevron-left">Prev</Button>
        <Text style={styles.pageText}>Page {page}</Text>
        <Button mode="outlined" onPress={() => setPage(p => (payments.length === 10 ? p + 1 : p))} disabled={payments.length < 10} icon="chevron-right">Next</Button>
      </View>
      {/* Floating Action Buttons */}
      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar('')}
        duration={3000}
        style={{ backgroundColor: Colors.light.tint }}
      >
        {snackbar}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    ...Platform.select({
      web: {
        background: 'linear-gradient(180deg, #e3f2fd 0%, #f5fafd 100%)',
        paddingBottom: 64,
        paddingTop: 0,
        minHeight: undefined,
        height: undefined,
        flex: undefined,
      },
      default: {
        flex: 1,
        backgroundColor: '#f5fafd',
        minHeight: '100%',
      },
    }),
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, padding: 16, borderRadius: 16, backgroundColor: '#fff', elevation: 4, marginTop: 16, marginHorizontal: 12 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: Colors.light.tint },
  roleText: { color: Colors.light.icon, fontSize: 15 },
  filtersCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 12, marginBottom: 16, elevation: 2 },
  stickyFilters: { position: 'sticky', top: 0, zIndex: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 12, marginBottom: 16, boxShadow: '0 2px 12px rgba(33,150,243,0.08)' },
  filterLabel: { fontWeight: 'bold', marginBottom: 4, color: Colors.light.icon },
  filterChip: { marginRight: 8, marginBottom: 8 },
  input: { marginBottom: 8, backgroundColor: '#f5fafd', borderRadius: 8, borderColor: Colors.light.tint, borderWidth: 1, padding: 10 },
  filterBtn: { marginTop: 8, backgroundColor: Colors.light.tint, color: '#fff' },
  row: { flexDirection: 'row', marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' },
  paymentCard: { borderRadius: 16, backgroundColor: '#fff', marginBottom: 12, elevation: 3, marginHorizontal: 12 },
  paymentContent: { flexDirection: 'row', alignItems: 'center' },
  paymentTitle: { fontWeight: 'bold', fontSize: 16, color: Colors.light.text },
  paymentSubtitle: { color: Colors.light.icon, fontSize: 13 },
  statusChip: { marginLeft: 8, minWidth: 70, justifyContent: 'center' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginHorizontal: 12 },
  pageText: { fontWeight: 'bold', color: Colors.light.text },
  fabAdd: { position: 'absolute', right: 24, bottom: 90, backgroundColor: Colors.light.tint, zIndex: 10, color: '#fff' },
  fabExport: { position: 'absolute', right: 24, bottom: 24, backgroundColor: '#fff', borderColor: Colors.light.tint, borderWidth: 1, zIndex: 10 },
  emptyText: { textAlign: 'center', color: Colors.light.icon, marginTop: 32 },
  logoutBtn: { marginLeft: 16, borderRadius: 32, borderColor: Colors.light.tint, borderWidth: 2, backgroundColor: '#fff', color: '#fff', fontWeight: 600, paddingHorizontal: 18, paddingVertical: 6 },
  topBtn: { marginLeft: 8, borderRadius: 32, paddingHorizontal: 18, paddingVertical: 6, fontWeight: 600 },
  primaryBtn: { backgroundColor: Colors.light.tint, borderRadius: 32, paddingHorizontal: 18, paddingVertical: 6, fontWeight: 600, color: '#fff', borderWidth: 0, boxShadow: '0 2px 8px rgba(16,185,129,0.08)', transition: 'background 0.2s' },
  primaryBtnOutline: { borderColor: Colors.light.tint, color: Colors.light.tint, borderRadius: 32, paddingHorizontal: 18, paddingVertical: 6, fontWeight: 600, backgroundColor: '#fff', borderWidth: 2, boxShadow: '0 2px 8px rgba(33,150,243,0.08)', transition: 'background 0.2s' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginLeft: 24 },
  // Add microinteractions for web
  '@media (hover: hover) and (pointer: fine)': {
    primaryBtn: { ':hover': { backgroundColor: '#059669' }, ':focus': { backgroundColor: '#059669' } },
    paymentCard: { ':hover': { boxShadow: '0 8px 32px rgba(16,185,129,0.12)' }, ':focus': { boxShadow: '0 8px 32px rgba(16,185,129,0.16)' } },
    logoutBtn: { ':hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 32px rgba(16,185,129,0.12)' }, ':focus': { transform: 'translateY(-3px)', boxShadow: '0 8px 32px rgba(16,185,129,0.16)' } },
  },
  // --- Mobile-only styles ---
  paymentCardMobile: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  paymentContentMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarMobile: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarTextMobile: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },
  paymentTitleMobile: {
    fontWeight: 'bold',
    fontSize: 17,
    color: Colors.light.text,
    marginBottom: 2,
  },
  paymentSubtitleMobile: {
    color: Colors.light.icon,
    fontSize: 14,
  },
  statusChipMobile: {
    alignSelf: 'flex-end',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginTop: 2,
    minWidth: 70,
    alignItems: 'center',
  },
  statusChipTextMobile: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  // --- Mobile header styles ---
  headerMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 4,
    marginTop: 16,
    marginHorizontal: 12,
  },
  headerMobileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleMobile: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginBottom: 2,
  },
  roleTextMobile: {
    color: Colors.light.icon,
    fontSize: 14,
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
    backgroundColor: Colors.light.tint,
    color: '#fff',
    fontWeight: '600',
    alignSelf: 'stretch',
    minHeight: 44,
  },
  headerMobileBtnOutline: {
    width: '100%',
    borderRadius: 24,
    marginBottom: 0,
    backgroundColor: '#fff',
    color: Colors.light.tint,
    fontWeight: '600',
    alignSelf: 'stretch',
    minHeight: 44,
    borderColor: Colors.light.tint,
    borderWidth: 2,
  },
});

export default PaymentsScreen; 