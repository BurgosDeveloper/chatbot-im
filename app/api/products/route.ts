import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

// Public: GET products with category and search filter
export async function GET(req: NextRequest) {
  try {
    await initDb();
    const db = getDbPool();

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category_id");
    const search = searchParams.get("search");

    let query = `
      SELECT 
        p.id,
        p.name,
        p.image_url,
        p.image_public_id,
        p.category_id,
        c.name AS category_name,
        p.code,
        p.stock,
        p.description,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (categoryId && categoryId !== "all") {
      params.push(parseInt(categoryId, 10));
      query += ` AND p.category_id = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      query += ` AND (p.name ILIKE $${params.length} OR p.code ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    query += ` ORDER BY p.id DESC;`;

    const result = await db.query(query, params);
    return NextResponse.json({ success: true, products: result.rows });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Error al obtener los productos" },
      { status: 500 }
    );
  }
}

// Admin only: POST create product
export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, image_url, image_public_id, category_id, code, stock, description } = body;

    if (!name || !image_url || !image_public_id || !code) {
      return NextResponse.json(
        { error: "Nombre, imagen, código y stock son requeridos" },
        { status: 400 }
      );
    }

    await initDb();
    const db = getDbPool();

    const insertRes = await db.query(
      `INSERT INTO products (
        name, image_url, image_public_id, category_id, code, stock, description, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *;`,
      [
        name.trim(),
        image_url.trim(),
        image_public_id.trim(),
        category_id ? parseInt(category_id, 10) : null,
        code.trim().toUpperCase(),
        parseInt(stock || 0, 10),
        description ? description.trim() : "",
      ]
    );

    return NextResponse.json({
      success: true,
      product: insertRes.rows[0],
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ya existe un producto con ese código único" },
        { status: 409 }
      );
    }
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Error al crear el producto en la base de datos" },
      { status: 500 }
    );
  }
}
