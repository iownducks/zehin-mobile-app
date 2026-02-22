import sql from "@/app/api/utils/sql";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookmarkId = searchParams.get("id");

    if (!bookmarkId) {
      return Response.json(
        { error: "Bookmark ID is required" },
        { status: 400 },
      );
    }

    await sql`
      DELETE FROM bookmarks WHERE id = ${bookmarkId}
    `;

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete bookmark error:", error);
    return Response.json(
      { error: "Failed to delete bookmark" },
      { status: 500 },
    );
  }
}
