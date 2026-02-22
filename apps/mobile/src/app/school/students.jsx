import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { Search, User } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SchoolStudents() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { getSchoolStudents, getSchoolTasks } = useSchoolStore();

  const students = getSchoolStudents(user?.schoolId);
  const tasks = getSchoolTasks(user?.schoolId);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  const classes = [...new Set(students.map((s) => s.classLevel))].sort((a, b) => a - b);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
      const matchClass = selectedClass === 'all' || s.classLevel === Number(selectedClass);
      return matchSearch && matchClass;
    });
  }, [students, search, selectedClass]);

  const getStudentStats = (student) => {
    const studentTasks = tasks.filter((t) => t.classLevel === student.classLevel);
    const submitted = studentTasks.filter((t) => t.submissions?.some((s) => s.studentId === student.id)).length;
    const graded = studentTasks.filter((t) => t.submissions?.some((s) => s.studentId === student.id && s.grade)).length;
    const rate = studentTasks.length > 0 ? Math.round((submitted / studentTasks.length) * 100) : 0;
    return { total: studentTasks.length, submitted, graded, rate };
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 }}>Students ({students.length})</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 }}>
          <Search size={18} color="#757575" />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search students..." style={{ flex: 1, marginLeft: 10, fontSize: 15 }} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E0E0E0', maxHeight: 54 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        <TouchableOpacity onPress={() => setSelectedClass('all')}
          style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: selectedClass === 'all' ? '#1A237E' : '#F5F5F5', borderWidth: 1, borderColor: selectedClass === 'all' ? '#1A237E' : '#E0E0E0' }}>
          <Text style={{ color: selectedClass === 'all' ? '#FFF' : '#424242', fontSize: 13, fontWeight: '600' }}>All Classes</Text>
        </TouchableOpacity>
        {classes.map((c) => (
          <TouchableOpacity key={c} onPress={() => setSelectedClass(String(c))}
            style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: selectedClass === String(c) ? '#1A237E' : '#F5F5F5', borderWidth: 1, borderColor: selectedClass === String(c) ? '#1A237E' : '#E0E0E0' }}>
            <Text style={{ color: selectedClass === String(c) ? '#FFF' : '#424242', fontSize: 13, fontWeight: '600' }}>Class {c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {filtered.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <Text style={{ color: '#9E9E9E', fontSize: 15 }}>No students found</Text>
          </View>
        ) : (
          filtered.map((student) => {
            const stats = getStudentStats(student);
            return (
              <View key={student.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#E8EAF6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <User size={22} color="#1A237E" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 15 }}>{student.name}</Text>
                    <Text style={{ color: '#757575', fontSize: 12 }}>
                      Class {student.classLevel} • {student.board}
                      {student.rollNumber ? ` • ${student.rollNumber}` : ''}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: stats.rate >= 70 ? '#E8F5E9' : stats.rate >= 40 ? '#FFF9C4' : '#FFEBEE', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: stats.rate >= 70 ? '#2E7D32' : stats.rate >= 40 ? '#F57F17' : '#C62828' }}>{stats.rate}%</Text>
                    <Text style={{ fontSize: 10, color: '#9E9E9E' }}>done</Text>
                  </View>
                </View>
                <View style={{ height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${stats.rate}%`, backgroundColor: stats.rate >= 70 ? '#4CAF50' : stats.rate >= 40 ? '#FFC107' : '#F44336', borderRadius: 3 }} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <Text style={{ fontSize: 12, color: '#9E9E9E' }}>{stats.total} tasks</Text>
                  <Text style={{ fontSize: 12, color: '#2E7D32' }}>• {stats.submitted} submitted</Text>
                  <Text style={{ fontSize: 12, color: '#1565C0' }}>• {stats.graded} graded</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
