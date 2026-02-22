import { useSchoolStore } from '@/store/schoolStore';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ManagementReports() {
  const insets = useSafeAreaInsets();
  const { data } = useSchoolStore();
  const [selectedSchool, setSelectedSchool] = useState('all');

  const schools = data?.schools || [];
  const users = data?.users || [];
  const tasks = data?.tasks || [];
  const quizzes = data?.quizzes || [];

  const filteredTasks = selectedSchool === 'all' ? tasks : tasks.filter((t) => t.schoolId === selectedSchool);

  const report = useMemo(() => {
    const students = users.filter((u) => u.role === 'student' && (selectedSchool === 'all' || u.schoolId === selectedSchool));
    const teachers = users.filter((u) => u.role === 'teacher' && (selectedSchool === 'all' || u.schoolId === selectedSchool));

    // Subject breakdown
    const subjectMap = {};
    filteredTasks.forEach((t) => {
      if (!subjectMap[t.subject]) subjectMap[t.subject] = { tasks: 0, submissions: 0 };
      subjectMap[t.subject].tasks++;
      subjectMap[t.subject].submissions += (t.submissions?.length || 0);
    });

    // Teacher performance
    const teacherPerf = teachers.map((t) => {
      const tTasks = filteredTasks.filter((task) => task.teacherId === t.id);
      const subs = tTasks.reduce((acc, task) => acc + (task.submissions?.length || 0), 0);
      const graded = tTasks.reduce((acc, task) => acc + (task.submissions?.filter((s) => s.grade)?.length || 0), 0);
      const school = schools.find((s) => s.id === t.schoolId);
      return { ...t, taskCount: tTasks.length, submissionCount: subs, gradedCount: graded, schoolName: school?.name };
    }).sort((a, b) => b.taskCount - a.taskCount);

    // Student performance
    const studentPerf = students.map((s) => {
      const sTasks = filteredTasks.filter((t) => t.classLevel === s.classLevel && (t.schoolId === s.schoolId));
      const submitted = sTasks.filter((t) => t.submissions?.some((sub) => sub.studentId === s.id)).length;
      const graded = sTasks.filter((t) => t.submissions?.some((sub) => sub.studentId === s.id && sub.grade)).length;
      const school = schools.find((sc) => sc.id === s.schoolId);
      const rate = sTasks.length > 0 ? Math.round((submitted / sTasks.length) * 100) : 0;
      return { ...s, totalTasks: sTasks.length, submitted, graded, rate, schoolName: school?.name };
    }).sort((a, b) => b.rate - a.rate);

    return { subjectMap, teacherPerf, studentPerf, totalStudents: students.length, totalTeachers: teachers.length };
  }, [filteredTasks, users, schools, selectedSchool]);

  const subjectEntries = Object.entries(report.subjectMap || {}).sort(([, a], [, b]) => b.tasks - a.tasks);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#4A148C', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 }}>Reports & Analytics</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => setSelectedSchool('all')}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: selectedSchool === 'all' ? '#FFD700' : 'rgba(255,255,255,0.2)' }}>
              <Text style={{ color: selectedSchool === 'all' ? '#4A148C' : '#FFF', fontWeight: '700', fontSize: 13 }}>All Schools</Text>
            </TouchableOpacity>
            {schools.map((s) => (
              <TouchableOpacity key={s.id} onPress={() => setSelectedSchool(s.id)}
                style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: selectedSchool === s.id ? '#FFD700' : 'rgba(255,255,255,0.2)' }}>
                <Text style={{ color: selectedSchool === s.id ? '#4A148C' : '#FFF', fontWeight: '600', fontSize: 12 }} numberOfLines={1}>{s.name.split(' ').slice(0, 3).join(' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {/* Subject Performance */}
        {subjectEntries.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4A148C', marginBottom: 12 }}>Subject-wise Task Activity</Text>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 20 }}>
              {subjectEntries.map(([subject, stats]) => (
                <View key={subject} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#4A148C' }}>{subject}</Text>
                    <Text style={{ fontSize: 12, color: '#757575' }}>{stats.tasks} tasks • {stats.submissions} submissions</Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${Math.min((stats.submissions / Math.max(stats.tasks, 1)) * 100, 100)}%`, backgroundColor: '#7B1FA2', borderRadius: 4 }} />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Teacher Performance Report */}
        {report.teacherPerf?.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4A148C', marginBottom: 12 }}>Teacher Performance</Text>
            {report.teacherPerf.slice(0, 10).map((t, idx) => (
              <View key={t.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: idx < 3 ? '#FFD700' : '#E0E0E0', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 14, color: idx < 3 ? '#4A148C' : '#757575' }}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: '#4A148C', fontSize: 14 }}>{t.name}</Text>
                  <Text style={{ color: '#757575', fontSize: 12 }}>{t.schoolName}</Text>
                  <Text style={{ color: '#9E9E9E', fontSize: 11, marginTop: 2 }}>{t.subjects?.join(', ')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: 'bold', color: '#4A148C', fontSize: 16 }}>{t.taskCount}</Text>
                  <Text style={{ fontSize: 11, color: '#9E9E9E' }}>tasks</Text>
                  <Text style={{ fontSize: 11, color: '#2E7D32' }}>{t.gradedCount} graded</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Student Performance Report */}
        {report.studentPerf?.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4A148C', marginBottom: 12, marginTop: 8 }}>Student Performance (Top)</Text>
            {report.studentPerf.slice(0, 10).map((s, idx) => (
              <View key={s.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: s.rate >= 80 ? '#E8F5E9' : s.rate >= 50 ? '#FFF9C4' : '#FFEBEE', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 12, color: s.rate >= 80 ? '#2E7D32' : s.rate >= 50 ? '#F57F17' : '#C62828' }}>{s.rate}%</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: '#4A148C', fontSize: 14 }}>{s.name}</Text>
                  <Text style={{ color: '#757575', fontSize: 12 }}>Class {s.classLevel} • {s.schoolName}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 12, color: '#2E7D32' }}>{s.submitted}/{s.totalTasks}</Text>
                  <Text style={{ fontSize: 11, color: '#9E9E9E' }}>submitted</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
