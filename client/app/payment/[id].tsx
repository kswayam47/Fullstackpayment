import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Title, Paragraph, Button, ActivityIndicator, Chip, Avatar } from 'react-native-paper';
import { Colors } from '../../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getToken } from '../../services/api';
import axios from 'axios';

const statusColors: Record<string, string> = {
  success: '#43a047',
  failed: '#e53935',
  pending: '#fbc02d',
};

const PaymentDetailsScreen = () => {
  const router = useRouter();
  const id = router.params?.id;
  let paymentParam = null;
  if (typeof window !== 'undefined' && window.history.state && window.history.state.payment) {
    paymentParam = window.history.state.payment;
  } else if (router.params?.payment) {
    paymentParam = router.params.payment;
  }
  const [payment] = useState<any>(paymentParam);

  // Bill format rendering
  return (
    <View style={styles.gradientBg}>
      {payment ? (
        <Card style={styles.card}>
          <Card.Content>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Title style={styles.billTitle}>Payment Receipt</Title>
              <Paragraph style={styles.billId}>Payment ID: {payment.id}</Paragraph>
            </View>
            <View style={styles.billRow}><Text style={styles.billLabel}>Sender:</Text><Text style={styles.billValue}>{payment.sender?.username}</Text></View>
            <View style={styles.billRow}><Text style={styles.billLabel}>Receiver:</Text><Text style={styles.billValue}>{payment.receiver?.username}</Text></View>
            <View style={styles.billRow}><Text style={styles.billLabel}>Amount:</Text><Text style={styles.billValue}>${payment.amount}</Text></View>
            <View style={styles.billRow}><Text style={styles.billLabel}>Status:</Text><Text style={[styles.billValue, { color: statusColors[payment.status] || '#333' }]}>{payment.status}</Text></View>
            <View style={styles.billRow}><Text style={styles.billLabel}>Method:</Text><Text style={styles.billValue}>{payment.method}</Text></View>
            <View style={styles.billRow}><Text style={styles.billLabel}>Date:</Text><Text style={styles.billValue}>{new Date(payment.createdAt).toLocaleString()}</Text></View>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={{ color: 'red', textAlign: 'center', marginTop: 32 }}>
              Payment not found.
            </Text>
          </Card.Content>
        </Card>
      )}
      <Button mode="outlined" icon="arrow-left" style={styles.backBtn} onPress={() => router.push('/payments')}>Back</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #e3f2fd 0%, #f5fafd 100%)',
    padding: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 24,
    marginBottom: 32,
    width: 420,
    maxWidth: '100%',
    boxShadow: '0 4px 24px rgba(33,150,243,0.10)',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.light.text },
  subtitle: { color: Colors.light.icon, fontSize: 15 },
  statusChip: { marginLeft: 12, minWidth: 80, justifyContent: 'center', fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  label: { fontWeight: 'bold', fontSize: 16, color: Colors.light.icon, marginRight: 8 },
  value: { fontSize: 16, color: Colors.light.text },
  backBtn: { marginTop: 32, borderRadius: 32, alignSelf: 'center', paddingHorizontal: 32, paddingVertical: 8, fontWeight: 600, borderColor: Colors.light.tint },
  billTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.light.tint, marginBottom: 4 },
  billId: { color: Colors.light.icon, fontSize: 14, marginBottom: 16 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { fontWeight: 'bold', fontSize: 16, color: Colors.light.icon },
  billValue: { fontSize: 16, color: Colors.light.text },
});

export default PaymentDetailsScreen; 