import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";
import { getAuthenticatedAdmin, hashPassword, comparePassword } from "@/lib/auth";

// Public / Admin: GET settings (WhatsApp number and exchange rates)
export async function GET() {
  try {
    await initDb();
    const db = getDbPool();
    const res = await db.query("SELECT key, value FROM app_settings");

    const settings: Record<string, string> = {};
    res.rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    return NextResponse.json({
      success: true,
      settings: {
        whatsapp_number: settings["whatsapp_number"] || "584120000000",
        rate_usd_cop: parseFloat(settings["rate_usd_cop"] || "4000"),
        rate_usd_ves: parseFloat(settings["rate_usd_ves"] || "40"),
      },
    });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 });
  }
}

// Admin only: POST update settings or change password
export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { whatsapp_number, rate_usd_cop, rate_usd_ves, current_password, new_password } = body;

    const db = getDbPool();

    // Update WhatsApp number if provided
    if (whatsapp_number !== undefined) {
      await db.query(
        `INSERT INTO app_settings (key, value)
         VALUES ('whatsapp_number', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
        [whatsapp_number.trim().replace(/[^0-9]/g, "")]
      );
    }

    // Update USD to COP rate if provided
    if (rate_usd_cop !== undefined) {
      await db.query(
        `INSERT INTO app_settings (key, value)
         VALUES ('rate_usd_cop', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
        [rate_usd_cop.toString()]
      );
    }

    // Update USD to VES rate if provided
    if (rate_usd_ves !== undefined) {
      await db.query(
        `INSERT INTO app_settings (key, value)
         VALUES ('rate_usd_ves', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
        [rate_usd_ves.toString()]
      );
    }

    // Change admin password if provided
    if (new_password) {
      if (!current_password) {
        return NextResponse.json(
          { error: "Debes ingresar tu contraseña actual para cambiarla" },
          { status: 400 }
        );
      }

      const adminRes = await db.query(
        "SELECT password_hash FROM admin_users WHERE id = $1",
        [admin.id]
      );
      if (adminRes.rowCount === 0) {
        return NextResponse.json({ error: "Usuario admin no encontrado" }, { status: 404 });
      }

      const isMatch = await comparePassword(current_password, adminRes.rows[0].password_hash);
      if (!isMatch) {
        return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
      }

      const newHash = await hashPassword(new_password);
      await db.query("UPDATE admin_users SET password_hash = $1 WHERE id = $2", [newHash, admin.id]);
    }

    return NextResponse.json({
      success: true,
      message: "Configuración actualizada correctamente",
    });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 });
  }
}
