import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        class_level INTEGER NOT NULL,
        board VARCHAR(100) DEFAULT 'Punjab',
        cover_color VARCHAR(20) DEFAULT '#1565C0',
        description TEXT,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chapters (
        id SERIAL PRIMARY KEY,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        summary TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
        number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'text',
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer INTEGER NOT NULL,
        explanation TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS reading_progress (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(100) NOT NULL,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        chapter_id INTEGER REFERENCES chapters(id),
        lesson_id INTEGER REFERENCES lessons(id),
        progress_percent INTEGER DEFAULT 0,
        last_read_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(student_id, book_id)
      )
    `;

    // Check if seed data already exists
    const existing = await sql`SELECT COUNT(*) as count FROM books`;
    if (parseInt(existing[0].count) > 0) {
      return Response.json({ success: true, message: "Tables created and seeded" });
    }

    // Seed Book 1: Mathematics Class 9
    const [mathBook] = await sql`
      INSERT INTO books (title, subject, class_level, board, cover_color, description, is_published)
      VALUES (
        'Mathematics Class 9',
        'Mathematics',
        9,
        'Punjab',
        '#1565C0',
        'A comprehensive mathematics textbook for Class 9 students following the Punjab curriculum. Covers algebra, geometry, and number systems.',
        true
      )
      RETURNING id
    `;

    // Math Chapter 1
    const [mathCh1] = await sql`
      INSERT INTO chapters (book_id, number, title, summary)
      VALUES (
        ${mathBook.id},
        1,
        'Matrices and Determinants',
        'This chapter introduces the concept of matrices, their types, operations, and determinants. Students will learn to perform matrix arithmetic and evaluate determinants.'
      )
      RETURNING id
    `;

    await sql`
      INSERT INTO lessons (chapter_id, number, title, type, content)
      VALUES (
        ${mathCh1.id},
        1,
        'Introduction to Matrices',
        'text',
        'A matrix is a rectangular array of numbers, symbols, or expressions arranged in rows and columns. The individual items in a matrix are called its elements or entries. A matrix with m rows and n columns is called an m × n matrix or m-by-n matrix, where m and n are called the matrix dimensions.

For example, a 2×3 matrix looks like this:
| 1  2  3 |
| 4  5  6 |

This matrix has 2 rows and 3 columns. The element in row i and column j is denoted as a_ij. So a_12 = 2 (first row, second column).

Types of Matrices:
1. Row Matrix: A matrix with only one row, e.g., [1, 2, 3]
2. Column Matrix: A matrix with only one column.
3. Square Matrix: A matrix where the number of rows equals the number of columns.
4. Zero Matrix: All elements are zero.
5. Identity Matrix: A square matrix with 1s on the main diagonal and 0s elsewhere.

Matrices are fundamental tools in mathematics and are widely used in physics, computer graphics, economics, and engineering.'
      )
    `;

    await sql`
      INSERT INTO lessons (chapter_id, number, title, type, content)
      VALUES (
        ${mathCh1.id},
        2,
        'Matrix Operations',
        'text',
        'Matrix operations include addition, subtraction, scalar multiplication, and matrix multiplication. Understanding these operations is essential for solving systems of equations and transformations.

Addition and Subtraction:
Two matrices can be added or subtracted only if they have the same dimensions. The operation is performed element-by-element. If A and B are both m×n matrices, then (A + B)_ij = a_ij + b_ij.

Example:
| 1  2 |   | 5  6 |   | 6   8 |
| 3  4 | + | 7  8 | = | 10 12 |

Scalar Multiplication:
When a matrix is multiplied by a scalar (a single number), every element of the matrix is multiplied by that scalar. If k is a scalar and A is a matrix, then (kA)_ij = k · a_ij.

Matrix Multiplication:
Two matrices A (m×n) and B (n×p) can be multiplied to produce a matrix C (m×p). The element c_ij is computed as the dot product of the i-th row of A and the j-th column of B:
c_ij = Σ a_ik · b_kj

Note: Matrix multiplication is NOT commutative, meaning AB ≠ BA in general.'
      )
    `;

    // Math Chapter 2
    const [mathCh2] = await sql`
      INSERT INTO chapters (book_id, number, title, summary)
      VALUES (
        ${mathBook.id},
        2,
        'Real and Complex Numbers',
        'This chapter explores the number system including natural numbers, integers, rational and irrational numbers, real numbers, and an introduction to complex numbers.'
      )
      RETURNING id
    `;

    await sql`
      INSERT INTO lessons (chapter_id, number, title, type, content)
      VALUES (
        ${mathCh2.id},
        1,
        'The Real Number System',
        'text',
        'The real number system is a complete ordered field that includes all rational and irrational numbers. Understanding the structure of real numbers is foundational to all of mathematics.

The hierarchy of numbers:
1. Natural Numbers (ℕ): The counting numbers {1, 2, 3, 4, ...}. These are the most basic numbers used for counting objects.

2. Whole Numbers (W): Natural numbers plus zero {0, 1, 2, 3, ...}.

3. Integers (ℤ): Whole numbers and their negatives {..., -3, -2, -1, 0, 1, 2, 3, ...}.

4. Rational Numbers (ℚ): Numbers that can be expressed as a fraction p/q where p and q are integers and q ≠ 0. Examples: 1/2, -3/4, 0.75, 2 (= 2/1). Their decimal expansions either terminate (e.g., 0.25) or repeat (e.g., 0.333...).

5. Irrational Numbers: Numbers that cannot be expressed as a fraction of two integers. Their decimal expansions are non-terminating and non-repeating. Examples: √2 ≈ 1.41421..., π ≈ 3.14159..., e ≈ 2.71828...

6. Real Numbers (ℝ): The union of all rational and irrational numbers. Every point on the number line corresponds to exactly one real number.

Properties of Real Numbers:
- Closure: For any two real numbers a and b, a + b and a × b are also real numbers.
- Commutativity: a + b = b + a and a × b = b × a
- Associativity: (a + b) + c = a + (b + c) and (a × b) × c = a × (b × c)
- Distributivity: a × (b + c) = a × b + a × c'
      )
    `;

    await sql`
      INSERT INTO lessons (chapter_id, number, title, type, content)
      VALUES (
        ${mathCh2.id},
        2,
        'Introduction to Complex Numbers',
        'text',
        'Complex numbers extend the real number system by introducing the imaginary unit i, defined as the square root of -1. This allows us to solve equations that have no real solutions, such as x² + 1 = 0.

Definition:
A complex number z is written in the form z = a + bi, where:
- a is the real part, denoted Re(z)
- b is the imaginary part, denoted Im(z)
- i is the imaginary unit where i² = -1

Examples of complex numbers: 3 + 4i, -2 + 0i (= -2), 0 + 5i (= 5i), 0 + 0i (= 0)

Operations with Complex Numbers:

Addition: (a + bi) + (c + di) = (a + c) + (b + d)i
Example: (3 + 2i) + (1 + 4i) = 4 + 6i

Subtraction: (a + bi) - (c + di) = (a - c) + (b - d)i
Example: (5 + 3i) - (2 + i) = 3 + 2i

Multiplication: (a + bi)(c + di) = (ac - bd) + (ad + bc)i
Example: (2 + 3i)(1 + 2i) = (2 - 6) + (4 + 3)i = -4 + 7i

Complex Conjugate:
The conjugate of z = a + bi is z̄ = a - bi. Multiplying a complex number by its conjugate gives a real number:
z · z̄ = (a + bi)(a - bi) = a² + b²

The Argand Plane:
Complex numbers can be represented geometrically on the Argand plane (complex plane), where the x-axis represents the real part and the y-axis represents the imaginary part.'
      )
    `;

    // Seed Book 2: English Class 9
    const [engBook] = await sql`
      INSERT INTO books (title, subject, class_level, board, cover_color, description, is_published)
      VALUES (
        'English Class 9',
        'English',
        9,
        'Punjab',
        '#2E7D32',
        'An English language and literature textbook for Class 9 students. Covers prose, poetry, grammar, and composition skills aligned with the Punjab Board curriculum.',
        true
      )
      RETURNING id
    `;

    // English Chapter 1
    const [engCh1] = await sql`
      INSERT INTO chapters (book_id, number, title, summary)
      VALUES (
        ${engBook.id},
        1,
        'The Doer of Good to Others',
        'A moral story about the importance of doing good deeds and helping others. The chapter explores themes of kindness, selflessness, and the rewards of virtuous actions.'
      )
      RETURNING id
    `;

    await sql`
      INSERT INTO lessons (chapter_id, number, title, type, content)
      VALUES (
        ${engCh1.id},
        1,
        'The Doer of Good to Others - Part I',
        'text',
        'Once upon a time, there lived a kind and generous man in a small village. He was known throughout the region for his selfless acts of charity and his willingness to help anyone in need, regardless of their status or background. The villagers called him "the doer of good to others," a title he carried with great humility and sincerity.

One harsh winter, a severe famine struck the land. Crops had failed, rivers had frozen, and the people were suffering greatly. Many families had nothing to eat, and the weak and elderly were particularly vulnerable. While most wealthy landowners hoarded their resources, this kind man opened his barns and distributed grain to all who came to his door, asking nothing in return.

A traveler passing through the village was astonished by what he saw. He approached the kind man and asked, "Why do you give away everything you have? Do you not fear poverty for yourself?" The man smiled gently and replied, "What I give away, I keep forever. What I hold for myself alone, I lose in the end. True wealth is not measured in grain or gold, but in the lives we touch and the hearts we warm."

Word of his generosity spread far and wide. People from neighboring villages came not just for food, but to learn from his wisdom and to be inspired by his example. He taught them that every act of kindness, no matter how small, creates ripples of goodness that spread outward in ways we cannot fully see or measure.'
      )
    `;

    await sql`
      INSERT INTO lessons (chapter_id, number, title, type, content)
      VALUES (
        ${engCh1.id},
        2,
        'The Doer of Good to Others - Comprehension and Vocabulary',
        'exercise',
        'Comprehension Questions:

1. Who is the central character of the story, and what is he known for in his village?
The central character is a kind and generous man known throughout the region for his selfless acts of charity and willingness to help anyone in need, regardless of their background.

2. What crisis struck the land, and how did the kind man respond differently from others?
A severe famine struck the land during a harsh winter. While most wealthy landowners hoarded their resources, the kind man opened his barns and distributed grain to all who came, asking nothing in return.

3. What did the kind man mean when he said "What I give away, I keep forever"?
He meant that acts of generosity and kindness leave a lasting positive impact — they live on in the lives of the people helped and in the memory of the community. Material things kept selfishly are ultimately lost, while goodness given freely endures.

4. What effect did the man''s generosity have beyond the immediate relief of hunger?
His generosity inspired people from neighboring villages who came not just for food but to learn from his wisdom. He became a teacher and an example, showing that kindness creates ripples of goodness that spread outward.

Vocabulary Builder:
- Famine (n.): an extreme scarcity of food affecting a region. Sentence: The famine of 1943 caused widespread suffering across Bengal.
- Humility (n.): the quality of having a modest view of one''s own importance. Sentence: He accepted the award with great humility.
- Selfless (adj.): concerned more with the needs of others than with one''s own. Sentence: Her selfless devotion to the cause inspired everyone around her.
- Generous (adj.): showing a readiness to give more than is strictly necessary. Sentence: The generous donation helped rebuild the school.

Writing Activity:
Write a short paragraph (80-100 words) about a person in your life who you consider a "doer of good to others." Describe one specific act of kindness they performed and explain what you learned from their example.'
      )
    `;

    return Response.json({ success: true, message: "Tables created and seeded" });
  } catch (error) {
    console.error("Setup error:", error);
    return Response.json({ error: "Setup failed", details: error.message }, { status: 500 });
  }
}
