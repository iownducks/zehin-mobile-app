import { useUser } from '@/context/UserContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A237E' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  // Route based on role
  switch (user.role) {
    case 'management':
      return <Redirect href="/management" />;
    case 'school_admin':
      return <Redirect href="/school" />;
    case 'teacher':
      return <Redirect href="/teacher" />;
    case 'parent':
      return <Redirect href="/parent" />;
    case 'student':
    default:
      return <Redirect href="/student" />;
  }
}
