import { Pool } from "pg";

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_fsJdkqw56uTg@ep-wispy-tooth-aw0dcu0b-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require";

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;

  const db = getDbPool();

  try {
    // 1. Categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        image_public_id VARCHAR(255) NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        price NUMERIC(12, 2) NOT NULL DEFAULT 0,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns exist if table was already created
    await db.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC(12, 2) NOT NULL DEFAULT 0;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'USD';
    `);

    // 3. Admin Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. App Settings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key VARCHAR(50) PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // 5. Page Views Analytics table
    await db.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        visitor_id VARCHAR(100) NOT NULL,
        path VARCHAR(255) NOT NULL DEFAULT '/',
        user_agent TEXT,
        ip_address VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
      CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
    `);

    // Default Settings (WhatsApp, USD to COP rate, USD to VES rate)
    const defaultWhatsapp = process.env.DEFAULT_WHATSAPP_NUMBER || "584120000000";
    await db.query(
      `INSERT INTO app_settings (key, value)
       VALUES 
        ('whatsapp_number', $1),
        ('rate_usd_cop', '4000'),
        ('rate_usd_ves', '40')
       ON CONFLICT (key) DO NOTHING;`,
      [defaultWhatsapp]
    );

    isInitialized = true;
    console.log("Database initialized successfully with PostgreSQL schema.");
  } catch (error) {
    console.error("Error initializing database schema:", error);
    throw error;
  }
}
