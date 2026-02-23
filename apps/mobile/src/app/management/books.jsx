import {
  BookOpen,
  ChevronDown,
  Edit2,
  Plus,
  Trash2,
  X,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE_URL = process.env.EXPO_PUBLIC_APP_URL;

// ─── Constants ───────────────────────────────────────────────────────────────
const SUBJECTS = [
  'Mathematics', 'English', 'Urdu', 'Science',
  'Islamic Studies', 'Pakistan Studies', 'Computer',
  'Physics', 'Chemistry', 'Biology',
];
const CLASS_LEVELS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const BOARDS = ['Punjab', 'Federal', 'Sindh', 'KPK', 'Balochistan'];
const COVER_COLORS = ['#7B1FA2', '#1565C0', '#2E7D32', '#E65100', '#AD1457', '#00695C'];
const LESSON_TYPES = ['text', 'example', 'exercise', 'note', 'keypoints'];
const LESSON_TYPE_COLORS = {
  text: { bg: '#E3F2FD', text: '#1565C0' },
  example: { bg: '#E8F5E9', text: '#2E7D32' },
  exercise: { bg: '#FFF3E0', text: '#E65100' },
  note: { bg: '#FFF8E1', text: '#F57F17' },
  keypoints: { bg: '#F3E5F5', text: '#7B1FA2' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const authHeaders = () => ({ 'Content-Type': 'application/json' });

function Badge({ label, bg, color }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginRight: 4, marginTop: 3 }}>
      <Text style={{ color, fontSize: 10, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

// ─── Picker Modal ─────────────────────────────────────────────────────────────
function PickerModal({ visible, title, options, selected, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable onPress={() => {}}>
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: 420 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderColor: '#EEE' }}>
              <Text style={{ fontWeight: '700', fontSize: 16, color: '#4A148C' }}>{title}</Text>
              <TouchableOpacity onPress={onClose}><X size={20} color="#757575" /></TouchableOpacity>
            </View>
            <ScrollView>
              {options.map((opt) => (
                <TouchableOpacity key={opt} onPress={() => { onSelect(opt); onClose(); }}
                  style={{ paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#F5F5F5' }}>
                  <Text style={{ fontSize: 15, color: selected === opt ? '#7B1FA2' : '#212121', fontWeight: selected === opt ? '700' : '400' }}>{opt}</Text>
                  {selected === opt && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#7B1FA2' }} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Field Row ────────────────────────────────────────────────────────────────
function FieldLabel({ label }) {
  return <Text style={{ fontSize: 12, fontWeight: '700', color: '#4A148C', marginBottom: 5, marginTop: 12 }}>{label}</Text>;
}
function FieldInput({ value, onChangeText, placeholder, multiline, style }) {
  return (
    <TextInput
      value={value} onChangeText={onChangeText} placeholder={placeholder}
      placeholderTextColor="#BDBDBD" multiline={multiline}
      style={[{ backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#212121', borderWidth: 1, borderColor: '#E0E0E0' }, multiline && { minHeight: 80, textAlignVertical: 'top' }, style]}
    />
  );
}

// ─── PickerField ──────────────────────────────────────────────────────────────
function PickerField({ label, value, options, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <FieldLabel label={label} />
      <TouchableOpacity onPress={() => setOpen(true)}
        style={{ backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, borderColor: '#E0E0E0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: value ? '#212121' : '#BDBDBD' }}>{value || `Select ${label}`}</Text>
        <ChevronDown size={16} color="#757575" />
      </TouchableOpacity>
      <PickerModal visible={open} title={`Select ${label}`} options={options} selected={value} onSelect={onSelect} onClose={() => setOpen(false)} />
    </>
  );
}

// ─── Book Modal ───────────────────────────────────────────────────────────────
function BookModal({ visible, onClose, onSaved, existing }) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [board, setBoard] = useState('');
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title || '');
      setSubject(existing.subject || '');
      setClassLevel(existing.classLevel ? String(existing.classLevel) : '');
      setBoard(existing.board || '');
      setCoverColor(existing.coverColor || COVER_COLORS[0]);
      setDescription(existing.description || '');
    } else {
      setTitle(''); setSubject(''); setClassLevel(''); setBoard('');
      setCoverColor(COVER_COLORS[0]); setDescription('');
    }
  }, [existing, visible]);

  const save = async () => {
    if (!title.trim() || !subject || !classLevel || !board) {
      Alert.alert('Missing fields', 'Please fill Title, Subject, Class and Board.'); return;
    }
    setSaving(true);
    try {
      const method = existing ? 'PUT' : 'POST';
      const url = existing
        ? `${BASE_URL}/api/books/manage/${existing.id}`
        : `${BASE_URL}/api/books/manage`;
      const res = await fetch(url, {
        method, headers: authHeaders(),
        body: JSON.stringify({ title, subject, classLevel: Number(classLevel), board, coverColor, description }),
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('Success', existing ? 'Book updated.' : 'Book created.');
      onSaved();
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
          {/* Header */}
          <View style={{ backgroundColor: '#4A148C', paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>{existing ? 'Edit Book' : 'New Book'}</Text>
            <TouchableOpacity onPress={onClose}><X size={22} color="#FFF" /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}>
            <FieldLabel label="Title *" />
            <FieldInput value={title} onChangeText={setTitle} placeholder="e.g. Mathematics Class 9" />
            <PickerField label="Subject *" value={subject} options={SUBJECTS} onSelect={setSubject} />
            <PickerField label="Class Level *" value={classLevel ? `Class ${classLevel}` : ''} options={CLASS_LEVELS.map(c => `Class ${c}`)} onSelect={(v) => setClassLevel(v.replace('Class ', ''))} />
            <PickerField label="Board *" value={board} options={BOARDS} onSelect={setBoard} />
            <FieldLabel label="Cover Color" />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              {COVER_COLORS.map((c) => (
                <TouchableOpacity key={c} onPress={() => setCoverColor(c)}
                  style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c, borderWidth: coverColor === c ? 3 : 0, borderColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 }} />
              ))}
            </View>
            <FieldLabel label="Description" />
            <FieldInput value={description} onChangeText={setDescription} placeholder="Brief description..." multiline />
            <TouchableOpacity onPress={save} disabled={saving}
              style={{ backgroundColor: '#7B1FA2', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 }}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>{existing ? 'Update Book' : 'Create Book'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Chapter Modal ────────────────────────────────────────────────────────────
function ChapterModal({ visible, onClose, onSaved, bookId, nextNumber, existing }) {
  const insets = useSafeAreaInsets();
  const [chapterNumber, setChapterNumber] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setChapterNumber(String(existing.chapterNumber || ''));
      setTitle(existing.title || '');
      setSummary(existing.summary || '');
    } else {
      setChapterNumber(String(nextNumber || 1));
      setTitle(''); setSummary('');
    }
  }, [existing, visible, nextNumber]);

  const save = async () => {
    if (!title.trim()) { Alert.alert('Missing fields', 'Chapter title is required.'); return; }
    setSaving(true);
    try {
      const method = existing ? 'PUT' : 'POST';
      const url = existing
        ? `${BASE_URL}/api/books/${bookId}/chapters/${existing.id}`
        : `${BASE_URL}/api/books/${bookId}/chapters`;
      const res = await fetch(url, {
        method, headers: authHeaders(),
        body: JSON.stringify({ chapterNumber: Number(chapterNumber), title, summary }),
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('Success', existing ? 'Chapter updated.' : 'Chapter added.');
      onSaved(); onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
          <View style={{ backgroundColor: '#4A148C', paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>{existing ? 'Edit Chapter' : 'Add Chapter'}</Text>
            <TouchableOpacity onPress={onClose}><X size={22} color="#FFF" /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}>
            <FieldLabel label="Chapter Number" />
            <FieldInput value={chapterNumber} onChangeText={setChapterNumber} placeholder="1" />
            <FieldLabel label="Title *" />
            <FieldInput value={title} onChangeText={setTitle} placeholder="e.g. Introduction to Algebra" />
            <FieldLabel label="Summary" />
            <FieldInput value={summary} onChangeText={setSummary} placeholder="Brief summary of the chapter..." multiline />
            <TouchableOpacity onPress={save} disabled={saving}
              style={{ backgroundColor: '#7B1FA2', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 }}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>{existing ? 'Update Chapter' : 'Add Chapter'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Lesson Modal (full-screen, handles long content) ─────────────────────────
function LessonModal({ visible, onClose, onSaved, bookId, chapterId, nextNumber, existing }) {
  const insets = useSafeAreaInsets();
  const [lessonNumber, setLessonNumber] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('text');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setLessonNumber(String(existing.lessonNumber || ''));
      setTitle(existing.title || '');
      setType(existing.type || 'text');
      setContent(existing.content || '');
    } else {
      setLessonNumber(String(nextNumber || 1));
      setTitle(''); setType('text'); setContent('');
    }
  }, [existing, visible, nextNumber]);

  const save = async () => {
    if (!title.trim() || !content.trim()) { Alert.alert('Missing fields', 'Title and content are required.'); return; }
    setSaving(true);
    try {
      const method = existing ? 'PUT' : 'POST';
      const url = existing
        ? `${BASE_URL}/api/books/${bookId}/chapters/${chapterId}/lessons/${existing.id}`
        : `${BASE_URL}/api/books/${bookId}/chapters/${chapterId}/lessons`;
      const res = await fetch(url, {
        method, headers: authHeaders(),
        body: JSON.stringify({ lessonNumber: Number(lessonNumber), title, type, content }),
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('Success', existing ? 'Lesson updated.' : 'Lesson added.');
      onSaved(); onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
          <View style={{ backgroundColor: '#4A148C', paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>{existing ? 'Edit Lesson' : 'Add Lesson'}</Text>
            <TouchableOpacity onPress={onClose}><X size={22} color="#FFF" /></TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}>
            <FieldLabel label="Lesson Number" />
            <FieldInput value={lessonNumber} onChangeText={setLessonNumber} placeholder="1" />
            <FieldLabel label="Title *" />
            <FieldInput value={title} onChangeText={setTitle} placeholder="e.g. Real Numbers" />
            <FieldLabel label="Type" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {LESSON_TYPES.map((t) => {
                const tc = LESSON_TYPE_COLORS[t];
                const active = type === t;
                return (
                  <TouchableOpacity key={t} onPress={() => setType(t)}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: active ? tc.text : tc.bg, borderWidth: 1, borderColor: tc.text }}>
                    <Text style={{ color: active ? '#FFF' : tc.text, fontWeight: '700', fontSize: 12, textTransform: 'capitalize' }}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <FieldLabel label="Content *" />
            <TextInput
              value={content} onChangeText={setContent}
              placeholder="Enter full lesson content here. This can be multiple paragraphs..."
              placeholderTextColor="#BDBDBD" multiline scrollEnabled={false}
              style={{ backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, fontSize: 14, color: '#212121', borderWidth: 1, borderColor: '#E0E0E0', minHeight: 220, textAlignVertical: 'top' }}
            />
            <Text style={{ fontSize: 11, color: '#9E9E9E', marginTop: 4 }}>{content.length} characters</Text>
            <TouchableOpacity onPress={save} disabled={saving}
              style={{ backgroundColor: '#7B1FA2', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 }}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>{existing ? 'Update Lesson' : 'Save Lesson'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Quiz Modal ───────────────────────────────────────────────────────────────
function QuizModal({ visible, onClose, onSaved, bookId, chapterId, existing }) {
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setQuestion(existing.question || '');
      setOptions(existing.options?.length === 4 ? existing.options : ['', '', '', '']);
      setCorrectIndex(existing.correctIndex ?? 0);
      setExplanation(existing.explanation || '');
    } else {
      setQuestion(''); setOptions(['', '', '', '']); setCorrectIndex(0); setExplanation('');
    }
  }, [existing, visible]);

  const setOption = (i, v) => { const o = [...options]; o[i] = v; setOptions(o); };

  const save = async () => {
    if (!question.trim() || options.some(o => !o.trim())) {
      Alert.alert('Missing fields', 'Question and all 4 options are required.'); return;
    }
    setSaving(true);
    try {
      const method = existing ? 'PUT' : 'POST';
      const url = existing
        ? `${BASE_URL}/api/books/${bookId}/chapters/${chapterId}/quiz/${existing.id}`
        : `${BASE_URL}/api/books/${bookId}/chapters/${chapterId}/quiz`;
      const res = await fetch(url, {
        method, headers: authHeaders(),
        body: JSON.stringify({ question, options, correctIndex, explanation }),
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('Success', existing ? 'Question updated.' : 'Question added.');
      onSaved(); onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
          <View style={{ backgroundColor: '#4A148C', paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>{existing ? 'Edit Quiz Question' : 'Add Quiz Question'}</Text>
            <TouchableOpacity onPress={onClose}><X size={22} color="#FFF" /></TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}>
            <FieldLabel label="Question *" />
            <FieldInput value={question} onChangeText={setQuestion} placeholder="Enter the quiz question..." multiline />
            <FieldLabel label="Options (select correct answer)" />
            {optionLabels.map((lbl, i) => (
              <TouchableOpacity key={lbl} onPress={() => setCorrectIndex(i)}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: correctIndex === i ? '#E8F5E9' : '#F5F5F5', borderRadius: 10, borderWidth: 1, borderColor: correctIndex === i ? '#2E7D32' : '#E0E0E0', overflow: 'hidden' }}>
                <View style={{ backgroundColor: correctIndex === i ? '#2E7D32' : '#E0E0E0', width: 36, height: '100%', minHeight: 46, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: correctIndex === i ? '#FFF' : '#757575', fontWeight: '700' }}>{lbl}</Text>
                </View>
                <TextInput
                  value={options[i]} onChangeText={(v) => setOption(i, v)}
                  placeholder={`Option ${lbl}`} placeholderTextColor="#BDBDBD"
                  style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: '#212121' }}
                />
              </TouchableOpacity>
            ))}
            <Text style={{ fontSize: 11, color: '#2E7D32', fontWeight: '600', marginBottom: 4 }}>
              Correct answer: Option {optionLabels[correctIndex]}
            </Text>
            <FieldLabel label="Explanation (optional)" />
            <FieldInput value={explanation} onChangeText={setExplanation} placeholder="Explain why the answer is correct..." multiline />
            <TouchableOpacity onPress={save} disabled={saving}
              style={{ backgroundColor: '#7B1FA2', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 }}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>{existing ? 'Update Question' : 'Add Question'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Selector Dropdown ────────────────────────────────────────────────────────
function SelectorRow({ label, value, items, labelKey, onSelect }) {
  const [open, setOpen] = useState(false);
  const display = items.find(i => i.id === value)?.[labelKey] || `Select ${label}`;
  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)}
        style={{ backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: '#9E9E9E', fontWeight: '600', marginBottom: 1 }}>{label}</Text>
          <Text style={{ fontSize: 14, color: value ? '#212121' : '#BDBDBD', fontWeight: value ? '600' : '400' }} numberOfLines={1}>{display}</Text>
        </View>
        <ChevronDown size={18} color="#757575" />
      </TouchableOpacity>
      <PickerModal
        visible={open}
        title={`Select ${label}`}
        options={items.map(i => i[labelKey])}
        selected={items.find(i => i.id === value)?.[labelKey]}
        onSelect={(v) => { const found = items.find(i => i[labelKey] === v); if (found) onSelect(found.id); }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

// ─── Books Tab ────────────────────────────────────────────────────────────────
function BooksTab({ books, loading, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const togglePublish = async (book) => {
    setTogglingId(book.id);
    try {
      const res = await fetch(`${BASE_URL}/api/books/manage/${book.id}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ is_published: !book.is_published }),
      });
      if (!res.ok) throw new Error(await res.text());
      onRefresh();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setTogglingId(null);
    }
  };

  const deleteBook = (book) => {
    Alert.alert('Delete Book', `Delete "${book.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/api/books/manage/${book.id}`, { method: 'DELETE', headers: authHeaders() });
            if (!res.ok) throw new Error(await res.text());
            onRefresh();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#7B1FA2" />
        </View>
      ) : books.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <BookOpen size={48} color="#CE93D8" />
          <Text style={{ color: '#9E9E9E', fontSize: 15, marginTop: 12, textAlign: 'center' }}>No books yet. Tap "+ New Book" to add one.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          {books.map((book) => (
            <View key={book.id} style={{ backgroundColor: '#FFF', borderRadius: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 4, elevation: 2, overflow: 'hidden', flexDirection: 'row' }}>
              <View style={{ width: 5, backgroundColor: book.coverColor || '#7B1FA2' }} />
              <View style={{ flex: 1, padding: 14 }}>
                <Text style={{ fontWeight: '700', fontSize: 15, color: '#212121', marginBottom: 4 }} numberOfLines={2}>{book.title}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                  {book.subject && <Badge label={book.subject} bg="#F3E5F5" color="#7B1FA2" />}
                  {book.classLevel && <Badge label={`Class ${book.classLevel}`} bg="#E3F2FD" color="#1565C0" />}
                  {book.board && <Badge label={book.board} bg="#E8F5E9" color="#2E7D32" />}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 11, color: '#9E9E9E' }}>{book.is_published ? 'Published' : 'Draft'}</Text>
                    {togglingId === book.id
                      ? <ActivityIndicator size="small" color="#7B1FA2" />
                      : <Switch value={!!book.is_published} onValueChange={() => togglePublish(book)} thumbColor={book.is_published ? '#7B1FA2' : '#BDBDBD'} trackColor={{ false: '#E0E0E0', true: '#CE93D8' }} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
                    }
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => { setEditBook(book); setShowModal(true); }}
                      style={{ backgroundColor: '#F3E5F5', borderRadius: 8, padding: 7 }}>
                      <Edit2 size={15} color="#7B1FA2" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteBook(book)}
                      style={{ backgroundColor: '#FFEBEE', borderRadius: 8, padding: 7 }}>
                      <Trash2 size={15} color="#C62828" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <BookModal
        visible={showModal}
        onClose={() => { setShowModal(false); setEditBook(null); }}
        onSaved={onRefresh}
        existing={editBook}
      />
    </View>
  );
}

// ─── Chapters Tab ─────────────────────────────────────────────────────────────
function ChaptersTab({ books }) {
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editChapter, setEditChapter] = useState(null);

  const fetchChapters = useCallback(async (bookId) => {
    if (!bookId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/books/${bookId}/chapters`, { headers: authHeaders() });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setChapters(Array.isArray(data) ? data : data.chapters || []);
    } catch (e) {
      Alert.alert('Error', e.message);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectBook = (id) => { setSelectedBookId(id); fetchChapters(id); };

  const deleteChapter = (ch) => {
    Alert.alert('Delete Chapter', `Delete "${ch.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/api/books/${selectedBookId}/chapters/${ch.id}`, { method: 'DELETE', headers: authHeaders() });
            if (!res.ok) throw new Error(await res.text());
            fetchChapters(selectedBookId);
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const nextChapterNumber = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapterNumber || 0)) + 1 : 1;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <SelectorRow label="Book" value={selectedBookId} items={books} labelKey="title" onSelect={selectBook} />
      </View>
      {!selectedBookId ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#9E9E9E', fontSize: 14 }}>Select a book to manage chapters</Text>
        </View>
      ) : loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#7B1FA2" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          {chapters.length === 0 && (
            <Text style={{ color: '#9E9E9E', textAlign: 'center', marginTop: 20 }}>No chapters yet.</Text>
          )}
          {chapters.map((ch) => (
            <View key={ch.id} style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ color: '#7B1FA2', fontWeight: '700', fontSize: 13 }}>{ch.chapterNumber}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: '#212121', fontSize: 14 }}>{ch.title}</Text>
                {ch.summary ? <Text style={{ color: '#9E9E9E', fontSize: 11, marginTop: 2 }} numberOfLines={1}>{ch.summary}</Text> : null}
                {ch.lessonCount != null && <Text style={{ color: '#7B1FA2', fontSize: 11, marginTop: 2 }}>{ch.lessonCount} lessons</Text>}
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => { setEditChapter(ch); setShowModal(true); }}
                  style={{ backgroundColor: '#F3E5F5', borderRadius: 8, padding: 7 }}>
                  <Edit2 size={14} color="#7B1FA2" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteChapter(ch)}
                  style={{ backgroundColor: '#FFEBEE', borderRadius: 8, padding: 7 }}>
                  <Trash2 size={14} color="#C62828" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={() => { setEditChapter(null); setShowModal(true); }}
            style={{ backgroundColor: '#7B1FA2', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
            <Plus size={18} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Add Chapter</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      <ChapterModal
        visible={showModal}
        onClose={() => { setShowModal(false); setEditChapter(null); }}
        onSaved={() => fetchChapters(selectedBookId)}
        bookId={selectedBookId}
        nextNumber={nextChapterNumber}
        existing={editChapter}
      />
    </View>
  );
}

// ─── Lessons Tab ──────────────────────────────────────────────────────────────
function LessonsTab({ books }) {
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);

  const fetchChapters = useCallback(async (bookId) => {
    if (!bookId) return;
    setLoadingChapters(true);
    setChapters([]); setSelectedChapterId(null); setLessons([]); setQuizzes([]);
    try {
      const res = await fetch(`${BASE_URL}/api/books/${bookId}/chapters`, { headers: authHeaders() });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setChapters(Array.isArray(data) ? data : data.chapters || []);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoadingChapters(false);
    }
  }, []);

  const fetchLessons = useCallback(async (bookId, chapterId) => {
    if (!bookId || !chapterId) return;
    setLoadingLessons(true);
    setLessons([]); setQuizzes([]);
    try {
      const [lessonsRes, quizRes] = await Promise.all([
        fetch(`${BASE_URL}/api/books/${bookId}/chapters/${chapterId}/lessons`, { headers: authHeaders() }),
        fetch(`${BASE_URL}/api/books/${bookId}/chapters/${chapterId}/quiz`, { headers: authHeaders() }),
      ]);
      if (lessonsRes.ok) {
        const d = await lessonsRes.json();
        setLessons(Array.isArray(d) ? d : d.lessons || []);
      }
      if (quizRes.ok) {
        const d = await quizRes.json();
        setQuizzes(Array.isArray(d) ? d : d.questions || []);
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoadingLessons(false);
    }
  }, []);

  const selectBook = (id) => { setSelectedBookId(id); fetchChapters(id); };
  const selectChapter = (id) => { setSelectedChapterId(id); fetchLessons(selectedBookId, id); };

  const deleteLesson = (lesson) => {
    Alert.alert('Delete Lesson', `Delete "${lesson.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/api/books/${selectedBookId}/chapters/${selectedChapterId}/lessons/${lesson.id}`, { method: 'DELETE', headers: authHeaders() });
            if (!res.ok) throw new Error(await res.text());
            fetchLessons(selectedBookId, selectedChapterId);
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const deleteQuiz = (quiz) => {
    Alert.alert('Delete Question', 'Remove this quiz question?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/api/books/${selectedBookId}/chapters/${selectedChapterId}/quiz/${quiz.id}`, { method: 'DELETE', headers: authHeaders() });
            if (!res.ok) throw new Error(await res.text());
            fetchLessons(selectedBookId, selectedChapterId);
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const nextLessonNumber = lessons.length > 0 ? Math.max(...lessons.map(l => l.lessonNumber || 0)) + 1 : 1;
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <SelectorRow label="Book" value={selectedBookId} items={books} labelKey="title" onSelect={selectBook} />
        {selectedBookId && (
          loadingChapters
            ? <ActivityIndicator color="#7B1FA2" style={{ marginBottom: 12 }} />
            : <SelectorRow label="Chapter" value={selectedChapterId} items={chapters} labelKey="title" onSelect={selectChapter} />
        )}
      </View>

      {!selectedBookId || !selectedChapterId ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#9E9E9E', fontSize: 14 }}>
            {!selectedBookId ? 'Select a book' : 'Select a chapter'}
          </Text>
        </View>
      ) : loadingLessons ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#7B1FA2" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          {/* Lessons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontWeight: '700', color: '#4A148C', fontSize: 15 }}>Lessons ({lessons.length})</Text>
            <TouchableOpacity onPress={() => { setEditLesson(null); setShowLessonModal(true); }}
              style={{ backgroundColor: '#7B1FA2', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Plus size={14} color="#FFF" />
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>Add Lesson</Text>
            </TouchableOpacity>
          </View>

          {lessons.length === 0 && (
            <Text style={{ color: '#9E9E9E', textAlign: 'center', marginBottom: 16 }}>No lessons yet.</Text>
          )}
          {lessons.map((lesson) => {
            const tc = LESSON_TYPE_COLORS[lesson.type] || { bg: '#F5F5F5', text: '#757575' };
            return (
              <View key={lesson.id} style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Text style={{ color: '#7B1FA2', fontWeight: '700', fontSize: 11 }}>{lesson.lessonNumber}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: '#212121', fontSize: 13 }} numberOfLines={1}>{lesson.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <View style={{ backgroundColor: tc.bg, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 }}>
                      <Text style={{ color: tc.text, fontSize: 10, fontWeight: '700', textTransform: 'capitalize' }}>{lesson.type}</Text>
                    </View>
                    {lesson.content && <Text style={{ color: '#BDBDBD', fontSize: 10 }}>{lesson.content.length} chars</Text>}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity onPress={() => { setEditLesson(lesson); setShowLessonModal(true); }}
                    style={{ backgroundColor: '#F3E5F5', borderRadius: 7, padding: 6 }}>
                    <Edit2 size={13} color="#7B1FA2" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteLesson(lesson)}
                    style={{ backgroundColor: '#FFEBEE', borderRadius: 7, padding: 6 }}>
                    <Trash2 size={13} color="#C62828" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Quiz Section */}
          <View style={{ marginTop: 20, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontWeight: '700', color: '#4A148C', fontSize: 15 }}>Quiz Questions ({quizzes.length})</Text>
              <TouchableOpacity onPress={() => { setEditQuiz(null); setShowQuizModal(true); }}
                style={{ backgroundColor: '#1565C0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Plus size={14} color="#FFF" />
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>Add Quiz</Text>
              </TouchableOpacity>
            </View>
            {quizzes.length === 0 && (
              <Text style={{ color: '#9E9E9E', textAlign: 'center', marginBottom: 12 }}>No quiz questions yet.</Text>
            )}
            {quizzes.map((quiz, idx) => (
              <View key={quiz.id} style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Text style={{ fontWeight: '700', color: '#212121', fontSize: 13, flex: 1, marginRight: 8 }}>Q{idx + 1}. {quiz.question}</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity onPress={() => { setEditQuiz(quiz); setShowQuizModal(true); }}
                      style={{ backgroundColor: '#E3F2FD', borderRadius: 7, padding: 6 }}>
                      <Edit2 size={12} color="#1565C0" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteQuiz(quiz)}
                      style={{ backgroundColor: '#FFEBEE', borderRadius: 7, padding: 6 }}>
                      <Trash2 size={12} color="#C62828" />
                    </TouchableOpacity>
                  </View>
                </View>
                {(quiz.options || []).map((opt, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, backgroundColor: quiz.correctIndex === i ? '#E8F5E9' : '#F9F9F9', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: quiz.correctIndex === i ? '#A5D6A7' : '#F0F0F0' }}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: quiz.correctIndex === i ? '#2E7D32' : '#E0E0E0', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                      <Text style={{ color: quiz.correctIndex === i ? '#FFF' : '#757575', fontSize: 10, fontWeight: '700' }}>{optionLabels[i]}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: quiz.correctIndex === i ? '#2E7D32' : '#424242', fontWeight: quiz.correctIndex === i ? '700' : '400', flex: 1 }}>{opt}</Text>
                  </View>
                ))}
                {quiz.explanation ? (
                  <View style={{ backgroundColor: '#FFFDE7', borderRadius: 8, padding: 8, marginTop: 6 }}>
                    <Text style={{ fontSize: 11, color: '#F57F17' }}>Explanation: {quiz.explanation}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <LessonModal
        visible={showLessonModal}
        onClose={() => { setShowLessonModal(false); setEditLesson(null); }}
        onSaved={() => fetchLessons(selectedBookId, selectedChapterId)}
        bookId={selectedBookId}
        chapterId={selectedChapterId}
        nextNumber={nextLessonNumber}
        existing={editLesson}
      />
      <QuizModal
        visible={showQuizModal}
        onClose={() => { setShowQuizModal(false); setEditQuiz(null); }}
        onSaved={() => fetchLessons(selectedBookId, selectedChapterId)}
        bookId={selectedBookId}
        chapterId={selectedChapterId}
        existing={editQuiz}
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const TABS = ['Books', 'Chapters', 'Lessons'];

export default function ManagementBooks() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Books');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewBook, setShowNewBook] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/books/list?all=true`, { headers: authHeaders() });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : data.books || []);
    } catch (e) {
      Alert.alert('Error loading books', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#4A148C', paddingTop: insets.top + 14, paddingBottom: 0, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <BookOpen size={24} color="#CE93D8" />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' }}>Book Library</Text>
          </View>
          <TouchableOpacity onPress={() => setShowNewBook(true)}
            style={{ backgroundColor: '#7B1FA2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Plus size={16} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>New Book</Text>
          </TouchableOpacity>
        </View>
        {/* Tab Bar */}
        <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 4 }}>
          {TABS.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
              style={{ flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: activeTab === tab ? '#FFF' : 'transparent', alignItems: 'center' }}>
              <Text style={{ color: activeTab === tab ? '#4A148C' : 'rgba(255,255,255,0.7)', fontWeight: activeTab === tab ? '700' : '500', fontSize: 13 }}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 16 }} />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'Books' && (
          <BooksTab books={books} loading={loading} onRefresh={fetchBooks} />
        )}
        {activeTab === 'Chapters' && (
          <ChaptersTab books={books} />
        )}
        {activeTab === 'Lessons' && (
          <LessonsTab books={books} />
        )}
      </View>

      {/* New Book Modal (from header button) */}
      <BookModal
        visible={showNewBook}
        onClose={() => setShowNewBook(false)}
        onSaved={fetchBooks}
        existing={null}
      />
    </View>
  );
}
