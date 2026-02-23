import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");
    const bookId = searchParams.get("book_id");

    if (!studentId) {
      return Response.json({ error: "student_id is required" }, { status: 400 });
    }

    if (bookId) {
      // Get progress for a specific book
      const rows = await sql`
        SELECT id, student_id, book_id, chapter_id, lesson_id, progress_percent, last_read_at
        FROM reading_progress
        WHERE student_id = ${studentId} AND book_id = ${bookId}
      `;
      return Response.json({ success: true, progress: rows[0] || null });
    }

    // Get all progress for student
    const rows = await sql`
      SELECT rp.id, rp.student_id, rp.book_id, rp.chapter_id, rp.lesson_id,
             rp.progress_percent, rp.last_read_at,
             b.title AS book_title, b.subject, b.cover_color
      FROM reading_progress rp
      JOIN books b ON b.id = rp.book_id
      WHERE rp.student_id = ${studentId}
      ORDER BY rp.last_read_at DESC
    `;

    return Response.json({ success: true, progress: rows });
  } catch (error) {
    console.error("Get progress error:", error);
    return Response.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { student_id, book_id, chapter_id, lesson_id, progress_percent } = body;

    if (!student_id || !book_id) {
      return Response.json({ error: "student_id and book_id are required" }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO reading_progress (student_id, book_id, chapter_id, lesson_id, progress_percent, last_read_at)
      VALUES (
        ${student_id},
        ${book_id},
        ${chapter_id || null},
        ${lesson_id || null},
        ${progress_percent ?? 0},
        NOW()
      )
      ON CONFLICT (student_id, book_id)
      DO UPDATE SET
        chapter_id       = COALESCE(EXCLUDED.chapter_id, reading_progress.chapter_id),
        lesson_id        = COALESCE(EXCLUDED.lesson_id, reading_progress.lesson_id),
        progress_percent = EXCLUDED.progress_percent,
        last_read_at     = NOW()
      RETURNING *
    `;

    return Response.json({ success: true, progress: rows[0] });
  } catch (error) {
    console.error("Update progress error:", error);
    return Response.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
