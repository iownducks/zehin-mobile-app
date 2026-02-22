import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { useLocalSearchParams } from 'expo-router';
import { BookOpen, ChevronDown, ChevronRight, Plus, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu', 'Islamiat', 'Pak Studies', 'Computer', 'History'];
const TYPES = ['notes', 'summary', 'formula_sheet', 'revision', 'reference'];

export default function TeacherMaterials() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const params = useLocalSearchParams();
  const { getTeacherMaterials, createMaterial, deleteMaterial } = useSchoolStore();

  const materials = getTeacherMaterials(user?.id);
  const [showCreate, setShowCreate] = useState(params.create === '1');
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    subject: user?.subjects?.[0] || 'Mathematics',
    classLevel: user?.classesAssigned?.[0] || 9,
    type: 'notes',
    content: '',
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      Alert.alert('Error', 'Title and content are required');
      return;
    }
    await createMaterial({ ...form, classLevel: Number(form.classLevel), teacherId: user.id, schoolId: user.schoolId });
    setShowCreate(false);
    setForm({ title: '', subject: user?.subjects?.[0] || 'Mathematics', classLevel: user?.classesAssigned?.[0] || 9, type: 'notes', content: '' });
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Material', 'Remove this study material?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMaterial(id) },
    ]);
  };

  const typeColors = { notes: '#1A237E', summary: '#2E7D32', formula_sheet: '#E65100', revision: '#7B1FA2', reference: '#1565C0' };

  if (showCreate) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => setShowCreate(false)}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', flex: 1 }}>Add Study Material</Text>
          <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: '#FFD700', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 }}>
            <Text style={{ color: '#1A237E', fontWeight: 'bold', fontSize: 13 }}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 }}>
            <Label>Title *</Label>
            <Input value={form.title} onChangeText={(v) => update('title', v)} placeholder="e.g. Algebra Formulas" />

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

            <Label>Material Type</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {TYPES.map((t) => (
                <TouchableOpacity key={t} onPress={() => update('type', t)}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: form.type === t ? typeColors[t] : '#F5F5F5', borderWidth: 1, borderColor: form.type === t ? typeColors[t] : '#E0E0E0' }}>
                  <Text style={{ color: form.type === t ? '#FFF' : '#424242', fontSize: 12 }}>{t.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Label>Content (Markdown supported) *</Label>
            <TextInput
              value={form.content}
              onChangeText={(v) => update('content', v)}
              placeholder="Write the study material content here...&#10;&#10;You can use:&#10;# Heading&#10;## Sub-heading&#10;- Bullet points&#10;**bold text**"
              multiline
              style={{ backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#E0E0E0', height: 200, textAlignVertical: 'top' }}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', flex: 1 }}>Study Materials</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)} style={{ backgroundColor: '#FFD700', borderRadius: 10, padding: 10 }}>
          <Plus size={20} color="#1A237E" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {materials.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <BookOpen size={48} color="#E0E0E0" />
            <Text style={{ fontSize: 16, color: '#9E9E9E', marginTop: 16, marginBottom: 16 }}>No materials added yet</Text>
            <TouchableOpacity onPress={() => setShowCreate(true)} style={{ backgroundColor: '#1A237E', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Add First Material</Text>
            </TouchableOpacity>
          </View>
        ) : (
          materials.slice().reverse().map((mat) => {
            const isExpanded = expandedId === mat.id;
            return (
              <View key={mat.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : mat.id)} style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 15 }} numberOfLines={1}>{mat.title}</Text>
                      <Text style={{ color: '#757575', fontSize: 12, marginTop: 4 }}>
                        {mat.subject} • Class {mat.classLevel}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <View style={{ backgroundColor: (typeColors[mat.type] || '#1A237E') + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ color: typeColors[mat.type] || '#1A237E', fontSize: 11, fontWeight: '700' }}>{mat.type?.replace('_', ' ').toUpperCase()}</Text>
                      </View>
                      {isExpanded ? <ChevronDown size={16} color="#9E9E9E" /> : <ChevronRight size={16} color="#9E9E9E" />}
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ backgroundColor: '#F8F9FF', borderTopWidth: 1, borderColor: '#E0E0E0', padding: 16 }}>
                    <Text style={{ fontSize: 13, color: '#424242', lineHeight: 20 }}>{mat.content}</Text>
                    <TouchableOpacity
                      onPress={() => handleDelete(mat.id)}
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, gap: 6 }}
                    >
                      <Trash2 size={16} color="#C62828" />
                      <Text style={{ color: '#C62828', fontSize: 13, fontWeight: '600' }}>Delete Material</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const Label = ({ children }) => (
  <Text style={{ color: '#424242', marginBottom: 6, fontSize: 13, fontWeight: '500' }}>{children}</Text>
);
const Input = ({ value, onChangeText, placeholder }) => (
  <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} autoCapitalize="none"
    style={{ backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 14, borderWidth: 1, borderColor: '#E0E0E0' }} />
);
