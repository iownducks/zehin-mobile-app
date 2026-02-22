import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, ChevronDown, ChevronRight, Plus, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TASK_TYPES = ['homework', 'reading', 'lab_report', 'project', 'quiz', 'other'];
const PRIORITY = ['high', 'medium', 'low'];
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu', 'Islamiat', 'Pak Studies', 'Computer', 'History'];

export default function TeacherTasks() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getTeacherTasks, createTask, deleteTask, gradeSubmission, getUser } = useSchoolStore();

  const tasks = getTeacherTasks(user?.id);
  const [showCreate, setShowCreate] = useState(params.create === '1');
  const [selectedTask, setSelectedTask] = useState(null);
  const [gradeModal, setGradeModal] = useState(null); // { taskId, studentId }
  const [gradeValue, setGradeValue] = useState('');
  const [feedbackValue, setFeedbackValue] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: user?.subjects?.[0] || 'Mathematics',
    classLevel: user?.classesAssigned?.[0] || 9,
    type: 'homework',
    priority: 'medium',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      Alert.alert('Error', 'Title and description are required');
      return;
    }
    await createTask({
      ...form,
      classLevel: Number(form.classLevel),
      teacherId: user.id,
      schoolId: user.schoolId,
    });
    setShowCreate(false);
    setForm({ title: '', description: '', subject: user?.subjects?.[0] || 'Mathematics', classLevel: user?.classesAssigned?.[0] || 9, type: 'homework', priority: 'medium', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
  };

  const handleDelete = (taskId) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTask(taskId) },
    ]);
  };

  const handleGrade = async () => {
    if (!gradeValue.trim()) {
      Alert.alert('Error', 'Please enter a grade');
      return;
    }
    await gradeSubmission(gradeModal.taskId, gradeModal.studentId, gradeValue, feedbackValue);
    setGradeModal(null);
    setGradeValue('');
    setFeedbackValue('');
  };

  const priorityColor = { high: '#C62828', medium: '#F57F17', low: '#2E7D32' };

  if (showCreate) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => setShowCreate(false)}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', flex: 1 }}>Assign New Task</Text>
          <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: '#FFD700', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 }}>
            <Text style={{ color: '#1A237E', fontWeight: 'bold', fontSize: 13 }}>Assign</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 }}>
            <Label>Task Title *</Label>
            <Input value={form.title} onChangeText={(v) => update('title', v)} placeholder="e.g. Chapter 3 Exercise 3.1" />

            <Label>Description / Instructions *</Label>
            <TextInput
              value={form.description}
              onChangeText={(v) => update('description', v)}
              placeholder="Describe what students need to do..."
              multiline
              numberOfLines={4}
              style={{ backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#E0E0E0', height: 100, textAlignVertical: 'top', marginBottom: 14 }}
            />

            <Label>Subject</Label>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {SUBJECTS.map((s) => (
                  <TouchableOpacity key={s} onPress={() => update('subject', s)}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: form.subject === s ? '#1A237E' : '#F5F5F5', borderWidth: 1, borderColor: form.subject === s ? '#1A237E' : '#E0E0E0' }}>
                    <Text style={{ color: form.subject === s ? '#FFF' : '#424242', fontSize: 13 }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Label>Class Level</Label>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
                  <TouchableOpacity key={c} onPress={() => update('classLevel', c)}
                    style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: form.classLevel === c ? '#1A237E' : '#F5F5F5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: form.classLevel === c ? '#1A237E' : '#E0E0E0' }}>
                    <Text style={{ color: form.classLevel === c ? '#FFF' : '#424242', fontWeight: '600', fontSize: 13 }}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Label>Task Type</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {TASK_TYPES.map((t) => (
                <TouchableOpacity key={t} onPress={() => update('type', t)}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: form.type === t ? '#1A237E' : '#F5F5F5', borderWidth: 1, borderColor: form.type === t ? '#1A237E' : '#E0E0E0' }}>
                  <Text style={{ color: form.type === t ? '#FFF' : '#424242', fontSize: 12 }}>{t.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Label>Priority</Label>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {PRIORITY.map((p) => (
                <TouchableOpacity key={p} onPress={() => update('priority', p)}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: form.priority === p ? priorityColor[p] : '#F5F5F5', alignItems: 'center', borderWidth: 1, borderColor: form.priority === p ? priorityColor[p] : '#E0E0E0' }}>
                  <Text style={{ color: form.priority === p ? '#FFF' : '#424242', fontSize: 13, fontWeight: '600', textTransform: 'capitalize' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Label>Due Date</Label>
            <Input value={form.dueDate} onChangeText={(v) => update('dueDate', v)} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', flex: 1 }}>Tasks</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)} style={{ backgroundColor: '#FFD700', borderRadius: 10, padding: 10 }}>
          <Plus size={20} color="#1A237E" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {tasks.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#9E9E9E', marginBottom: 16 }}>No tasks assigned yet</Text>
            <TouchableOpacity onPress={() => setShowCreate(true)} style={{ backgroundColor: '#1A237E', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Assign First Task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tasks.slice().reverse().map((task) => {
            const submitted = task.submissions?.length || 0;
            const graded = task.submissions?.filter((s) => s.grade)?.length || 0;
            const isExpanded = selectedTask === task.id;
            return (
              <View key={task.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                <TouchableOpacity
                  onPress={() => setSelectedTask(isExpanded ? null : task.id)}
                  style={{ padding: 16 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 15 }} numberOfLines={2}>{task.title}</Text>
                      <Text style={{ color: '#757575', fontSize: 12, marginTop: 4 }}>
                        {task.subject} • Class {task.classLevel} • Due: {task.dueDate?.split('T')[0]}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <View style={{ backgroundColor: priorityColor[task.priority] + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ color: priorityColor[task.priority], fontSize: 11, fontWeight: '700' }}>{task.priority?.toUpperCase()}</Text>
                      </View>
                      {isExpanded ? <ChevronDown size={16} color="#9E9E9E" /> : <ChevronRight size={16} color="#9E9E9E" />}
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                    <View style={{ backgroundColor: '#E3F2FD', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 12, color: '#1565C0' }}>{submitted} submitted</Text>
                    </View>
                    <View style={{ backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 12, color: '#2E7D32' }}>{graded} graded</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ backgroundColor: '#F8F9FF', borderTopWidth: 1, borderColor: '#E0E0E0', padding: 16 }}>
                    <Text style={{ fontSize: 13, color: '#424242', marginBottom: 12 }}>{task.description}</Text>

                    {task.submissions?.length > 0 ? (
                      <>
                        <Text style={{ fontWeight: '700', color: '#1A237E', marginBottom: 10, fontSize: 14 }}>
                          Submissions ({task.submissions.length})
                        </Text>
                        {task.submissions.map((sub) => {
                          const student = getUser(sub.studentId);
                          return (
                            <View key={sub.studentId} style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E0E0E0' }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                  <Text style={{ fontWeight: '600', color: '#1A237E', fontSize: 13 }}>{student?.name || 'Unknown'}</Text>
                                  <Text style={{ fontSize: 11, color: '#9E9E9E' }}>
                                    Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                                  </Text>
                                  {sub.note ? <Text style={{ fontSize: 12, color: '#616161', marginTop: 2 }}>"{sub.note}"</Text> : null}
                                </View>
                                {sub.grade ? (
                                  <View style={{ alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 10, padding: 8 }}>
                                    <CheckCircle size={16} color="#2E7D32" />
                                    <Text style={{ color: '#2E7D32', fontWeight: 'bold', fontSize: 14 }}>{sub.grade}</Text>
                                  </View>
                                ) : (
                                  <TouchableOpacity
                                    onPress={() => setGradeModal({ taskId: task.id, studentId: sub.studentId })}
                                    style={{ backgroundColor: '#1A237E', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}
                                  >
                                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>Grade</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>
                          );
                        })}
                      </>
                    ) : (
                      <Text style={{ color: '#9E9E9E', fontSize: 13, textAlign: 'center', paddingVertical: 10 }}>
                        No submissions yet
                      </Text>
                    )}

                    <TouchableOpacity
                      onPress={() => handleDelete(task.id)}
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 6 }}
                    >
                      <Trash2 size={16} color="#C62828" />
                      <Text style={{ color: '#C62828', fontSize: 13, fontWeight: '600' }}>Delete Task</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Grade Modal */}
      <Modal visible={!!gradeModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: insets.bottom + 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1A237E', marginBottom: 16 }}>Grade Submission</Text>
            <Label>Grade (e.g. A, B+, 85/100)</Label>
            <Input value={gradeValue} onChangeText={setGradeValue} placeholder="Enter grade..." />
            <Label>Feedback (optional)</Label>
            <TextInput
              value={feedbackValue}
              onChangeText={setFeedbackValue}
              placeholder="Write feedback for the student..."
              multiline
              numberOfLines={3}
              style={{ backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#E0E0E0', height: 80, textAlignVertical: 'top', marginBottom: 16 }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setGradeModal(null)} style={{ flex: 1, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, alignItems: 'center' }}>
                <Text style={{ color: '#424242', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleGrade} style={{ flex: 2, backgroundColor: '#1A237E', borderRadius: 12, padding: 14, alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Submit Grade</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const Label = ({ children }) => (
  <Text style={{ color: '#424242', marginBottom: 6, fontSize: 13, fontWeight: '500' }}>{children}</Text>
);
const Input = ({ value, onChangeText, placeholder, keyboardType, secureTextEntry }) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    keyboardType={keyboardType}
    secureTextEntry={secureTextEntry}
    autoCapitalize="none"
    style={{ backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 14, borderWidth: 1, borderColor: '#E0E0E0' }}
  />
);
