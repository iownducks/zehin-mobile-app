import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { Search, User } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TeacherStudents() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { getSchoolStudents, getTeacherTasks } = useSchoolStore();
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  const allStudents = getSchoolStudents(user?.schoolId).filter(
    (s) => !user?.classesAssigned?.length || user?.classesAssigned?.includes(s.classLevel)
  );
  const tasks = getTeacherTasks(user?.id);

  const filtered = useMemo(() => {
    return allStudents.filter((s) => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
      const matchClass = selectedClass === 'all' || s.classLevel === Number(selectedClass);
      return matchSearch && matchClass;
    });
  }, [allStudents, search, selectedClass]);

  const getStudentStats = (studentId) => {
    let totalTasks = 0;
    let submitted = 0;
    let graded = 0;
    let totalGradeScore = 0;

    tasks.forEach((t) => {
      totalTasks++;
      const sub = t.submissions?.find((s) => s.studentId === studentId);
      if (sub) {
        submitted++;
        if (sub.grade) {
          graded++;
        }
      }
    });

    return { totalTasks, submitted, pending: totalTasks - submitted };
  };

  const classes = [...new Set(allStudents.map((s) => s.classLevel))].sort((a, b) => a - b);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 }}>My Students</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 }}>
          <Search size={18} color="#757575" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search students..."
            style={{ flex: 1, marginLeft: 10, fontSize: 15 }}
          />
        </View>
      </View>

      {/* Class Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E0E0E0', maxHeight: 56 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row', alignItems: 'center' }}>
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
            const stats = getStudentStats(student.id);
            const submissionRate = stats.totalTasks > 0 ? Math.round((stats.submitted / stats.totalTasks) * 100) : 0;
            return (
              <View key={student.id} style={{
                backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 10,
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#E8EAF6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <User size={22} color="#1A237E" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 15 }}>{student.name}</Text>
                    <Text style={{ color: '#757575', fontSize: 12 }}>
                      Class {student.classLevel} • {student.board} Board
                      {student.rollNumber ? ` • ${student.rollNumber}` : ''}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: submissionRate >= 70 ? '#E8F5E9' : submissionRate >= 40 ? '#FFF9C4' : '#FFEBEE', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: submissionRate >= 70 ? '#2E7D32' : submissionRate >= 40 ? '#F57F17' : '#C62828', fontWeight: '700', fontSize: 14 }}>
                      {submissionRate}%
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1, backgroundColor: '#F8F9FF', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1A237E' }}>{stats.totalTasks}</Text>
                    <Text style={{ fontSize: 11, color: '#9E9E9E' }}>Total Tasks</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: '#E8F5E9', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2E7D32' }}>{stats.submitted}</Text>
                    <Text style={{ fontSize: 11, color: '#9E9E9E' }}>Submitted</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: '#FFEBEE', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#C62828' }}>{stats.pending}</Text>
                    <Text style={{ fontSize: 11, color: '#9E9E9E' }}>Pending</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={{ marginTop: 10 }}>
                  <View style={{ height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${submissionRate}%`, backgroundColor: submissionRate >= 70 ? '#4CAF50' : submissionRate >= 40 ? '#FFC107' : '#F44336', borderRadius: 3 }} />
                  </View>
                  <Text style={{ fontSize: 11, color: '#9E9E9E', marginTop: 4 }}>Task completion rate</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
