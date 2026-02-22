import { useUser } from '@/context/UserContext';
import { Redirect, Tabs } from 'expo-router';
import { BarChart2, Home, School, Users } from 'lucide-react-native';

export default function ManagementLayout() {
  const { user } = useUser();
  if (!user || user.role !== 'management') return <Redirect href="/auth/login" />;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E0E0E0', paddingTop: 6 },
      tabBarActiveTintColor: '#7B1FA2',
      tabBarInactiveTintColor: '#9E9E9E',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tabs.Screen name="schools" options={{ title: 'Schools', tabBarIcon: ({ color }) => <School color={color} size={22} /> }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: ({ color }) => <BarChart2 color={color} size={22} /> }} />
      <Tabs.Screen name="users" options={{ title: 'All Users', tabBarIcon: ({ color }) => <Users color={color} size={22} /> }} />
    </Tabs>
  );
}
