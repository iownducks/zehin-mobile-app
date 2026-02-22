import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { BookOpen, ChevronLeft, Search } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StudentStudy() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { getStudentMaterials } = useSchoolStore();

  const materials = getStudentMaterials(user || {});
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [reading, setReading] = useState(null);

  const subjects = useMemo(() => ['all', ...new Set(materials.map((m) => m.subject))], [materials]);

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase());
      const matchSubject = selectedSubject === 'all' || m.subject === selectedSubject;
      return matchSearch && matchSubject;
    });
  }, [materials, search, selectedSubject]);

  const typeColors = {
    notes: '#1A237E', summary: '#2E7D32', formula_sheet: '#E65100',
    revision: '#7B1FA2', reference: '#1565C0',
  };

  // Reading view
  if (reading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => setReading(null)}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }} numberOfLines={1}>{reading.title}</Text>
            <Text style={{ fontSize: 12, color: '#9FA8DA' }}>{reading.subject} • Class {reading.classLevel}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
          {/* Render content with basic markdown-like display */}
          {reading.content.split('\n').map((line, idx) => {
            if (line.startsWith('# ')) {
              return <Text key={idx} style={{ fontSize: 22, fontWeight: 'bold', color: '#1A237E', marginBottom: 8, marginTop: 12 }}>{line.substring(2)}</Text>;
            }
            if (line.startsWith('## ')) {
              return <Text key={idx} style={{ fontSize: 18, fontWeight: 'bold', color: '#1A237E', marginBottom: 6, marginTop: 10 }}>{line.substring(3)}</Text>;
            }
            if (line.startsWith('### ')) {
              return <Text key={idx} style={{ fontSize: 15, fontWeight: '700', color: '#424242', marginBottom: 4, marginTop: 8 }}>{line.substring(4)}</Text>;
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return (
                <View key={idx} style={{ flexDirection: 'row', marginBottom: 4, paddingLeft: 8 }}>
                  <Text style={{ color: '#1A237E', marginRight: 6, fontWeight: 'bold' }}>•</Text>
                  <Text style={{ flex: 1, fontSize: 14, color: '#424242', lineHeight: 21 }}>{line.substring(2)}</Text>
                </View>
              );
            }
            if (line.trim() === '') {
              return <View key={idx} style={{ height: 8 }} />;
            }
            // Bold text
            const parts = line.split(/\*\*(.*?)\*\*/g);
            if (parts.length > 1) {
              return (
                <Text key={idx} style={{ fontSize: 14, color: '#424242', lineHeight: 21, marginBottom: 4 }}>
                  {parts.map((part, i) => i % 2 === 1 ? (
                    <Text key={i} style={{ fontWeight: 'bold', color: '#1A237E' }}>{part}</Text>
                  ) : part)}
                </Text>
              );
            }
            return <Text key={idx} style={{ fontSize: 14, color: '#424242', lineHeight: 21, marginBottom: 4 }}>{line}</Text>;
          })}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 }}>Study Materials</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 }}>
          <Search size={18} color="#757575" />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search materials..." style={{ flex: 1, marginLeft: 10, fontSize: 15 }} />
        </View>
      </View>

      {/* Subject Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E0E0E0', maxHeight: 54 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        {subjects.map((s) => (
          <TouchableOpacity key={s} onPress={() => setSelectedSubject(s)}
            style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: selectedSubject === s ? '#1A237E' : '#F5F5F5', borderWidth: 1, borderColor: selectedSubject === s ? '#1A237E' : '#E0E0E0' }}>
            <Text style={{ color: selectedSubject === s ? '#FFF' : '#424242', fontSize: 13, fontWeight: '600', textTransform: s === 'all' ? 'capitalize' : 'none' }}>
              {s === 'all' ? 'All' : s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {filtered.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <BookOpen size={48} color="#E0E0E0" />
            <Text style={{ color: '#9E9E9E', fontSize: 15, marginTop: 16 }}>No study materials yet</Text>
            <Text style={{ color: '#BDBDBD', fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
              Your teachers will add study notes and materials here
            </Text>
          </View>
        ) : (
          filtered.map((mat) => (
            <TouchableOpacity key={mat.id} onPress={() => setReading(mat)}
              style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: (typeColors[mat.type] || '#1A237E') + '22', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <BookOpen size={22} color={typeColors[mat.type] || '#1A237E'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 15 }} numberOfLines={2}>{mat.title}</Text>
                  <Text style={{ color: '#757575', fontSize: 12, marginTop: 3 }}>{mat.subject} • Class {mat.classLevel}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ backgroundColor: (typeColors[mat.type] || '#1A237E') + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: typeColors[mat.type] || '#1A237E', fontSize: 10, fontWeight: '700' }}>
                      {mat.type?.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={{ color: '#9E9E9E', fontSize: 12, marginTop: 10, lineHeight: 17 }} numberOfLines={2}>
                {mat.content?.substring(0, 100)}...
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
