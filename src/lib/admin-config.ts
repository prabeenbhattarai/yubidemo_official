// Admin login settings. On the live site these MUST come from environment
// variables: if they're missing (or too weak) the admin locks itself rather
// than falling back to the development defaults, which are public in the code.
// Shared by src/proxy.ts and src/lib/auth.ts.

const DEV_SECRET = "dev-only-insecure-secret-change-me-in-env-local";
const isProd = process.env.NODE_ENV === "production";

/** Key that signs admin sessions, or null when the admin must stay locked. */
export function sessionSecret(): Uint8Array | null {
  const s = process.env.ADMIN_SESSION_SECRET?.trim();
  if (s && s.length >= 32) return new TextEncoder().encode(s);
  if (!isProd) return new TextEncoder().encode(s || DEV_SECRET);
  return null;
}

/** The admin password, or null when login must stay disabled. */
export function adminPassword(): string | null {
  const p = process.env.ADMIN_PASSWORD;
  if (p && p.length >= 8 && !["admin", "changeme", "password"].includes(p.toLowerCase())) return p;
  if (!isProd) return p || "admin";
  return null;
}

/** Why the live admin is locked, for the login page — or null if it's set up. */
export function adminSetupProblem(): string | null {
  if (!sessionSecret()) return "ADMIN_SESSION_SECRET is missing or shorter than 32 characters.";
  if (!adminPassword()) return "ADMIN_PASSWORD is missing, shorter than 8 characters, or a default like “admin”.";
  return null;
}
