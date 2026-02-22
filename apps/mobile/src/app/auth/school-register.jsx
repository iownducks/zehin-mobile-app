import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { useRouter } from 'expo-router';
import { ArrowLeft, School } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert, ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'AJK'];

export default function SchoolRegister() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useUser();
  const registerSchool = useSchoolStore((s) => s.registerSchool);

  const [form, setForm] = useState({
    name: '',
    city: '',
    province: 'Punjab',
    principalName: '',
    phone: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: school info, 2: admin account

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    const { name, city, province, principalName, adminEmail, adminPassword } = form;
    if (!name || !city || !principalName || !adminEmail || !adminPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (adminPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      const { school, admin } = await registerSchool(form);
      Alert.alert(
        'School Registered!',
        `Your registration code is: ${school.registrationCode}\n\nShare this with your students and teachers so they can join your school.`,
        [{ text: 'Continue', onPress: () => {
          login(admin);
          router.replace('/school');
        }}]
      );
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
        keyboardType={keyboardType || 'default'}
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
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' }}>Register School</Text>
            <Text style={{ color: '#E8EAF6', fontSize: 13 }}>Join the Zihn network</Text>
          </View>
        </View>

        {/* Steps */}
        <View style={{ flexDirection: 'row', marginBottom: 20, gap: 8 }}>
          {[1, 2].map((s) => (
            <View key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              backgroundColor: s <= step ? '#FFD700' : 'rgba(255,255,255,0.3)',
            }} />
          ))}
        </View>

        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24 }}>
          {step === 1 ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <School size={24} color="#1A237E" />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1A237E', marginLeft: 10 }}>
                  School Information
                </Text>
              </View>
              <Field label="School Name *" placeholder="e.g. Govt. High School Lahore" value={form.name} onChangeText={(v) => update('name', v)} />
              <Field label="City *" placeholder="e.g. Lahore" value={form.city} onChangeText={(v) => update('city', v)} />

              <Text style={{ color: '#424242', marginBottom: 6, fontSize: 13, fontWeight: '500' }}>Province *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {PROVINCES.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => update('province', p)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: form.province === p ? '#1A237E' : '#F5F5F5',
                      borderWidth: 1,
                      borderColor: form.province === p ? '#1A237E' : '#E0E0E0',
                    }}
                  >
                    <Text style={{
                      color: form.province === p ? '#FFF' : '#424242',
                      fontWeight: form.province === p ? '600' : '400',
                      fontSize: 13,
                    }}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Field label="Principal's Name *" placeholder="e.g. Muhammad Arshad" value={form.principalName} onChangeText={(v) => update('principalName', v)} />
              <Field label="School Phone" placeholder="e.g. 042-35761234" value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" />

              <TouchableOpacity
                onPress={() => setStep(2)}
                style={{ backgroundColor: '#1A237E', borderRadius: 12, padding: 16, alignItems: 'center' }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Next →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1A237E', marginBottom: 20 }}>
                Admin Account
              </Text>
              <Text style={{ fontSize: 13, color: '#757575', marginBottom: 16 }}>
                This account will be used to manage your school, add teachers and students.
              </Text>
              <Field label="Admin Email *" placeholder="principal@school.edu.pk" value={form.adminEmail} onChangeText={(v) => update('adminEmail', v)} keyboardType="email-address" />
              <Field label="Password *" placeholder="Min 6 characters" value={form.adminPassword} onChangeText={(v) => update('adminPassword', v)} secureTextEntry />

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#9FA8DA' : '#1A237E',
                  borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
                  {isLoading ? 'Registering...' : 'Register School'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep(1)}>
                <Text style={{ textAlign: 'center', color: '#1A237E', fontSize: 13 }}>← Back</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
