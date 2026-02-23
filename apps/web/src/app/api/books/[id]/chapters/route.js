import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const bookCheck = await sql`SELECT id FROM books WHERE id = ${id}`;
    if (bookCheck.length === 0) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    const chapters = await sql`
      SELECT id, book_id, number, title, summary, created_at
      FROM chapters
      WHERE book_id = ${id}
      ORDER BY number ASC
    `;

    return Response.json({ success: true, chapters });
  } catch (error) {
    console.error("List chapters error:", error);
    return Response.json({ error: "Failed to fetch chapters" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { number, title, summary } = body;

    if (!number || !title) {
      return Response.json({ error: "number and title are required" }, { status: 400 });
    }

    const bookCheck = await sql`SELECT id FROM books WHERE id = ${id}`;
    if (bookCheck.length === 0) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    const rows = await sql`
      INSERT INTO chapters (book_id, number, title, summary)
      VALUES (${id}, ${parseInt(number)}, ${title}, ${summary || null})
      RETURNING *
    `;

    return Response.json({ success: true, chapter: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Create chapter error:", error);
    return Response.json({ error: "Failed to create chapter" }, { status: 500 });
  }
}
