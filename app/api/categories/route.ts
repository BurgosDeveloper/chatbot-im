import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

// Public: List all categories with product count
export async function GET() {
  try {
    await initDb();
    const db = getDbPool();
    const result = await db.query(`
      SELECT 
        c.id, 
        c.name, 
        c.created_at,
        COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id, c.name, c.created_at
      ORDER BY c.name ASC;
    `);

    return NextResponse.json({ success: true, categories: result.rows });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}

// Admin only: Create a category
export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre de la categoría es obligatorio" },
        { status: 400 }
      );
    }

    await initDb();
    const db = getDbPool();

    const insertRes = await db.query(
      `INSERT INTO categories (name) VALUES ($1) RETURNING *;`,
      [name.trim()]
    );

    return NextResponse.json({
      success: true,
      category: insertRes.rows[0],
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre" },
        { status: 409 }
      );
    }
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Error al crear la categoría" },
      { status: 500 }
    );
  }
}
