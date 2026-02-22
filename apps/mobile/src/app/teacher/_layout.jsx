import { useUser } from '@/context/UserContext';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router';
import { BookOpen, ClipboardList, Home, Users } from 'lucide-react-native';

export default function TeacherLayout() {
  const { user } = useUser();
  if (!user || user.role !== 'teacher') return <Redirect href="/auth/login" />;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E0E0E0', paddingTop: 6 },
      tabBarActiveTintColor: '#1A237E',
      tabBarInactiveTintColor: '#9E9E9E',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks', tabBarIcon: ({ color }) => <ClipboardList color={color} size={22} /> }} />
      <Tabs.Screen name="materials" options={{ title: 'Materials', tabBarIcon: ({ color }) => <BookOpen color={color} size={22} /> }} />
      <Tabs.Screen name="students" options={{ title: 'Students', tabBarIcon: ({ color }) => <Users color={color} size={22} /> }} />
    </Tabs>
  );
}
