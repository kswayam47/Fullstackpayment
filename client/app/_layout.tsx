import { Stack } from 'expo-router';
import { Platform, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(Dimensions.get('window').width <= 600);
  useEffect(() => {
    const onChange = ({ window }: { window: { width: number; height: number } }) => setIsMobile(window.width <= 600);
    const sub = Dimensions.addEventListener('change', onChange);
    return () => sub?.remove && sub.remove();
  }, []);
  return isMobile;
}

export default function RootLayout() {
  const router = useRouter();
  const isMobile = useIsMobile();
  return (
    <>
      {Platform.OS === 'web' && (
        <style>{`
          html, body, #root {
            min-height: 100vh;
            height: 100%;
            width: 100%;
            overflow-y: auto;
            background: linear-gradient(180deg, #e3f2fd 0%, #f5fafd 100%);
          }
        `}</style>
      )}
      <Stack initialRouteName="login">
        <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'Register' }} />
        <Stack.Screen name="dashboard" options={{
          title: 'Dashboard',
          headerRight: isMobile
            ? () => (
                <Button
                  mode="outlined"
                  icon="logout"
                  onPress={() => router.replace('/login')}
                  style={{ borderColor: '#10b981', borderWidth: 1, backgroundColor: '#fff', borderRadius: 24, minWidth: 100, minHeight: 44, marginRight: 8, paddingHorizontal: 16 }}
                >
                  Logout
                </Button>
              )
            : undefined,
        }} />
        <Stack.Screen name="payments" options={{ title: 'Payments' }} />
        <Stack.Screen name="payment/[id]" options={{ title: 'Payment Details' }} />
        <Stack.Screen name="add-payment" options={{ title: 'Add Payment' }} />
        <Stack.Screen name="users" options={{ title: 'Users' }} />
        <Stack.Screen name="payments-stats" options={{ title: 'Payments Stats' }} />
      </Stack>
    </>
  );
}
