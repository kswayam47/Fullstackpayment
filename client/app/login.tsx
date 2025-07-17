import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { login } from '../services/api';
import { useRouter } from 'expo-router';
import { TextInput, Button, Card, Text, ActivityIndicator, Title, Surface } from 'react-native-paper';
import { Colors } from '../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await login(username, password);
    
      router.replace('/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={4}>
        <Icon name="credit-card-outline" size={40} color={Colors.light.primary} style={{ marginRight: 16 }} />
        <Title style={styles.headerTitle}>Welcome Back</Title>
      </Surface>
      <View style={styles.formWrapper}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.subtitle}>Sign in to your account</Text>
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
              accessibilityLabel="Username"
              accessibilityHint="Enter your username"
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              accessibilityLabel="Password"
              accessibilityHint="Enter your password"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginBtn}
              icon="login"
              contentStyle={{ height: 56 }}
              labelStyle={styles.loginBtnLabel}
              accessibilityLabel="Login"
              accessibilityHint="Tap to login"
            >
              Login
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.replace('/register')}
              style={styles.registerBtn}
              icon="account-plus"
              contentStyle={{ height: 56 }}
              labelStyle={{ fontSize: 16 }}
              accessibilityLabel="Register"
              accessibilityHint="Tap to register a new account"
            >
              Register
            </Button>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.light.background },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, padding: 20, borderRadius: 16, backgroundColor: Colors.light.surface, alignSelf: 'center', shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: Colors.light.primary },
  subtitle: { fontSize: 18, color: Colors.light.gray500, marginBottom: 24, textAlign: 'center' },
  formWrapper: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  card: { borderRadius: 20, padding: 12, backgroundColor: Colors.light.surface, elevation: 4, shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 6 },
  input: { marginBottom: 20, backgroundColor: Colors.light.gray100, fontSize: 16 },
  loginBtn: { marginTop: 12, backgroundColor: Colors.light.primary, borderRadius: 12, elevation: 2 },
  loginBtnLabel: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  registerBtn: { marginTop: 12, borderRadius: 12, borderColor: Colors.light.primary, borderWidth: 1 },
  error: { color: Colors.light.error, marginBottom: 12, textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
});

export default LoginScreen; 