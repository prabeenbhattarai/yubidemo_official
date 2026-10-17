"use server";

import { headers } from "next/headers";
import { getCompany } from "@/lib/content";
import { formatAuPhone, toAuPhone, validateQuoteFields, type FieldErrors } from "@/lib/quote-validation";
import {
  checkEmailDomain,
  hashIp,
  isRateLimited,
  quoteRecipients,
  saveQuote,
  scoreQuote,
  sendQuoteEmail,
  statusFor,
  verifyTurnstile,
  type QuoteInput,
} from "@/lib/quote";

export type QuoteState =
  // emailed: the email really went out (vs. only saved, or a bot quietly dropped).
  | { ok: true; emailed: boolean }
  | { ok: false; error: string; fieldErrors?: FieldErrors }
  | null;

const MIN_FILL_MS = 3000;

function str(fd: FormData, key: string, max: number): string {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

export async function submitQuote(_prev: QuoteState, fd: FormData): Promise<QuoteState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  const ipHash = hashIp(ip);
  const userAgent = (h.get("user-agent") ?? "").slice(0, 300);

  const fields = {
    name: str(fd, "name", 120),
    company: str(fd, "company", 160),
    email: str(fd, "email", 200),
    phone: str(fd, "phone", 40),
    inquiry: str(fd, "inquiry", 120),
    message: str(fd, "message", 5000),
  };
  const fieldErrors = validateQuoteFields(fields);
  if (!fieldErrors.email) {
    const domainError = await checkEmailDomain(fields.email);
    if (domainError) fieldErrors.email = domainError;
  }
  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const input: QuoteInput = {
    name: fields.name,
    company: fields.company,
    email: fields.email,
    phone: formatAuPhone(toAuPhone(fields.phone)!),
    service: fields.inquiry,
    message: fields.message,
    page: str(fd, "page", 200),
  };

  if (!(await verifyTurnstile(str(fd, "cf-turnstile-response", 4096), ip))) {
    return { ok: false, error: "Please complete the “Verify you are human” check and try again." };
  }

  // Bot traps: the hidden field is invisible to people, and nobody types a quote in under 3 seconds.
  // Bots get a normal-looking success so they don't learn what tripped them.
  const trapped = str(fd, "contact_ref", 200) !== "";
  const tooFast = Date.now() - Number(str(fd, "t", 20) || 0) < MIN_FILL_MS;

  if (await isRateLimited(ipHash)) {
    return { ok: false, error: "You've sent several requests recently. Please call us instead, or try again in an hour." };
  }

  const { score, reasons } = scoreQuote(input);
  if (trapped) reasons.unshift("Filled the hidden bot-trap field");
  if (tooFast) reasons.unshift("Submitted in under 3 seconds");
  const total = score + (trapped || tooFast ? 100 : 0);
  const status = statusFor(total);

  const company = await getCompany();
  const recipients = quoteRecipients(company);
  // Possible spam only goes to the first (main) inbox so other recipients stay clean.
  const to = status === "clean" ? recipients : recipients.slice(0, 1);

  let emailed = false;
  if (status !== "blocked" && to.length) {
    try {
      await sendQuoteEmail(input, to, status === "flagged" ? { reasons } : null);
      emailed = true;
    } catch (err) {
      console.error("[quote] Email failed", err);
    }
  }

  let saved = false;
  try {
    await saveQuote({ ...input, status, score: total, reasons, emailed, createdAt: Date.now(), ipHash, userAgent });
    saved = true;
  } catch (err) {
    console.error("[quote] Saving to Firestore failed", err);
  }

  if (status !== "blocked" && !emailed && !saved) {
    return {
      ok: false,
      error: `Sorry, we couldn't send your request. Please call us on ${company.phone} or email ${company.email}.`,
    };
  }
  return { ok: true, emailed };
}
