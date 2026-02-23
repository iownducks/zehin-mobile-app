import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { BookOpen, CheckCircle, ChevronRight, Clock, Mail, Search, User, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TeacherStudents() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { getSchoolStudents, getTeacherTasks } = useSchoolStore();
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [profileStudent, setProfileStudent] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

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
    tasks.forEach((t) => {
      totalTasks++;
      const sub = t.submissions?.find((s) => s.studentId === studentId);
      if (sub) {
        submitted++;
        if (sub.grade) graded++;
      }
    });
    return { totalTasks, submitted, graded, pending: totalTasks - submitted };
  };

  const getStudentTaskDetails = (studentId) => {
    return tasks.map((task) => {
      const sub = task.submissions?.find((s) => s.studentId === studentId);
      let status = 'pending';
      if (sub) status = sub.grade ? 'graded' : 'submitted';
      else if (new Date(task.dueDate) < new Date()) status = 'overdue';
      return { ...task, submission: sub || null, status };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const statusConfig = {
    pending: { label: 'Pending', bg: '#FFF9C4', color: '#F57F17' },
    overdue: { label: 'Overdue', bg: '#FFEBEE', color: '#C62828' },
    submitted: { label: 'Submitted', bg: '#E3F2FD', color: '#1565C0' },
    graded: { label: 'Graded', bg: '#E8F5E9', color: '#2E7D32' },
  };

  const priorityColor = { high: '#C62828', medium: '#F57F17', low: '#2E7D32' };

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
            const rateColor = submissionRate >= 70 ? '#2E7D32' : submissionRate >= 40 ? '#F57F17' : '#C62828';
            const rateBg = submissionRate >= 70 ? '#E8F5E9' : submissionRate >= 40 ? '#FFF9C4' : '#FFEBEE';
            return (
              <TouchableOpacity
                key={student.id}
                onPress={() => setProfileStudent(student)}
                activeOpacity={0.85}
                style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}
              >
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ backgroundColor: rateBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ color: rateColor, fontWeight: '700', fontSize: 14 }}>{submissionRate}%</Text>
                    </View>
                    <ChevronRight size={16} color="#9E9E9E" />
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
                  <Text style={{ fontSize: 11, color: '#9E9E9E', marginTop: 4 }}>Task completion rate • Tap to view profile</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ── Student Profile Modal ── */}
      <Modal visible={!!profileStudent} animationType="slide">
        {profileStudent && (() => {
          const stats = getStudentStats(profileStudent.id);
          const submissionRate = stats.totalTasks > 0 ? Math.round((stats.submitted / stats.totalTasks) * 100) : 0;
          const taskDetails = getStudentTaskDetails(profileStudent.id);
          const rateColor = submissionRate >= 70 ? '#2E7D32' : submissionRate >= 40 ? '#F57F17' : '#C62828';

          return (
            <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
              {/* Header */}
              <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 12, paddingBottom: 24, paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <TouchableOpacity onPress={() => setProfileStudent(null)} style={{ marginRight: 12 }}>
                    <X size={24} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFF', flex: 1 }}>Student Profile</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#E8EAF6', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFD700' }}>
                    <User size={30} color="#1A237E" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>{profileStudent.name}</Text>
                    <Text style={{ color: '#9FA8DA', fontSize: 13, marginTop: 2 }}>
                      Class {profileStudent.classLevel} • {profileStudent.board} Board
                      {profileStudent.rollNumber ? ` • Roll: ${profileStudent.rollNumber}` : ''}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Mail size={12} color="#9FA8DA" />
                      <Text style={{ color: '#9FA8DA', fontSize: 12 }}>{profileStudent.email}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Stats row */}
              <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: -16 }}>
                {[
                  { label: 'Total', value: stats.totalTasks, bg: '#FFF', color: '#1A237E' },
                  { label: 'Submitted', value: stats.submitted, bg: '#E8F5E9', color: '#2E7D32' },
                  { label: 'Graded', value: stats.graded, bg: '#E3F2FD', color: '#1565C0' },
                  { label: 'Pending', value: stats.pending, bg: '#FFEBEE', color: '#C62828' },
                ].map((s) => (
                  <View key={s.label} style={{ flex: 1, backgroundColor: s.bg, borderRadius: 12, padding: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: s.color }}>{s.value}</Text>
                    <Text style={{ fontSize: 10, color: '#9E9E9E', marginTop: 2 }}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* Completion bar */}
              <View style={{ marginHorizontal: 16, marginTop: 14, backgroundColor: '#FFF', borderRadius: 12, padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontWeight: '600', color: '#424242', fontSize: 13 }}>Overall Completion</Text>
                  <Text style={{ fontWeight: 'bold', color: rateColor, fontSize: 13 }}>{submissionRate}%</Text>
                </View>
                <View style={{ height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${submissionRate}%`, backgroundColor: submissionRate >= 70 ? '#4CAF50' : submissionRate >= 40 ? '#FFC107' : '#F44336', borderRadius: 4 }} />
                </View>
              </View>

              <Text style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, fontWeight: '700', color: '#1A237E', fontSize: 15 }}>
                Assigned Tasks ({taskDetails.length})
              </Text>

              <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 30 }}>
                {taskDetails.length === 0 ? (
                  <Text style={{ color: '#9E9E9E', textAlign: 'center', paddingVertical: 24 }}>No tasks assigned yet</Text>
                ) : (
                  taskDetails.map((task) => {
                    const sc = statusConfig[task.status];
                    const sub = task.submission;
                    return (
                      <View key={task.id} style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: priorityColor[task.priority] || '#9E9E9E', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 14 }} numberOfLines={2}>{task.title}</Text>
                            <Text style={{ color: '#757575', fontSize: 12, marginTop: 3 }}>
                              {task.subject} • {task.type?.replace('_', ' ')}
                            </Text>
                            {task.bookTitle && task.chapterTitle && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                                <BookOpen size={10} color="#5C6BC0" />
                                <Text style={{ color: '#5C6BC0', fontSize: 11 }} numberOfLines={1}>
                                  {task.bookTitle} • Ch. {task.chapterNumber}
                                </Text>
                              </View>
                            )}
                          </View>
                          <View style={{ backgroundColor: sc.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 }}>
                            <Text style={{ color: sc.color, fontSize: 11, fontWeight: '700' }}>{sc.label}</Text>
                          </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                          <Clock size={11} color="#9E9E9E" />
                          <Text style={{ fontSize: 12, color: '#9E9E9E' }}>
                            Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Text>
                        </View>

                        {sub && (
                          <View style={{ marginTop: 10, backgroundColor: '#F8F9FF', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#E8EAF6' }}>
                            <Text style={{ fontSize: 12, color: '#5C6BC0', fontWeight: '600', marginBottom: 4 }}>
                              Submitted: {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                            {sub.note ? (
                              <Text style={{ fontSize: 12, color: '#424242', fontStyle: 'italic', marginBottom: 6 }}>"{sub.note}"</Text>
                            ) : null}
                            {sub.attachments?.length > 0 && (
                              <View style={{ marginBottom: 8 }}>
                                <Text style={{ fontSize: 11, color: '#757575', marginBottom: 5 }}>
                                  📎 {sub.attachments.length} photo{sub.attachments.length > 1 ? 's' : ''}
                                </Text>
                                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                                  {sub.attachments.map((att, idx) => (
                                    <TouchableOpacity key={idx} onPress={() => setLightboxImage(att.url)}>
                                      <Image source={{ uri: att.url }} style={{ width: 56, height: 56, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0' }} resizeMode="cover" />
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              </View>
                            )}
                            {sub.grade ? (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <CheckCircle size={14} color="#2E7D32" />
                                <Text style={{ color: '#2E7D32', fontWeight: 'bold', fontSize: 15 }}>Grade: {sub.grade}</Text>
                              </View>
                            ) : (
                              <Text style={{ fontSize: 12, color: '#F57F17', fontWeight: '600' }}>⏳ Not graded yet</Text>
                            )}
                            {sub.feedback ? (
                              <Text style={{ fontSize: 12, color: '#388E3C', marginTop: 4 }}>💬 {sub.feedback}</Text>
                            ) : null}
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          );
        })()}
      </Modal>

      {/* Image Lightbox */}
      <Modal visible={!!lightboxImage} transparent animationType="fade">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => setLightboxImage(null)}
          activeOpacity={1}
        >
          <Image source={{ uri: lightboxImage }} style={{ width: '95%', height: '80%' }} resizeMode="contain" />
          <Text style={{ color: '#FFF', marginTop: 16, opacity: 0.5, fontSize: 13 }}>Tap to close</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
