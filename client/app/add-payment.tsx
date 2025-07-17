import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { addPayment, getToken, getUsersList } from '../services/api';
import { useRouter } from 'expo-router';
import { TextInput, Button, Card, Text, Title, Surface, Chip } from 'react-native-paper';
import { Colors } from '../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Autocomplete from 'react-native-autocomplete-input';
import * as SecureStore from 'expo-secure-store';
import { logout } from '../utils/auth';

const statusOptions = ['success', 'failed', 'pending'];
const methodOptions = ['card', 'bank', 'wallet'];

const AddPaymentScreen = () => {
  const [amount, setAmount] = useState('');
  const [receiverQuery, setReceiverQuery] = useState('');
  const [receiverId, setReceiverId] = useState<number | null>(null);
  const [receiverOptions, setReceiverOptions] = useState<any[]>([]);
  const [status, setStatus] = useState('success');
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState('');
  const [sender, setSender] = useState('');
  const router = useRouter();
  const [receiverLoading, setReceiverLoading] = useState(false);
  const [receiverError, setReceiverError] = useState('');

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setRole(payload.role || '');
        setSender(payload.username || '');
      }
    })();
  }, []);

  useEffect(() => {
    if (receiverQuery.length === 0) {
      setReceiverOptions([]);
      setReceiverId(null);
      setReceiverError('');
      setReceiverLoading(false);
      console.log('Receiver query empty, cleared options.');
      return;
    }
    setReceiverLoading(true);
    setReceiverError('');
    let active = true;
    console.log('Fetching users for query:', receiverQuery);
    getUsersList(receiverQuery)
      .then(res => {
        if (active) {
          console.log('Users API response:', res.data);
          setReceiverOptions(res.data);
          if (res.data.length === 0) setReceiverError('No users found.');
        }
      })
      .catch((err) => {
        if (active) {
          setReceiverError('Error fetching users.');
          console.error('Error fetching users:', err);
        }
      })
      .finally(() => {
        if (active) setReceiverLoading(false);
      });
    return () => { active = false; };
  }, [receiverQuery]);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!amount || !receiverId) {
      setError('Amount and receiver are required. Please select a receiver from the list.');
      return;
    }
    setLoading(true);
    try {
      await addPayment({ amount: parseFloat(amount), receiverId, status, method });
      setSuccess('Payment added!');
      setAmount('');
      setReceiverQuery('');
      setReceiverId(null);
      setStatus('success');
      setMethod('card');
      setTimeout(() => router.replace('/payments'), 1000);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Surface style={styles.header} elevation={4}>
        <Icon name="plus-circle-outline" size={28} color={Colors.light.tint} style={{ marginRight: 12 }} />
        <Title style={styles.headerTitle}>Add Payment</Title>
        <View style={{ flex: 1 }} />
        <Button mode="outlined" style={styles.logoutBtn} icon="logout" onPress={() => router.replace('/login')}>Logout</Button>
      </Surface>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Sender:</Text>
          <TextInput
            value={sender}
            editable={false}
            style={[styles.input, { backgroundColor: '#eee' }]}
            left={<TextInput.Icon icon="account" />}
          />
          <Text style={styles.label}>Receiver:</Text>
          <Autocomplete
            data={receiverOptions}
            value={receiverQuery}
            onChangeText={text => {
              setReceiverQuery(text);
              setReceiverId(null);
            }}
            flatListProps={{
              keyExtractor: item => item.id.toString(),
              renderItem: ({ item }) => (
                <Text
                  style={{ padding: 8, backgroundColor: '#f5fafd' }}
                  onPress={() => {
                    setReceiverQuery(item.username);
                    setReceiverId(item.id);
                    setReceiverOptions([]);
                  }}
                >
                  {item.username}
                </Text>
              ),
              ListEmptyComponent: () => (
                receiverLoading ? <Text style={{ padding: 8 }}>Loading...</Text> :
                receiverError ? <Text style={{ padding: 8, color: 'red' }}>{receiverError}</Text> : null
              ),
            }}
            inputContainerStyle={styles.input}
            listContainerStyle={{ backgroundColor: '#fff', borderRadius: 8, elevation: 2 }}
            hideResults={receiverQuery.length === 0}
          />
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
            left={<TextInput.Icon icon="currency-usd" />}
          />
          <Text style={styles.label}>Status:</Text>
          <View style={styles.row}>
            {statusOptions.map(opt => (
              <Chip
                key={opt}
                style={[styles.chip, status === opt && { backgroundColor: Colors.light.tint }]}
                selected={status === opt}
                onPress={() => setStatus(opt)}
                textStyle={{ color: status === opt ? '#fff' : Colors.light.text }}
              >
                {opt}
              </Chip>
            ))}
          </View>
          <Text style={styles.label}>Method:</Text>
          <View style={styles.row}>
            {methodOptions.map(opt => (
              <Chip
                key={opt}
                style={[styles.chip, method === opt && { backgroundColor: Colors.light.tint }]}
                selected={method === opt}
                onPress={() => setMethod(opt)}
                textStyle={{ color: method === opt ? '#fff' : Colors.light.text }}
                icon={opt === 'card' ? 'credit-card' : opt === 'bank' ? 'bank' : 'wallet'}
              >
                {opt}
              </Chip>
            ))}
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !receiverId}
            style={styles.addBtn}
            icon="plus"
            labelStyle={styles.addBtnLabel}
          >
            Add Payment
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: Colors.light.background },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, padding: 16, borderRadius: 12, backgroundColor: '#fff', alignSelf: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.light.tint },
  card: { borderRadius: 16, padding: 8, backgroundColor: '#fff', elevation: 3 },
  input: { marginBottom: 16, backgroundColor: '#f5fafd' },
  label: { fontWeight: 'bold', marginBottom: 4, color: Colors.light.icon },
  row: { flexDirection: 'row', marginBottom: 12, flexWrap: 'wrap' },
  chip: { marginRight: 8, marginBottom: 8 },
  addBtn: { marginTop: 8, backgroundColor: Colors.light.tint, color: '#fff' },
  addBtnLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  // Add microinteractions for web
  '@media (hover: hover) and (pointer: fine)': {
    addBtn: { ':hover': { backgroundColor: '#059669' }, ':focus': { backgroundColor: '#059669' } },
  },
  error: { color: '#e53935', marginBottom: 8, textAlign: 'center' },
  success: { color: '#43a047', marginBottom: 8, textAlign: 'center' },
  logoutBtn: { marginLeft: 16, borderRadius: 32, borderColor: Colors.light.tint, borderWidth: 2, backgroundColor: '#fff', color: '#fff', fontWeight: 600, paddingHorizontal: 18, paddingVertical: 6 },
  // Add microinteractions for web
  '@media (hover: hover) and (pointer: fine)': {
    logoutBtn: { ':hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 32px rgba(16,185,129,0.12)' }, ':focus': { transform: 'translateY(-3px)', boxShadow: '0 8px 32px rgba(16,185,129,0.16)' } },
  },
});

export default AddPaymentScreen; 