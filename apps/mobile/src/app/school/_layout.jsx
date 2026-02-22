import { useUser } from '@/context/UserContext';
import { Redirect, Tabs } from 'expo-router';
import { Bell, Home, Users, BookOpen } from 'lucide-react-native';

export default function SchoolLayout() {
  const { user } = useUser();
  if (!user || user.role !== 'school_admin') return <Redirect href="/auth/login" />;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E0E0E0', paddingTop: 6 },
      tabBarActiveTintColor: '#1A237E',
      tabBarInactiveTintColor: '#9E9E9E',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tabs.Screen name="teachers" options={{ title: 'Teachers', tabBarIcon: ({ color }) => <Users color={color} size={22} /> }} />
      <Tabs.Screen name="students" options={{ title: 'Students', tabBarIcon: ({ color }) => <BookOpen color={color} size={22} /> }} />
      <Tabs.Screen name="announce" options={{ title: 'Announce', tabBarIcon: ({ color }) => <Bell color={color} size={22} /> }} />
    </Tabs>
  );
}
