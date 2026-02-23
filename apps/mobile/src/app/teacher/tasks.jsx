import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BookOpen, CheckCircle, ChevronDown, ChevronRight, Image as ImageIcon, Plus, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View,
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
  const { getTeacherTasks, createTask, deleteTask, gradeSubmission, getUser, getBooks } = useSchoolStore();

  const tasks = getTeacherTasks(user?.id);
  const [showCreate, setShowCreate] = useState(params.create === '1');
  const [selectedTask, setSelectedTask] = useState(null);
  const [gradeModal, setGradeModal] = useState(null); // { taskId, studentId, attachments }
  const [gradeValue, setGradeValue] = useState('');
  const [feedbackValue, setFeedbackValue] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);

  // Book picker state
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null); // { id, title, chapters }
  const [selectedChapter, setSelectedChapter] = useState(null); // { id, title, number }

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

  const openBookPicker = () => {
    setShowBookPicker(true);
    setBookSearch('');
    setSelectedBook(null);
    setSelectedChapter(null);
  };

  const allBooks = getBooks();

  const filteredBooks = useMemo(() => {
    if (!bookSearch.trim()) return allBooks;
    const q = bookSearch.toLowerCase();
    return allBooks.filter(
      (b) => b.title?.toLowerCase().includes(q) || b.subject?.toLowerCase().includes(q)
    );
  }, [allBooks, bookSearch]);

  const confirmBookSelection = () => {
    setShowBookPicker(false);
  };

  const clearBookRef = () => {
    setSelectedBook(null);
    setSelectedChapter(null);
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      Alert.alert('Error', 'Title and description are required');
      return;
    }
    const taskPayload = {
      ...form,
      classLevel: Number(form.classLevel),
      teacherId: user.id,
      schoolId: user.schoolId,
      bookId: selectedBook?.id || null,
      bookTitle: selectedBook?.title || null,
      chapterId: selectedChapter?.id || null,
      chapterTitle: selectedChapter?.title || null,
      chapterNumber: selectedChapter?.number || null,
    };
    await createTask(taskPayload);
    setShowCreate(false);
    clearBookRef();
    setForm({
      title: '',
      description: '',
      subject: user?.subjects?.[0] || 'Mathematics',
      classLevel: user?.classesAssigned?.[0] || 9,
      type: 'homework',
      priority: 'medium',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
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

  // ── Book Picker Modal ──────────────────────────────────────────────────────
  const BookPickerModal = () => (
    <Modal visible={showBookPicker} animationType="slide">
      <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        {/* Header */}
        <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 12, paddingBottom: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => setShowBookPicker(false)}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFF', flex: 1 }}>
            {selectedBook ? `Chapters: ${selectedBook.title}` : 'Pick a Book'}
          </Text>
          {selectedBook && selectedChapter && (
            <TouchableOpacity onPress={confirmBookSelection} style={{ backgroundColor: '#FFD700', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ color: '#1A237E', fontWeight: 'bold', fontSize: 13 }}>Done</Text>
            </TouchableOpacity>
          )}
        </View>

        {!selectedBook ? (
          <>
            {/* Search */}
            <View style={{ margin: 16, backgroundColor: '#FFF', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: '#E0E0E0' }}>
              <BookOpen size={16} color="#9E9E9E" />
              <TextInput
                value={bookSearch}
                onChangeText={setBookSearch}
                placeholder="Search books by title or subject..."
                style={{ flex: 1, paddingVertical: 12, paddingLeft: 10, fontSize: 14 }}
              />
            </View>

            {filteredBooks.length === 0 ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
                <BookOpen size={48} color="#E0E0E0" />
                <Text style={{ color: '#9E9E9E', fontSize: 15, marginTop: 12, textAlign: 'center' }}>
                  No books match your search
                </Text>
              </View>
            ) : (
              <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
                {filteredBooks.map((book) => (
                  <TouchableOpacity
                    key={book.id}
                    onPress={() => setSelectedBook(book)}
                    style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E0E0E0' }}
                  >
                    {book.cover_image ? (
                      <Image source={{ uri: book.cover_image }} style={{ width: 44, height: 60, borderRadius: 6 }} resizeMode="cover" />
                    ) : (
                      <View style={{ width: 44, height: 60, borderRadius: 6, backgroundColor: '#E8EAF6', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={20} color="#5C6BC0" />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 14 }} numberOfLines={2}>{book.title}</Text>
                      <Text style={{ color: '#757575', fontSize: 12, marginTop: 3 }}>
                        {book.subject} • Class {book.classLevel} • {book.board}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#9E9E9E" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        ) : (
          /* Chapter list */
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <TouchableOpacity
              onPress={() => setSelectedBook(null)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}
            >
              <ChevronRight size={16} color="#1A237E" style={{ transform: [{ rotate: '180deg' }] }} />
              <Text style={{ color: '#1A237E', fontWeight: '600' }}>Back to books</Text>
            </TouchableOpacity>

            {(selectedBook.chapters || []).length === 0 ? (
              <Text style={{ color: '#9E9E9E', textAlign: 'center', marginTop: 32 }}>No chapters available for this book</Text>
            ) : (
              (selectedBook.chapters || []).map((ch) => {
                const isSelected = selectedChapter?.id === ch.id;
                return (
                  <TouchableOpacity
                    key={ch.id}
                    onPress={() => setSelectedChapter(isSelected ? null : ch)}
                    style={{ backgroundColor: isSelected ? '#E8EAF6' : '#FFF', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: isSelected ? '#3949AB' : '#E0E0E0' }}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isSelected ? '#3949AB' : '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Text style={{ color: isSelected ? '#FFF' : '#757575', fontWeight: '700', fontSize: 13 }}>{ch.number}</Text>
                    </View>
                    <Text style={{ flex: 1, color: '#1A237E', fontWeight: '600', fontSize: 14 }} numberOfLines={2}>{ch.title}</Text>
                    {isSelected && <CheckCircle size={18} color="#3949AB" />}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  if (showCreate) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <BookPickerModal />
        <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => { setShowCreate(false); clearBookRef(); }}>
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

            {/* Book Reference */}
            <Label>Book Reference (optional)</Label>
            {selectedBook && selectedChapter ? (
              <View style={{ backgroundColor: '#E8EAF6', borderRadius: 12, padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center' }}>
                <BookOpen size={18} color="#3949AB" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#1A237E', fontWeight: '700', fontSize: 13 }} numberOfLines={1}>{selectedBook.title}</Text>
                  <Text style={{ color: '#5C6BC0', fontSize: 12, marginTop: 2 }}>Ch. {selectedChapter.number}: {selectedChapter.title}</Text>
                </View>
                <TouchableOpacity onPress={clearBookRef}>
                  <X size={18} color="#C62828" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={openBookPicker}
                style={{ backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed' }}
              >
                <BookOpen size={18} color="#9E9E9E" />
                <Text style={{ color: '#9E9E9E', fontSize: 14 }}>Link a book chapter...</Text>
              </TouchableOpacity>
            )}

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
                      {task.bookTitle && task.chapterTitle && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <BookOpen size={11} color="#5C6BC0" />
                          <Text style={{ color: '#5C6BC0', fontSize: 11 }} numberOfLines={1}>
                            {task.bookTitle} • Ch. {task.chapterNumber}: {task.chapterTitle}
                          </Text>
                        </View>
                      )}
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
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontWeight: '600', color: '#1A237E', fontSize: 13 }}>{student?.name || 'Unknown'}</Text>
                                  <Text style={{ fontSize: 11, color: '#9E9E9E' }}>
                                    Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                                  </Text>
                                  {sub.note ? <Text style={{ fontSize: 12, color: '#616161', marginTop: 2 }}>"{sub.note}"</Text> : null}
                                  {sub.feedback ? <Text style={{ fontSize: 12, color: '#388E3C', marginTop: 2 }}>Feedback: {sub.feedback}</Text> : null}
                                </View>
                                {sub.grade ? (
                                  <View style={{ alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 10, padding: 8 }}>
                                    <CheckCircle size={16} color="#2E7D32" />
                                    <Text style={{ color: '#2E7D32', fontWeight: 'bold', fontSize: 14 }}>{sub.grade}</Text>
                                  </View>
                                ) : (
                                  <TouchableOpacity
                                    onPress={() => setGradeModal({ taskId: task.id, studentId: sub.studentId, attachments: sub.attachments || [] })}
                                    style={{ backgroundColor: '#1A237E', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}
                                  >
                                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>Grade</Text>
                                  </TouchableOpacity>
                                )}
                              </View>

                              {/* Homework photo attachments */}
                              {sub.attachments?.length > 0 && (
                                <View style={{ marginTop: 10 }}>
                                  <Text style={{ fontSize: 12, color: '#757575', marginBottom: 6, fontWeight: '600' }}>
                                    📎 Attachments ({sub.attachments.length})
                                  </Text>
                                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                    {sub.attachments.map((att, idx) => (
                                      <TouchableOpacity key={idx} onPress={() => setLightboxImage(att.url)}>
                                        <Image
                                          source={{ uri: att.url }}
                                          style={{ width: 72, height: 72, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0' }}
                                          resizeMode="cover"
                                        />
                                      </TouchableOpacity>
                                    ))}
                                  </View>
                                </View>
                              )}
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

            {/* Show attachments in grade modal too */}
            {gradeModal?.attachments?.length > 0 && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 13, color: '#757575', marginBottom: 8, fontWeight: '600' }}>Student's Photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {gradeModal.attachments.map((att, idx) => (
                      <TouchableOpacity key={idx} onPress={() => setLightboxImage(att.url)}>
                        <Image source={{ uri: att.url }} style={{ width: 80, height: 80, borderRadius: 10 }} resizeMode="cover" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

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

      {/* Image Lightbox */}
      <Modal visible={!!lightboxImage} transparent animationType="fade">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => setLightboxImage(null)}
          activeOpacity={1}
        >
          <Image source={{ uri: lightboxImage }} style={{ width: '95%', height: '80%' }} resizeMode="contain" />
          <Text style={{ color: '#FFF', marginTop: 16, opacity: 0.6, fontSize: 13 }}>Tap anywhere to close</Text>
        </TouchableOpacity>
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
