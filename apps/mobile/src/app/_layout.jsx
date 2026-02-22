import { UserProvider } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const loadData = useSchoolStore((s) => s.loadData);

  useEffect(() => {
    loadData().then(() => {
      setIsReady(true);
      SplashScreen.hideAsync();
    });
  }, []);

  if (!isReady) return null;

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />
      <Stack.Screen name="auth/school-register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="teacher" />
      <Stack.Screen name="student" />
      <Stack.Screen name="management" />
      <Stack.Screen name="school" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppContent />
        </GestureHandlerRootView>
      </UserProvider>
    </QueryClientProvider>
  );
}
