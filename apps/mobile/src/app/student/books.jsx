import { useUser } from '@/context/UserContext';
import { useRouter } from 'expo-router';
import { BookOpen, Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const SUBJECTS = [
  'All',
  'Mathematics',
  'English',
  'Urdu',
  'Science',
  'Islamic Studies',
  'Pakistan Studies',
  'Computer',
  'Physics',
  'Chemistry',
  'Biology',
];

const SUBJECT_COLORS = {
  Mathematics: '#1565C0',
  English: '#2E7D32',
  Urdu: '#6A1B9A',
  Science: '#00695C',
  'Islamic Studies': '#E65100',
  'Pakistan Studies': '#33691E',
  Computer: '#0277BD',
  Physics: '#4527A0',
  Chemistry: '#880E4F',
  Biology: '#1B5E20',
};

const BASE_URL = process.env.EXPO_PUBLIC_APP_URL;

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <View
      style={{
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View style={{ height: 140, backgroundColor: '#E0E0E0' }} />
      <View style={{ padding: 11, gap: 6 }}>
        <View style={{ height: 13, backgroundColor: '#EEEEEE', borderRadius: 6, width: '80%' }} />
        <View style={{ height: 11, backgroundColor: '#EEEEEE', borderRadius: 6, width: '50%' }} />
        <View style={{ height: 10, backgroundColor: '#EEEEEE', borderRadius: 6, width: '60%' }} />
      </View>
    </View>
  );
}

// ─── Book Card ─────────────────────────────────────────────────────────────────
function BookCard({ book, onPress }) {
  const color = book.cover_color || SUBJECT_COLORS[book.subject] || '#1A237E';
  const initial = (book.subject || 'B')[0].toUpperCase();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
      }}
      activeOpacity={0.85}
    >
      {/* Colored Cover */}
      <View
        style={{
          backgroundColor: color,
          height: 140,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        {/* Book spine decoration */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            backgroundColor: 'rgba(0,0,0,0.18)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 8,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: 'rgba(255,255,255,0.12)',
          }}
        />
        {/* Subject initial circle */}
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 26, fontWeight: '800', color: '#FFFFFF' }}>{initial}</Text>
        </View>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '700',
            textAlign: 'center',
            opacity: 0.85,
            letterSpacing: 0.5,
          }}
          numberOfLines={2}
        >
          {book.subject?.toUpperCase()}
        </Text>
      </View>

      {/* Book Info */}
      <View style={{ padding: 11 }}>
        <Text
          style={{ fontSize: 13, fontWeight: '700', color: '#1A237E', marginBottom: 5 }}
          numberOfLines={2}
        >
          {book.title}
        </Text>

        {/* Badges row */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 5 }}>
          <View
            style={{
              backgroundColor: color + '1A',
              paddingHorizontal: 7,
              paddingVertical: 2,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color }}>
              {book.subject}
            </Text>
          </View>
          {book.class_level && (
            <View
              style={{
                backgroundColor: '#F5F5F5',
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#616161' }}>
                Class {book.class_level}
              </Text>
            </View>
          )}
        </View>

        {book.board && (
          <Text style={{ fontSize: 10, color: '#9E9E9E', marginBottom: 3 }}>{book.board} Board</Text>
        )}

        <Text style={{ fontSize: 10, color: '#BDBDBD' }}>
          {book.chapter_count ?? 0} chapter{book.chapter_count !== 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function StudentBooks() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const router = useRouter();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [showMyClass, setShowMyClass] = useState(true);

  const debounceTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const studentClassLevel = user?.classLevel || null;

  // Debounce search input 400ms
  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(text);
    }, 400);
  }, []);

  const fetchBooks = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (showMyClass && studentClassLevel) {
        params.append('class_level', studentClassLevel);
      } else {
        params.append('all', 'true');
      }
      if (selectedSubject !== 'All') {
        params.append('subject', selectedSubject);
      }
      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim());
      }

      const url = `${BASE_URL}/api/books/list?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setBooks(data.books || []);
    } catch (err) {
      setError(err.message || 'Failed to load books');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showMyClass, studentClassLevel, selectedSubject, debouncedSearch]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleRefresh = () => fetchBooks(true);

  const renderContent = () => {
    if (loading && !refreshing) {
      // Skeleton grid
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
          {[1, 2, 3, 4, 5, 6].map((k) => <SkeletonCard key={k} />)}
        </View>
      );
    }

    if (error) {
      return (
        <View style={{ paddingVertical: 60, alignItems: 'center' }}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#424242', textAlign: 'center' }}>
            Couldn't load books
          </Text>
          <Text style={{ fontSize: 13, color: '#9E9E9E', marginTop: 6, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchBooks()}
            style={{
              marginTop: 16,
              backgroundColor: '#1A237E',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (books.length === 0) {
      return (
        <View style={{ paddingVertical: 60, alignItems: 'center' }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📚</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#424242', textAlign: 'center' }}>
            No books found
          </Text>
          <Text style={{ fontSize: 13, color: '#9E9E9E', marginTop: 6, textAlign: 'center' }}>
            Try adjusting your filters or search
          </Text>
        </View>
      );
    }

    return (
      <>
        <Text style={{ fontSize: 13, color: '#757575', marginBottom: 12 }}>
          {books.length} book{books.length !== 1 ? 's' : ''} found
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onPress={() => router.push(`/student/reader/${book.id}`)}
            />
          ))}
        </View>
      </>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          backgroundColor: '#1A237E',
          paddingTop: insets.top + 16,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <BookOpen color="#FFFFFF" size={26} />
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 10 }}>
            My Books
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Search size={18} color="#757575" />
          <TextInput
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Search books by title or subject..."
            placeholderTextColor="#9E9E9E"
            style={{ flex: 1, marginLeft: 10, fontSize: 15, color: '#212121' }}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Class Toggle */}
      {studentClassLevel && (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderColor: '#E0E0E0',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => setShowMyClass(true)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: showMyClass ? '#1A237E' : '#F5F5F5',
              borderWidth: 1,
              borderColor: showMyClass ? '#1A237E' : '#E0E0E0',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: showMyClass ? '#FFFFFF' : '#616161',
              }}
            >
              My Class
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowMyClass(false)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: !showMyClass ? '#1A237E' : '#F5F5F5',
              borderWidth: 1,
              borderColor: !showMyClass ? '#1A237E' : '#E0E0E0',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: !showMyClass ? '#FFFFFF' : '#616161',
              }}
            >
              All Classes
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Subject Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          flexGrow: 0,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderColor: '#E0E0E0',
        }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
      >
        {SUBJECTS.map((subject) => {
          const active = selectedSubject === subject;
          const color = SUBJECT_COLORS[subject] || '#1A237E';
          return (
            <TouchableOpacity
              key={subject}
              onPress={() => setSelectedSubject(subject)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: active ? color : '#F5F5F5',
                borderWidth: 1,
                borderColor: active ? color : '#E0E0E0',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: active ? '#FFFFFF' : '#616161',
                }}
              >
                {subject}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Books Grid */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#1A237E"
            colors={['#1A237E']}
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}
