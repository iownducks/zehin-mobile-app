import { useSchoolStore } from '@/store/schoolStore';
import { School, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ManagementSchools() {
  const insets = useSafeAreaInsets();
  const { data } = useSchoolStore();
  const [search, setSearch] = useState('');

  const schools = (data?.schools || []).filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#4A148C', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 }}>All Schools ({schools.length})</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 }}>
          <Search size={18} color="#757575" />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search schools..." style={{ flex: 1, marginLeft: 10, fontSize: 15 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {schools.map((school) => {
          const teachers = data?.users.filter((u) => u.role === 'teacher' && u.schoolId === school.id) || [];
          const students = data?.users.filter((u) => u.role === 'student' && u.schoolId === school.id) || [];
          const tasks = data?.tasks.filter((t) => t.schoolId === school.id) || [];

          return (
            <View key={school.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
                <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <School size={26} color="#7B1FA2" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#4A148C', fontSize: 16 }}>{school.name}</Text>
                  <Text style={{ color: '#757575', fontSize: 13, marginTop: 2 }}>
                    {school.city}, {school.province}
                  </Text>
                  {school.principalName && (
                    <Text style={{ color: '#9E9E9E', fontSize: 12, marginTop: 2 }}>
                      Principal: {school.principalName}
                    </Text>
                  )}
                </View>
              </View>

              <View style={{ backgroundColor: '#F3E5F5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: '#7B1FA2', fontSize: 13, fontWeight: '500' }}>Registration Code:</Text>
                <Text style={{ color: '#4A148C', fontSize: 16, fontWeight: 'bold' }}>{school.registrationCode}</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { label: 'Teachers', value: teachers.length },
                  { label: 'Students', value: students.length },
                  { label: 'Tasks', value: tasks.length },
                ].map((stat) => (
                  <View key={stat.label} style={{ flex: 1, backgroundColor: '#F8F9FF', borderRadius: 10, padding: 12, alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#4A148C' }}>{stat.value}</Text>
                    <Text style={{ fontSize: 11, color: '#9E9E9E', marginTop: 2 }}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              {school.phone && (
                <Text style={{ color: '#9E9E9E', fontSize: 12, marginTop: 12 }}>📞 {school.phone}</Text>
              )}
              <Text style={{ color: '#BDBDBD', fontSize: 11, marginTop: 4 }}>
                Registered: {new Date(school.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
