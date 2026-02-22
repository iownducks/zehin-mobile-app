import sql from "@/app/api/utils/sql";
import argon2 from "argon2";

export async function POST(request) {
  try {
    const { name, email, password, classLevel, board } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !classLevel) {
      return Response.json(
        { error: "Name, email, password, and class are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate class level
    if (classLevel < 1 || classLevel > 12) {
      return Response.json(
        { error: "Class must be between 1 and 12" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return Response.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create user
    const newUser = await sql`
      INSERT INTO users (name, email, password_hash, class, board)
      VALUES (${name}, ${email}, ${passwordHash}, ${classLevel}, ${board || "Punjab"})
      RETURNING id, name, email, class, board, avatar, created_at
    `;

    return Response.json(
      {
        success: true,
        user: newUser[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
