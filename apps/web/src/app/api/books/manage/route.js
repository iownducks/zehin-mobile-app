import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, subject, class_level, board, cover_color, description } = body;

    if (!title || !subject || !class_level) {
      return Response.json(
        { error: "title, subject, and class_level are required" },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO books (title, subject, class_level, board, cover_color, description)
      VALUES (
        ${title},
        ${subject},
        ${parseInt(class_level)},
        ${board || "Punjab"},
        ${cover_color || "#1565C0"},
        ${description || null}
      )
      RETURNING *
    `;

    return Response.json({ success: true, book: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Create book error:", error);
    return Response.json({ error: "Failed to create book" }, { status: 500 });
  }
}
