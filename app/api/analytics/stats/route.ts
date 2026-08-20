import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await initDb();
    const db = getDbPool();

    // 1. Total views
    const totalViewsRes = await db.query("SELECT COUNT(*)::int AS total FROM page_views;");
    const totalViews = totalViewsRes.rows[0]?.total || 0;

    // 2. Unique visitors
    const uniqueVisitorsRes = await db.query("SELECT COUNT(DISTINCT visitor_id)::int AS total FROM page_views;");
    const uniqueVisitors = uniqueVisitorsRes.rows[0]?.total || 0;

    // 3. Views today
    const viewsTodayRes = await db.query(
      "SELECT COUNT(*)::int AS total FROM page_views WHERE created_at >= CURRENT_DATE;"
    );
    const viewsToday = viewsTodayRes.rows[0]?.total || 0;

    // 4. Unique visitors today
    const uniqueTodayRes = await db.query(
      "SELECT COUNT(DISTINCT visitor_id)::int AS total FROM page_views WHERE created_at >= CURRENT_DATE;"
    );
    const uniqueToday = uniqueTodayRes.rows[0]?.total || 0;

    // 5. Last 7 days breakdown
    const last7DaysRes = await db.query(`
      SELECT 
        TO_CHAR(d.day, 'YYYY-MM-DD') AS date_str,
        TO_CHAR(d.day, 'Dy') AS day_name,
        COUNT(pv.id)::int AS views,
        COUNT(DISTINCT pv.visitor_id)::int AS unique_visitors
      FROM (
        SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval)::date AS day
      ) d
      LEFT JOIN page_views pv ON pv.created_at::date = d.day
      GROUP BY d.day
      ORDER BY d.day ASC;
    `);

    // 6. Recent activity (last 15 views)
    const recentRes = await db.query(`
      SELECT id, visitor_id, path, user_agent, created_at
      FROM page_views
      ORDER BY id DESC
      LIMIT 15;
    `);

    const recentActivity = recentRes.rows.map((row) => {
      const ua = row.user_agent || "";
      let device = "Escritorio";
      if (/iPhone/i.test(ua)) device = "iPhone";
      else if (/iPad/i.test(ua)) device = "iPad";
      else if (/Android/i.test(ua)) device = "Android Móvil";
      else if (/Windows/i.test(ua)) device = "Windows PC";
      else if (/Macintosh/i.test(ua)) device = "Mac OS";
      else if (/Linux/i.test(ua)) device = "Linux";

      return {
        id: row.id,
        visitor_id: row.visitor_id,
        path: row.path,
        device,
        created_at: row.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalViews,
        uniqueVisitors,
        viewsToday,
        uniqueToday,
        last7Days: last7DaysRes.rows,
        recentActivity,
      },
    });
  } catch (error: any) {
    console.error("Analytics stats error:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas de visitantes" },
      { status: 500 }
    );
  }
}
