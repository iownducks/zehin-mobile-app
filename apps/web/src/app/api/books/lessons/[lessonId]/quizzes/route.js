import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { lessonId } = params;

    const lessonCheck = await sql`SELECT id FROM lessons WHERE id = ${lessonId}`;
    if (lessonCheck.length === 0) {
      return Response.json({ error: "Lesson not found" }, { status: 404 });
    }

    const quizzes = await sql`
      SELECT id, lesson_id, chapter_id, question, options, correct_answer, explanation, created_at
      FROM quizzes
      WHERE lesson_id = ${lessonId}
      ORDER BY id ASC
    `;

    return Response.json({ success: true, quizzes });
  } catch (error) {
    console.error("List quizzes error:", error);
    return Response.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { lessonId } = params;
    const body = await request.json();
    const { question, options, correct_answer, explanation } = body;

    if (!question || !options || correct_answer == null) {
      return Response.json(
        { error: "question, options, and correct_answer are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(options) || options.length < 2) {
      return Response.json(
        { error: "options must be an array with at least 2 items" },
        { status: 400 }
      );
    }

    if (correct_answer < 0 || correct_answer >= options.length) {
      return Response.json(
        { error: "correct_answer must be a valid index into options" },
        { status: 400 }
      );
    }

    const lessonCheck = await sql`SELECT id, chapter_id FROM lessons WHERE id = ${lessonId}`;
    if (lessonCheck.length === 0) {
      return Response.json({ error: "Lesson not found" }, { status: 404 });
    }

    const chapterId = lessonCheck[0].chapter_id;

    const rows = await sql`
      INSERT INTO quizzes (lesson_id, chapter_id, question, options, correct_answer, explanation)
      VALUES (
        ${lessonId},
        ${chapterId},
        ${question},
        ${JSON.stringify(options)},
        ${parseInt(correct_answer)},
        ${explanation || null}
      )
      RETURNING *
    `;

    return Response.json({ success: true, quiz: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Create quiz error:", error);
    return Response.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
