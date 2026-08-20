import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const db = getDbPool();

    const body = await req.json().catch(() => ({}));
    const { visitor_id, path } = body;

    if (!visitor_id) {
      return NextResponse.json({ success: false, error: "visitor_id missing" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || "Unknown Device";
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "Unknown IP";

    await db.query(
      `INSERT INTO page_views (visitor_id, path, user_agent, ip_address, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [visitor_id, path || "/", userAgent, ip]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Tracking error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
