import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { Bell, Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SchoolAnnounce() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { getSchoolAnnouncements, createAnnouncement } = useSchoolStore();

  const announcements = getSchoolAnnouncements(user?.schoolId);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', targetRoles: ['student', 'teacher'] });

  const toggleRole = (role) => {
    setForm((f) => ({
      ...f,
      targetRoles: f.targetRoles.includes(role) ? f.targetRoles.filter((r) => r !== role) : [...f.targetRoles, role],
    }));
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      Alert.alert('Error', 'Title and content are required');
      return;
    }
    await createAnnouncement({
      ...form,
      schoolId: user.schoolId,
      postedBy: user.id,
      postedByName: `${user.name} (Principal)`,
    });
    setShowCreate(false);
    setForm({ title: '', content: '', targetRoles: ['student', 'teacher'] });
    Alert.alert('Posted!', 'Announcement sent successfully.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', flex: 1 }}>Announcements</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)} style={{ backgroundColor: '#FFD700', borderRadius: 10, padding: 10 }}>
          <Plus size={20} color="#1A237E" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {announcements.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <Bell size={48} color="#E0E0E0" />
            <Text style={{ color: '#9E9E9E', fontSize: 15, marginTop: 16 }}>No announcements yet</Text>
            <TouchableOpacity onPress={() => setShowCreate(true)} style={{ backgroundColor: '#1A237E', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 16 }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Post First Announcement</Text>
            </TouchableOpacity>
          </View>
        ) : (
          announcements.slice().reverse().map((ann) => (
            <View key={ann.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#FFD700', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
              <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 16, marginBottom: 8 }}>{ann.title}</Text>
              <Text style={{ color: '#424242', fontSize: 14, lineHeight: 21, marginBottom: 10 }}>{ann.content}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#9E9E9E', fontSize: 12 }}>
                  {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {ann.targetRoles?.map((r) => (
                    <View key={r} style={{ backgroundColor: '#E8EAF6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ color: '#1A237E', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}>{r === 'school_admin' ? 'Admin' : r}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showCreate} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '75%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#E0E0E0' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1A237E', flex: 1 }}>New Announcement</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <X size={22} color="#424242" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
              <Text style={{ color: '#424242', marginBottom: 6, fontSize: 13, fontWeight: '500' }}>Title *</Text>
              <TextInput value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
                placeholder="e.g. Annual Exam Schedule"
                style={{ backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 14, borderWidth: 1, borderColor: '#E0E0E0' }} />

              <Text style={{ color: '#424242', marginBottom: 6, fontSize: 13, fontWeight: '500' }}>Message *</Text>
              <TextInput value={form.content} onChangeText={(v) => setForm((f) => ({ ...f, content: v }))}
                placeholder="Write your announcement..."
                multiline numberOfLines={5}
                style={{ backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#E0E0E0', height: 120, textAlignVertical: 'top', marginBottom: 16 }} />

              <Text style={{ color: '#424242', marginBottom: 10, fontSize: 13, fontWeight: '500' }}>Send to:</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                {['student', 'teacher', 'parent'].map((role) => (
                  <TouchableOpacity key={role} onPress={() => toggleRole(role)}
                    style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: form.targetRoles.includes(role) ? '#1A237E' : '#F5F5F5', alignItems: 'center', borderWidth: 1, borderColor: form.targetRoles.includes(role) ? '#1A237E' : '#E0E0E0' }}>
                    <Text style={{ color: form.targetRoles.includes(role) ? '#FFF' : '#424242', fontWeight: '600', textTransform: 'capitalize', fontSize: 13 }}>{role}s</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: '#1A237E', borderRadius: 12, padding: 16, alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15 }}>Post Announcement</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
