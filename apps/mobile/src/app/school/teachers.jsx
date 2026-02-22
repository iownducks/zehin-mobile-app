import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { Plus, Search, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu', 'Islamiat', 'Pak Studies', 'Computer', 'History'];

export default function SchoolTeachers() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { getSchoolTeachers, registerTeacher, getTeacherTasks } = useSchoolStore();

  const teachers = getSchoolTeachers(user?.schoolId);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', subjects: [], classesAssigned: [],
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleSubject = (s) => {
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(s) ? f.subjects.filter((x) => x !== s) : [...f.subjects, s],
    }));
  };
  const toggleClass = (c) => {
    setForm((f) => ({
      ...f,
      classesAssigned: f.classesAssigned.includes(c) ? f.classesAssigned.filter((x) => x !== c) : [...f.classesAssigned, c],
    }));
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Error', 'Name, email and password are required');
      return;
    }
    if (form.subjects.length === 0) {
      Alert.alert('Error', 'Please select at least one subject');
      return;
    }
    await registerTeacher({ ...form, schoolId: user.schoolId });
    setShowAdd(false);
    setForm({ name: '', email: '', password: '', subjects: [], classesAssigned: [] });
    Alert.alert('Success', 'Teacher account created successfully!');
  };

  const filtered = teachers.filter((t) =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', flex: 1 }}>Teachers ({teachers.length})</Text>
          <TouchableOpacity onPress={() => setShowAdd(true)} style={{ backgroundColor: '#FFD700', borderRadius: 10, padding: 10 }}>
            <Plus size={20} color="#1A237E" />
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 }}>
          <Search size={18} color="#757575" />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search teachers..." style={{ flex: 1, marginLeft: 10, fontSize: 15 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {filtered.map((teacher) => {
          const tasks = getTeacherTasks(teacher.id);
          const totalSubmissions = tasks.reduce((acc, t) => acc + (t.submissions?.length || 0), 0);
          return (
            <View key={teacher.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8EAF6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <User size={22} color="#1A237E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 15 }}>{teacher.name}</Text>
                  <Text style={{ color: '#757575', fontSize: 12 }}>{teacher.email}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {teacher.subjects?.map((s) => (
                  <View key={s} style={{ backgroundColor: '#E8EAF6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: '#1A237E', fontSize: 11, fontWeight: '600' }}>{s}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1, backgroundColor: '#F8F9FF', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1A237E' }}>{tasks.length}</Text>
                  <Text style={{ fontSize: 11, color: '#9E9E9E' }}>Tasks</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#E8F5E9', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2E7D32' }}>{totalSubmissions}</Text>
                  <Text style={{ fontSize: 11, color: '#9E9E9E' }}>Submissions</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#FFF9C4', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F57F17' }}>
                    {teacher.classesAssigned?.length || 0}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#9E9E9E' }}>Classes</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#E0E0E0' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1A237E', flex: 1 }}>Add Teacher</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <X size={22} color="#424242" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
              <Label>Full Name *</Label>
              <Input value={form.name} onChangeText={(v) => update('name', v)} placeholder="Ms. Ayesha Siddiqui" />
              <Label>Email *</Label>
              <Input value={form.email} onChangeText={(v) => update('email', v)} placeholder="teacher@school.edu.pk" keyboardType="email-address" />
              <Label>Password *</Label>
              <Input value={form.password} onChangeText={(v) => update('password', v)} placeholder="Min 6 characters" secureTextEntry />

              <Label>Subjects *</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {SUBJECTS.map((s) => (
                  <TouchableOpacity key={s} onPress={() => toggleSubject(s)}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: form.subjects.includes(s) ? '#1A237E' : '#F5F5F5', borderWidth: 1, borderColor: form.subjects.includes(s) ? '#1A237E' : '#E0E0E0' }}>
                    <Text style={{ color: form.subjects.includes(s) ? '#FFF' : '#424242', fontSize: 12 }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Label>Classes Assigned</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
                  <TouchableOpacity key={c} onPress={() => toggleClass(c)}
                    style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: form.classesAssigned.includes(c) ? '#1A237E' : '#F5F5F5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: form.classesAssigned.includes(c) ? '#1A237E' : '#E0E0E0' }}>
                    <Text style={{ color: form.classesAssigned.includes(c) ? '#FFF' : '#424242', fontWeight: '600', fontSize: 13 }}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: '#1A237E', borderRadius: 12, padding: 16, alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15 }}>Add Teacher</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const Label = ({ children }) => <Text style={{ color: '#424242', marginBottom: 6, fontSize: 13, fontWeight: '500' }}>{children}</Text>;
const Input = ({ value, onChangeText, placeholder, keyboardType, secureTextEntry }) => (
  <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} keyboardType={keyboardType} secureTextEntry={secureTextEntry} autoCapitalize="none"
    style={{ backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 14, borderWidth: 1, borderColor: '#E0E0E0' }} />
);
