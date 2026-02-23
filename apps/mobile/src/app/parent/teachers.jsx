import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { BookOpen, Mail, Phone, User } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ParentTeachers() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { getUser, getChildTeachers, getTeacherTasks } = useSchoolStore();

  const child = getUser(user?.childId);
  // Only teachers who teach child's class — NOT all school teachers
  const teachers = child ? getChildTeachers(user?.schoolId, child.classLevel) : [];

  const getTeacherStats = (teacherId) => {
    const tasks = getTeacherTasks(teacherId);
    const childTasks = tasks.filter((t) => t.classLevel === child?.classLevel);
    const childSubmissions = childTasks.filter((t) =>
      t.submissions?.find((s) => s.studentId === child?.id)
    );
    return { tasksGiven: childTasks.length, childSubmitted: childSubmissions.length };
  };

  const subjectColors = {
    Mathematics: '#1565C0', Physics: '#6A1B9A', Chemistry: '#2E7D32',
    Biology: '#00695C', English: '#E65100', Urdu: '#C62828',
    Islamiat: '#1B5E20', Computer: '#37474F', History: '#4E342E',
    'Pak Studies': '#880E4F',
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#006064', paddingTop: insets.top + 16, paddingBottom: 20, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 }}>Teachers</Text>
        <Text style={{ color: '#80DEEA', fontSize: 13 }}>
          {child?.name}'s teachers — Class {child?.classLevel}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {teachers.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <User size={48} color="#E0E0E0" />
            <Text style={{ color: '#9E9E9E', fontSize: 15, marginTop: 16, textAlign: 'center' }}>
              No teachers assigned to Class {child?.classLevel} yet
            </Text>
          </View>
        ) : (
          teachers.map((teacher) => {
            const stats = getTeacherStats(teacher.id);
            return (
              <View key={teacher.id} style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                {/* Teacher header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                  <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#E0F7FA', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 2, borderColor: '#006064' }}>
                    <User size={26} color="#006064" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 16 }}>{teacher.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      <Mail size={12} color="#757575" />
                      <Text style={{ color: '#757575', fontSize: 12 }}>{teacher.email}</Text>
                    </View>
                    {teacher.phone && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Phone size={12} color="#757575" />
                        <Text style={{ color: '#757575', fontSize: 12 }}>{teacher.phone}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Subjects */}
                <Text style={{ fontSize: 12, color: '#9E9E9E', fontWeight: '600', marginBottom: 8 }}>TEACHES</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {(teacher.subjects || []).map((sub) => (
                    <View key={sub} style={{ backgroundColor: (subjectColors[sub] || '#006064') + '18', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: (subjectColors[sub] || '#006064') + '44' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <BookOpen size={11} color={subjectColors[sub] || '#006064'} />
                        <Text style={{ color: subjectColors[sub] || '#006064', fontSize: 12, fontWeight: '600' }}>{sub}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Stats for this child */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1, backgroundColor: '#E0F7FA', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#006064' }}>{stats.tasksGiven}</Text>
                    <Text style={{ fontSize: 11, color: '#00838F', marginTop: 2 }}>Tasks Given</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: '#E8F5E9', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2E7D32' }}>{stats.childSubmitted}</Text>
                    <Text style={{ fontSize: 11, color: '#388E3C', marginTop: 2 }}>Submitted</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: '#FFEBEE', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#C62828' }}>{stats.tasksGiven - stats.childSubmitted}</Text>
                    <Text style={{ fontSize: 11, color: '#D32F2F', marginTop: 2 }}>Pending</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
