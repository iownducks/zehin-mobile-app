import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId, bookId, chapterId, position, note } = await request.json();

    if (!userId || !bookId) {
      return Response.json(
        { error: "User ID and Book ID are required" },
        { status: 400 },
      );
    }

    const newBookmark = await sql`
      INSERT INTO bookmarks (user_id, book_id, chapter_id, position, note)
      VALUES (${userId}, ${bookId}, ${chapterId || null}, ${position || 0}, ${note || ""})
      RETURNING *
    `;

    return Response.json(
      {
        success: true,
        bookmark: newBookmark[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create bookmark error:", error);
    return Response.json(
      { error: "Failed to create bookmark" },
      { status: 500 },
    );
  }
}
