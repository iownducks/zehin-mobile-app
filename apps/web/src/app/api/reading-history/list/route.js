import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const history = await sql`
      SELECT 
        rh.id,
        rh.user_id,
        rh.book_id,
        rh.chapter_id,
        rh.progress_percentage,
        rh.last_position,
        rh.last_read_at,
        books.title as book_title,
        books.subject,
        books.cover_image,
        books.class,
        chapters.title as chapter_title,
        chapters.chapter_number
      FROM reading_history rh
      JOIN books ON rh.book_id = books.id
      LEFT JOIN chapters ON rh.chapter_id = chapters.id
      WHERE rh.user_id = ${userId}
      ORDER BY rh.last_read_at DESC
    `;

    return Response.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("List reading history error:", error);
    return Response.json(
      { error: "Failed to fetch reading history" },
      { status: 500 },
    );
  }
}
