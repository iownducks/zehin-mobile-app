import sql from "@/app/api/utils/sql";

export async function PUT(request, { params }) {
  try {
    const { chapterId } = params;
    const body = await request.json();
    const { number, title, summary } = body;

    const existing = await sql`SELECT id FROM chapters WHERE id = ${chapterId}`;
    if (existing.length === 0) {
      return Response.json({ error: "Chapter not found" }, { status: 404 });
    }

    const rows = await sql`
      UPDATE chapters SET
        number  = COALESCE(${number != null ? parseInt(number) : null}, number),
        title   = COALESCE(${title ?? null}, title),
        summary = COALESCE(${summary ?? null}, summary)
      WHERE id = ${chapterId}
      RETURNING *
    `;

    return Response.json({ success: true, chapter: rows[0] });
  } catch (error) {
    console.error("Update chapter error:", error);
    return Response.json({ error: "Failed to update chapter" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { chapterId } = params;

    const existing = await sql`SELECT id FROM chapters WHERE id = ${chapterId}`;
    if (existing.length === 0) {
      return Response.json({ error: "Chapter not found" }, { status: 404 });
    }

    await sql`DELETE FROM chapters WHERE id = ${chapterId}`;

    return Response.json({ success: true, message: "Chapter deleted" });
  } catch (error) {
    console.error("Delete chapter error:", error);
    return Response.json({ error: "Failed to delete chapter" }, { status: 500 });
  }
}
