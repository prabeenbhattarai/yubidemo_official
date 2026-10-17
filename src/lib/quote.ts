import "server-only";
import { createHash } from "node:crypto";
import { resolveMx } from "node:dns/promises";
import nodemailer from "nodemailer";
import { db, isFirebaseConfigured } from "./firebase-admin";

/* ------------------------------- TYPES ------------------------------- */

export type QuoteInput = {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  page: string;
};

/** clean → emailed to everyone, flagged → emailed to the primary inbox only, blocked → not emailed. */
export type QuoteStatus = "clean" | "flagged" | "blocked";

export type QuoteRecord = QuoteInput & {
  id?: string;
  status: QuoteStatus;
  score: number;
  reasons: string[];
  emailed: boolean;
  createdAt: number;
};

/* ----------------------------- TURNSTILE ----------------------------- */

// Cloudflare's published test keys: they always pass. Used until real keys are
// added so the form keeps working in development.
const TEST_SECRET = "1x0000000000000000000000000000000AA";

export async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret && process.env.NODE_ENV === "production") {
    console.warn("[quote] TURNSTILE_SECRET_KEY is not set — the human check is not enforced.");
  }
  if (!token) return false;
  const body = new URLSearchParams({ secret: secret || TEST_SECRET, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[quote] Turnstile verification failed", err);
    return false;
  }
}

/* ---------------------------- SCAM SCORING ---------------------------- */

// Scores add up; >= BLOCK is never emailed, >= FLAG is emailed as possible spam.
const BLOCK = 100;
const FLAG = 30;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com", "temp-mail.org",
  "yopmail.com", "trashmail.com", "sharklasers.com", "getnada.com", "dispostable.com",
  "maildrop.cc", "throwawaymail.com", "fakeinbox.com", "mailnesia.com", "tempail.com",
  "emailondeck.com", "mohmal.com", "burnermail.io", "spamgourmet.com", "mintemail.com",
]);

// Typical pitches sent through contact forms — not anything a demolition customer writes.
const SPAM_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\b(seo|search engine optimi[sz]ation|backlinks?|domain authority|google (ranking|first page))\b/i, label: "SEO pitch" },
  { re: /\b(web ?design|website redesign|app development|wordpress)\b/i, label: "web design pitch" },
  { re: /\b(crypto|bitcoin|btc|forex|nft|investment opportunity)\b/i, label: "crypto/investment" },
  { re: /\b(loan|business funding|merchant cash|credit line)\b/i, label: "finance offer" },
  { re: /\b(casino|viagra|cialis|porn|xxx|dating)\b/i, label: "adult/gambling" },
  { re: /\b(lead generation|more leads|guest post|social media marketing|virtual assistant)\b/i, label: "marketing pitch" },
  { re: /\b(unsubscribe|this is not spam|limited time offer)\b/i, label: "bulk-mail wording" },
];

async function emailDomainAcceptsMail(domain: string): Promise<boolean> {
  try {
    const mx = await Promise.race([
      resolveMx(domain),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
    ]);
    return mx.length > 0;
  } catch (err) {
    // A slow or failing DNS lookup should not punish a real customer.
    return (err as NodeJS.ErrnoException).code !== "ENOTFOUND" && (err as NodeJS.ErrnoException).code !== "ENODATA";
  }
}

/** Hard check, run before scoring: a quote we can't reply to is useless. */
export async function checkEmailDomain(email: string): Promise<string | null> {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (DISPOSABLE_DOMAINS.has(domain)) return "Please use your regular email, not a temporary one.";
  if (!(await emailDomainAcceptsMail(domain)))
    return `“${domain}” can't receive email — please check the spelling.`;
  return null;
}

export function scoreQuote(q: QuoteInput): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(reason);
  };

  const text = `${q.name} ${q.company} ${q.message}`;
  const links = (q.message.match(/https?:\/\/|www\./gi) ?? []).length;
  if (links >= 3) add(40, `${links} links in message`);
  else if (links > 0) add(10, "Link in message");

  for (const p of SPAM_PATTERNS) if (p.re.test(text)) add(25, `Looks like a ${p.label}`);

  if (/[Ѐ-ӿ一-鿿؀-ۿ]/.test(text)) add(20, "Non-English script");
  if (/https?:\/\/|www\./i.test(q.name)) add(50, "Link in name field");
  const letters = q.message.replace(/[^a-z]/gi, "");
  if (letters.length > 20 && letters === letters.toUpperCase()) add(10, "Message is all capitals");

  return { score, reasons };
}

export function statusFor(score: number): QuoteStatus {
  if (score >= BLOCK) return "blocked";
  if (score >= FLAG) return "flagged";
  return "clean";
}

/* ----------------------------- RATE LIMIT ----------------------------- */

const MAX_PER_HOUR = 3;
const HOUR = 60 * 60 * 1000;
// Fallback only — serverless instances do not share memory, so Firestore is the real limit.
const memoryHits = new Map<string, number[]>();

export function hashIp(ip: string | null): string {
  return createHash("sha256").update(`yubi:${ip ?? "unknown"}`).digest("hex").slice(0, 32);
}

