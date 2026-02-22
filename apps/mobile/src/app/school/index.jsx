import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { useRouter } from 'expo-router';
import { BookOpen, ClipboardList, LogOut, TrendingUp, Users } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SchoolOverview() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useUser();
  const router = useRouter();
  const { getSchool, getSchoolTeachers, getSchoolStudents, getSchoolTasks, getSchoolAnnouncements, getTeacherMaterials } = useSchoolStore();

  const school = getSchool(user?.schoolId);
  const teachers = getSchoolTeachers(user?.schoolId);
  const students = getSchoolStudents(user?.schoolId);
  const tasks = getSchoolTasks(user?.schoolId);
  const announcements = getSchoolAnnouncements(user?.schoolId);

  const totalSubmissions = useMemo(() => {
    return tasks.reduce((acc, t) => acc + (t.submissions?.length || 0), 0);
  }, [tasks]);

  const submissionRate = tasks.length > 0 && students.length > 0
    ? Math.round((totalSubmissions / (tasks.length * students.length)) * 100)
    : 0;

  const classGroups = useMemo(() => {
    const groups = {};
    students.forEach((s) => {
      if (!groups[s.classLevel]) groups[s.classLevel] = 0;
      groups[s.classLevel]++;
    });
    return Object.entries(groups).sort(([a], [b]) => Number(a) - Number(b));
  }, [students]);

  const teacherPerformance = useMemo(() => {
    return teachers.map((t) => {
      const tTasks = tasks.filter((task) => task.teacherId === t.id);
      const tSubmissions = tTasks.reduce((acc, task) => acc + (task.submissions?.length || 0), 0);
      return { ...t, taskCount: tTasks.length, submissionCount: tSubmissions };
    }).sort((a, b) => b.taskCount - a.taskCount);
  }, [teachers, tasks]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 24, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: '#E8EAF6' }}>School Admin Portal</Text>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginTop: 2 }} numberOfLines={2}>
              {school?.name || 'Your School'}
            </Text>
            <Text style={{ fontSize: 12, color: '#FFD700', marginTop: 4 }}>
              {school?.city}, {school?.province}
            </Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8, alignSelf: 'flex-start' }}>
              <Text style={{ color: '#FFD700', fontSize: 12, fontWeight: '700' }}>Code: {school?.registrationCode}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={async () => { await logout(); router.replace('/auth/login'); }}
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10 }}>
            <LogOut size={20} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 80 }}>
        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Teachers', value: teachers.length, icon: <Users size={18} color="#1A237E" />, color: '#E8EAF6' },
            { label: 'Students', value: students.length, icon: <BookOpen size={18} color="#2E7D32" />, color: '#E8F5E9' },
            { label: 'Tasks', value: tasks.length, icon: <ClipboardList size={18} color="#E65100" />, color: '#FFF3E0' },
            { label: 'Completion', value: `${submissionRate}%`, icon: <TrendingUp size={18} color="#7B1FA2" />, color: '#F3E5F5' },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, backgroundColor: s.color, borderRadius: 12, padding: 12, alignItems: 'center' }}>
              {s.icon}
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1A237E', marginTop: 6 }}>{s.value}</Text>
              <Text style={{ fontSize: 10, color: '#757575', marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Class Breakdown */}
        {classGroups.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1A237E', marginBottom: 12 }}>Students by Class</Text>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 20 }}>
              {classGroups.map(([cls, count]) => (
                <View key={cls} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ width: 64, fontSize: 13, fontWeight: '600', color: '#1A237E' }}>Class {cls}</Text>
                  <View style={{ flex: 1, height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden', marginHorizontal: 10 }}>
                    <View style={{ height: '100%', width: `${(count / students.length) * 100}%`, backgroundColor: '#1A237E', borderRadius: 4 }} />
                  </View>
                  <Text style={{ width: 28, fontSize: 13, color: '#757575', textAlign: 'right' }}>{count}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Teacher Activity */}
        {teacherPerformance.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1A237E', marginBottom: 12 }}>Teacher Activity</Text>
            {teacherPerformance.map((t) => (
              <View key={t.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8EAF6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Users size={20} color="#1A237E" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', color: '#1A237E', fontSize: 14 }}>{t.name}</Text>
                    <Text style={{ color: '#757575', fontSize: 12 }}>{t.subjects?.join(', ')}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontWeight: 'bold', color: '#1A237E', fontSize: 16 }}>{t.taskCount}</Text>
                    <Text style={{ color: '#9E9E9E', fontSize: 11 }}>tasks</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Recent Announcements */}
        {announcements.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1A237E', marginBottom: 12, marginTop: 8 }}>Recent Announcements</Text>
            {announcements.slice(0, 3).map((ann) => (
              <View key={ann.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#FFD700' }}>
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
