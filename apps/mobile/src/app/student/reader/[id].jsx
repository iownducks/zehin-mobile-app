import { useUser } from '@/context/UserContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  List,
  X,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE_URL = process.env.EXPO_PUBLIC_APP_URL;

// ─── Lesson type styles ────────────────────────────────────────────────────────
const LESSON_STYLES = {
  text: {
    bg: '#FFFFFF',
    border: '#E0E0E0',
    headerBg: null,
    headerLabel: null,
    headerColor: null,
  },
  example: {
    bg: '#E3F2FD',
    border: '#90CAF9',
    headerBg: '#BBDEFB',
    headerLabel: '📘 Example',
    headerColor: '#1565C0',
  },
  exercise: {
    bg: '#E8F5E9',
    border: '#A5D6A7',
    headerBg: '#C8E6C9',
    headerLabel: '✏️ Exercise',
    headerColor: '#2E7D32',
  },
  note: {
    bg: '#FFF8E1',
    border: '#FFE082',
    headerBg: '#FFECB3',
    headerLabel: '📌 Note',
    headerColor: '#F57F17',
  },
  keypoints: {
    bg: '#F3E5F5',
    border: '#CE93D8',
    headerBg: '#E1BEE7',
    headerLabel: '⭐ Key Points',
    headerColor: '#6A1B9A',
  },
};

