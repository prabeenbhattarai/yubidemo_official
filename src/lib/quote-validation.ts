// Field rules for the quote form. Shared by the browser (instant feedback) and
// the server action (the real check — browser checks can be bypassed).

export type QuoteFields = {
  name: string;
  company: string;
  email: string;
  phone: string;
  inquiry: string;
  message: string;
};

export type FieldErrors = Partial<Record<keyof QuoteFields, string>>;

/**
 * Turns whatever the visitor typed after the +61 box into E.164 (+61XXXXXXXXX),
 * or null if it isn't a real Australian mobile or landline. Accepts
 * "0412 345 678", "412345678", "(02) 9876 5432", or a pasted "+61 412 345 678".
 */
export function toAuPhone(raw: string): string | null {
  let d = raw.replace(/[^\d+]/g, "");
  if (d.startsWith("+61")) d = d.slice(3);
  else if (d.startsWith("61") && d.length === 11) d = d.slice(2);
  d = d.replace(/^0/, "");
  // Mobiles start with 4, landlines with 2 (NSW/ACT), 3 (VIC/TAS), 7 (QLD), 8 (SA/WA/NT).
  if (!/^[23478]\d{8}$/.test(d)) return null;
  return `+61${d}`;
}

/** +61412345678 → +61 412 345 678, +61298765432 → +61 2 9876 5432 */
export function formatAuPhone(e164: string): string {
  const d = e164.slice(3);
  return d.startsWith("4")
    ? `+61 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
    : `+61 ${d[0]} ${d.slice(1, 5)} ${d.slice(5)}`;
}

/** Numbers like 0400 000 000 or 0412 345 678 that people type to get past a form. */
export function looksLikeFakePhone(e164: string): boolean {
  const rest = e164.slice(4); // the 8 digits after the area/mobile prefix
  return /^(\d)\1{7}$/.test(rest) || rest === "12345678";
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const LINK = /https?:\/\/|www\.|\.(com|net|org|ru|xyz)\b/i;

export const MESSAGE_MIN = 20;

export function validateQuoteFields(f: QuoteFields): FieldErrors {
  const e: FieldErrors = {};

  const name = f.name.trim();
  if (!name) e.name = "Please enter your name.";
  else if (name.length < 2 || !/\p{L}/u.test(name)) e.name = "Please enter your real name.";
  else if (LINK.test(name) || /\d{3,}/.test(name)) e.name = "Your name can't contain links or numbers.";

  const company = f.company.trim();
  if (company && LINK.test(company)) e.company = "Please enter the company name, not a website.";

  const email = f.email.trim();
  if (!email) e.email = "Please enter your email.";
  else if (!EMAIL.test(email)) e.email = "Please enter a valid email, e.g. name@company.com.au.";

  const phone = toAuPhone(f.phone);
  if (!f.phone.trim()) e.phone = "Please enter your contact number.";
  else if (!phone) e.phone = "Enter an Australian mobile (4XX XXX XXX) or landline with area code (2 XXXX XXXX).";
  else if (looksLikeFakePhone(phone)) e.phone = "Please enter a real contact number.";

  if (!f.inquiry.trim()) e.inquiry = "Please choose what your enquiry is about.";

  const message = f.message.trim();
  if (!message) e.message = "Please describe the job.";
  else if (message.length < MESSAGE_MIN)
    e.message = `Please add a few more details — what, where and when (at least ${MESSAGE_MIN} characters).`;

  return e;
}
