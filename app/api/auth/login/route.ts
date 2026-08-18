import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { comparePassword, signAdminToken, ensureAdminUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await ensureAdminUser();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const db = getDbPool();
    const res = await db.query(
      "SELECT id, username, password_hash FROM admin_users WHERE username = $1",
      [username.trim()]
    );

    if (res.rowCount === 0) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const admin = res.rows[0];
    const isMatch = await comparePassword(password, admin.password_hash);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = signAdminToken({ id: admin.id, username: admin.username });

    const response = NextResponse.json({
      success: true,
      user: { id: admin.id, username: admin.username },
      token,
    });

    // Set HttpOnly cookie for secure session
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor durante el inicio de sesión" },
      { status: 500 }
    );
  }
}
