import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { chapterId } = params;

    const chapterCheck = await sql`SELECT id FROM chapters WHERE id = ${chapterId}`;
    if (chapterCheck.length === 0) {
      return Response.json({ error: "Chapter not found" }, { status: 404 });
    }

    const lessons = await sql`
      SELECT id, chapter_id, number, title, type, created_at
      FROM lessons
      WHERE chapter_id = ${chapterId}
      ORDER BY number ASC
    `;

    return Response.json({ success: true, lessons });
  } catch (error) {
    console.error("List lessons error:", error);
    return Response.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { chapterId } = params;
    const body = await request.json();
    const { number, title, type, content } = body;

    if (!number || !title || !content) {
      return Response.json(
        { error: "number, title, and content are required" },
        { status: 400 }
      );
    }

    const chapterCheck = await sql`SELECT id FROM chapters WHERE id = ${chapterId}`;
    if (chapterCheck.length === 0) {
      return Response.json({ error: "Chapter not found" }, { status: 404 });
    }

    const rows = await sql`
      INSERT INTO lessons (chapter_id, number, title, type, content)
      VALUES (
        ${chapterId},
        ${parseInt(number)},
        ${title},
        ${type || "text"},
        ${content}
      )
      RETURNING *
    `;

    return Response.json({ success: true, lesson: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Create lesson error:", error);
    return Response.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}
