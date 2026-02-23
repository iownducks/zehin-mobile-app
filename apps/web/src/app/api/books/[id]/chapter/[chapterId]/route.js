import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id, chapterId } = params;

    const chapters = await sql`
      SELECT id, book_id, number, title, summary, created_at
      FROM chapters
      WHERE id = ${chapterId} AND book_id = ${id}
    `;

    if (chapters.length === 0) {
      return Response.json({ error: "Chapter not found" }, { status: 404 });
    }

    const lessons = await sql`
      SELECT id, chapter_id, number, title, type, content, created_at
      FROM lessons
      WHERE chapter_id = ${chapterId}
      ORDER BY number ASC
    `;

    const quizzes = await sql`
      SELECT id, lesson_id, chapter_id, question, options, correct_answer, explanation, created_at
      FROM quizzes
      WHERE chapter_id = ${chapterId}
      ORDER BY id ASC
    `;

    return Response.json({
      success: true,
      chapter: {
        ...chapters[0],
        lessons,
        quizzes,
      },
    });
  } catch (error) {
    console.error("Get chapter error:", error);
    return Response.json({ error: "Failed to fetch chapter" }, { status: 500 });
  }
}
