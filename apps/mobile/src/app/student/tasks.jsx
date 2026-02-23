import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import useUpload from '@/utils/useUpload';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { BookOpen, Camera, CheckCircle, ChevronDown, ChevronRight, Clock, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FILTERS = ['all', 'pending', 'submitted', 'graded', 'overdue'];
const MAX_PHOTOS = 3;

export default function StudentTasks() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const router = useRouter();
  const { getStudentTasks, submitTask, getUser } = useSchoolStore();
  const [upload, { loading: uploadLoading }] = useUpload();

  const allTasks = getStudentTasks(user || {});
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [submitModal, setSubmitModal] = useState(null);
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState([]); // [{ uri, mimeType }]
  const [submitting, setSubmitting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

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

  const openSubmitModal = (task) => {
    setSubmitModal(task);
    setNote('');
    setPhotos([]);
  };

  const closeSubmitModal = () => {
    setSubmitModal(null);
    setNote('');
    setPhotos([]);
  };

  const pickPhoto = async (fromCamera) => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit reached', `You can attach up to ${MAX_PHOTOS} photos.`);
      return;
    }
    let result;
    try {
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission needed', 'Camera access is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          allowsEditing: true,
          aspect: [4, 3],
        });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission needed', 'Gallery access is required to pick photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          allowsEditing: true,
          aspect: [4, 3],
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open image picker.');
      return;
    }
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      setPhotos((prev) => [...prev, { uri: asset.uri, mimeType: asset.mimeType || 'image/jpeg' }]);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert('Add Photo', 'Choose source', [
      { text: 'Take Photo', onPress: () => pickPhoto(true) },
      { text: 'Choose from Gallery', onPress: () => pickPhoto(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!submitModal) return;
    setSubmitting(true);
    try {
      const attachments = [];
      for (const photo of photos) {
        const result = await upload({ reactNativeAsset: { uri: photo.uri, mimeType: photo.mimeType } });
        if (result?.url) {
          attachments.push({ url: result.url, mimeType: result.mimeType || photo.mimeType });
        } else if (result?.error) {
          Alert.alert('Upload failed', result.error + '\nSubmitting without this photo.');
        }
      }
      await submitTask(submitModal.id, user.id, note, attachments);
      closeSubmitModal();
      Alert.alert('Submitted!', 'Your task has been submitted successfully.');
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
                      {/* Book reference badge */}
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

                    {/* Open in Reader button */}
                    {task.bookId && task.chapterId && (
                      <TouchableOpacity
                        onPress={() => router.push(`/reader/${task.bookId}?chapter=${task.chapterId}`)}
                        style={{ backgroundColor: '#E8EAF6', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}
                      >
                        <BookOpen size={18} color="#3949AB" />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#3949AB', fontWeight: '700', fontSize: 13 }}>Open in Reader</Text>
                          <Text style={{ color: '#7986CB', fontSize: 11 }} numberOfLines={1}>
                            Ch. {task.chapterNumber}: {task.chapterTitle}
                          </Text>
                        </View>
                        <ChevronRight size={16} color="#3949AB" />
                      </TouchableOpacity>
                    )}

                    {sub ? (
                      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E0E0E0' }}>
                        <Text style={{ fontWeight: '600', color: '#1A237E', marginBottom: 6 }}>Your Submission</Text>
                        {sub.note ? <Text style={{ color: '#424242', fontSize: 13, marginBottom: 8 }}>"{sub.note}"</Text> : null}
                        {/* Submitted photo thumbnails */}
                        {sub.attachments?.length > 0 && (
                          <View style={{ marginBottom: 8 }}>
                            <Text style={{ fontSize: 12, color: '#757575', marginBottom: 6 }}>
                              📎 {sub.attachments.length} photo{sub.attachments.length > 1 ? 's' : ''} attached
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
                        onPress={() => openSubmitModal(task)}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1A237E', flex: 1 }}>Submit Task</Text>
              <TouchableOpacity onPress={closeSubmitModal}>
                <X size={22} color="#9E9E9E" />
              </TouchableOpacity>
            </View>
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
              style={{ backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#E0E0E0', height: 80, textAlignVertical: 'top', marginBottom: 14 }}
            />

            {/* Photo attachments */}
            <Text style={{ color: '#424242', marginBottom: 8, fontSize: 13, fontWeight: '500' }}>
              📷 Homework Photos ({photos.length}/{MAX_PHOTOS})
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              {photos.map((photo, idx) => (
                <View key={idx} style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={{ width: 76, height: 76, borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0' }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removePhoto(idx)}
                    style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#C62828', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={12} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < MAX_PHOTOS && (
                <TouchableOpacity
                  onPress={showPhotoOptions}
                  style={{ width: 76, height: 76, borderRadius: 10, borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FF' }}
                >
                  <Camera size={22} color="#9E9E9E" />
                  <Text style={{ color: '#9E9E9E', fontSize: 10, marginTop: 4 }}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={closeSubmitModal} style={{ flex: 1, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, alignItems: 'center' }}>
                <Text style={{ color: '#424242', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting || uploadLoading}
                style={{ flex: 2, backgroundColor: submitting || uploadLoading ? '#9FA8DA' : '#1A237E', borderRadius: 12, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
              >
                {(submitting || uploadLoading) && <ActivityIndicator size="small" color="#FFF" />}
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                  {submitting || uploadLoading ? 'Uploading...' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
