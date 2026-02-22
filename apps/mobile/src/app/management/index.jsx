import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { useRouter } from 'expo-router';
import { BarChart2, BookOpen, ClipboardList, LogOut, School, TrendingUp, Users } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ManagementDashboard() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useUser();
  const router = useRouter();
  const { data } = useSchoolStore();

  const stats = useMemo(() => {
    if (!data) return {};
    const schools = data.schools || [];
    const users = data.users || [];
    const tasks = data.tasks || [];
    const materials = data.studyMaterials || [];

    const teachers = users.filter((u) => u.role === 'teacher');
    const students = users.filter((u) => u.role === 'student');
    const totalSubmissions = tasks.reduce((acc, t) => acc + (t.submissions?.length || 0), 0);
    const gradedSubmissions = tasks.reduce((acc, t) => acc + (t.submissions?.filter((s) => s.grade)?.length || 0), 0);

    return {
      schools: schools.length,
      teachers: teachers.length,
      students: students.length,
      tasks: tasks.length,
      materials: materials.length,
      totalSubmissions,
      gradedSubmissions,
      overallRate: tasks.length > 0 && students.length > 0
        ? Math.round((totalSubmissions / (tasks.length * students.length)) * 100)
        : 0,
    };
  }, [data]);

  const schoolStats = useMemo(() => {
    if (!data) return [];
    return data.schools.map((school) => {
      const teachers = data.users.filter((u) => u.role === 'teacher' && u.schoolId === school.id);
      const students = data.users.filter((u) => u.role === 'student' && u.schoolId === school.id);
      const tasks = data.tasks.filter((t) => t.schoolId === school.id);
      const totalSubs = tasks.reduce((acc, t) => acc + (t.submissions?.length || 0), 0);
      return { ...school, teacherCount: teachers.length, studentCount: students.length, taskCount: tasks.length, submissionCount: totalSubs };
    });
  }, [data]);

  const summaryCards = [
    { label: 'Total Schools', value: stats.schools, icon: <School size={20} color="#7B1FA2" />, color: '#F3E5F5', textColor: '#7B1FA2' },
    { label: 'Teachers', value: stats.teachers, icon: <Users size={20} color="#1565C0" />, color: '#E3F2FD', textColor: '#1565C0' },
    { label: 'Students', value: stats.students, icon: <BookOpen size={20} color="#2E7D32" />, color: '#E8F5E9', textColor: '#2E7D32' },
    { label: 'Tasks Given', value: stats.tasks, icon: <ClipboardList size={20} color="#E65100" />, color: '#FFF3E0', textColor: '#E65100' },
    { label: 'Submissions', value: stats.totalSubmissions, icon: <TrendingUp size={20} color="#00695C" />, color: '#E0F2F1', textColor: '#00695C' },
    { label: 'Study Materials', value: stats.materials, icon: <BarChart2 size={20} color="#AD1457" />, color: '#FCE4EC', textColor: '#AD1457' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#4A148C', paddingTop: insets.top + 16, paddingBottom: 24, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ fontSize: 13, color: '#E1BEE7' }}>Management Portal</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginTop: 2 }}>Zihn Network</Text>
            <Text style={{ fontSize: 12, color: '#CE93D8', marginTop: 4 }}>System-wide overview</Text>
          </View>
          <TouchableOpacity onPress={async () => { await logout(); router.replace('/auth/login'); }}
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10 }}>
            <LogOut size={20} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 80 }}>
        {/* Global Stats */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {summaryCards.map((s) => (
            <View key={s.label} style={{ width: '47%', backgroundColor: s.color, borderRadius: 14, padding: 16 }}>
              <View style={{ marginBottom: 8 }}>{s.icon}</View>
              <Text style={{ fontSize: 26, fontWeight: 'bold', color: s.textColor }}>{s.value}</Text>
              <Text style={{ fontSize: 11, color: s.textColor, marginTop: 2, opacity: 0.8 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Overall Submission Rate */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#4A148C', marginBottom: 12 }}>Network Performance</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: '#616161' }}>Overall task completion rate</Text>
            <Text style={{ fontWeight: 'bold', color: '#4A148C' }}>{stats.overallRate}%</Text>
          </View>
          <View style={{ height: 10, backgroundColor: '#E0E0E0', borderRadius: 5, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${stats.overallRate}%`, backgroundColor: '#7B1FA2', borderRadius: 5 }} />
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <View style={{ flex: 1, backgroundColor: '#F3E5F5', borderRadius: 10, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#7B1FA2' }}>{stats.totalSubmissions}</Text>
              <Text style={{ fontSize: 11, color: '#9E9E9E' }}>Total Submissions</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#E8F5E9', borderRadius: 10, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#2E7D32' }}>{stats.gradedSubmissions}</Text>
              <Text style={{ fontSize: 11, color: '#9E9E9E' }}>Graded</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#FFF3E0', borderRadius: 10, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#E65100' }}>
                {stats.totalSubmissions - stats.gradedSubmissions}
              </Text>
              <Text style={{ fontSize: 11, color: '#9E9E9E' }}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Schools Overview */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4A148C', marginBottom: 12 }}>Schools Overview</Text>
        {schoolStats.map((school) => (
          <View key={school.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 }}>
              <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                <School size={22} color="#7B1FA2" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: '#4A148C', fontSize: 15 }}>{school.name}</Text>
                <Text style={{ color: '#757575', fontSize: 12, marginTop: 2 }}>{school.city}, {school.province}</Text>
                <View style={{ backgroundColor: '#F3E5F5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginTop: 6, alignSelf: 'flex-start' }}>
                  <Text style={{ color: '#7B1FA2', fontSize: 11, fontWeight: '700' }}>{school.registrationCode}</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { label: 'Teachers', value: school.teacherCount, color: '#E3F2FD', textColor: '#1565C0' },
                { label: 'Students', value: school.studentCount, color: '#E8F5E9', textColor: '#2E7D32' },
                { label: 'Tasks', value: school.taskCount, color: '#FFF3E0', textColor: '#E65100' },
                { label: 'Submissions', value: school.submissionCount, color: '#F3E5F5', textColor: '#7B1FA2' },
              ].map((stat) => (
                <View key={stat.label} style={{ flex: 1, backgroundColor: stat.color, borderRadius: 10, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: stat.textColor }}>{stat.value}</Text>
                  <Text style={{ fontSize: 10, color: '#9E9E9E', textAlign: 'center' }}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
