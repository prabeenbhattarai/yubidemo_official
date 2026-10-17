import "server-only";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "yubi_admin";
const ALG = "HS256";

function secret(): Uint8Array {
  const s =
    process.env.ADMIN_SESSION_SECRET ||
    "dev-only-insecure-secret-change-me-in-env-local";
  return new TextEncoder().encode(s);
}

/** The admin password. Defaults to "admin" for first run — change it in .env.local. */
export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin";
}

export function checkPassword(input: string): boolean {
  const expected = adminPassword();
  // constant-ish comparison
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i++) diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
