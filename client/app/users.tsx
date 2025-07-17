import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { getUsersList as getUsers, deleteUser as apiDeleteUser } from '../services/api';
import { Card, Text, Title, Surface, Chip, ActivityIndicator, Button, Snackbar } from 'react-native-paper';
import { Colors } from '../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getToken } from '../services/api';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { logout } from '../utils/auth';

const roleColors: Record<string, string> = {
  admin: Colors.light.tint,
  user: '#43a047',
};

const UsersScreen = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width <= 500;

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setRole(payload.role || '');
      }
    })();
    (async () => {
      setLoading(true);
      try {
        const res = await getUsers();
        setUsers(res.data);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (role !== 'admin') {
    return (
      <View style={styles.container}>
        <Surface style={styles.header} elevation={4}>
          <Icon name="account-group" size={28} color={Colors.light.tint} style={{ marginRight: 12 }} />
          <Title style={styles.headerTitle}>User Management</Title>
        </Surface>
        <Text style={styles.error}>You do not have permission to view this page.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={4}>
        <Icon name="account-group" size={28} color={Colors.light.tint} style={{ marginRight: 12 }} />
        <Title style={styles.headerTitle}>User Management</Title>
        <Button mode="outlined" style={styles.logoutBtn} icon="logout" onPress={() => {
          router.replace('/login');
        }}>Logout</Button>
      </Surface>
      {loading ? <ActivityIndicator style={{ marginTop: 32 }} /> : (
        users.length === 0 ? (
          <Text style={styles.emptyText}>No users found.</Text>
        ) : (
          users.map(user => (
            <Card key={user.id} style={[styles.userCard, isMobile && styles.userCardMobile]}>
              <View style={[styles.userRow, isMobile && styles.userRowMobile]}>
                <View style={styles.userInfoRow}>
                  <Icon name="account" size={isMobile ? 20 : 24} color={Colors.light.tint} style={[styles.userIcon, isMobile && styles.userIconMobile]} />
                  <Text style={[styles.username, isMobile && styles.usernameMobile]} numberOfLines={1} ellipsizeMode="tail">{user.username}</Text>
                </View>
                <View style={styles.spacer} />
                <Button
                  mode="contained"
                  icon="delete"
                  style={[styles.actionBtn, isMobile && styles.actionBtnMobile]}
                  labelStyle={[styles.actionBtnLabel, isMobile && styles.actionBtnLabelMobile]}
                  onPress={async () => {
                    setDeletingId(user.id);
                    try {
                      await apiDeleteUser(user.id);
                      setUsers(prev => prev.filter(u => u.id !== user.id));
                      setSnackbar('User deleted successfully.');
                    } catch (e) {
                      setSnackbar('Failed to delete user.');
                    } finally {
                      setDeletingId(null);
                    }
                  }}
                  disabled={deletingId === user.id}
                >
                  Delete
                </Button>
                <Chip
                  style={[styles.roleChip, isMobile && styles.roleChipMobile, { backgroundColor: roleColors[user.role] || Colors.light.icon }]}
                  textStyle={[styles.roleChipText, isMobile && styles.roleChipTextMobile]}
                  icon={user.role === 'admin' ? 'shield-account' : user.role === 'user' ? 'account' : 'account-outline'}
                >
                  {user.role}
                </Chip>
              </View>
            </Card>
          ))
        )
      )}
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
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 8,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignSelf: 'center',
    minWidth: 280,
    maxWidth: 480,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.tint,
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
    color: Colors.light.tint,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.light.icon,
    marginTop: 32,
  },
  userCard: {
    borderRadius: 18,
    backgroundColor: '#fff',
    marginBottom: 18,
    elevation: 4,
    minWidth: 280,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    transitionProperty: 'box-shadow',
    transitionDuration: '0.2s',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 22,
    width: '100%',
    minHeight: 60,
    justifyContent: 'flex-start',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  userIcon: {
    marginRight: 18,
  },
  username: {
    fontWeight: '900',
    fontSize: 18,
    color: Colors.light.text,
    marginRight: 18,
    letterSpacing: 0.1,
  },
  roleChip: {
    marginLeft: 8,
    borderRadius: 18,
    height: 38,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  roleChipText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  spacer: {
    flex: 1,
  },
  actionBtn: {
    borderRadius: 18,
    minWidth: 100,
    height: 40,
    backgroundColor: '#e53935',
    borderColor: '#e53935',
    justifyContent: 'center',
    marginLeft: 12,
    marginRight: 8,
    elevation: 2,
    alignSelf: 'center',
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  actionBtnLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  error: {
    color: '#e53935',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logoutBtn: {
    marginLeft: 12,
    backgroundColor: '#fff',
    borderColor: Colors.light.tint,
    borderWidth: 1,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
  },
  userCardMobile: {
    maxWidth: '100%',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRadius: 12,
    marginBottom: 10,
  },
  userRowMobile: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    minHeight: 44,
  },
  userIconMobile: {
    marginRight: 8,
  },
  usernameMobile: {
    fontSize: 15,
    marginRight: 8,
  },
  actionBtnMobile: {
    minWidth: 70,
    height: 32,
    borderRadius: 12,
    marginLeft: 6,
    marginRight: 4,
  },
  actionBtnLabelMobile: {
    fontSize: 13,
  },
  roleChipMobile: {
    height: 30,
    borderRadius: 12,
    paddingHorizontal: 8,
    marginLeft: 4,
  },
  roleChipTextMobile: {
    fontSize: 13,
  },
});

export default UsersScreen; 