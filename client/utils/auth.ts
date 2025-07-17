import * as SecureStore from 'expo-secure-store';

export async function logout() {
  // Remove both possible keys for safety
  await SecureStore.deleteItemAsync('jwt');
  await SecureStore.deleteItemAsync('token');
} 