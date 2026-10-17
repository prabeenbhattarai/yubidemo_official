import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "yubi_admin";

function secret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.ADMIN_SESSION_SECRET || "dev-only-insecure-secret-change-me-in-env-local"
  );
}

async function isValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const valid = await isValid(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/admin/login") {
    if (valid) return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }

  if (!valid) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
