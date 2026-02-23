import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { useRouter } from 'expo-router';
import { AlertCircle, Bell, BookOpen, CheckCircle, Clock, LogOut, User } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ParentHome() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useUser();
  const router = useRouter();
  const { getUser, getSchool, getStudentTasks, getChildFees, getParentAnnouncements } = useSchoolStore();

  const child = getUser(user?.childId);
  const school = getSchool(user?.schoolId);
  const tasks = child ? getStudentTasks(child) : [];
  const fees = getChildFees(user?.childId);
  const announcements = getParentAnnouncements(user?.schoolId);

  const pendingTasks = tasks.filter((t) => {
    const sub = t.submissions?.find((s) => s.studentId === child?.id);
    return !sub && new Date(t.dueDate) >= new Date();
  });
  const overdueTasks = tasks.filter((t) => {
    const sub = t.submissions?.find((s) => s.studentId === child?.id);
    return !sub && new Date(t.dueDate) < new Date();
  });
  const gradedTasks = tasks.filter((t) => {
    const sub = t.submissions?.find((s) => s.studentId === child?.id);
    return sub?.grade;
  });
  const pendingFees = fees.filter((f) => f.status !== 'paid');
  const overdueFees = fees.filter((f) => f.status === 'overdue');

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#006064', paddingTop: insets.top + 12, paddingBottom: 24, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={{ color: '#B2EBF2', fontSize: 13 }}>Welcome back,</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>{user?.name}</Text>
            <Text style={{ color: '#80DEEA', fontSize: 12, marginTop: 2 }}>Parent Portal • {school?.name}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10 }}>
            <LogOut size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Child card */}
        {child && (
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#E0F7FA', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} color="#006064" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>{child.name}</Text>
              <Text style={{ color: '#B2EBF2', fontSize: 13 }}>
                Class {child.classLevel} • {child.board} Board
                {child.rollNumber ? ` • Roll: ${child.rollNumber}` : ''}
              </Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {/* Alerts */}
        {overdueTasks.length > 0 && (
          <View style={{ backgroundColor: '#FFEBEE', borderRadius: 12, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#FFCDD2' }}>
            <AlertCircle size={20} color="#C62828" />
            <Text style={{ color: '#C62828', fontWeight: '700', flex: 1 }}>
              {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''} — needs attention!
            </Text>
          </View>
        )}
        {overdueFees.length > 0 && (
          <View style={{ backgroundColor: '#FFF3E0', borderRadius: 12, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#FFE0B2' }}>
            <AlertCircle size={20} color="#E65100" />
            <Text style={{ color: '#E65100', fontWeight: '700', flex: 1 }}>
              {overdueFees.length} fee payment{overdueFees.length > 1 ? 's' : ''} overdue!
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Total Tasks', value: tasks.length, color: '#006064', bg: '#E0F7FA' },
            { label: 'Pending', value: pendingTasks.length, color: '#F57F17', bg: '#FFF9C4' },
            { label: 'Overdue', value: overdueTasks.length, color: '#C62828', bg: '#FFEBEE' },
            { label: 'Graded', value: gradedTasks.length, color: '#2E7D32', bg: '#E8F5E9' },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, backgroundColor: s.bg, borderRadius: 12, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: s.color }}>{s.value}</Text>
              <Text style={{ fontSize: 10, color: '#757575', marginTop: 2, textAlign: 'center' }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick links */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.push('/parent/child')}
            style={{ flex: 1, backgroundColor: '#006064', borderRadius: 12, padding: 14, alignItems: 'center', gap: 6 }}>
            <BookOpen size={22} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>View Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/parent/fees')}
            style={{ flex: 1, backgroundColor: pendingFees.length > 0 ? '#E65100' : '#37474F', borderRadius: 12, padding: 14, alignItems: 'center', gap: 6 }}>
            <Bell size={22} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>
              Fees {pendingFees.length > 0 ? `(${pendingFees.length})` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/parent/teachers')}
            style={{ flex: 1, backgroundColor: '#1565C0', borderRadius: 12, padding: 14, alignItems: 'center', gap: 6 }}>
            <User size={22} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>Teachers</Text>
          </TouchableOpacity>
        </View>

        {/* Recent tasks */}
        <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 15, marginBottom: 10 }}>
          Recent Tasks
        </Text>
        {tasks.length === 0 ? (
          <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#9E9E9E' }}>No tasks assigned yet</Text>
          </View>
        ) : (
          tasks.slice().sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 4).map((task) => {
            const sub = task.submissions?.find((s) => s.studentId === child?.id);
            const isOverdue = !sub && new Date(task.dueDate) < new Date();
            const status = sub?.grade ? 'graded' : sub ? 'submitted' : isOverdue ? 'overdue' : 'pending';
            const statusColors = { graded: '#2E7D32', submitted: '#1565C0', overdue: '#C62828', pending: '#F57F17' };
            const statusBgs = { graded: '#E8F5E9', submitted: '#E3F2FD', overdue: '#FFEBEE', pending: '#FFF9C4' };
            return (
              <View key={task.id} style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: '#1A237E', fontSize: 14 }} numberOfLines={1}>{task.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Clock size={11} color="#9E9E9E" />
                    <Text style={{ fontSize: 12, color: '#9E9E9E' }}>
                      Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                    <Text style={{ color: '#9E9E9E' }}>•</Text>
                    <Text style={{ fontSize: 12, color: '#757575' }}>{task.subject}</Text>
                  </View>
                  {sub?.grade && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <CheckCircle size={12} color="#2E7D32" />
                      <Text style={{ fontSize: 12, color: '#2E7D32', fontWeight: '700' }}>Grade: {sub.grade}</Text>
                    </View>
                  )}
                </View>
                <View style={{ backgroundColor: statusBgs[status], borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Text style={{ color: statusColors[status], fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>{status}</Text>
                </View>
              </View>
            );
          })
        )}

        {/* Announcements preview */}
        {announcements.length > 0 && (
          <>
            <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 15, marginTop: 16, marginBottom: 10 }}>
              School Announcements
            </Text>
            {announcements.slice().reverse().slice(0, 2).map((ann) => (
              <View key={ann.id} style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#FFD700' }}>
                <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 14 }}>{ann.title}</Text>
                <Text style={{ color: '#424242', fontSize: 13, marginTop: 6, lineHeight: 19 }} numberOfLines={3}>{ann.content}</Text>
                <Text style={{ color: '#9E9E9E', fontSize: 12, marginTop: 6 }}>
                  {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
