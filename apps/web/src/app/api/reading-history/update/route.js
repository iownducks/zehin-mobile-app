import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId, bookId, chapterId, progressPercentage, lastPosition } =
      await request.json();

    if (!userId || !bookId) {
      return Response.json(
        { error: "User ID and Book ID are required" },
        { status: 400 },
      );
    }

    // Check if history entry exists
    const existing = await sql`
      SELECT id FROM reading_history 
      WHERE user_id = ${userId} AND book_id = ${bookId}
    `;

    let result;

    if (existing.length > 0) {
      // Update existing entry
      result = await sql`
        UPDATE reading_history 
        SET 
          chapter_id = ${chapterId || null},
          progress_percentage = ${progressPercentage || 0},
          last_position = ${lastPosition || 0},
          last_read_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND book_id = ${bookId}
        RETURNING *
      `;
    } else {
      // Create new entry
      result = await sql`
        INSERT INTO reading_history (user_id, book_id, chapter_id, progress_percentage, last_position)
        VALUES (${userId}, ${bookId}, ${chapterId || null}, ${progressPercentage || 0}, ${lastPosition || 0})
        RETURNING *
      `;
    }

    return Response.json({
      success: true,
      history: result[0],
    });
  } catch (error) {
    console.error("Update reading history error:", error);
    return Response.json(
      { error: "Failed to update reading history" },
      { status: 500 },
    );
  }
}
