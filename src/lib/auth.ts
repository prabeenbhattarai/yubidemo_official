import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { adminPassword, sessionSecret } from "./admin-config";

export const SESSION_COOKIE = "yubi_admin";
const ALG = "HS256";

export { adminPassword, adminSetupProblem } from "./admin-config";

export function checkPassword(input: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  // constant-ish comparison
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i++) diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const key = sessionSecret();
  if (!key) throw new Error("Admin is locked: ADMIN_SESSION_SECRET is not set.");
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  const key = sessionSecret();
  if (!token || !key) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.role === "admin";
  } catch {
    return false;
  }
}
