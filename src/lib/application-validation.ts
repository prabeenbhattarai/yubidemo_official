// Field rules for the job application form. Shared by the browser (instant
// feedback) and the server action (the real check).
import { toAuPhone, looksLikeFakePhone } from "./quote-validation";

export const WORK_RIGHTS = [
  "Australian citizen or permanent resident",
  "Visa with full work rights",
  "Visa with limited work rights",
  "No work rights in Australia yet",
] as const;

export const EXPERIENCE = ["Less than 1 year", "1–3 years", "3–5 years", "5+ years"] as const;

/** Vercel caps request bodies at 4.5 MB, so the CV must stay under that with room to spare. */
export const CV_MAX_BYTES = 4 * 1024 * 1024;
export const CV_ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type ApplicationFields = {
  jobId: string;
  name: string;
  email: string;
  phone: string;
  suburb: string;
  workRights: string;
  experience: string;
  licences: string;
  message: string;
};

export type ApplicationErrors = Partial<Record<keyof ApplicationFields | "cv", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const LINK = /https?:\/\/|www\./i;

export function validateCvMeta(file: { name: string; size: number } | null): string | undefined {
  if (!file || !file.size) return "Please attach your CV (PDF or Word).";
  if (!/\.(pdf|docx?|DOCX?|PDF)$/.test(file.name)) return "Your CV must be a PDF or Word document (.pdf, .doc, .docx).";
  if (file.size > CV_MAX_BYTES) return "Your CV is too large — please keep it under 4 MB.";
  return undefined;
}

export function validateApplication(f: ApplicationFields): ApplicationErrors {
  const e: ApplicationErrors = {};
  if (!f.jobId) e.jobId = "Please choose the job you're applying for.";

  const name = f.name.trim();
  if (!name) e.name = "Please enter your full name.";
  else if (name.length < 3 || !/\p{L}/u.test(name) || !/\s/.test(name)) e.name = "Please enter your first and last name.";
  else if (LINK.test(name) || /\d/.test(name)) e.name = "Your name can't contain numbers or links.";

  if (!f.email.trim()) e.email = "Please enter your email.";
  else if (!EMAIL.test(f.email.trim())) e.email = "Please enter a valid email, e.g. name@gmail.com.";

  const phone = toAuPhone(f.phone);
  if (!f.phone.trim()) e.phone = "Please enter your contact number.";
  else if (!phone) e.phone = "Enter an Australian mobile (4XX XXX XXX) or landline with area code.";
  else if (looksLikeFakePhone(phone)) e.phone = "Please enter a real contact number.";

  if (f.suburb.trim().length < 2) e.suburb = "Please enter the suburb you live in.";
  if (!(WORK_RIGHTS as readonly string[]).includes(f.workRights)) e.workRights = "Please choose your work rights.";
  if (!(EXPERIENCE as readonly string[]).includes(f.experience)) e.experience = "Please choose your experience.";
  if (f.licences.length > 300) e.licences = "Please keep this under 300 characters.";
  if (f.message.length > 2000) e.message = "Please keep your message under 2000 characters.";
  else if ((f.message.match(/https?:\/\//gi) ?? []).length > 2) e.message = "Please remove the links from your message.";
  return e;
}
