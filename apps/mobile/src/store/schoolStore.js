/**
 * School Management Store
 * Manages all school data locally using AsyncStorage
 * Roles: student | teacher | school_admin | management
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'zihn_school_data';

// ─── Seed Data ────────────────────────────────────────────────────────────────
const seedData = {
  schools: [
    {
      id: 'school_1',
      name: 'Govt. Model High School Lahore',
      city: 'Lahore',
      province: 'Punjab',
      registrationCode: 'GMHSL001',
      principalName: 'Muhammad Arshad',
      phone: '042-35761234',
      studentCount: 0,
      teacherCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'school_2',
      name: 'Beacon House School Karachi',
      city: 'Karachi',
      province: 'Sindh',
      registrationCode: 'BHSK002',
      principalName: 'Sarah Ahmed',
      phone: '021-35678901',
      studentCount: 0,
      teacherCount: 0,
      createdAt: new Date().toISOString(),
    },
  ],
  users: [
    // Management account
    {
      id: 'mgmt_1',
      name: 'Zihn Management',
      email: 'admin@zihn.pk',
      password: 'admin123',
      role: 'management',
      createdAt: new Date().toISOString(),
    },
    // School admin
    {
      id: 'sadmin_1',
      name: 'Muhammad Arshad',
      email: 'principal@gmhsl.edu.pk',
      password: 'school123',
      role: 'school_admin',
      schoolId: 'school_1',
      createdAt: new Date().toISOString(),
    },
    // Teachers
    {
      id: 'teacher_1',
      name: 'Ms. Ayesha Siddiqui',
      email: 'ayesha@gmhsl.edu.pk',
      password: 'teacher123',
      role: 'teacher',
      schoolId: 'school_1',
      subjects: ['Mathematics', 'Physics'],
      classesAssigned: [9, 10],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'teacher_2',
      name: 'Mr. Khalid Mahmood',
      email: 'khalid@gmhsl.edu.pk',
      password: 'teacher123',
      role: 'teacher',
      schoolId: 'school_1',
      subjects: ['English', 'Urdu'],
      classesAssigned: [8, 9],
      createdAt: new Date().toISOString(),
    },
    // Students
    {
      id: 'student_1',
      name: 'Ahmed Ali',
      email: 'ahmed@student.gmhsl.edu.pk',
      password: 'student123',
      role: 'student',
      schoolId: 'school_1',
      classLevel: 9,
      rollNumber: 'IX-001',
      board: 'Punjab',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'student_2',
      name: 'Fatima Khan',
      email: 'fatima@student.gmhsl.edu.pk',
      password: 'student123',
      role: 'student',
      schoolId: 'school_1',
      classLevel: 9,
      rollNumber: 'IX-002',
      board: 'Punjab',
      createdAt: new Date().toISOString(),
    },
  ],
  tasks: [
    {
      id: 'task_1',
      title: 'Chapter 3: Algebra - Exercise 3.1 & 3.2',
      description: 'Complete all exercises from Chapter 3 on Algebra. Show all working steps.',
      subject: 'Mathematics',
      classLevel: 9,
      teacherId: 'teacher_1',
      schoolId: 'school_1',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      type: 'homework',
      priority: 'high',
      submissions: [],
    },
    {
      id: 'task_2',
      title: 'Read Chapter 5: The Old Man and The Sea',
      description: 'Read the assigned chapter and write a 200-word summary.',
      subject: 'English',
      classLevel: 9,
      teacherId: 'teacher_2',
      schoolId: 'school_1',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      type: 'reading',
      priority: 'medium',
      submissions: [],
    },
    {
      id: 'task_3',
      title: 'Physics Lab Report: Simple Pendulum',
      description: 'Submit the lab report for the simple pendulum experiment. Include observations and conclusions.',
      subject: 'Physics',
      classLevel: 9,
      teacherId: 'teacher_1',
      schoolId: 'school_1',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      type: 'lab_report',
      priority: 'high',
      submissions: [],
    },
  ],
  studyMaterials: [
    {
      id: 'mat_1',
      title: 'Algebra Formulas Quick Reference',
      subject: 'Mathematics',
      classLevel: 9,
      teacherId: 'teacher_1',
      schoolId: 'school_1',
      content: `# Algebra Formulas - Class 9

## Basic Identities
- (a + b)² = a² + 2ab + b²
- (a - b)² = a² - 2ab + b²
- (a + b)(a - b) = a² - b²
- (a + b)³ = a³ + 3a²b + 3ab² + b³

## Quadratic Formula
x = (-b ± √(b² - 4ac)) / 2a

Where ax² + bx + c = 0

## Laws of Exponents
- aᵐ × aⁿ = aᵐ⁺ⁿ
- aᵐ ÷ aⁿ = aᵐ⁻ⁿ
- (aᵐ)ⁿ = aᵐⁿ
- a⁰ = 1 (a ≠ 0)

## Practice Tips
1. Always expand brackets first
2. Collect like terms
3. Check your answer by substitution`,
      type: 'notes',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mat_2',
      title: 'English Grammar: Tenses Summary',
      subject: 'English',
      classLevel: 9,
      teacherId: 'teacher_2',
      schoolId: 'school_1',
      content: `# English Tenses - Class 9

## Present Tenses
**Simple Present**: I walk / He walks
- Used for habits, facts, routines

**Present Continuous**: I am walking
- Used for actions happening now

**Present Perfect**: I have walked
- Used for actions with present relevance

## Past Tenses
**Simple Past**: I walked
- Used for completed actions

**Past Continuous**: I was walking
- Used for ongoing past actions

**Past Perfect**: I had walked
- Used for actions before another past action

## Future Tenses
**Simple Future**: I will walk
- Used for predictions, decisions

**Future Continuous**: I will be walking
- Used for ongoing future actions

## Key Words
- Yesterday, last year → Past
- Now, currently → Present
- Tomorrow, next week → Future`,
      type: 'notes',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mat_3',
      title: 'Physics: Newton\'s Laws of Motion',
      subject: 'Physics',
      classLevel: 9,
      teacherId: 'teacher_1',
      schoolId: 'school_1',
      content: `# Newton's Laws of Motion - Class 9

## First Law (Law of Inertia)
"An object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force."

**Examples:**
- A ball rolling on the ground eventually stops due to friction
- Passengers lurch forward when a bus brakes suddenly

## Second Law (F = ma)
"The acceleration of an object is directly proportional to the net force applied and inversely proportional to its mass."

**Formula**: F = ma
- F = Force (in Newtons, N)
- m = Mass (in kg)
- a = Acceleration (in m/s²)

**Example**: A 5kg object with 20N force → a = F/m = 20/5 = 4 m/s²

## Third Law (Action-Reaction)
"For every action, there is an equal and opposite reaction."

**Examples:**
- Rocket propulsion
- Walking (we push ground backward, ground pushes us forward)
- Swimming

## Important Note
Newton's laws apply to objects in inertial (non-accelerating) reference frames.`,
      type: 'notes',
      createdAt: new Date().toISOString(),
    },
  ],
  announcements: [
    {
      id: 'ann_1',
      title: 'Annual Examinations Schedule',
      content: 'Annual examinations will begin from March 15th. Students are advised to start preparation immediately. Detailed schedule will be shared next week.',
      schoolId: 'school_1',
      postedBy: 'sadmin_1',
      postedByName: 'Muhammad Arshad (Principal)',
      createdAt: new Date().toISOString(),
      targetRoles: ['student', 'teacher'],
    },
    {
      id: 'ann_2',
      title: 'Parents-Teachers Meeting',
      content: 'PTM will be held on Saturday, March 2nd from 9 AM to 1 PM. All teachers must be present.',
      schoolId: 'school_1',
      postedBy: 'sadmin_1',
      postedByName: 'Muhammad Arshad (Principal)',
      createdAt: new Date().toISOString(),
      targetRoles: ['teacher'],
    },
  ],
  quizzes: [
    {
      id: 'quiz_1',
      title: 'Algebra Chapter 3 Quiz',
      subject: 'Mathematics',
      classLevel: 9,
      teacherId: 'teacher_1',
      schoolId: 'school_1',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: 'q1',
          text: 'What is the expansion of (a + b)²?',
          options: ['a² + b²', 'a² + 2ab + b²', 'a² - 2ab + b²', '2a + 2b'],
          correct: 1,
        },
        {
          id: 'q2',
          text: 'Solve: x² - 9 = 0',
          options: ['x = 3 only', 'x = -3 only', 'x = ±3', 'x = 9'],
          correct: 2,
        },
        {
          id: 'q3',
          text: 'If a = 3, b = 2, find (a - b)²',
          options: ['1', '5', '25', '1'],
          correct: 0,
        },
        {
          id: 'q4',
          text: 'Which formula gives quadratic roots?',
          options: [
            'x = -b/2a',
            'x = (-b ± √(b²-4ac)) / 2a',
            'x = b² - 4ac',
            'x = a/b',
          ],
          correct: 1,
        },
        {
          id: 'q5',
          text: 'Simplify: a³ × a² =',
          options: ['a⁶', 'a⁵', 'a¹', '2a⁵'],
          correct: 1,
        },
      ],
      attempts: [],
    },
  ],
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useSchoolStore = create((set, get) => ({
  data: null,
  isLoaded: false,

  // Load all data from AsyncStorage
  loadData: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ data: JSON.parse(stored), isLoaded: true });
      } else {
        // First run: seed data
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
        set({ data: seedData, isLoaded: true });
      }
    } catch (e) {
      set({ data: seedData, isLoaded: true });
    }
  },

  // Save entire data to AsyncStorage
  _save: async (newData) => {
    set({ data: newData });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  loginUser: (email, password) => {
    const { data } = get();
    const user = data.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    return user || null;
  },

  registerSchool: async (schoolData) => {
    const { data, _save } = get();
    const id = 'school_' + Date.now();
    const adminId = 'sadmin_' + Date.now();
    const newSchool = {
      id,
      ...schoolData,
      registrationCode: 'SCH' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      studentCount: 0,
      teacherCount: 0,
      createdAt: new Date().toISOString(),
    };
    const adminUser = {
      id: adminId,
      name: schoolData.principalName,
      email: schoolData.adminEmail,
      password: schoolData.adminPassword,
      role: 'school_admin',
      schoolId: id,
      createdAt: new Date().toISOString(),
    };
    const newData = {
      ...data,
      schools: [...data.schools, newSchool],
      users: [...data.users, adminUser],
    };
    await _save(newData);
    return { school: newSchool, admin: adminUser };
  },

  registerStudent: async (studentData) => {
    const { data, _save } = get();
    const id = 'student_' + Date.now();
    const newUser = {
      id,
      ...studentData,
      role: 'student',
      createdAt: new Date().toISOString(),
    };
    const newData = {
      ...data,
      users: [...data.users, newUser],
      schools: data.schools.map((s) =>
        s.id === studentData.schoolId
          ? { ...s, studentCount: (s.studentCount || 0) + 1 }
          : s
      ),
    };
    await _save(newData);
    return newUser;
  },

  registerTeacher: async (teacherData) => {
    const { data, _save } = get();
    const id = 'teacher_' + Date.now();
    const newUser = {
      id,
      ...teacherData,
      role: 'teacher',
      createdAt: new Date().toISOString(),
    };
    const newData = {
      ...data,
      users: [...data.users, newUser],
      schools: data.schools.map((s) =>
        s.id === teacherData.schoolId
          ? { ...s, teacherCount: (s.teacherCount || 0) + 1 }
          : s
      ),
    };
    await _save(newData);
    return newUser;
  },

  // ── Tasks ─────────────────────────────────────────────────────────────────
  createTask: async (taskData) => {
    const { data, _save } = get();
    const id = 'task_' + Date.now();
    const newTask = {
      id,
      ...taskData,
      submissions: [],
      createdAt: new Date().toISOString(),
    };
    const newData = { ...data, tasks: [...data.tasks, newTask] };
    await _save(newData);
    return newTask;
  },

  submitTask: async (taskId, studentId, note) => {
    const { data, _save } = get();
    const newData = {
      ...data,
      tasks: data.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              submissions: [
                ...t.submissions.filter((s) => s.studentId !== studentId),
                {
                  studentId,
                  note,
                  submittedAt: new Date().toISOString(),
                  status: 'submitted',
                  grade: null,
                },
              ],
            }
          : t
      ),
    };
    await _save(newData);
  },

  gradeSubmission: async (taskId, studentId, grade, feedback) => {
    const { data, _save } = get();
    const newData = {
      ...data,
      tasks: data.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              submissions: t.submissions.map((s) =>
                s.studentId === studentId
                  ? { ...s, grade, feedback, status: 'graded', gradedAt: new Date().toISOString() }
                  : s
              ),
            }
          : t
      ),
    };
    await _save(newData);
  },

  deleteTask: async (taskId) => {
    const { data, _save } = get();
    const newData = { ...data, tasks: data.tasks.filter((t) => t.id !== taskId) };
    await _save(newData);
  },

  // ── Study Materials ───────────────────────────────────────────────────────
  createMaterial: async (materialData) => {
    const { data, _save } = get();
    const id = 'mat_' + Date.now();
    const newMat = { id, ...materialData, createdAt: new Date().toISOString() };
    const newData = { ...data, studyMaterials: [...data.studyMaterials, newMat] };
    await _save(newData);
    return newMat;
  },

  deleteMaterial: async (matId) => {
    const { data, _save } = get();
    const newData = {
      ...data,
      studyMaterials: data.studyMaterials.filter((m) => m.id !== matId),
    };
    await _save(newData);
  },

  // ── Quizzes ───────────────────────────────────────────────────────────────
  createQuiz: async (quizData) => {
    const { data, _save } = get();
    const id = 'quiz_' + Date.now();
    const newQuiz = { id, ...quizData, attempts: [], createdAt: new Date().toISOString() };
    const newData = { ...data, quizzes: [...data.quizzes, newQuiz] };
    await _save(newData);
    return newQuiz;
  },

  submitQuizAttempt: async (quizId, studentId, answers, score) => {
    const { data, _save } = get();
    const newData = {
      ...data,
      quizzes: data.quizzes.map((q) =>
        q.id === quizId
          ? {
              ...q,
              attempts: [
                ...q.attempts.filter((a) => a.studentId !== studentId),
                {
                  studentId,
                  answers,
                  score,
                  submittedAt: new Date().toISOString(),
                },
              ],
            }
          : q
      ),
    };
    await _save(newData);
  },

  // ── Announcements ─────────────────────────────────────────────────────────
  createAnnouncement: async (annData) => {
    const { data, _save } = get();
    const id = 'ann_' + Date.now();
    const newAnn = { id, ...annData, createdAt: new Date().toISOString() };
    const newData = { ...data, announcements: [...data.announcements, newAnn] };
    await _save(newData);
    return newAnn;
  },

  // ── Selectors ─────────────────────────────────────────────────────────────
  getSchool: (schoolId) => get().data?.schools.find((s) => s.id === schoolId),
  getUser: (userId) => get().data?.users.find((u) => u.id === userId),
  getSchoolTeachers: (schoolId) =>
    get().data?.users.filter((u) => u.role === 'teacher' && u.schoolId === schoolId) || [],
  getSchoolStudents: (schoolId) =>
    get().data?.users.filter((u) => u.role === 'student' && u.schoolId === schoolId) || [],
  getTeacherTasks: (teacherId) =>
    get().data?.tasks.filter((t) => t.teacherId === teacherId) || [],
  getStudentTasks: (student) =>
    get().data?.tasks.filter(
      (t) => t.schoolId === student.schoolId && t.classLevel === student.classLevel
    ) || [],
  getSchoolTasks: (schoolId) =>
    get().data?.tasks.filter((t) => t.schoolId === schoolId) || [],
  getTeacherMaterials: (teacherId) =>
    get().data?.studyMaterials.filter((m) => m.teacherId === teacherId) || [],
  getStudentMaterials: (student) =>
    get().data?.studyMaterials.filter(
      (m) => m.schoolId === student.schoolId && m.classLevel === student.classLevel
    ) || [],
  getSchoolQuizzes: (schoolId, classLevel) =>
    get().data?.quizzes.filter(
      (q) => q.schoolId === schoolId && (!classLevel || q.classLevel === classLevel)
    ) || [],
  getSchoolAnnouncements: (schoolId) =>
    get().data?.announcements.filter((a) => a.schoolId === schoolId) || [],
  getAllSchools: () => get().data?.schools || [],
}));
