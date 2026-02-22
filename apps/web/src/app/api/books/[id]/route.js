import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Get book details
    const books = await sql`
      SELECT * FROM books WHERE id = ${id}
    `;

    if (books.length === 0) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    // Get chapters for this book
    const chapters = await sql`
      SELECT id, chapter_number, title, content
      FROM chapters 
      WHERE book_id = ${id}
      ORDER BY chapter_number ASC
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
