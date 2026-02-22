import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const bookmarks = await sql`
      SELECT 
        b.id,
        b.user_id,
        b.book_id,
        b.chapter_id,
        b.position,
        b.note,
        b.created_at,
        books.title as book_title,
        books.subject,
        books.cover_image,
        chapters.title as chapter_title,
        chapters.chapter_number
      FROM bookmarks b
      JOIN books ON b.book_id = books.id
      LEFT JOIN chapters ON b.chapter_id = chapters.id
      WHERE b.user_id = ${userId}
      ORDER BY b.created_at DESC
    `;

    return Response.json({
      success: true,
      bookmarks,
    });
  } catch (error) {
    console.error("List bookmarks error:", error);
    return Response.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 },
    );
  }
}
