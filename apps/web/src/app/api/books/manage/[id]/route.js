import sql from "@/app/api/utils/sql";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, subject, class_level, board, cover_color, description, is_published } = body;

    const existing = await sql`SELECT id FROM books WHERE id = ${id}`;
    if (existing.length === 0) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    const rows = await sql`
      UPDATE books SET
        title        = COALESCE(${title ?? null}, title),
        subject      = COALESCE(${subject ?? null}, subject),
        class_level  = COALESCE(${class_level != null ? parseInt(class_level) : null}, class_level),
        board        = COALESCE(${board ?? null}, board),
        cover_color  = COALESCE(${cover_color ?? null}, cover_color),
        description  = COALESCE(${description ?? null}, description),
        is_published = COALESCE(${is_published ?? null}, is_published),
        updated_at   = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return Response.json({ success: true, book: rows[0] });
  } catch (error) {
    console.error("Update book error:", error);
    return Response.json({ error: "Failed to update book" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const existing = await sql`SELECT id FROM books WHERE id = ${id}`;
    if (existing.length === 0) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    await sql`DELETE FROM books WHERE id = ${id}`;

    return Response.json({ success: true, message: "Book deleted" });
  } catch (error) {
    console.error("Delete book error:", error);
    return Response.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
