import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { CheckCircle, ChevronDown, ChevronRight, Clock } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FILTERS = ['all', 'pending', 'submitted', 'graded', 'overdue'];

export default function StudentTasks() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { getStudentTasks, submitTask, getUser } = useSchoolStore();

  const allTasks = getStudentTasks(user || {});
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [submitModal, setSubmitModal] = useState(null);
  const [note, setNote] = useState('');

  const getTaskStatus = (task) => {
    const sub = task.submissions?.find((s) => s.studentId === user?.id);
    if (!sub) {
      return new Date(task.dueDate) < new Date() ? 'overdue' : 'pending';
    }
    return sub.grade ? 'graded' : 'submitted';
  };

  const filtered = allTasks.filter((t) => {
    if (filter === 'all') return true;
    return getTaskStatus(t) === filter;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const handleSubmit = async () => {
    if (!submitModal) return;
    await submitTask(submitModal.id, user.id, note);
    setSubmitModal(null);
    setNote('');
    Alert.alert('Submitted!', 'Your task has been submitted successfully.');
  };

  const statusConfig = {
    pending: { label: 'Pending', bg: '#FFF9C4', color: '#F57F17' },
    overdue: { label: 'Overdue', bg: '#FFEBEE', color: '#C62828' },
    submitted: { label: 'Submitted', bg: '#E3F2FD', color: '#1565C0' },
    graded: { label: 'Graded', bg: '#E8F5E9', color: '#2E7D32' },
  };

  const priorityBorder = { high: '#C62828', medium: '#FFC107', low: '#4CAF50' };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 }}>My Tasks</Text>
        <Text style={{ color: '#9FA8DA', fontSize: 13 }}>{allTasks.length} total tasks</Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E0E0E0', maxHeight: 54 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        {FILTERS.map((f) => {
          const count = f === 'all' ? allTasks.length : allTasks.filter((t) => getTaskStatus(t) === f).length;
          return (
            <TouchableOpacity key={f} onPress={() => setFilter(f)}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: filter === f ? '#1A237E' : '#F5F5F5', borderWidth: 1, borderColor: filter === f ? '#1A237E' : '#E0E0E0', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: filter === f ? '#FFF' : '#424242', fontSize: 13, fontWeight: '600', textTransform: 'capitalize' }}>{f}</Text>
              <Text style={{ color: filter === f ? '#FFD700' : '#9E9E9E', fontSize: 11, fontWeight: '700' }}>({count})</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {filtered.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <CheckCircle size={48} color="#E0E0E0" />
            <Text style={{ color: '#9E9E9E', fontSize: 15, marginTop: 16 }}>
              {filter === 'pending' ? 'No pending tasks!' : `No ${filter} tasks`}
            </Text>
          </View>
        ) : (
          filtered.map((task) => {
            const status = getTaskStatus(task);
            const sc = statusConfig[status];
            const sub = task.submissions?.find((s) => s.studentId === user?.id);
            const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            const isExpanded = expandedId === task.id;
            const teacher = getUser(task.teacherId);

            return (
              <View key={task.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, borderLeftWidth: 4, borderLeftColor: priorityBorder[task.priority] || '#1A237E' }}>
                <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : task.id)} style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 15 }} numberOfLines={2}>{task.title}</Text>
                      <Text style={{ color: '#757575', fontSize: 12, marginTop: 4 }}>
                        {task.subject} • {teacher?.name || 'Teacher'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <View style={{ backgroundColor: sc.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ color: sc.color, fontSize: 11, fontWeight: '700' }}>{sc.label}</Text>
                      </View>
                      {isExpanded ? <ChevronDown size={16} color="#9E9E9E" /> : <ChevronRight size={16} color="#9E9E9E" />}
                    </View>
                  </View>

                  {/* Due date */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
                    <Clock size={12} color={status === 'overdue' ? '#C62828' : '#9E9E9E'} />
                    <Text style={{ fontSize: 12, color: status === 'overdue' ? '#C62828' : '#9E9E9E' }}>
                      Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {status === 'pending' && daysLeft >= 0 && ` (${daysLeft === 0 ? 'Today' : `${daysLeft}d left`})`}
                    </Text>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ backgroundColor: '#F8F9FF', borderTopWidth: 1, borderColor: '#E0E0E0', padding: 16 }}>
                    <Text style={{ fontSize: 14, color: '#424242', lineHeight: 21, marginBottom: 16 }}>{task.description}</Text>

                    {sub ? (
                      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E0E0E0' }}>
                        <Text style={{ fontWeight: '600', color: '#1A237E', marginBottom: 6 }}>Your Submission</Text>
                        {sub.note ? <Text style={{ color: '#424242', fontSize: 13, marginBottom: 8 }}>"{sub.note}"</Text> : null}
                        <Text style={{ color: '#9E9E9E', fontSize: 12 }}>
                          Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                        </Text>
                        {sub.grade && (
                          <View style={{ marginTop: 10, backgroundColor: '#E8F5E9', borderRadius: 10, padding: 12 }}>
                            <Text style={{ fontWeight: 'bold', color: '#2E7D32', fontSize: 16 }}>Grade: {sub.grade}</Text>
                            {sub.feedback && <Text style={{ color: '#388E3C', fontSize: 13, marginTop: 4 }}>{sub.feedback}</Text>}
                          </View>
                        )}
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setSubmitModal(task)}
                        style={{ backgroundColor: '#1A237E', borderRadius: 12, padding: 14, alignItems: 'center' }}
                      >
                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15 }}>
                          {status === 'overdue' ? 'Submit Late' : 'Submit Task'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Submit Modal */}
      <Modal visible={!!submitModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: insets.bottom + 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1A237E', marginBottom: 4 }}>Submit Task</Text>
            <Text style={{ color: '#757575', fontSize: 13, marginBottom: 16 }} numberOfLines={2}>{submitModal?.title}</Text>

            <Text style={{ color: '#424242', marginBottom: 8, fontSize: 13, fontWeight: '500' }}>
              Note for teacher (optional)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Completed all exercises, had difficulty with Q3..."
              multiline
              numberOfLines={3}
              style={{ backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#E0E0E0', height: 80, textAlignVertical: 'top', marginBottom: 16 }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setSubmitModal(null)} style={{ flex: 1, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, alignItems: 'center' }}>
                <Text style={{ color: '#424242', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={{ flex: 2, backgroundColor: '#1A237E', borderRadius: 12, padding: 14, alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
