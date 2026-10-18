import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { cvDownloadUrl, getApplication } from "@/lib/careers";

export const runtime = "nodejs";

/** Admin-only: sends the browser to a 10-minute private download link for an applicant's CV. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const app = await getApplication(id).catch(() => null);
  if (!app?.cvPath) return NextResponse.json({ error: "CV not found" }, { status: 404 });
  try {
    return NextResponse.redirect(await cvDownloadUrl(app.cvPath, app.cvName));
  } catch (err) {
    console.error("[careers] Signed URL failed", err);
    return NextResponse.json({ error: "Couldn't open the CV" }, { status: 500 });
  }
}
