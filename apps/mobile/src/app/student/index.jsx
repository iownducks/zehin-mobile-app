import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { useRouter } from 'expo-router';
import { BookOpen, CheckCircle, Clock, LogOut, TrendingUp } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StudentHome() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useUser();
  const router = useRouter();
  const { getStudentTasks, getStudentMaterials, getSchoolAnnouncements, getSchool, getSchoolQuizzes } = useSchoolStore();

  const school = getSchool(user?.schoolId);
  const tasks = getStudentTasks(user || {});
  const materials = getStudentMaterials(user || {});
  const announcements = getSchoolAnnouncements(user?.schoolId).slice(0, 3);
  const quizzes = getSchoolQuizzes(user?.schoolId, user?.classLevel);

  const taskStats = useMemo(() => {
    const mySubmissions = tasks.map((t) => ({
      task: t,
      sub: t.submissions?.find((s) => s.studentId === user?.id),
    }));
    const submitted = mySubmissions.filter((x) => x.sub).length;
    const pending = tasks.length - submitted;
    const graded = mySubmissions.filter((x) => x.sub?.grade).length;
    return { total: tasks.length, submitted, pending, graded };
  }, [tasks, user?.id]);

  const overdueTasks = tasks.filter((t) => {
    const sub = t.submissions?.find((s) => s.studentId === user?.id);
    return !sub && new Date(t.dueDate) < new Date();
  });

  const upcomingTasks = tasks.filter((t) => {
    const sub = t.submissions?.find((s) => s.studentId === user?.id);
    return !sub && new Date(t.dueDate) >= new Date();
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 3);

  const stats = [
    { label: 'Pending', value: taskStats.pending, color: '#FFEBEE', textColor: '#C62828' },
    { label: 'Submitted', value: taskStats.submitted, color: '#E8F5E9', textColor: '#2E7D32' },
    { label: 'Graded', value: taskStats.graded, color: '#E3F2FD', textColor: '#1565C0' },
    { label: 'Materials', value: materials.length, color: '#FFF9C4', textColor: '#F57F17' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: '#E8EAF6' }}>Welcome back,</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginTop: 2 }}>{user?.name}</Text>
            <Text style={{ fontSize: 12, color: '#FFD700', marginTop: 4 }}>
              Class {user?.classLevel} • {user?.board} Board
            </Text>
            {school && <Text style={{ fontSize: 12, color: '#9FA8DA', marginTop: 2 }}>{school.name}</Text>}
          </View>
          <TouchableOpacity
            onPress={async () => { await logout(); router.replace('/auth/login'); }}
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10 }}
          >
            <LogOut size={20} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 80 }} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {stats.map((s) => (
            <View key={s.label} style={{
              width: '47%', backgroundColor: s.color, borderRadius: 14, padding: 16,
            }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: s.textColor }}>{s.value}</Text>
              <Text style={{ fontSize: 12, color: s.textColor, marginTop: 2, opacity: 0.8 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Overdue Warning */}
        {overdueTasks.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push('/student/tasks')}
            style={{ backgroundColor: '#FFEBEE', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#FFCDD2', flexDirection: 'row', alignItems: 'center' }}>
            <Clock size={24} color="#C62828" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: 'bold', color: '#C62828', fontSize: 15 }}>
                {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}!
              </Text>
              <Text style={{ color: '#E57373', fontSize: 12, marginTop: 2 }}>Submit them as soon as possible</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Upcoming Tasks */}
        {upcomingTasks.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1A237E' }}>Upcoming Tasks</Text>
              <TouchableOpacity onPress={() => router.push('/student/tasks')}>
                <Text style={{ color: '#1A237E', fontSize: 13, fontWeight: '600' }}>View All</Text>
              </TouchableOpacity>
            </View>
            {upcomingTasks.map((task) => {
              const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              const priorityColor = { high: '#C62828', medium: '#F57F17', low: '#2E7D32' };
              return (
                <TouchableOpacity key={task.id} onPress={() => router.push('/student/tasks')}
                  style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 4, height: '100%', backgroundColor: priorityColor[task.priority] || '#1A237E', borderRadius: 2, marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', color: '#1A237E', fontSize: 14 }} numberOfLines={1}>{task.title}</Text>
                    <Text style={{ color: '#757575', fontSize: 12, marginTop: 3 }}>{task.subject}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: daysLeft <= 1 ? '#C62828' : daysLeft <= 3 ? '#F57F17' : '#2E7D32', fontWeight: '700', fontSize: 13 }}>
                      {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d`}
                    </Text>
                    <Text style={{ color: '#9E9E9E', fontSize: 10 }}>left</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Quick Links */}
        <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1A237E', marginBottom: 12, marginTop: 8 }}>Study Tools</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.push('/student/study')}
            style={{ flex: 1, backgroundColor: '#1A237E', borderRadius: 14, padding: 16, alignItems: 'center' }}>
            <BookOpen size={24} color="#FFD700" />
            <Text style={{ color: '#FFF', fontWeight: '600', marginTop: 8, fontSize: 13 }}>Study Notes</Text>
            <Text style={{ color: '#9FA8DA', fontSize: 11, marginTop: 2 }}>{materials.length} materials</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/student/quiz')}
            style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#1A237E' }}>
            <TrendingUp size={24} color="#1A237E" />
            <Text style={{ color: '#1A237E', fontWeight: '600', marginTop: 8, fontSize: 13 }}>Practice Quiz</Text>
            <Text style={{ color: '#9E9E9E', fontSize: 11, marginTop: 2 }}>{quizzes.length} quizzes</Text>
          </TouchableOpacity>
        </View>

        {/* Announcements */}
        {announcements.length > 0 && (
          <>
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1A237E', marginBottom: 12 }}>School Announcements</Text>
            {announcements.map((ann) => (
              <View key={ann.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#FFD700' }}>
                <Text style={{ fontWeight: '600', color: '#1A237E', fontSize: 14, marginBottom: 4 }}>{ann.title}</Text>
                <Text style={{ color: '#616161', fontSize: 13 }} numberOfLines={3}>{ann.content}</Text>
                <Text style={{ color: '#9E9E9E', fontSize: 11, marginTop: 6 }}>{ann.postedByName}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
