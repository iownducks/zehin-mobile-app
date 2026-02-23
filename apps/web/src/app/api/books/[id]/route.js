import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const books = await sql`
      SELECT
        id, title, subject, class_level, board,
        cover_color, description, is_published, created_at, updated_at
      FROM books
      WHERE id = ${id}
    `;

    if (books.length === 0) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    const chapters = await sql`
      SELECT
        c.id,
        c.number,
        c.title,
        c.summary,
        c.created_at,
        json_agg(
          json_build_object(
            'id', l.id,
            'number', l.number,
            'title', l.title,
            'type', l.type
          ) ORDER BY l.number ASC
        ) FILTER (WHERE l.id IS NOT NULL) AS lessons
      FROM chapters c
      LEFT JOIN lessons l ON l.chapter_id = c.id
      WHERE c.book_id = ${id}
      GROUP BY c.id
      ORDER BY c.number ASC
    `;

    return Response.json({
      success: true,
      book: {
        ...books[0],
        chapters,
      },
    });
  } catch (error) {
    console.error("Get book error:", error);
    return Response.json({ error: "Failed to fetch book" }, { status: 500 });
  }
}
