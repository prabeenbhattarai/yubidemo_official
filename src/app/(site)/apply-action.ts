"use server";

import { headers } from "next/headers";
import { getCompany, getOpenJobs } from "@/lib/content";
import { isFirebaseConfigured } from "@/lib/firebase-admin";
import {
  validateApplication,
  validateCvMeta,
  type ApplicationErrors,
  type ApplicationFields,
} from "@/lib/application-validation";
import { formatAuPhone, toAuPhone } from "@/lib/quote-validation";
import {
  cvFileName,
  deleteCv,
  hasApplied,
  markEmailed,
  saveApplication,
  sniffCv,
  uploadCv,
  type ApplicationRecord,
} from "@/lib/careers";
import {
  checkEmailDomain,
  escapeHtml,
  hashIp,
  isRateLimited,
  parseEmails,
  quoteRecipients,
  sendSiteEmail,
  verifyTurnstile,
} from "@/lib/quote";

export type ApplyState =
  | { ok: true; jobId: string; emailed: boolean }
  | { ok: false; error: string; fieldErrors?: ApplicationErrors; duplicate?: boolean; jobId?: string }
  | null;

const MIN_FILL_MS = 5000;
const DUPLICATE =
  "You've already applied for this role with these details. Our team has your application and will be in touch if you're shortlisted.";

function str(fd: FormData, key: string, max: number) {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

export async function submitApplication(_prev: ApplyState, fd: FormData): Promise<ApplyState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");

  const fields: ApplicationFields = {
    jobId: str(fd, "jobId", 100),
    name: str(fd, "name", 120),
    email: str(fd, "email", 200).toLowerCase(),
    phone: str(fd, "phone", 40),
    suburb: str(fd, "suburb", 80),
    workRights: str(fd, "workRights", 80),
    experience: str(fd, "experience", 40),
    licences: str(fd, "licences", 300),
    message: str(fd, "message", 2000),
  };
  const cv = fd.get("cv");
  const file = cv instanceof File ? cv : null;

  const fieldErrors = validateApplication(fields);
  const cvError = validateCvMeta(file);
  if (cvError) fieldErrors.cv = cvError;
  if (!fieldErrors.email) {
    const domainError = await checkEmailDomain(fields.email);
    if (domainError) fieldErrors.email = domainError;
  }
  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors, jobId: fields.jobId };
  }

  const job = (await getOpenJobs()).find((j) => j.id === fields.jobId);
  if (!job) return { ok: false, error: "Sorry, this job is no longer open for applications." };

  if (!(await verifyTurnstile(str(fd, "cf-turnstile-response", 4096), ip))) {
    return { ok: false, error: "Please complete the “Verify you are human” check and try again.", jobId: job.id };
  }

  // Bot traps: hidden field, or a full application in under 5 seconds. Bots get
  // a normal-looking reply so they don't learn what tripped them.
  if (str(fd, "app_ref", 200) || Date.now() - Number(str(fd, "t", 20) || 0) < MIN_FILL_MS) {
    return { ok: true, jobId: job.id!, emailed: false };
  }

  const bytes = Buffer.from(await file!.arrayBuffer());
  const kind = sniffCv(bytes, file!.name);
  if (!kind) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: { cv: "That file doesn't look like a real PDF or Word document. Please attach your CV again." },
      jobId: job.id,
    };
  }

  // Counted only once the application is complete and valid, so someone fixing
  // a wrong file isn't locked out.
  if (await isRateLimited(hashIp(`apply:${ip}`))) {
    return { ok: false, error: "You've sent several applications recently. Please try again in an hour." };
  }

  const phoneE164 = toAuPhone(fields.phone)!;
  const record: ApplicationRecord = {
    jobId: job.id!,
    jobTitle: job.title,
    name: fields.name,
    email: fields.email,
    phone: formatAuPhone(phoneE164),
    suburb: fields.suburb,
    workRights: fields.workRights,
    experience: fields.experience,
    licences: fields.licences,
    message: fields.message,
    cvPath: "",
    cvName: cvFileName(fields.name, kind.ext),
    emailed: false,
    createdAt: Date.now(),
  };

  // One application per person per job, matched on email OR phone number.
  // This needs the database; without Firebase every application is emailed.
  let appId: string | null = null;
  if (isFirebaseConfigured()) {
    try {
      if (await hasApplied(job.id!, fields.email, phoneE164)) {
        return { ok: false, error: DUPLICATE, duplicate: true, jobId: job.id };
      }
      record.cvPath = await uploadCv(job.id!, bytes, kind);
      appId = await saveApplication(record, phoneE164);
      if (!appId) {
        await deleteCv(record.cvPath);
        return { ok: false, error: DUPLICATE, duplicate: true, jobId: job.id };
      }
    } catch (err) {
      console.error("[careers] Saving the application failed", err);
    }
  } else if (process.env.NODE_ENV === "production") {
    console.warn("[careers] Firebase is not configured — duplicate applications can't be detected.");
  }

  let emailed = false;
  try {
    const company = await getCompany();
    const to = parseEmails(process.env.CAREERS_TO_EMAIL || "").length
      ? parseEmails(process.env.CAREERS_TO_EMAIL!)
      : quoteRecipients(company).slice(0, 1);
    const rows: [string, string][] = [
      ["Job", `${job.title} (${job.type}, ${job.location})`],
      ["Name", record.name],
      ["Email", record.email],
      ["Phone", record.phone],
      ["Suburb", record.suburb],
      ["Work rights", record.workRights],
      ["Experience", record.experience],
      ["Licences / tickets", record.licences || "—"],
    ];
    await sendSiteEmail({
      to,
      replyTo: { name: record.name, address: record.email },
      subject: `New job application — ${job.title} — ${record.name}`,
      text: [...rows.map(([k, v]) => `${k}: ${v}`), "", "Message:", record.message || "—", "", "CV attached. Reply to this email to contact the applicant."].join("\n"),
      html: `
<div style="font-family:Arial,sans-serif;max-width:600px;color:#1d2228">
  <h2 style="margin:0 0 16px;color:#d63a2f">New job application</h2>
  <table cellpadding="8" style="border-collapse:collapse;width:100%">
    ${rows.map(([k, v]) => `<tr><td style="border-bottom:1px solid #eee;width:140px;color:#6b7280">${k}</td><td style="border-bottom:1px solid #eee"><strong>${escapeHtml(v)}</strong></td></tr>`).join("")}
  </table>
  <h3 style="margin:24px 0 8px">Message</h3>
  <p style="white-space:pre-wrap;margin:0;line-height:1.5">${escapeHtml(record.message || "—")}</p>
  <p style="margin-top:24px;color:#6b7280;font-size:13px">The CV is attached. Reply to this email to contact ${escapeHtml(record.name)} directly.</p>
</div>`,
      attachments: [{ filename: record.cvName, content: bytes, contentType: kind.mime }],
    });
    emailed = true;
  } catch (err) {
    console.error("[careers] Application email failed", err);
  }

  if (appId && emailed) await markEmailed(appId);

  if (!appId && !emailed) {
    return { ok: false, error: "Sorry, we couldn't send your application. Please try again, or email us your CV.", jobId: job.id };
  }
  return { ok: true, jobId: job.id!, emailed };
}
