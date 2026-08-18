import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { ensureAdminUser } from "@/lib/auth";

export async function GET() {
  try {
    await initDb();
    await ensureAdminUser();
    return NextResponse.json({ success: true, message: "Base de datos y admin inicializados correctamente en NeonDB PostgreSQL." });
  } catch (error: any) {
    console.error("Error en init:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al inicializar la base de datos" },
      { status: 500 }
    );
  }
}
