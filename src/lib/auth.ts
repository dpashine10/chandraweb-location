import jwt from "jsonwebtoken";

const COOKIE_NAME = "fp_admin_token";
const TOKEN_MAX_AGE = 60 * 60 * 1; // 1 hour

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// Read lazily (at request time) instead of throwing at module load. Next.js
// imports this module while collecting route page-data at *build* time —
// throwing here would fail `npm run build` itself whenever JWT_SECRET isn't
// set yet (e.g. a fresh clone, or the first deploy before env vars are
// configured on the host). Deferring the check means the build always
// succeeds, and a genuinely missing secret only surfaces as a clean 500
// from the route's own try/catch when someone actually tries to log in.
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Add it to .env.local (see .env.example)."
    );
  }
  return secret;
}

export function signToken(username: string): string {
  return jwt.sign({ username, role: "admin" }, getJwtSecret(), {
    expiresIn: TOKEN_MAX_AGE,
  });
}

export function verifyToken(token: string): { username: string; role: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { username: string; role: string };
  } catch {
    return null;
  }
}

export { COOKIE_NAME, TOKEN_MAX_AGE };
