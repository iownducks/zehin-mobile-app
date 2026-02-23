import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { BookOpen, CheckCircle, ChevronDown, ChevronRight, Clock } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FILTERS = ['all', 'pending', 'submitted', 'graded', 'overdue'];

export default function ParentChild() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { getUser, getStudentTasks } = useSchoolStore();

  const child = getUser(user?.childId);
  const allTasks = child ? getStudentTasks(child) : [];
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const getTaskStatus = (task) => {
    const sub = task.submissions?.find((s) => s.studentId === child?.id);
    if (!sub) return new Date(task.dueDate) < new Date() ? 'overdue' : 'pending';
    return sub.grade ? 'graded' : 'submitted';
  };

  const filtered = allTasks
    .filter((t) => filter === 'all' || getTaskStatus(t) === filter)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const statusConfig = {
    pending: { label: 'Pending', bg: '#FFF9C4', color: '#F57F17' },
    overdue: { label: 'Overdue', bg: '#FFEBEE', color: '#C62828' },
    submitted: { label: 'Submitted', bg: '#E3F2FD', color: '#1565C0' },
    graded: { label: 'Graded', bg: '#E8F5E9', color: '#2E7D32' },
  };

  const priorityBorder = { high: '#C62828', medium: '#FFC107', low: '#4CAF50' };

  // Completion stats
  const submitted = allTasks.filter((t) => {
    const s = t.submissions?.find((s) => s.studentId === child?.id);
    return !!s;
  }).length;
  const rate = allTasks.length > 0 ? Math.round((submitted / allTasks.length) * 100) : 0;
  const rateColor = rate >= 70 ? '#2E7D32' : rate >= 40 ? '#F57F17' : '#C62828';

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#006064', paddingTop: insets.top + 16, paddingBottom: 20, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 }}>
          {child?.name || 'My Child'}
        </Text>
        <Text style={{ color: '#80DEEA', fontSize: 13 }}>
          Class {child?.classLevel} • {child?.board} Board • {allTasks.length} tasks assigned
        </Text>

        {/* Mini progress bar */}
        <View style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: '#B2EBF2', fontSize: 12 }}>Task Completion</Text>
            <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 12 }}>{rate}%</Text>
          </View>
          <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${rate}%`, backgroundColor: '#FFD700', borderRadius: 3 }} />
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E0E0E0', maxHeight: 54 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        {FILTERS.map((f) => {
          const count = f === 'all' ? allTasks.length : allTasks.filter((t) => getTaskStatus(t) === f).length;
          return (
            <TouchableOpacity key={f} onPress={() => setFilter(f)}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: filter === f ? '#006064' : '#F5F5F5', borderWidth: 1, borderColor: filter === f ? '#006064' : '#E0E0E0', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
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
            <Text style={{ color: '#9E9E9E', fontSize: 15, marginTop: 16 }}>No {filter} tasks</Text>
          </View>
        ) : (
          filtered.map((task) => {
            const status = getTaskStatus(task);
            const sc = statusConfig[status];
            const sub = task.submissions?.find((s) => s.studentId === child?.id);
            const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            const isExpanded = expandedId === task.id;

            return (
              <View key={task.id} style={{ backgroundColor: '#FFF', borderRadius: 14, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, borderLeftWidth: 4, borderLeftColor: priorityBorder[task.priority] || '#9E9E9E' }}>
                <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : task.id)} style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 15 }} numberOfLines={2}>{task.title}</Text>
                      <Text style={{ color: '#757575', fontSize: 12, marginTop: 4 }}>{task.subject} • {task.type?.replace('_', ' ')}</Text>
                      {task.bookTitle && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                          <BookOpen size={11} color="#5C6BC0" />
                          <Text style={{ color: '#5C6BC0', fontSize: 11 }} numberOfLines={1}>
                            {task.bookTitle} • Ch. {task.chapterNumber}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <View style={{ backgroundColor: sc.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ color: sc.color, fontSize: 11, fontWeight: '700' }}>{sc.label}</Text>
                      </View>
                      {isExpanded ? <ChevronDown size={16} color="#9E9E9E" /> : <ChevronRight size={16} color="#9E9E9E" />}
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Clock size={12} color={status === 'overdue' ? '#C62828' : '#9E9E9E'} />
                    <Text style={{ fontSize: 12, color: status === 'overdue' ? '#C62828' : '#9E9E9E' }}>
                      Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {status === 'pending' && daysLeft >= 0 && ` (${daysLeft === 0 ? 'Today!' : `${daysLeft}d left`})`}
                    </Text>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ backgroundColor: '#F8F9FF', borderTopWidth: 1, borderColor: '#E0E0E0', padding: 16 }}>
                    <Text style={{ fontSize: 14, color: '#424242', lineHeight: 21, marginBottom: 12 }}>{task.description}</Text>

                    {sub ? (
                      <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E0E0E0' }}>
                        <Text style={{ fontWeight: '600', color: '#1565C0', marginBottom: 6 }}>✓ Your child submitted this task</Text>
                        {sub.note ? <Text style={{ color: '#424242', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>Note: "{sub.note}"</Text> : null}
                        <Text style={{ color: '#9E9E9E', fontSize: 12 }}>
                          Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                        </Text>
                        {sub.attachments?.length > 0 && (
                          <View style={{ marginTop: 8 }}>
                            <Text style={{ fontSize: 12, color: '#757575', marginBottom: 6 }}>
                              📎 {sub.attachments.length} homework photo{sub.attachments.length > 1 ? 's' : ''}
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              {sub.attachments.map((att, idx) => (
                                <TouchableOpacity key={idx} onPress={() => setLightboxImage(att.url)}>
                                  <Image source={{ uri: att.url }} style={{ width: 64, height: 64, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0' }} resizeMode="cover" />
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        )}
                        {sub.grade && (
                          <View style={{ marginTop: 10, backgroundColor: '#E8F5E9', borderRadius: 10, padding: 12 }}>
                            <Text style={{ fontWeight: 'bold', color: '#2E7D32', fontSize: 18 }}>🏆 Grade: {sub.grade}</Text>
                            {sub.feedback && <Text style={{ color: '#388E3C', fontSize: 13, marginTop: 4 }}>Teacher: {sub.feedback}</Text>}
                          </View>
                        )}
                        {!sub.grade && (
                          <View style={{ marginTop: 8, backgroundColor: '#FFF9C4', borderRadius: 8, padding: 8 }}>
                            <Text style={{ color: '#F57F17', fontSize: 12 }}>⏳ Waiting for teacher to grade</Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      <View style={{ backgroundColor: status === 'overdue' ? '#FFEBEE' : '#FFF9C4', borderRadius: 10, padding: 12 }}>
                        <Text style={{ color: status === 'overdue' ? '#C62828' : '#F57F17', fontWeight: '600', fontSize: 13 }}>
                          {status === 'overdue' ? '⚠️ Your child has not submitted this task (overdue)' : '📌 Task not yet submitted'}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Lightbox */}
      <Modal visible={!!lightboxImage} transparent animationType="fade">
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => setLightboxImage(null)} activeOpacity={1}>
          <Image source={{ uri: lightboxImage }} style={{ width: '95%', height: '80%' }} resizeMode="contain" />
          <Text style={{ color: '#FFF', marginTop: 16, opacity: 0.5, fontSize: 13 }}>Tap to close</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
