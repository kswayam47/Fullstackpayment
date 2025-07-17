import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Card, Button as PaperButton } from 'react-native-paper';
import { Colors } from '../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_URL = 'http://localhost:3000';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('user');
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/users`, { username, password, role });
      Alert.alert('Success', 'Registration successful! Please login.');
      router.replace('/login');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formWrapper}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Icon name="account-plus" size={36} color={Colors.light.primary} style={{ marginRight: 12 }} />
              <Text style={styles.title}>Create Account</Text>
            </View>
            <Text style={styles.subtitle}>Sign up to get started</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              accessibilityLabel="Username"
              accessibilityHint="Enter your username"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              accessibilityLabel="Password"
              accessibilityHint="Enter your password"
            />
            <Text style={styles.label}>Role</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={role}
                onValueChange={setRole}
                style={styles.picker}
                accessibilityLabel="Role"
              >
                <Picker.Item label="User" value="user" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>
            </View>
            <PaperButton
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.paperButton}
              labelStyle={styles.buttonLabel}
              accessibilityLabel="Register"
              icon="account-plus"
            >
              Register
            </PaperButton>
            <PaperButton
              mode="outlined"
              onPress={() => router.replace('/login')}
              style={[styles.paperButton, styles.loginButtonWhite]}
              labelStyle={[styles.loginButtonLabelPurple]}
              accessibilityLabel="Back to Login"
              icon="login"
            >
              Back to Login
            </PaperButton>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.light.background },
  formWrapper: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  card: { borderRadius: 20, padding: 16, backgroundColor: Colors.light.surface, elevation: 4, shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 6 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, alignSelf: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: Colors.light.primary },
  subtitle: { fontSize: 16, color: Colors.light.gray500, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: Colors.light.gray200, borderRadius: 10, padding: 14, marginBottom: 16, backgroundColor: Colors.light.gray100, fontSize: 16 },
  label: { fontSize: 16, marginBottom: 8, fontWeight: 'bold', color: Colors.light.primary },
  pickerWrapper: { borderWidth: 0, borderColor: Colors.light.gray200, borderRadius: 16, marginBottom: 20, backgroundColor: Colors.light.gray100, overflow: 'hidden', paddingHorizontal: 4 },
  picker: { width: '100%', height: 48, backgroundColor: 'transparent', borderRadius: 16 },
  paperButton: { borderRadius: 12, height: 52, justifyContent: 'center', backgroundColor: Colors.light.primary, elevation: 2 },
  buttonLabel: { color: '#fff', fontWeight: 'normal', fontSize: 18, letterSpacing: 1 },
  
  '@media (hover: hover) and (pointer: fine)': {
    paperButton: { ':hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 32px rgba(16,185,129,0.12)' }, ':focus': { transform: 'translateY(-3px)', boxShadow: '0 8px 32px rgba(16,185,129,0.16)' } },
  },
  loginButtonWhite: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderColor: '#7C3AED',
    borderWidth: 1,
  },
  loginButtonLabelPurple: {
    color: '#7C3AED',
    fontWeight: 'normal',
    fontSize: 18,
    letterSpacing: 1,
  },
}); 