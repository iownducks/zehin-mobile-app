import sql from "@/app/api/utils/sql";
import argon2 from "argon2";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user by email
    const users = await sql`
      SELECT id, name, email, password_hash, class, board, avatar, created_at
      FROM users 
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await argon2.verify(user.password_hash, password);

    if (!isValidPassword) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Remove password hash from response
    delete user.password_hash;

    return Response.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
