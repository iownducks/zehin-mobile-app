import { useUser } from '@/context/UserContext';
import { Redirect, Tabs } from 'expo-router';
import { Bell, BookOpen, Home, Users } from 'lucide-react-native';

export default function ParentLayout() {
  const { user } = useUser();
  if (!user || user.role !== 'parent') return <Redirect href="/auth/login" />;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E0E0E0', paddingTop: 6 },
      tabBarActiveTintColor: '#006064',
      tabBarInactiveTintColor: '#9E9E9E',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tabs.Screen name="child" options={{ title: 'My Child', tabBarIcon: ({ color }) => <BookOpen color={color} size={22} /> }} />
      <Tabs.Screen name="teachers" options={{ title: 'Teachers', tabBarIcon: ({ color }) => <Users color={color} size={22} /> }} />
      <Tabs.Screen name="fees" options={{ title: 'Fees & News', tabBarIcon: ({ color }) => <Bell color={color} size={22} /> }} />
    </Tabs>
  );
}
