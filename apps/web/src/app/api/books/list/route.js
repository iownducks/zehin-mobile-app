import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("class");
    const board = searchParams.get("board");
    const subject = searchParams.get("subject");
    const search = searchParams.get("search");

    let query = "SELECT * FROM books WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (classLevel) {
      query += ` AND class = $${paramIndex}`;
      params.push(parseInt(classLevel));
      paramIndex++;
    }

    if (board) {
      query += ` AND board = $${paramIndex}`;
      params.push(board);
      paramIndex++;
    }

    if (subject) {
      query += ` AND subject = $${paramIndex}`;
      params.push(subject);
      paramIndex++;
    }

    if (search) {
      query += ` AND (LOWER(title) LIKE LOWER($${paramIndex}) OR LOWER(subject) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += " ORDER BY class ASC, subject ASC";

    const books = await sql(query, params);

    return Response.json({
      success: true,
      books,
    });
  } catch (error) {
    console.error("List books error:", error);
    return Response.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}
