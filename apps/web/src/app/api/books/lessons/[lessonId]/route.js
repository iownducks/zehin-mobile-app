import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { lessonId } = params;

    const lessons = await sql`
      SELECT id, chapter_id, number, title, type, content, created_at
      FROM lessons
      WHERE id = ${lessonId}
    `;

    if (lessons.length === 0) {
      return Response.json({ error: "Lesson not found" }, { status: 404 });
    }

    const quizzes = await sql`
      SELECT id, lesson_id, chapter_id, question, options, correct_answer, explanation, created_at
      FROM quizzes
      WHERE lesson_id = ${lessonId}
      ORDER BY id ASC
    `;

    return Response.json({
      success: true,
      lesson: {
        ...lessons[0],
        quizzes,
      },
    });
  } catch (error) {
    console.error("Get lesson error:", error);
    return Response.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { lessonId } = params;
    const body = await request.json();
    const { number, title, type, content } = body;

    const existing = await sql`SELECT id FROM lessons WHERE id = ${lessonId}`;
    if (existing.length === 0) {
      return Response.json({ error: "Lesson not found" }, { status: 404 });
    }

    const rows = await sql`
      UPDATE lessons SET
        number  = COALESCE(${number != null ? parseInt(number) : null}, number),
        title   = COALESCE(${title ?? null}, title),
        type    = COALESCE(${type ?? null}, type),
        content = COALESCE(${content ?? null}, content)
      WHERE id = ${lessonId}
      RETURNING *
    `;

    return Response.json({ success: true, lesson: rows[0] });
  } catch (error) {
    console.error("Update lesson error:", error);
    return Response.json({ error: "Failed to update lesson" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { lessonId } = params;

    const existing = await sql`SELECT id FROM lessons WHERE id = ${lessonId}`;
    if (existing.length === 0) {
      return Response.json({ error: "Lesson not found" }, { status: 404 });
    }

    await sql`DELETE FROM lessons WHERE id = ${lessonId}`;

    return Response.json({ success: true, message: "Lesson deleted" });
  } catch (error) {
    console.error("Delete lesson error:", error);
    return Response.json({ error: "Failed to delete lesson" }, { status: 500 });
  }
}
