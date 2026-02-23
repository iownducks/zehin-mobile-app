import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("class");
    const board = searchParams.get("board");
    const subject = searchParams.get("subject");
    const search = searchParams.get("search");
    const showAll = searchParams.get("all") === "true";

    let query = `
      SELECT
        b.id,
        b.title,
        b.subject,
        b.class_level,
        b.board,
        b.cover_color,
        b.description,
        b.is_published,
        b.created_at,
        b.updated_at,
        COUNT(c.id)::INTEGER AS chapter_count
      FROM books b
      LEFT JOIN chapters c ON c.book_id = b.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (!showAll) {
      query += ` AND b.is_published = true`;
    }

    if (classLevel) {
      query += ` AND b.class_level = $${paramIndex}`;
      params.push(parseInt(classLevel));
      paramIndex++;
    }

    if (board) {
      query += ` AND b.board = $${paramIndex}`;
      params.push(board);
      paramIndex++;
    }

    if (subject) {
      query += ` AND b.subject = $${paramIndex}`;
      params.push(subject);
      paramIndex++;
    }

    if (search) {
      query += ` AND (LOWER(b.title) LIKE LOWER($${paramIndex}) OR LOWER(b.subject) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY b.id ORDER BY b.class_level ASC, b.subject ASC`;

    const books = await sql(query, params);

    return Response.json({ success: true, books });
  } catch (error) {
    console.error("List books error:", error);
    return Response.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}