// ─── Lesson Card ───────────────────────────────────────────────────────────────
function LessonCard({ lesson }) {
  const type = lesson.type || 'text';
  const style = LESSON_STYLES[type] || LESSON_STYLES.text;
  const content = lesson.content || '';

  const renderContent = () => {
    if (type === 'keypoints') {
      // Render bullet list if newline separated
      const lines = content.split('\n').filter((l) => l.trim().length > 0);
      return lines.map((line, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 14, color: '#6A1B9A', marginRight: 8, marginTop: 2 }}>•</Text>
          <Text
            style={{
              flex: 1,
              fontSize: 16,
              color: '#212121',
              lineHeight: 26,
            }}
          >
            {line.trim()}
          </Text>
        </View>
      ));
    }

    // For other types split on double newlines into paragraphs
    const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);
    if (paragraphs.length === 0) {
      return (
        <Text style={{ fontSize: 16, color: '#424242', lineHeight: 26 }}>
          {content}
        </Text>
      );
    }
    return paragraphs.map((para, i) => (
      <Text key={i} style={{ fontSize: 16, color: '#424242', lineHeight: 26, marginBottom: i < paragraphs.length - 1 ? 14 : 0 }}>
        {para.trim()}
      </Text>
    ));
  };

  return (
    <View
      style={{
        backgroundColor: style.bg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: style.border,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      {/* Type header badge */}
      {style.headerLabel && (
        <View
          style={{
            backgroundColor: style.headerBg,
            paddingHorizontal: 16,
            paddingVertical: 9,
            borderBottomWidth: 1,
            borderColor: style.border,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: style.headerColor }}>
            {style.headerLabel}
          </Text>
        </View>
      )}

      <View style={{ padding: 16 }}>
        {/* Lesson title */}
        {lesson.title && (
          <Text
            style={{
              fontSize: 17,
              fontWeight: '700',
              color: '#1A237E',
              marginBottom: 12,
              lineHeight: 24,
            }}
          >
            {lesson.title}
          </Text>
        )}
        {renderContent()}
      </View>
    </View>
  );
}

// ─── Quiz Section ──────────────────────────────────────────────────────────────
function QuizSection({ quizzes }) {
  const [answers, setAnswers] = useState({});
  const correctCount = Object.entries(answers).filter(
    ([qi, ans]) => quizzes[parseInt(qi)]?.correct_answer === ans
  ).length;

  if (!quizzes || quizzes.length === 0) return null;

  return (
    <View style={{ marginTop: 8 }}>
      {/* Quiz header */}
      <View
        style={{
          backgroundColor: '#1A237E',
          borderRadius: 14,
          padding: 18,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFFFFF' }}>
            Chapter Quiz
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
            {quizzes.length} question{quizzes.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {Object.keys(answers).length > 0 && (
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#FFFFFF' }}>
              {correctCount}/{quizzes.length}
            </Text>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
              correct
            </Text>
          </View>
        )}
      </View>

      {quizzes.map((q, qi) => {
        const selected = answers[qi];
        const answered = selected !== undefined;
        const isCorrect = selected === q.correct_answer;
        const optionLetters = ['A', 'B', 'C', 'D'];
        const options = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);

        return (
          <View
            key={q.id || qi}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: answered ? (isCorrect ? '#A5D6A7' : '#EF9A9A') : '#E0E0E0',
              padding: 16,
              marginBottom: 14,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            {/* Question */}
            <View style={{ flexDirection: 'row', marginBottom: 14 }}>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: '#1A237E',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                  marginTop: 1,
                  flexShrink: 0,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>
                  Q{qi + 1}
                </Text>
              </View>
              <Text
                style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#212121', lineHeight: 22 }}
              >
                {q.question}
              </Text>
            </View>

            {/* Options */}
            {options.map((opt, oi) => {
              const letter = optionLetters[oi];
              const isSelected = selected === letter;
              const isCorrectOption = q.correct_answer === letter;

              let optBg = '#F5F5F5';
              let optBorder = '#E0E0E0';
              let optTextColor = '#424242';
              let optLetterBg = '#E0E0E0';
              let optLetterColor = '#616161';

              if (answered) {
                if (isCorrectOption) {
                  optBg = '#E8F5E9';
                  optBorder = '#66BB6A';
                  optTextColor = '#1B5E20';
                  optLetterBg = '#66BB6A';
                  optLetterColor = '#FFFFFF';
                } else if (isSelected && !isCorrect) {
                  optBg = '#FFEBEE';
                  optBorder = '#EF5350';
                  optTextColor = '#B71C1C';
                  optLetterBg = '#EF5350';
                  optLetterColor = '#FFFFFF';
                }
              } else if (isSelected) {
                optBg = '#E8EAF6';
                optBorder = '#1A237E';
                optLetterBg = '#1A237E';
                optLetterColor = '#FFFFFF';
                optTextColor = '#1A237E';
              }

              return (
                <TouchableOpacity
                  key={letter}
                  disabled={answered}
                  onPress={() => setAnswers((prev) => ({ ...prev, [qi]: letter }))}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: optBg,
                    borderWidth: 1.5,
                    borderColor: optBorder,
                    borderRadius: 10,
                    padding: 11,
                    marginBottom: 8,
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: optLetterBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                      flexShrink: 0,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: optLetterColor }}>
                      {letter}
                    </Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, color: optTextColor, lineHeight: 20 }}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Explanation */}
            {answered && q.explanation && (
              <View
                style={{
                  backgroundColor: '#FFF8E1',
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 4,
                  borderLeftWidth: 3,
                  borderLeftColor: '#FFA000',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#F57F17', marginBottom: 4 }}>
                  Explanation
                </Text>
                <Text style={{ fontSize: 13, color: '#424242', lineHeight: 20 }}>
                  {q.explanation}
                </Text>
              </View>
            )}

            {/* Result badge */}
            {answered && (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                <View
                  style={{
                    backgroundColor: isCorrect ? '#E8F5E9' : '#FFEBEE',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: isCorrect ? '#2E7D32' : '#C62828',
                    }}
                  >
                    {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Main Reader Screen ────────────────────────────────────────────────────────
export default function BookReader() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();

  const scrollRef = useRef(null);

  // Book overview (chapters list without full content)
  const [book, setBook] = useState(null);
  const [bookLoading, setBookLoading] = useState(true);
  const [bookError, setBookError] = useState(null);

  // Current position
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  // Full chapter data with lesson content + quizzes
  const [chapterData, setChapterData] = useState(null);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterError, setChapterError] = useState(null);

  const [showChapterList, setShowChapterList] = useState(false);

  // ── Fetch book overview ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setBookLoading(true);
        setBookError(null);
        const res = await fetch(`${BASE_URL}/api/books/${id}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setBook(data.book);
      } catch (err) {
        setBookError(err.message || 'Failed to load book');
      } finally {
        setBookLoading(false);
      }
    })();
  }, [id]);

  // ── Fetch chapter content whenever chapter changes ────────────────────────────
  useEffect(() => {
    if (!book || !book.chapters || book.chapters.length === 0) return;
    const chapter = book.chapters[currentChapterIndex];
    if (!chapter) return;

    (async () => {
      try {
        setChapterLoading(true);
        setChapterError(null);
        setChapterData(null);
        const res = await fetch(`${BASE_URL}/api/books/${id}/chapter/${chapter.id}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setChapterData(data.chapter);
        setCurrentLessonIndex(0);
        // Scroll to top
        setTimeout(() => {
          scrollRef.current?.scrollTo({ y: 0, animated: false });
        }, 50);
      } catch (err) {
        setChapterError(err.message || 'Failed to load chapter');
      } finally {
        setChapterLoading(false);
      }
    })();
  }, [book, currentChapterIndex, id]);

  // ── Scroll to top on lesson change ──────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentLessonIndex]);

  // ── Progress tracking ────────────────────────────────────────────────────────
  const reportProgress = useCallback(async (lessonIndex) => {
    if (!book || !chapterData || !user?.id) return;
    const chapter = book.chapters[currentChapterIndex];
    if (!chapter) return;
    const lessons = chapterData.lessons || [];
    const lesson = lessons[lessonIndex];
    if (!lesson) return;

    // Total lessons across whole book (approximation: sum of chapter lesson counts)
    const totalLessons = (book.chapters || []).reduce(
      (sum, ch) => sum + (ch.lessons?.length || 0),
      0
    );
    // Lessons completed so far (chapters before this + lessons in this chapter up to now)
    const chaptersBefore = book.chapters.slice(0, currentChapterIndex);
    const lessonsBeforeThisChapter = chaptersBefore.reduce(
      (sum, ch) => sum + (ch.lessons?.length || 0),
      0
    );
    const completedLessons = lessonsBeforeThisChapter + lessonIndex + 1;
    const progress_percent =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    try {
      await fetch(`${BASE_URL}/api/books/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          book_id: book.id,
          chapter_id: chapter.id,
          lesson_id: lesson.id,
          progress_percent,
        }),
      });
    } catch {
      // Silent fail — progress tracking should not disrupt reading
    }
  }, [book, chapterData, currentChapterIndex, user]);

  // ── Navigation ───────────────────────────────────────────────────────────────
  const lessons = chapterData?.lessons || [];
  const quizzes = chapterData?.quizzes || [];
  const chapters = book?.chapters || [];
  const currentChapter = chapters[currentChapterIndex];
  const coverColor = book?.cover_color || '#1A237E';

  // Total "pages" in this chapter = lessons + (quizzes.length > 0 ? 1 : 0)
  const hasQuiz = quizzes.length > 0;
  const totalPages = lessons.length + (hasQuiz ? 1 : 0);
  const isOnQuiz = currentLessonIndex === lessons.length && hasQuiz;

  const canGoPrev = currentLessonIndex > 0 || currentChapterIndex > 0;
  const canGoNext =
    currentLessonIndex < totalPages - 1 ||
    currentChapterIndex < chapters.length - 1;

  const goToPrev = useCallback(() => {
    if (currentLessonIndex > 0) {
      const newIndex = currentLessonIndex - 1;
      setCurrentLessonIndex(newIndex);
      reportProgress(newIndex);
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex((i) => i - 1);
      // currentLessonIndex reset happens in chapter fetch effect
    }
  }, [currentLessonIndex, currentChapterIndex, reportProgress]);

  const goToNext = useCallback(() => {
    if (currentLessonIndex < totalPages - 1) {
      const newIndex = currentLessonIndex + 1;
      setCurrentLessonIndex(newIndex);
      // Only report progress for actual lessons (not quiz page)
      if (newIndex < lessons.length) reportProgress(newIndex);
    } else if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex((i) => i + 1);
    }
  }, [currentLessonIndex, totalPages, lessons.length, currentChapterIndex, chapters.length, reportProgress]);

  // ── Render states ────────────────────────────────────────────────────────────
  if (bookLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#1A237E" />
        <Text style={{ color: '#9E9E9E', marginTop: 12, fontSize: 14 }}>Loading book...</Text>
      </View>
    );
  }

  if (bookError || !book) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', padding: 24 }}>
        <Text style={{ fontSize: 36, marginBottom: 12 }}>📚</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#424242', textAlign: 'center', marginBottom: 6 }}>
          {bookError || 'Book not found'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 16,
            backgroundColor: '#1A237E',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4F8' }}>
      {/* ── Top Bar ── */}
      <View
        style={{
          backgroundColor: coverColor,
          paddingTop: insets.top + 8,
          paddingBottom: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12, padding: 4 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft color="#FFFFFF" size={26} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text
            style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', lineHeight: 20 }}
            numberOfLines={1}
          >
            {book.title}
          </Text>
          {currentChapter && (
            <TouchableOpacity onPress={() => setShowChapterList(true)}>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 12,
                  marginTop: 2,
                  textDecorationLine: 'underline',
                }}
                numberOfLines={1}
              >
                Ch {currentChapter.number}: {currentChapter.title}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setShowChapterList(true)}
          style={{
            backgroundColor: 'rgba(255,255,255,0.22)',
            borderRadius: 10,
            padding: 9,
            marginLeft: 8,
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <List color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>

      {/* ── Content Area ── */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        {chapterLoading ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1A237E" />
            <Text style={{ color: '#9E9E9E', marginTop: 12, fontSize: 14 }}>
              Loading chapter...
            </Text>
          </View>
        ) : chapterError ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>⚠️</Text>
            <Text style={{ fontSize: 15, color: '#424242', textAlign: 'center', fontWeight: '600' }}>
              {chapterError}
            </Text>
            <TouchableOpacity
              onPress={() => {
                // Re-trigger chapter fetch by toggling index
                const idx = currentChapterIndex;
                setCurrentChapterIndex(-1);
                setTimeout(() => setCurrentChapterIndex(idx), 50);
              }}
              style={{
                marginTop: 14,
                backgroundColor: '#1A237E',
                paddingHorizontal: 18,
                paddingVertical: 9,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : isOnQuiz ? (
          <QuizSection quizzes={quizzes} />
        ) : lessons.length > 0 ? (
          <LessonCard lesson={lessons[currentLessonIndex]} />
        ) : (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <BookOpen color="#BDBDBD" size={48} />
            <Text style={{ color: '#9E9E9E', marginTop: 12, fontSize: 15 }}>
              No lessons in this chapter
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Bottom Navigation Bar ── */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderColor: '#E0E0E0',
          paddingBottom: insets.bottom + 8,
          paddingTop: 10,
          paddingHorizontal: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 8,
        }}
      >
        {/* Progress row */}
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          {isOnQuiz ? (
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#1A237E' }}>
              Chapter Quiz
            </Text>
          ) : lessons.length > 0 ? (
            <Text style={{ fontSize: 12, color: '#757575' }}>
              Lesson {currentLessonIndex + 1} of {lessons.length}
              {hasQuiz ? ' · Quiz after last lesson' : ''}
            </Text>
          ) : null}

          {/* Progress bar */}
          {totalPages > 0 && (
            <View
              style={{
                height: 3,
                backgroundColor: '#E0E0E0',
                borderRadius: 2,
                marginTop: 6,
                width: '80%',
              }}
            >
              <View
                style={{
                  height: 3,
                  backgroundColor: coverColor,
                  borderRadius: 2,
                  width: `${((currentLessonIndex + 1) / totalPages) * 100}%`,
                }}
              />
            </View>
          )}
        </View>

        {/* Prev / Next buttons */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={goToPrev}
            disabled={!canGoPrev}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              opacity: canGoPrev ? 1 : 0.3,
              backgroundColor: '#F5F5F5',
              borderRadius: 10,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
            activeOpacity={0.8}
          >
            <ChevronLeft color="#1A237E" size={18} />
            <Text style={{ color: '#1A237E', fontWeight: '600', fontSize: 14, marginLeft: 4 }}>
              Prev
            </Text>
          </TouchableOpacity>

          {/* Chapter indicator */}
          <TouchableOpacity onPress={() => setShowChapterList(true)}>
            <Text style={{ fontSize: 12, color: '#9E9E9E', textAlign: 'center' }}>
              Ch {currentChapterIndex + 1}/{chapters.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToNext}
            disabled={!canGoNext}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              opacity: canGoNext ? 1 : 0.3,
              backgroundColor: coverColor,
              borderRadius: 10,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14, marginRight: 4 }}>
              Next
            </Text>
            <ChevronRight color="#FFFFFF" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Chapter List Modal ── */}
      <Modal
        visible={showChapterList}
        animationType="slide"
        transparent
        onRequestClose={() => setShowChapterList(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.45)',
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              maxHeight: '80%',
            }}
          >
            {/* Modal header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderColor: '#F0F0F0',
              }}
            >
              <View>
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#1A237E' }}>
                  Chapters
                </Text>
                <Text style={{ fontSize: 12, color: '#9E9E9E', marginTop: 2 }}>
                  {chapters.length} chapters · {book.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowChapterList(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X color="#757575" size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
              {chapters.map((chapter, index) => {
                const active = index === currentChapterIndex;
                return (
                  <TouchableOpacity
                    key={chapter.id}
                    onPress={() => {
                      setCurrentChapterIndex(index);
                      setShowChapterList(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      backgroundColor: active ? coverColor + '12' : '#FFFFFF',
                      borderBottomWidth: 1,
                      borderColor: '#F5F5F5',
                    }}
                    activeOpacity={0.8}
                  >
                    {/* Chapter number circle */}
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: active ? coverColor : '#F0F0F0',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 14,
                        flexShrink: 0,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '700',
                          color: active ? '#FFFFFF' : '#757575',
                        }}
                      >
                        {chapter.number}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: active ? '700' : '500',
                          color: active ? coverColor : '#212121',
                          lineHeight: 20,
                        }}
                        numberOfLines={2}
                      >
                        {chapter.title}
                      </Text>
                      {chapter.lessons && (
                        <Text style={{ fontSize: 11, color: '#9E9E9E', marginTop: 2 }}>
                          {chapter.lessons.length} lesson{chapter.lessons.length !== 1 ? 's' : ''}
                        </Text>
                      )}
                    </View>

                    {active && (
                      <View
                        style={{
                          backgroundColor: coverColor,
                          paddingHorizontal: 9,
                          paddingVertical: 3,
                          borderRadius: 8,
                          marginLeft: 8,
                        }}
                      >
                        <Text style={{ fontSize: 10, color: '#FFFFFF', fontWeight: '700' }}>
                          Reading
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
