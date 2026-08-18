import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getDbPool, initDb } from "./db";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "chatbot_im_jwt_secret_key_super_secure_2026_x89a";
const SESSION_EXPIRY = "2h"; // 2 hours expiration for admin session

export interface AdminPayload {
  id: number;
  username: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_EXPIRY });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getAuthenticatedAdmin(req: NextRequest): Promise<AdminPayload | null> {
  // Check cookie first
  const tokenCookie = req.cookies.get("admin_token")?.value;
  if (tokenCookie) {
    const payload = verifyAdminToken(tokenCookie);
    if (payload) return payload;
  }

  // Check Authorization header Bearer token
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7);
    const payload = verifyAdminToken(bearerToken);
    if (payload) return payload;
  }

  return null;
}

/**
 * Ensures the initial admin user exists in the database.
 */
export async function ensureAdminUser(): Promise<void> {
  await initDb();
  const db = getDbPool();

  const defaultUser = process.env.ADMIN_INITIAL_USER || "admin";
  const defaultPass = process.env.ADMIN_INITIAL_PASS || "admin2026!";

  const res = await db.query("SELECT id FROM admin_users WHERE username = $1", [defaultUser]);
  if (res.rowCount === 0) {
    const hashed = await hashPassword(defaultPass);
    await db.query(
      "INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)",
      [defaultUser, hashed]
    );
    console.log(`Initial admin user [${defaultUser}] created.`);
  }
}
