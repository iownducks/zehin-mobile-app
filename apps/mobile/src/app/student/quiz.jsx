import { useUser } from '@/context/UserContext';
import { useSchoolStore } from '@/store/schoolStore';
import { CheckCircle, ChevronLeft, HelpCircle, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StudentQuiz() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { getSchoolQuizzes, submitQuizAttempt } = useSchoolStore();

  const quizzes = getSchoolQuizzes(user?.schoolId, user?.classLevel);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const handleAnswer = (questionId, optionIdx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    let correct = 0;
    activeQuiz.questions.forEach((q) => {
      if (answers[q.id] === q.correct) correct++;
    });
    const finalScore = Math.round((correct / activeQuiz.questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
    await submitQuizAttempt(activeQuiz.id, user.id, answers, finalScore);
  };

  // Results screen
  if (submitted && activeQuiz) {
    const correct = activeQuiz.questions.filter((q) => answers[q.id] === q.correct).length;
    return (
      <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => setActiveQuiz(null)}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' }}>Quiz Results</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
          {/* Score Card */}
          <View style={{ backgroundColor: score >= 70 ? '#E8F5E9' : score >= 50 ? '#FFF9C4' : '#FFEBEE', borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 64, fontWeight: 'bold', color: score >= 70 ? '#2E7D32' : score >= 50 ? '#F57F17' : '#C62828' }}>
              {score}%
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#424242', marginTop: 4 }}>
              {correct}/{activeQuiz.questions.length} Correct
            </Text>
            <Text style={{ fontSize: 15, color: '#757575', marginTop: 8 }}>
              {score >= 80 ? 'Excellent! Keep it up!' : score >= 60 ? 'Good job! Review the wrong answers.' : 'Keep practicing! You can do better.'}
            </Text>
          </View>

          {/* Answer Review */}
          <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1A237E', marginBottom: 14 }}>Answer Review</Text>
          {activeQuiz.questions.map((q, idx) => {
            const userAns = answers[q.id];
            const isCorrect = userAns === q.correct;
            return (
              <View key={q.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: isCorrect ? '#4CAF50' : '#F44336' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                  {isCorrect ? <CheckCircle size={18} color="#4CAF50" /> : <XCircle size={18} color="#F44336" />}
                  <Text style={{ flex: 1, fontWeight: '600', color: '#1A237E', marginLeft: 8, fontSize: 14 }}>
                    Q{idx + 1}. {q.text}
                  </Text>
                </View>
                {q.options.map((opt, oi) => (
                  <View key={oi} style={{
                    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginTop: 4,
                    backgroundColor: oi === q.correct ? '#E8F5E9' : oi === userAns && !isCorrect ? '#FFEBEE' : 'transparent',
                  }}>
                    <Text style={{
                      fontSize: 13,
                      color: oi === q.correct ? '#2E7D32' : oi === userAns && !isCorrect ? '#C62828' : '#424242',
                      fontWeight: oi === q.correct ? '600' : '400',
                    }}>
                      {oi === q.correct ? '✓ ' : oi === userAns && !isCorrect ? '✗ ' : '   '}{opt}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}

          <TouchableOpacity onPress={() => setActiveQuiz(null)} style={{ backgroundColor: '#1A237E', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 }}>
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15 }}>Back to Quizzes</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Active quiz
  if (activeQuiz) {
    const q = activeQuiz.questions[currentQuestion];
    const total = activeQuiz.questions.length;
    const progress = (currentQuestion + 1) / total;
    const answered = Object.keys(answers).length;

    return (
      <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <TouchableOpacity onPress={() => setActiveQuiz(null)} style={{ marginRight: 12 }}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', color: '#FFFFFF', fontSize: 16 }} numberOfLines={1}>{activeQuiz.title}</Text>
              <Text style={{ color: '#9FA8DA', fontSize: 12 }}>Question {currentQuestion + 1} of {total}</Text>
            </View>
          </View>
          <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: '#FFD700', borderRadius: 3 }} />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1A237E', lineHeight: 24 }}>{q.text}</Text>
          </View>

          {q.options.map((opt, idx) => {
            const isSelected = answers[q.id] === idx;
            return (
              <TouchableOpacity key={idx} onPress={() => handleAnswer(q.id, idx)}
                style={{
                  backgroundColor: isSelected ? '#1A237E' : '#FFFFFF',
                  borderRadius: 14, padding: 16, marginBottom: 10,
                  borderWidth: 2, borderColor: isSelected ? '#1A237E' : '#E0E0E0',
                  flexDirection: 'row', alignItems: 'center',
                }}>
                <View style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: isSelected ? '#FFD700' : '#F5F5F5',
                  alignItems: 'center', justifyContent: 'center', marginRight: 12,
                }}>
                  <Text style={{ fontWeight: 'bold', color: isSelected ? '#1A237E' : '#9E9E9E', fontSize: 13 }}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={{ flex: 1, color: isSelected ? '#FFFFFF' : '#424242', fontSize: 14, fontWeight: isSelected ? '600' : '400' }}>{opt}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Navigation */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            {currentQuestion > 0 && (
              <TouchableOpacity onPress={() => setCurrentQuestion((c) => c - 1)}
                style={{ flex: 1, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, alignItems: 'center' }}>
                <Text style={{ color: '#424242', fontWeight: '600' }}>← Previous</Text>
              </TouchableOpacity>
            )}
            {currentQuestion < total - 1 ? (
              <TouchableOpacity onPress={() => setCurrentQuestion((c) => c + 1)}
                style={{ flex: 2, backgroundColor: '#1A237E', borderRadius: 12, padding: 14, alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Next →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSubmitQuiz}
                disabled={answered < total}
                style={{ flex: 2, backgroundColor: answered < total ? '#9FA8DA' : '#2E7D32', borderRadius: 12, padding: 14, alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                  {answered < total ? `Answer All (${answered}/${total})` : 'Submit Quiz'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Question dots */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
            {activeQuiz.questions.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setCurrentQuestion(i)}>
                <View style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: i === currentQuestion ? '#1A237E' : answers[activeQuiz.questions[i].id] !== undefined ? '#FFD700' : '#E0E0E0',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: i === currentQuestion ? '#FFF' : '#424242' }}>{i + 1}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Quiz list
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ backgroundColor: '#1A237E', paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 }}>Practice Quizzes</Text>
        <Text style={{ color: '#9FA8DA', fontSize: 13 }}>{quizzes.length} quizzes available</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {quizzes.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <HelpCircle size={48} color="#E0E0E0" />
            <Text style={{ color: '#9E9E9E', fontSize: 15, marginTop: 16 }}>No quizzes yet</Text>
            <Text style={{ color: '#BDBDBD', fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
              Your teachers will add quizzes here
            </Text>
          </View>
        ) : (
          quizzes.map((quiz) => {
            const myAttempt = quiz.attempts?.find((a) => a.studentId === user?.id);
            const daysLeft = Math.ceil((new Date(quiz.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            return (
              <View key={quiz.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: '#1A237E', fontSize: 15 }}>{quiz.title}</Text>
                    <Text style={{ color: '#757575', fontSize: 12, marginTop: 3 }}>
                      {quiz.subject} • {quiz.questions?.length} questions
                    </Text>
                  </View>
                  {myAttempt ? (
                    <View style={{ backgroundColor: myAttempt.score >= 70 ? '#E8F5E9' : '#FFF9C4', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: myAttempt.score >= 70 ? '#2E7D32' : '#F57F17' }}>{myAttempt.score}%</Text>
                      <Text style={{ fontSize: 10, color: '#9E9E9E' }}>scored</Text>
                    </View>
                  ) : null}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Text style={{ fontSize: 12, color: daysLeft >= 0 ? '#F57F17' : '#C62828' }}>
                    Due: {new Date(quiz.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => startQuiz(quiz)}
                  style={{ backgroundColor: myAttempt ? '#F5F5F5' : '#1A237E', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: myAttempt ? 1 : 0, borderColor: '#E0E0E0' }}
                >
                  <Text style={{ color: myAttempt ? '#424242' : '#FFF', fontWeight: 'bold', fontSize: 14 }}>
                    {myAttempt ? 'Retake Quiz' : 'Start Quiz'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
