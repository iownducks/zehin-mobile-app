import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { useRouter } from 'expo-router';
import { BookOpen, ClipboardList, LogOut, TrendingUp, Users } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TeacherDashboard() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useUser();
  const router = useRouter();
  const { getSchoolStudents, getTeacherTasks, getSchoolAnnouncements, getSchool, getTeacherMaterials } = useSchoolStore();

  const school = getSchool(user?.schoolId);
  const students = getSchoolStudents(user?.schoolId).filter(
    (s) => user?.classesAssigned?.includes(s.classLevel)
  );
  const tasks = getTeacherTasks(user?.id);
  const materials = getTeacherMaterials(user?.id);
  const announcements = getSchoolAnnouncements(user?.schoolId).slice(0, 3);

  const pendingGrades = useMemo(() => {
    let count = 0;
    tasks.forEach((t) => {
      t.submissions?.forEach((s) => {
        if (s.status === 'submitted' && !s.grade) count++;
      });
    });
    return count;
  }, [tasks]);

  const stats = [
    { label: 'My Students', value: students.length, icon: <Users size={20} color="#1A237E" />, color: '#E8EAF6' },
    { label: 'Tasks Given', value: tasks.length, icon: <ClipboardList size={20} color="#2E7D32" />, color: '#E8F5E9' },
    { label: 'Materials', value: materials.length, icon: <BookOpen size={20} color="#E65100" />, color: '#FFF3E0' },
    { label: 'To Grade', value: pendingGrades, icon: <TrendingUp size={20} color="#C62828" />, color: '#FFEBEE' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 24, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: '#E8EAF6' }}>Teacher Dashboard</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginTop: 2 }}>
              {user?.name}
            </Text>
            <Text style={{ fontSize: 12, color: '#FFD700', marginTop: 4 }}>
              {school?.name || 'School'}
            </Text>
            <Text style={{ fontSize: 12, color: '#9FA8DA', marginTop: 2 }}>
              Subjects: {user?.subjects?.join(', ')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={async () => { await logout(); router.replace('/auth/login'); }}
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10 }}
          >
            <LogOut size={20} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 80 }}>
        {/* Stats */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {stats.map((s) => (
            <View key={s.label} style={{
              width: '47%', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
            }}>
              <View style={{ backgroundColor: s.color, borderRadius: 10, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                {s.icon}
              </View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1A237E' }}>{s.value}</Text>
              <Text style={{ fontSize: 12, color: '#757575', marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1A237E', marginBottom: 12 }}>Quick Actions</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.push('/teacher/tasks?create=1')}
            style={{ flex: 1, backgroundColor: '#1A237E', borderRadius: 14, padding: 16, alignItems: 'center' }}
          >
            <ClipboardList size={24} color="#FFD700" />
            <Text style={{ color: '#FFF', fontWeight: '600', marginTop: 8, fontSize: 13 }}>Assign Task</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/teacher/materials?create=1')}
            style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#1A237E' }}
          >
            <BookOpen size={24} color="#1A237E" />
            <Text style={{ color: '#1A237E', fontWeight: '600', marginTop: 8, fontSize: 13 }}>Add Material</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Tasks */}
        {tasks.length > 0 && (
          <>
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1A237E', marginBottom: 12 }}>Recent Tasks</Text>
            {tasks.slice(-3).reverse().map((task) => {
              const submitted = task.submissions?.length || 0;
              const graded = task.submissions?.filter((s) => s.grade)?.length || 0;
              return (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => router.push(`/teacher/tasks?id=${task.id}`)}
                  style={{
                    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 10,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ flex: 1, fontWeight: '600', color: '#1A237E', fontSize: 14 }} numberOfLines={1}>
                      {task.title}
                    </Text>
                    <View style={{
                      backgroundColor: task.priority === 'high' ? '#FFEBEE' : '#FFF9C4',
                      borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8,
                    }}>
                      <Text style={{ fontSize: 11, color: task.priority === 'high' ? '#C62828' : '#F57F17', fontWeight: '600' }}>
                        {task.priority?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: '#757575' }}>
                    {task.subject} • Class {task.classLevel} • {submitted} submitted, {graded} graded
                  </Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <>
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1A237E', marginBottom: 12, marginTop: 8 }}>
              School Announcements
            </Text>
            {announcements.map((ann) => (
              <View key={ann.id} style={{
                backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10,
                borderLeftWidth: 4, borderLeftColor: '#FFD700',
              }}>
                <Text style={{ fontWeight: '600', color: '#1A237E', fontSize: 14, marginBottom: 4 }}>{ann.title}</Text>
                <Text style={{ color: '#616161', fontSize: 13 }} numberOfLines={2}>{ann.content}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
