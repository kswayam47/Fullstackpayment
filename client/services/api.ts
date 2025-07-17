import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Change if backend runs elsewhere

let token: string | null = null;

function isWeb() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export async function setToken(newToken: string) {
  token = newToken;
  if (isWeb()) {
    window.localStorage.setItem('token', newToken);
  } else {
    await SecureStore.setItemAsync('token', newToken);
  }
}

export async function getToken() {
  if (!token) {
    if (isWeb()) {
      token = window.localStorage.getItem('token');
    } else {
      token = await SecureStore.getItemAsync('token');
    }
  }
  return token;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function login(username: string, password: string) {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { username, password });
    await setToken(res.data.access_token);
    console.log('API login response:', res.data);
    return res.data;
  } catch (e) {
    console.log('API login error:', e);
    throw e;
  }
}

export async function getStats() {
  await getToken();
  return axios.get(`${API_URL}/payments/stats`, { headers: authHeaders() });
}

export async function getPayments(params: any) {
  await getToken();
  return axios.get(`${API_URL}/payments`, { params, headers: authHeaders() });
}

export async function getPaymentById(id: number) {
  await getToken();
  return axios.get(`${API_URL}/payments/${id}`, { headers: authHeaders() });
}

export async function addPayment(data: any) {
  await getToken();
  return axios.post(`${API_URL}/payments`, data, { headers: authHeaders() });
}

export async function getUsersList(q = '') {
  await getToken();
  return axios.get(`${API_URL}/users/list`, { params: { q }, headers: authHeaders() });
}

export async function deleteUser(id: number) {
  await getToken();
  return axios.delete(`${API_URL}/users/${id}`, { headers: authHeaders() });
} 