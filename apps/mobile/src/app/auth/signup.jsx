import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert, ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);
const BOARDS = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Federal'];

export default function Signup() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useUser();
  const { data, registerStudent, registerParent } = useSchoolStore();

  const [mode, setMode] = useState('student'); // 'student' | 'parent'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    classLevel: 9,
    board: 'Punjab',
    schoolCode: '',
    childRollNumber: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [foundSchool, setFoundSchool] = useState(null);
  const [foundChild, setFoundChild] = useState(null);

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const lookupSchool = () => {
    const school = data?.schools.find(
      (s) => s.registrationCode.toUpperCase() === form.schoolCode.trim().toUpperCase()
    );
    if (school) {
      setFoundSchool(school);
      setFoundChild(null);
    } else {
      setFoundSchool(null);
      Alert.alert('Not Found', 'No school found with this registration code. Please check with your school admin.');
    }
  };

  const lookupChild = () => {
    if (!foundSchool) {
      Alert.alert('Error', 'Please verify school code first');
      return;
    }
    const child = data?.users.find(
      (u) => u.role === 'student' && u.schoolId === foundSchool.id &&
        u.rollNumber?.toUpperCase() === form.childRollNumber.trim().toUpperCase()
    );
    if (child) {
      setFoundChild(child);
    } else {
      setFoundChild(null);
      Alert.alert('Not Found', 'No student found with this roll number in the school.');
    }
  };

  const handleSignup = async () => {
    const { name, email, password } = form;
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (!foundSchool) {
      Alert.alert('Error', 'Please verify your school registration code first');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (mode === 'parent' && !foundChild) {
      Alert.alert('Error', "Please verify your child's roll number");
      return;
    }
    setIsLoading(true);
    try {
      if (mode === 'student') {
        const newStudent = await registerStudent({
          name, email, password,
          classLevel: form.classLevel,
          board: form.board,
          rollNumber: form.rollNumber,
          schoolId: foundSchool.id,
        });
        await login(newStudent);
        router.replace('/student');
      } else {
        const newParent = await registerParent({
          name, email, password,
          phone: form.phone,
          schoolId: foundSchool.id,
          childId: foundChild.id,
        });
        await login(newParent);
        router.replace('/parent');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const Field = ({ label, placeholder, value, onChangeText, keyboardType, secureTextEntry }) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: '#424242', marginBottom: 6, fontSize: 13, fontWeight: '500' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        style={{
          backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14,
          fontSize: 15, borderWidth: 1, borderColor: '#E0E0E0',
        }}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#1A237E' }}>
      <ScrollView contentContainerStyle={{
        flexGrow: 1, paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20, paddingHorizontal: 24,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' }}>Register</Text>
            <Text style={{ color: '#E8EAF6', fontSize: 13 }}>Join your school on Zihn</Text>
          </View>
        </View>

        {/* Mode selector */}
        <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 4, marginBottom: 20 }}>
          <TouchableOpacity onPress={() => { setMode('student'); setFoundChild(null); }}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: mode === 'student' ? '#FFFFFF' : 'transparent', alignItems: 'center' }}>
            <Text style={{ color: mode === 'student' ? '#1A237E' : '#FFF', fontWeight: '700', fontSize: 14 }}>🎓 Student</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setMode('parent'); }}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: mode === 'parent' ? '#FFFFFF' : 'transparent', alignItems: 'center' }}>
            <Text style={{ color: mode === 'parent' ? '#006064' : '#FFF', fontWeight: '700', fontSize: 14 }}>👪 Parent</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24 }}>
          {/* School Code */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1A237E', marginBottom: 14 }}>
            Step 1: Enter School Code
          </Text>
          <Text style={{ fontSize: 13, color: '#757575', marginBottom: 10 }}>
            Ask your school admin or teacher for the school registration code.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            <TextInput
              value={form.schoolCode}
              onChangeText={(v) => { update('schoolCode', v); setFoundSchool(null); }}
              placeholder="e.g. GMHSL001"
              autoCapitalize="characters"
              style={{
                flex: 1, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14,
                fontSize: 15, borderWidth: 1, borderColor: foundSchool ? '#4CAF50' : '#E0E0E0',
              }}
            />
            <TouchableOpacity
              onPress={lookupSchool}
              style={{ backgroundColor: '#1A237E', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Verify</Text>
            </TouchableOpacity>
          </View>
          {foundSchool && (
            <View style={{
              backgroundColor: '#E8F5E9', borderRadius: 10, padding: 12, marginBottom: 16,
              borderWidth: 1, borderColor: '#4CAF50',
            }}>
              <Text style={{ color: '#2E7D32', fontWeight: 'bold', fontSize: 14 }}>✓ {foundSchool.name}</Text>
              <Text style={{ color: '#388E3C', fontSize: 12 }}>{foundSchool.city}, {foundSchool.province}</Text>
            </View>
          )}

          {/* Step 2 label */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1A237E', marginBottom: 14 }}>
            Step 2: Your Details
          </Text>

          <Field label="Full Name *" placeholder={mode === 'parent' ? 'Mr. Ali Khan' : 'Ahmed Ali'} value={form.name} onChangeText={(v) => update('name', v)} />
          <Field label="Email *" placeholder="your@email.com" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" />
          <Field label="Password *" placeholder="Min 6 characters" value={form.password} onChangeText={(v) => update('password', v)} secureTextEntry />

          {mode === 'student' ? (
            <>
              <Field label="Roll Number (optional)" placeholder="e.g. IX-001" value={form.rollNumber} onChangeText={(v) => update('rollNumber', v)} />

              <Text style={{ color: '#424242', marginBottom: 8, fontSize: 13, fontWeight: '500' }}>Class / Grade *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {CLASSES.map((c) => (
                    <TouchableOpacity key={c} onPress={() => update('classLevel', c)}
                      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: form.classLevel === c ? '#1A237E' : '#F5F5F5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: form.classLevel === c ? '#1A237E' : '#E0E0E0' }}>
                      <Text style={{ color: form.classLevel === c ? '#FFF' : '#424242', fontWeight: '600', fontSize: 13 }}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={{ color: '#424242', marginBottom: 8, fontSize: 13, fontWeight: '500' }}>Board *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {BOARDS.map((b) => (
                  <TouchableOpacity key={b} onPress={() => update('board', b)}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: form.board === b ? '#1A237E' : '#F5F5F5', borderWidth: 1, borderColor: form.board === b ? '#1A237E' : '#E0E0E0' }}>
                    <Text style={{ color: form.board === b ? '#FFF' : '#424242', fontWeight: form.board === b ? '600' : '400', fontSize: 13 }}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <>
              <Field label="Phone (optional)" placeholder="e.g. 0300-1234567" value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" />

              {/* Child lookup */}
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1A237E', marginBottom: 8, marginTop: 4 }}>
                Step 3: Link Your Child
              </Text>
              <Text style={{ fontSize: 13, color: '#757575', marginBottom: 10 }}>
                Enter your child's roll number to link their account.
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                <TextInput
                  value={form.childRollNumber}
                  onChangeText={(v) => { update('childRollNumber', v); setFoundChild(null); }}
                  placeholder="e.g. IX-001"
                  autoCapitalize="characters"
                  style={{ flex: 1, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: foundChild ? '#4CAF50' : '#E0E0E0' }}
                />
                <TouchableOpacity onPress={lookupChild}
                  style={{ backgroundColor: '#006064', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Find</Text>
                </TouchableOpacity>
              </View>
              {foundChild && (
                <View style={{ backgroundColor: '#E0F7FA', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#4CAF50' }}>
                  <Text style={{ color: '#006064', fontWeight: 'bold', fontSize: 14 }}>✓ {foundChild.name}</Text>
                  <Text style={{ color: '#00838F', fontSize: 12 }}>Class {foundChild.classLevel} • Roll: {foundChild.rollNumber}</Text>
                </View>
              )}
            </>
          )}

          <TouchableOpacity
            onPress={handleSignup}
            disabled={isLoading || !foundSchool || (mode === 'parent' && !foundChild)}
            style={{
              backgroundColor: isLoading || !foundSchool || (mode === 'parent' && !foundChild) ? '#9FA8DA' : (mode === 'parent' ? '#006064' : '#1A237E'),
              borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
              {isLoading ? 'Registering...' : mode === 'parent' ? 'Create Parent Account' : 'Create Student Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ textAlign: 'center', color: '#1A237E', fontSize: 13 }}>
              Already have an account? <Text style={{ fontWeight: 'bold' }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