/** Records this attempt and returns true when the visitor is over the hourly limit. */
export async function isRateLimited(ipHash: string): Promise<boolean> {
  const now = Date.now();
  if (!isFirebaseConfigured()) {
    const hits = (memoryHits.get(ipHash) ?? []).filter((t) => now - t < HOUR);
    hits.push(now);
    memoryHits.set(ipHash, hits);
    return hits.length > MAX_PER_HOUR;
  }
  const ref = db().collection("quoteRateLimits").doc(ipHash);
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const hits = ((snap.data()?.hits as number[] | undefined) ?? []).filter((t) => now - t < HOUR);
    hits.push(now);
    tx.set(ref, { hits });
    return hits.length > MAX_PER_HOUR;
  });
}

/* ------------------------------- EMAIL ------------------------------- */

export function parseEmails(list: string): string[] {
  return list
    .split(/[,;\s]+/)
    .map((e) => e.trim())
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendQuoteEmail(
  q: QuoteInput,
  to: string[],
  flagged: { reasons: string[] } | null
): Promise<void> {
  const who = q.company ? `${q.name} (${q.company})` : q.name;
  const subject = `${flagged ? "[POSSIBLE SPAM] " : ""}New quote request — ${q.service || "General"} — ${who}`;
  const rows: [string, string][] = [
    ["Name", q.name],
    ["Company", q.company || "—"],
    ["Email", q.email],
    ["Phone", q.phone],
    ["Service", q.service || "Not specified"],
    ["Sent from", q.page || "Website"],
  ];
  const text = [
    flagged ? `This request was flagged as possible spam: ${flagged.reasons.join("; ")}\n` : "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    q.message,
    "",
    "Reply to this email to answer the customer directly.",
  ].join("\n");
  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;color:#1d2228">
  ${flagged ? `<p style="background:#fff3cd;border:1px solid #ffe08a;padding:12px;margin:0 0 16px"><strong>Possible spam:</strong> ${esc(flagged.reasons.join("; "))}</p>` : ""}
  <h2 style="margin:0 0 16px;color:#d63a2f">New quote request</h2>
  <table cellpadding="8" style="border-collapse:collapse;width:100%">
    ${rows.map(([k, v]) => `<tr><td style="border-bottom:1px solid #eee;width:110px;color:#6b7280">${k}</td><td style="border-bottom:1px solid #eee"><strong>${esc(v)}</strong></td></tr>`).join("")}
  </table>
  <h3 style="margin:24px 0 8px">Message</h3>
  <p style="white-space:pre-wrap;margin:0;line-height:1.5">${esc(q.message)}</p>
  <p style="margin-top:24px;color:#6b7280;font-size:13px">Reply to this email to answer ${esc(q.name)} directly.</p>
</div>`;

  await sendSiteEmail({ to, replyTo: { name: q.name, address: q.email }, subject, text, html });
}

/** Sends an email from the site's Google account. In development without SMTP set up, it logs instead. */
export async function sendSiteEmail(mail: {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: { name: string; address: string };
}): Promise<void> {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "production") throw new Error("SMTP_USER / SMTP_PASS are not set.");
    console.log(`[email] Email not configured — would send to ${mail.to.join(", ")}:\n${mail.subject}\n${mail.text}`);
    return;
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    // Google shows App Passwords as "abcd efgh ijkl mnop"; accept it with or without spaces.
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS?.replace(/\s+/g, "") },
  });
  await transport.sendMail({
    from: { name: "Yubi Demolition Website", address: process.env.SMTP_USER! },
    ...mail,
  });
}

/** Everyone who gets quote emails, in order — the first is the main inbox. */
export function quoteRecipients(company: { quoteRecipients?: string; email: string }): string[] {
  return parseEmails(company.quoteRecipients || process.env.QUOTE_TO_EMAIL || company.email);
}

export { esc as escapeHtml };

/* ------------------------------- STORAGE ------------------------------- */

export async function saveQuote(record: QuoteRecord & { ipHash: string; userAgent: string }): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await db().collection("quotes").add(record);
}

export async function getQuotes(limit = 200): Promise<QuoteRecord[]> {
  if (!isFirebaseConfigured()) return [];
  const snap = await db().collection("quotes").orderBy("createdAt", "desc").limit(limit).get();
  // Leave out ipHash / userAgent: they're only for rate limiting.
  return snap.docs.map((d) => {
    const q = d.data() as QuoteRecord;
    return {
      id: d.id,
      name: q.name,
      company: q.company ?? "",
      email: q.email,
      phone: q.phone,
      service: q.service,
      message: q.message,
      page: q.page,
      status: q.status,
      score: q.score,
      reasons: q.reasons ?? [],
      emailed: q.emailed,
      createdAt: q.createdAt,
    };
  });
}

/** Emails a saved (usually flagged or blocked) quote to everyone and marks it clean. */
export async function forwardQuote(id: string, to: string[]): Promise<void> {
  const ref = db().collection("quotes").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Quote not found");
  const q = snap.data() as QuoteRecord;
  await sendQuoteEmail(
    { name: q.name, company: q.company ?? "", email: q.email, phone: q.phone, service: q.service, message: q.message, page: q.page },
    to,
    null
  );
  await ref.update({ status: "clean", emailed: true });
}
