import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { deleteImageFromCloudinary } from "@/lib/cloudinary";

// GET single product
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const db = getDbPool();
    const res = await db.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [productId]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: res.rows[0] });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Error al obtener el producto" }, { status: 500 });
  }
}

// Admin only: PUT update product
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const productId = parseInt(params.id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const { name, image_url, image_public_id, category_id, code, stock, price, currency, description } = body;

    const db = getDbPool();

    // Check existing product
    const existingRes = await db.query("SELECT * FROM products WHERE id = $1", [productId]);
    if (existingRes.rowCount === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const currentProduct = existingRes.rows[0];

    // If image has changed, remove the old one from Cloudinary to keep it clean
    if (
      image_public_id &&
      currentProduct.image_public_id &&
      image_public_id !== currentProduct.image_public_id
    ) {
      console.log(`Deleting old image from Cloudinary: ${currentProduct.image_public_id}`);
      await deleteImageFromCloudinary(currentProduct.image_public_id);
    }

    const updatedRes = await db.query(
      `UPDATE products
       SET 
        name = COALESCE($1, name),
        image_url = COALESCE($2, image_url),
        image_public_id = COALESCE($3, image_public_id),
        category_id = $4,
        code = COALESCE($5, code),
        stock = COALESCE($6, stock),
        price = COALESCE($7, price),
        currency = COALESCE($8, currency),
        description = COALESCE($9, description),
        updated_at = NOW()
       WHERE id = $10
       RETURNING *;`,
      [
        name ? name.trim() : currentProduct.name,
        image_url ? image_url.trim() : currentProduct.image_url,
        image_public_id ? image_public_id.trim() : currentProduct.image_public_id,
        category_id !== undefined ? (category_id ? parseInt(category_id, 10) : null) : currentProduct.category_id,
        code ? code.trim().toUpperCase() : currentProduct.code,
        stock !== undefined ? parseInt(stock, 10) : currentProduct.stock,
        price !== undefined ? parseFloat(price) : currentProduct.price,
        currency ? currency : currentProduct.currency,
        description !== undefined ? description.trim() : currentProduct.description,
        productId,
      ]
    );

    return NextResponse.json({
      success: true,
      product: updatedRes.rows[0],
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ya existe un producto con ese código único" },
        { status: 409 }
      );
    }
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Error al actualizar el producto" }, { status: 500 });
  }
}

// Admin only: DELETE product & destroy its Cloudinary image
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const productId = parseInt(params.id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const db = getDbPool();

    // 1. Get image_public_id before deleting
    const productRes = await db.query("SELECT image_public_id FROM products WHERE id = $1", [productId]);
    if (productRes.rowCount === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const imagePublicId = productRes.rows[0].image_public_id;

    // 2. Delete product from database
    await db.query("DELETE FROM products WHERE id = $1", [productId]);

    // 3. Clean up Cloudinary image
    if (imagePublicId) {
      console.log(`Cleaning up Cloudinary image: ${imagePublicId}`);
      await deleteImageFromCloudinary(imagePublicId);
    }

    return NextResponse.json({
      success: true,
      message: "Producto e imagen de Cloudinary eliminados exitosamente",
    });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Error al eliminar el producto" }, { status: 500 });
  }
}
