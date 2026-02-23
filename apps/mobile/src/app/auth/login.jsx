import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { BookOpen } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useUser();
  const loginUser = useSchoolStore((s) => s.loginUser);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const user = loginUser(email.trim(), password);
      if (!user) {
        Alert.alert('Error', 'Invalid email or password');
        return;
      }
      await login(user);
      // Navigate based on role
      switch (user.role) {
        case 'management':
          router.replace('/management');
          break;
        case 'school_admin':
          router.replace('/school');
          break;
        case 'teacher':
          router.replace('/teacher');
          break;
        case 'parent':
          router.replace('/parent');
          break;
        case 'student':
        default:
          router.replace('/student');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const DEMO_ACCOUNTS = [
    { label: 'Management', email: 'admin@zihn.pk', password: 'admin123', color: '#7B1FA2' },
    { label: 'School Admin', email: 'principal@gmhsl.edu.pk', password: 'school123', color: '#1565C0' },
    { label: 'Teacher', email: 'ayesha@gmhsl.edu.pk', password: 'teacher123', color: '#2E7D32' },
    { label: 'Student', email: 'ahmed@student.gmhsl.edu.pk', password: 'student123', color: '#E65100' },
    { label: 'Parent', email: 'parent@gmhsl.edu.pk', password: 'parent123', color: '#006064' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#1A237E' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 24,
        }}
      >
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: '#FFD700', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <BookOpen size={40} color="#1A237E" />
          </View>
          <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' }}>Zihn</Text>
          <Text style={{ fontSize: 24, color: '#FFD700' }}>ذہن</Text>
          <Text style={{ fontSize: 14, color: '#E8EAF6', marginTop: 6 }}>
            Complete School Management System
          </Text>
        </View>

        {/* Login Card */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, marginBottom: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1A237E', marginBottom: 20 }}>
            Sign In
          </Text>

          <Text style={{ color: '#424242', marginBottom: 6, fontSize: 13, fontWeight: '500' }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14,
              fontSize: 15, marginBottom: 14, borderWidth: 1, borderColor: '#E0E0E0',
            }}
          />

          <Text style={{ color: '#424242', marginBottom: 6, fontSize: 13, fontWeight: '500' }}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            style={{
              backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14,
              fontSize: 15, marginBottom: 20, borderWidth: 1, borderColor: '#E0E0E0',
            }}
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#9FA8DA' : '#1A237E',
              borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 14,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={{ textAlign: 'center', color: '#1A237E', fontSize: 13 }}>
              New student?{' '}
              <Text style={{ fontWeight: 'bold' }}>Register here</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register School */}
        <TouchableOpacity
          onPress={() => router.push('/auth/school-register')}
          style={{
            borderWidth: 2, borderColor: '#FFD700', borderRadius: 12,
            padding: 14, alignItems: 'center', marginBottom: 20,
          }}
        >
          <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 14 }}>
            🏫 Register Your School
          </Text>
        </TouchableOpacity>

        {/* Demo Accounts */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16 }}>
          <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 13, marginBottom: 10, textAlign: 'center' }}>
            Demo Accounts — Tap to fill
          </Text>
          {DEMO_ACCOUNTS.map((acc) => (
            <TouchableOpacity
              key={acc.label}
              onPress={() => { setEmail(acc.email); setPassword(acc.password); }}
              style={{
                flexDirection: 'row', alignItems: 'center', marginBottom: 8,
                backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 10,
              }}
            >
              <View style={{
                backgroundColor: acc.color, borderRadius: 6, paddingHorizontal: 8,
                paddingVertical: 2, marginRight: 10,
              }}>
                <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{acc.label}</Text>
              </View>
              <Text style={{ color: '#E8EAF6', fontSize: 12 }}>{acc.email}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
