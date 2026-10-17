"use server";

import { headers } from "next/headers";
import { getCompany } from "@/lib/content";
import { db, isFirebaseConfigured } from "@/lib/firebase-admin";
import { checkEmailDomain, escapeHtml, hashIp, isRateLimited, quoteRecipients, sendSiteEmail } from "@/lib/quote";

export type NewsletterState =
  | { ok: true; already: boolean }
  | { ok: false; error: string }
  | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export async function subscribeNewsletter(_prev: NewsletterState, fd: FormData): Promise<NewsletterState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  if (!EMAIL.test(email)) return { ok: false, error: "Please enter a valid email address." };

  // Bot trap: hidden from people. Bots get a normal-looking reply.
  if (String(fd.get("nl_ref") ?? "") !== "") return { ok: true, already: false };

  const domainError = await checkEmailDomain(email);
  if (domainError) return { ok: false, error: domainError };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  if (await isRateLimited(hashIp(`newsletter:${ip}`))) {
    return { ok: false, error: "Too many attempts — please try again in an hour." };
  }

  // One document per address, so signing up twice doesn't create duplicates.
  let already = false;
  let saved = false;
  if (isFirebaseConfigured()) {
    try {
      const ref = db().collection("subscribers").doc(email);
      already = (await ref.get()).exists;
      if (!already) await ref.set({ email, createdAt: Date.now(), page: String(fd.get("page") ?? "").slice(0, 200) });
      saved = true;
    } catch (err) {
      console.error("[newsletter] Saving to Firestore failed", err);
    }
  }
  if (already) return { ok: true, already: true };

  // Let the main inbox know (only the first quote recipient — not the estimator).
  let emailed = false;
  try {
    const company = await getCompany();
    const to = quoteRecipients(company).slice(0, 1);
    if (to.length) {
      await sendSiteEmail({
        to,
        subject: `New newsletter subscriber — ${email}`,
        text: `${email} subscribed to the newsletter on the website.`,
        html: `<p style="font-family:Arial,sans-serif;color:#1d2228"><strong>${escapeHtml(email)}</strong> subscribed to the newsletter on the website.</p>`,
      });
      emailed = true;
    }
  } catch (err) {
    console.error("[newsletter] Notification email failed", err);
  }

  if (!saved && !emailed) return { ok: false, error: "Sorry, that didn't work. Please try again later." };
  return { ok: true, already: false };
}
