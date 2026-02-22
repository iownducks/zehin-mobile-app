import { useSchoolStore } from '@/store/schoolStore';
import { Search, User } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ROLES = ['all', 'student', 'teacher', 'school_admin', 'management'];
const roleColors = {
  student: { bg: '#E8F5E9', text: '#2E7D32' },
  teacher: { bg: '#E3F2FD', text: '#1565C0' },
  school_admin: { bg: '#FFF3E0', text: '#E65100' },
  management: { bg: '#F3E5F5', text: '#7B1FA2' },
};

export default function ManagementUsers() {
  const insets = useSafeAreaInsets();
  const { data } = useSchoolStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const schools = data?.schools || [];
  const users = (data?.users || []).filter((u) => u.role !== 'management');

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#4A148C', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 }}>All Users ({users.length})</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 }}>
          <Search size={18} color="#757575" />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search users..." style={{ flex: 1, marginLeft: 10, fontSize: 15 }} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E0E0E0', maxHeight: 54 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        {ROLES.filter((r) => r !== 'management').map((r) => {
          const count = r === 'all' ? users.length : users.filter((u) => u.role === r).length;
          return (
            <TouchableOpacity key={r} onPress={() => setRoleFilter(r)}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: roleFilter === r ? '#4A148C' : '#F5F5F5', borderWidth: 1, borderColor: roleFilter === r ? '#4A148C' : '#E0E0E0', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: roleFilter === r ? '#FFF' : '#424242', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>{r.replace('_', ' ')}</Text>
              <Text style={{ color: roleFilter === r ? '#CE93D8' : '#9E9E9E', fontSize: 11 }}>({count})</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {filtered.map((u) => {
          const school = schools.find((s) => s.id === u.schoolId);
          const rc = roleColors[u.role] || { bg: '#F5F5F5', text: '#424242' };
          return (
            <View key={u.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: rc.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <User size={20} color={rc.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: '#1A237E', fontSize: 14 }}>{u.name}</Text>
                  <Text style={{ color: '#757575', fontSize: 12 }}>{u.email}</Text>
                  {school && <Text style={{ color: '#9E9E9E', fontSize: 11, marginTop: 1 }}>{school.name}</Text>}
                  {u.classLevel && <Text style={{ color: '#9E9E9E', fontSize: 11 }}>Class {u.classLevel} • {u.board}</Text>}
                  {u.subjects && <Text style={{ color: '#9E9E9E', fontSize: 11 }}>{u.subjects.join(', ')}</Text>}
                </View>
                <View style={{ backgroundColor: rc.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: rc.text, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>
                    {u.role.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
