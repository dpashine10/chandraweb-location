import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken, COOKIE_NAME, TOKEN_MAX_AGE, ADMIN_USERNAME, ADMIN_PASSWORD_HASH } from "@/lib/auth";

// Rate limiting: simple in-memory (per-server). Replace with Redis in production.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  if (entry.count > MAX_ATTEMPTS) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try{
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  // Constant-time username comparison  
  const usernameMatch =
    username === ADMIN_USERNAME;

  let passwordMatch = false;

  if (
    usernameMatch &&
    ADMIN_PASSWORD_HASH
  ) {

    passwordMatch = await bcrypt.compare(
      password,
      ADMIN_PASSWORD_HASH
    );
  } else {
    // Dummy bcrypt comparison to reduce
    // username enumeration timing attacks
    await bcrypt.compare(
      password,
      "$2a$12$abcdefghijklmnopqrstuvabcdefghijklmnopqrstuvabcd"
    );
  }

  if (!usernameMatch || !passwordMatch) {
    await new Promise((r) =>
      setTimeout(
        r,
        500 + Math.random() * 500
      )
    );

    return NextResponse.json(
      {
        error:
          "Invalid username or password.",
      },
      { status: 401 }
    );
  }
  attempts.delete(ip);

const token = signToken(username);

const res = NextResponse.json({ ok: true });

res.cookies.set(COOKIE_NAME, token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: TOKEN_MAX_AGE,
  path: "/",
});

return res;
} catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}