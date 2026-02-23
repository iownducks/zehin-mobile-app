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
    // Parent
    {
      id: 'parent_1',
      name: 'Mr. Ali Khan',
      email: 'parent@gmhsl.edu.pk',
      password: 'parent123',
      role: 'parent',
      schoolId: 'school_1',
      childId: 'student_1',
      phone: '0300-1234567',
      createdAt: new Date().toISOString(),
    },
  ],
  fees: [
    {
      id: 'fee_1',
      studentId: 'student_1',
      schoolId: 'school_1',
      title: 'Monthly Fee - February 2026',
      amount: 3500,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      month: 'February 2026',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'fee_2',
      studentId: 'student_1',
      schoolId: 'school_1',
      title: 'Monthly Fee - January 2026',
      amount: 3500,
      dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'paid',
      paidOn: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
      month: 'January 2026',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'fee_3',
      studentId: 'student_1',
      schoolId: 'school_1',
      title: 'Annual Fund',
      amount: 5000,
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'overdue',
      month: 'Annual 2026',
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
  books: [
    {
      id: 'book_1',
      title: 'Mathematics Class 9',
      subject: 'Mathematics',
      classLevel: 9,
      board: 'Punjab',
      coverColor: '#1565C0',
      description: 'Punjab Textbook Board Mathematics for Class 9. Covers algebra, geometry, trigonometry and statistics.',
      chapters: [
        { id: 'book_1_ch1', number: 1, title: 'Matrices and Determinants', pages: 45 },
        { id: 'book_1_ch2', number: 2, title: 'Real and Complex Numbers', pages: 38 },
        { id: 'book_1_ch3', number: 3, title: 'Logarithms', pages: 30 },
        { id: 'book_1_ch4', number: 4, title: 'Algebraic Expressions and Algebraic Formulas', pages: 42 },
        { id: 'book_1_ch5', number: 5, title: 'Factorisation', pages: 35 },
        { id: 'book_1_ch6', number: 6, title: 'Algebraic Manipulation', pages: 28 },
        { id: 'book_1_ch7', number: 7, title: 'Linear Equations and Inequalities', pages: 33 },
        { id: 'book_1_ch8', number: 8, title: 'Linear Graphs and Their Applications', pages: 40 },
        { id: 'book_1_ch9', number: 9, title: 'Introduction to Coordinate Geometry', pages: 36 },
        { id: 'book_1_ch10', number: 10, title: 'Congruent Triangles', pages: 29 },
      ],
    },
    {
      id: 'book_2',
      title: 'Mathematics Class 10',
      subject: 'Mathematics',
      classLevel: 10,
      board: 'Punjab',
      coverColor: '#0D47A1',
      description: 'Punjab Textbook Board Mathematics for Class 10. Advanced algebra, geometry and trigonometry.',
      chapters: [
        { id: 'book_2_ch1', number: 1, title: 'Quadratic Equations', pages: 48 },
        { id: 'book_2_ch2', number: 2, title: 'Theory of Quadratic Equations', pages: 40 },
        { id: 'book_2_ch3', number: 3, title: 'Variations', pages: 32 },
        { id: 'book_2_ch4', number: 4, title: 'Partial Fractions', pages: 35 },
        { id: 'book_2_ch5', number: 5, title: 'Sets and Functions', pages: 44 },
        { id: 'book_2_ch6', number: 6, title: 'Basic Statistics', pages: 38 },
        { id: 'book_2_ch7', number: 7, title: 'Introduction to Trigonometry', pages: 50 },
        { id: 'book_2_ch8', number: 8, title: 'Projection of a Side of a Triangle', pages: 28 },
      ],
    },
    {
      id: 'book_3',
      title: 'English Class 9',
      subject: 'English',
      classLevel: 9,
      board: 'Punjab',
      coverColor: '#2E7D32',
      description: 'Punjab Textbook Board English for Class 9. Prose, poetry, grammar and writing skills.',
      chapters: [
        { id: 'book_3_ch1', number: 1, title: 'Unit 1: Books', pages: 22 },
        { id: 'book_3_ch2', number: 2, title: 'Unit 2: Honesty', pages: 24 },
        { id: 'book_3_ch3', number: 3, title: 'Unit 3: Allama Iqbal', pages: 20 },
        { id: 'book_3_ch4', number: 4, title: 'Unit 4: Television', pages: 26 },
        { id: 'book_3_ch5', number: 5, title: 'Unit 5: My Hobby', pages: 22 },
        { id: 'book_3_ch6', number: 6, title: 'Unit 6: The Jewel of the World', pages: 28 },
        { id: 'book_3_ch7', number: 7, title: 'Unit 7: The Reward of Diligence', pages: 24 },
        { id: 'book_3_ch8', number: 8, title: 'Unit 8: Road Safety', pages: 20 },
        { id: 'book_3_ch9', number: 9, title: 'Grammar: Tenses and Voice', pages: 32 },
        { id: 'book_3_ch10', number: 10, title: 'Writing Skills: Essays and Letters', pages: 30 },
      ],
    },
    {
      id: 'book_4',
      title: 'English Class 10',
      subject: 'English',
      classLevel: 10,
      board: 'Punjab',
      coverColor: '#1B5E20',
      description: 'Punjab Textbook Board English for Class 10. Advanced prose, poetry and composition.',
      chapters: [
        { id: 'book_4_ch1', number: 1, title: 'Unit 1: The Saviour of Mankind', pages: 26 },
        { id: 'book_4_ch2', number: 2, title: 'Unit 2: Courtesy', pages: 22 },
        { id: 'book_4_ch3', number: 3, title: 'Unit 3: The Man Who Was a Hospital', pages: 24 },
        { id: 'book_4_ch4', number: 4, title: 'Unit 4: My Financial Career', pages: 20 },
        { id: 'book_4_ch5', number: 5, title: 'Unit 5: China\'s Way to Progress', pages: 28 },
        { id: 'book_4_ch6', number: 6, title: 'Unit 6: The Quaid\'s Vision', pages: 24 },
        { id: 'book_4_ch7', number: 7, title: 'Unit 7: I Have a Dream', pages: 26 },
        { id: 'book_4_ch8', number: 8, title: 'Grammar: Advanced Structures', pages: 35 },
      ],
    },
    {
      id: 'book_5',
      title: 'Urdu Class 9',
      subject: 'Urdu',
      classLevel: 9,
      board: 'Punjab',
      coverColor: '#6A1B9A',
      description: 'Punjab Textbook Board Urdu for Class 9. Classical and modern Urdu prose and poetry.',
      chapters: [
        { id: 'book_5_ch1', number: 1, title: 'نظم: لب پہ آتی ہے دعا', pages: 18 },
        { id: 'book_5_ch2', number: 2, title: 'سبق: حضرت محمد ﷺ', pages: 22 },
        { id: 'book_5_ch3', number: 3, title: 'نظم: ہمالہ', pages: 16 },
        { id: 'book_5_ch4', number: 4, title: 'سبق: میرا وطن', pages: 20 },
        { id: 'book_5_ch5', number: 5, title: 'غزل: میر تقی میر', pages: 18 },
        { id: 'book_5_ch6', number: 6, title: 'سبق: محنت کی عظمت', pages: 22 },
        { id: 'book_5_ch7', number: 7, title: 'قواعد: اسم، فعل، صفت', pages: 30 },
        { id: 'book_5_ch8', number: 8, title: 'مضمون نویسی', pages: 28 },
      ],
    },
    {
      id: 'book_6',
      title: 'Urdu Class 8',
      subject: 'Urdu',
      classLevel: 8,
      board: 'Punjab',
      coverColor: '#4A148C',
      description: 'Punjab Textbook Board Urdu for Class 8. Urdu prose, poetry and grammar fundamentals.',
      chapters: [
        { id: 'book_6_ch1', number: 1, title: 'سبق: قائداعظم کا پیغام', pages: 20 },
        { id: 'book_6_ch2', number: 2, title: 'نظم: پاکستان کا مطلب کیا', pages: 16 },
        { id: 'book_6_ch3', number: 3, title: 'سبق: خدمت خلق', pages: 18 },
        { id: 'book_6_ch4', number: 4, title: 'قصیدہ: مدح', pages: 20 },
        { id: 'book_6_ch5', number: 5, title: 'قواعد: جملے کی اقسام', pages: 28 },
        { id: 'book_6_ch6', number: 6, title: 'خط نویسی اور درخواست', pages: 26 },
      ],
    },
    {
      id: 'book_7',
      title: 'Science Class 7',
      subject: 'Science',
      classLevel: 7,
      board: 'Punjab',
      coverColor: '#00695C',
      description: 'Punjab Textbook Board General Science for Class 7. Biology, chemistry and physics concepts.',
      chapters: [
        { id: 'book_7_ch1', number: 1, title: 'Properties of Matter', pages: 30 },
        { id: 'book_7_ch2', number: 2, title: 'Atoms and Molecules', pages: 28 },
        { id: 'book_7_ch3', number: 3, title: 'The Cell', pages: 32 },
        { id: 'book_7_ch4', number: 4, title: 'Photosynthesis', pages: 26 },
        { id: 'book_7_ch5', number: 5, title: 'Human Digestive System', pages: 34 },
        { id: 'book_7_ch6', number: 6, title: 'Electricity and Magnetism', pages: 38 },
        { id: 'book_7_ch7', number: 7, title: 'Earth and Space', pages: 30 },
        { id: 'book_7_ch8', number: 8, title: 'Environment and Ecology', pages: 28 },
      ],
    },
    {
      id: 'book_8',
      title: 'Science Class 8',
      subject: 'Science',
      classLevel: 8,
      board: 'Punjab',
      coverColor: '#004D40',
      description: 'Punjab Textbook Board General Science for Class 8. Advanced concepts in natural sciences.',
      chapters: [
        { id: 'book_8_ch1', number: 1, title: 'Chemical Reactions', pages: 36 },
        { id: 'book_8_ch2', number: 2, title: 'Acids, Bases and Salts', pages: 32 },
        { id: 'book_8_ch3', number: 3, title: 'Reproduction in Plants', pages: 28 },
        { id: 'book_8_ch4', number: 4, title: 'Reproduction in Animals', pages: 30 },
        { id: 'book_8_ch5', number: 5, title: 'Genetics and Heredity', pages: 34 },
        { id: 'book_8_ch6', number: 6, title: 'Force and Motion', pages: 38 },
        { id: 'book_8_ch7', number: 7, title: 'Sound', pages: 26 },
        { id: 'book_8_ch8', number: 8, title: 'Light', pages: 30 },
      ],
    },
    {
      id: 'book_9',
      title: 'Islamic Studies Class 9',
      subject: 'Islamic Studies',
      classLevel: 9,
      board: 'Federal',
      coverColor: '#E65100',
      description: 'Federal Board Islamic Studies for Class 9. Quran, Hadith, Fiqh and Islamic history.',
      chapters: [
        { id: 'book_9_ch1', number: 1, title: 'Belief in Allah (Tawhid)', pages: 30 },
        { id: 'book_9_ch2', number: 2, title: 'Prophethood (Risalat)', pages: 28 },
        { id: 'book_9_ch3', number: 3, title: 'The Holy Quran', pages: 35 },
        { id: 'book_9_ch4', number: 4, title: 'Hadith and Sunnah', pages: 30 },
        { id: 'book_9_ch5', number: 5, title: 'Prayer and Worship (Ibadat)', pages: 32 },
        { id: 'book_9_ch6', number: 6, title: 'Islamic Ethics and Morality', pages: 28 },
        { id: 'book_9_ch7', number: 7, title: 'The Rightly Guided Caliphs', pages: 40 },
        { id: 'book_9_ch8', number: 8, title: 'Islamic Civilization', pages: 36 },
      ],
    },
    {
      id: 'book_10',
      title: 'Islamic Studies Class 6',
      subject: 'Islamic Studies',
      classLevel: 6,
      board: 'Punjab',
      coverColor: '#BF360C',
      description: 'Punjab Textbook Board Islamic Studies for Class 6. Basic Islamic beliefs and practices.',
      chapters: [
        { id: 'book_10_ch1', number: 1, title: 'Surah Al-Fatiha', pages: 20 },
        { id: 'book_10_ch2', number: 2, title: 'Pillars of Islam', pages: 24 },
        { id: 'book_10_ch3', number: 3, title: 'Pillars of Faith (Iman)', pages: 22 },
        { id: 'book_10_ch4', number: 4, title: 'Prophet Muhammad\'s (PBUH) Life', pages: 30 },
        { id: 'book_10_ch5', number: 5, title: 'Islamic Manners and Etiquette', pages: 26 },
        { id: 'book_10_ch6', number: 6, title: 'Stories of the Prophets', pages: 32 },
      ],
    },
    {
      id: 'book_11',
      title: 'Pakistan Studies Class 10',
      subject: 'Pakistan Studies',
      classLevel: 10,
      board: 'Punjab',
      coverColor: '#33691E',
      description: 'Punjab Textbook Board Pakistan Studies for Class 10. History, geography and civics of Pakistan.',
      chapters: [
        { id: 'book_11_ch1', number: 1, title: 'Historical Background of Pakistan', pages: 40 },
        { id: 'book_11_ch2', number: 2, title: 'The Pakistan Movement', pages: 38 },
        { id: 'book_11_ch3', number: 3, title: 'Geography of Pakistan', pages: 44 },
        { id: 'book_11_ch4', number: 4, title: 'Natural Resources of Pakistan', pages: 36 },
        { id: 'book_11_ch5', number: 5, title: 'Agriculture and Economy', pages: 34 },
        { id: 'book_11_ch6', number: 6, title: 'Governance and Constitution', pages: 38 },
        { id: 'book_11_ch7', number: 7, title: 'Foreign Policy of Pakistan', pages: 30 },
      ],
    },
    {
      id: 'book_12',
      title: 'Pakistan Studies Class 9',
      subject: 'Pakistan Studies',
      classLevel: 9,
      board: 'Federal',
      coverColor: '#558B2F',
      description: 'Federal Board Pakistan Studies for Class 9. Culture, history and civic education.',
      chapters: [
        { id: 'book_12_ch1', number: 1, title: 'Ideology of Pakistan', pages: 32 },
        { id: 'book_12_ch2', number: 2, title: 'Quaid-e-Azam Muhammad Ali Jinnah', pages: 36 },
        { id: 'book_12_ch3', number: 3, title: 'Allama Muhammad Iqbal', pages: 30 },
        { id: 'book_12_ch4', number: 4, title: 'Culture and Heritage of Pakistan', pages: 34 },
        { id: 'book_12_ch5', number: 5, title: 'Major Industries of Pakistan', pages: 30 },
        { id: 'book_12_ch6', number: 6, title: 'Problems and Challenges', pages: 28 },
      ],
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
        const parsed = JSON.parse(stored);
        // Migrate: ensure fees array exists
        if (!parsed.fees) parsed.fees = seedData.fees;
        // Migrate: ensure books array exists
        if (!parsed.books) parsed.books = seedData.books;
        set({ data: parsed, isLoaded: true });
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

  submitTask: async (taskId, studentId, note, attachments = []) => {
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
                  attachments,
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

  // ── Parent ────────────────────────────────────────────────────────────────
  registerParent: async (parentData) => {
    const { data, _save } = get();
    const id = 'parent_' + Date.now();
    const newUser = {
      id,
      ...parentData,
      role: 'parent',
      createdAt: new Date().toISOString(),
    };
    const newData = { ...data, users: [...data.users, newUser] };
    await _save(newData);
    return newUser;
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
  // Parent-specific: only announcements targeting parents or all
  getParentAnnouncements: (schoolId) =>
    get().data?.announcements.filter(
      (a) => a.schoolId === schoolId &&
        (!a.targetRoles?.length || a.targetRoles.includes('parent'))
    ) || [],
  getChildFees: (studentId) =>
    get().data?.fees?.filter((f) => f.studentId === studentId) || [],
  // Teachers who teach the child's class
  getChildTeachers: (schoolId, classLevel) =>
    get().data?.users.filter(
      (u) => u.role === 'teacher' && u.schoolId === schoolId &&
        u.classesAssigned?.includes(classLevel)
    ) || [],
  getAllSchools: () => get().data?.schools || [],
  getBooks: (filters = {}) => {
    const books = get().data?.books || [];
    return books.filter((book) => {
      if (filters.classLevel && book.classLevel !== filters.classLevel) return false;
      if (filters.board && filters.board !== 'All' && book.board !== filters.board) return false;
      if (filters.subject && filters.subject !== 'All' && book.subject !== filters.subject) return false;
      return true;
    });
  },
  getBook: (bookId) => get().data?.books?.find((b) => b.id === bookId) || null,
}));
