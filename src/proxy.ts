import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { sessionSecret } from "@/lib/admin-config";

const SESSION_COOKIE = "yubi_admin";

async function isValid(token: string | undefined): Promise<boolean> {
  // No secret configured on the live site → nobody is treated as logged in.
  const key = sessionSecret();
  if (!token || !key) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const valid = await isValid(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/api/admin/yubidemo/login") {
    if (valid) return NextResponse.redirect(new URL("/api/admin/yubidemo", req.url));
    return NextResponse.next();
  }

  if (!valid) {
    const url = new URL("/api/admin/yubidemo/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/yubidemo/:path*"],
};
