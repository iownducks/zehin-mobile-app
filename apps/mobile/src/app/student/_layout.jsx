import { useUser } from '@/context/UserContext';
import { Redirect, Tabs } from 'expo-router';
import { BookMarked, BookOpen, ClipboardList, Home, HelpCircle } from 'lucide-react-native';

export default function StudentLayout() {
  const { user } = useUser();
  if (!user || user.role !== 'student') return <Redirect href="/auth/login" />;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E0E0E0', paddingTop: 6 },
      tabBarActiveTintColor: '#1A237E',
      tabBarInactiveTintColor: '#9E9E9E',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tabs.Screen name="tasks" options={{ title: 'My Tasks', tabBarIcon: ({ color }) => <ClipboardList color={color} size={22} /> }} />
      <Tabs.Screen name="books" options={{ title: 'Books', tabBarIcon: ({ color }) => <BookMarked color={color} size={22} /> }} />
      <Tabs.Screen name="study" options={{ title: 'Study', tabBarIcon: ({ color }) => <BookOpen color={color} size={22} /> }} />
      <Tabs.Screen name="quiz" options={{ title: 'Quiz', tabBarIcon: ({ color }) => <HelpCircle color={color} size={22} /> }} />
      <Tabs.Screen name="reader" options={{ href: null }} />
      <Tabs.Screen name="reader/[id]" options={{ href: null }} />
    </Tabs>
  );
}
