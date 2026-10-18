import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { bucket, db, isFirebaseConfigured } from "./firebase-admin";

export type ApplicationRecord = {
  id?: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  suburb: string;
  workRights: string;
  experience: string;
  licences: string;
  message: string;
  cvPath: string;
  cvName: string;
  emailed: boolean;
  createdAt: number;
};

/* ------------------------------ CV FILES ------------------------------ */

export type CvKind = { ext: "pdf" | "doc" | "docx"; mime: string };

/**
 * Identifies the CV from its first bytes rather than trusting the file name,
 * so a renamed script or image can't be passed off as a CV.
 */
export function sniffCv(bytes: Buffer, fileName: string): CvKind | null {
  const head = bytes.subarray(0, 8);
  if (head.subarray(0, 5).toString("latin1") === "%PDF-") return { ext: "pdf", mime: "application/pdf" };
  // Legacy Word (.doc): OLE compound document signature.
  if (head.equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) {
    return { ext: "doc", mime: "application/msword" };
  }
  // .docx is a zip; only accept it when it's named as a Word document.
  if (head.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) && /\.docx$/i.test(fileName)) {
    return { ext: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
  }
  return null;
}

/** A tidy attachment name like "Sarah Lee - CV.pdf". */
export function cvFileName(name: string, ext: string) {
  const clean = name.replace(/[^\p{L}\p{N} .'-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 60) || "Applicant";
  return `${clean} - CV.${ext}`;
}

/** Stored privately — CVs are personal documents, so no public link is ever made. */
export async function uploadCv(jobId: string, bytes: Buffer, kind: CvKind): Promise<string> {
  const path = `applications/${jobId}/${Date.now()}-${randomUUID()}.${kind.ext}`;
  await bucket().file(path).save(bytes, { resumable: false, metadata: { contentType: kind.mime } });
  return path;
}

export async function deleteCv(path: string) {
  if (!path) return;
  await bucket().file(path).delete({ ignoreNotFound: true });
}

/** A short-lived download link for the admin panel. */
export async function cvDownloadUrl(path: string, downloadName: string): Promise<string> {
  const [url] = await bucket().file(path).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 10 * 60 * 1000,
    responseDisposition: `attachment; filename="${downloadName.replace(/"/g, "")}"`,
  });
  return url;
}

/* --------------------------- ONE PER PERSON --------------------------- */

// One key document per (job, email) and per (job, phone). Creating them in the
// same transaction as the application means two people can't slip past the
// check at the same moment, and no database index is needed. Keys are hashed
// so the document IDs don't expose anyone's email or phone number.
const KEYS = "applicationKeys";

function keyIds(jobId: string, email: string, phoneE164: string) {
  const h = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 40);
  return [`${jobId}_e_${h(email.trim().toLowerCase())}`, `${jobId}_p_${h(phoneE164)}`];
}

/** True if this email or phone number has already applied for this job. */
export async function hasApplied(jobId: string, email: string, phoneE164: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  const refs = keyIds(jobId, email, phoneE164).map((id) => db().collection(KEYS).doc(id));
  const snaps = await db().getAll(...refs);
  return snaps.some((s) => s.exists);
}

/**
 * Saves the application and its duplicate-check keys together and returns the
 * new application's ID — or null (saving nothing) if they've already applied.
 */
export async function saveApplication(record: ApplicationRecord, phoneE164: string): Promise<string | null> {
  const appRef = db().collection("applications").doc();
  const keyRefs = keyIds(record.jobId, record.email, phoneE164).map((id) => db().collection(KEYS).doc(id));
  return db().runTransaction(async (tx) => {
    const snaps = await tx.getAll(...keyRefs);
    if (snaps.some((s) => s.exists)) return null;
    keyRefs.forEach((ref) => tx.create(ref, { applicationId: appRef.id, createdAt: record.createdAt }));
    tx.create(appRef, record);
    return appRef.id;
  });
}

export async function markEmailed(id: string) {
  // Best effort — the application is already saved.
  await db().collection("applications").doc(id).update({ emailed: true }).catch(() => {});
}

/* ------------------------------- ADMIN ------------------------------- */

export async function getApplications(limit = 300): Promise<ApplicationRecord[]> {
  if (!isFirebaseConfigured()) return [];
  const snap = await db().collection("applications").orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as ApplicationRecord) }));
}

export async function getApplication(id: string): Promise<ApplicationRecord | null> {
  const snap = await db().collection("applications").doc(id).get();
  return snap.exists ? { id: snap.id, ...(snap.data() as ApplicationRecord) } : null;
}

/** Removes the application, its CV, and its duplicate-check keys (so they could apply again). */
export async function deleteApplication(id: string): Promise<void> {
  const app = await getApplication(id);
  if (!app) return;
  const keys = await db().collection(KEYS).where("applicationId", "==", id).get();
  const batch = db().batch();
  keys.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(db().collection("applications").doc(id));
  await batch.commit();
  await deleteCv(app.cvPath).catch((err) => console.error("[careers] CV delete failed", err));
}
