"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE,
  adminSetupProblem,
  checkPassword,
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth";
import {
  addGalleryImages,
  deleteDoc,
  deleteGalleryImages,
  ensureGallerySaved,
  getCompany,
  getGallery,
  moveGalleryImages,
  saveCompany,
  saveDoc,
  saveHome,
} from "@/lib/content";
import { forwardQuote, parseEmails } from "@/lib/quote";
import { deleteApplication } from "@/lib/careers";
import { JOB_TYPES, type Company, type Home, type Service, type Project, type Faq, type GalleryFolder, type Job, type JobType } from "@/lib/content-types";

/* ------------------------------- AUTH ------------------------------- */

async function requireAuth() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) redirect("/api/admin/yubidemo/login");
}

export async function login(_prev: unknown, formData: FormData) {
  const problem = adminSetupProblem();
  if (problem) {
    return { error: `Admin login is locked until it's set up in Vercel: ${problem} Add it, then redeploy.` };
  }
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    return { error: "Incorrect password. Try again." };
  }
  const token = await createSessionToken();
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/api/admin/yubidemo");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/api/admin/yubidemo/login");
}

/* ---------------------------- HELPERS ---------------------------- */

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}
function lines(fd: FormData, key: string): string[] {
  return str(fd, key)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function refreshPublic() {
  revalidatePath("/", "layout");
}

/* ---------------------------- COMPANY ---------------------------- */

export async function saveCompanyAction(fd: FormData) {
  await requireAuth();
  const data: Company = {
    name: str(fd, "name"),
    legalName: str(fd, "legalName"),
    tagline: str(fd, "tagline"),
    phone: str(fd, "phone"),
    phoneHref: str(fd, "phoneHref") || str(fd, "phone").replace(/\s+/g, ""),
    email: str(fd, "email"),
    supportEmail: str(fd, "supportEmail"),
    address: str(fd, "address"),
    addressShort: str(fd, "addressShort"),
    website: str(fd, "website"),
    abn: str(fd, "abn"),
    quoteRecipients: str(fd, "quoteRecipients"),
  };
  await saveCompany(data);
  refreshPublic();
  redirect("/api/admin/yubidemo/company?saved=1");
}

/* ---------------------------- HOMEPAGE ---------------------------- */

export async function saveHomeAction(fd: FormData) {
  await requireAuth();
  const stats = [0, 1, 2].map((i) => ({
    value: str(fd, `stat${i}value`),
    label: str(fd, `stat${i}label`),
  }));
  const safetyCards = [0, 1, 2].map((i) => ({
    title: str(fd, `safety${i}title`),
    text: str(fd, `safety${i}text`),
  }));
  const data: Home = {
    heroTitle: str(fd, "heroTitle"),
    heroSubtitle: str(fd, "heroSubtitle"),
    heroImage: str(fd, "heroImage"),
    responseTitle: str(fd, "responseTitle"),
    responseText: str(fd, "responseText"),
    aboutTitle: str(fd, "aboutTitle"),
    aboutP1: str(fd, "aboutP1"),
    aboutP2: str(fd, "aboutP2"),
    stats,
    missionText: str(fd, "missionText"),
    visionText: str(fd, "visionText"),
    servicesTitle: str(fd, "servicesTitle"),
    servicesSubtitle: str(fd, "servicesSubtitle"),
    whyTitle: str(fd, "whyTitle"),
    whySubtitle: str(fd, "whySubtitle"),
    whyPoints: lines(fd, "whyPoints"),
    whyImage: str(fd, "whyImage"),
    sustainEyebrow: str(fd, "sustainEyebrow"),
    sustainTitle: str(fd, "sustainTitle"),
    sustainText: str(fd, "sustainText"),
    sustainImage: str(fd, "sustainImage"),
    safetyCards,
    projectsTitle: str(fd, "projectsTitle"),
    projectsText: str(fd, "projectsText"),
  };
  await saveHome(data);
  refreshPublic();
  redirect("/api/admin/yubidemo/homepage?saved=1");
}

/* ---------------------------- SERVICES ---------------------------- */

export async function saveServiceAction(fd: FormData) {
  await requireAuth();
  const data: Service = {
    id: str(fd, "id") || undefined,
    slug: str(fd, "slug"),
    title: str(fd, "title"),
    icon: (str(fd, "icon") || "site") as Service["icon"],
    excerpt: str(fd, "excerpt"),
    description: lines(fd, "description"),
    image: str(fd, "image"),
    order: Number(str(fd, "order") || 0),
  };
  await saveDoc("services", data);
  refreshPublic();
  redirect("/api/admin/yubidemo/services?saved=1");
}

export async function deleteServiceAction(fd: FormData) {
  await requireAuth();
  await deleteDoc("services", str(fd, "id"));
  refreshPublic();
  redirect("/api/admin/yubidemo/services?deleted=1");
}

/* ---------------------------- PROJECTS ---------------------------- */

export async function saveProjectAction(fd: FormData) {
  await requireAuth();
  const data: Project = {
    id: str(fd, "id") || undefined,
    title: str(fd, "title"),
    location: str(fd, "location"),
    category: str(fd, "category"),
    blurb: str(fd, "blurb"),
    image: str(fd, "image"),
    color: str(fd, "color") || "#7c8590",
    order: Number(str(fd, "order") || 0),
  };
  await saveDoc("projects", data);
  refreshPublic();
  redirect("/api/admin/yubidemo/projects?saved=1");
}

export async function deleteProjectAction(fd: FormData) {
  await requireAuth();
  await deleteDoc("projects", str(fd, "id"));
  refreshPublic();
  redirect("/api/admin/yubidemo/projects?deleted=1");
}

/* ---------------------------- FAQS ---------------------------- */

export async function saveFaqAction(fd: FormData) {
  await requireAuth();
  const data: Faq = {
    id: str(fd, "id") || undefined,
    question: str(fd, "question"),
    answer: str(fd, "answer"),
    order: Number(str(fd, "order") || 0),
  };
  await saveDoc("faqs", data);
  refreshPublic();
  redirect("/api/admin/yubidemo/faqs?saved=1");
}

export async function deleteFaqAction(fd: FormData) {
  await requireAuth();
  await deleteDoc("faqs", str(fd, "id"));
  refreshPublic();
  redirect("/api/admin/yubidemo/faqs?deleted=1");
}

/* ---------------------------- GALLERY ---------------------------- */
// Folder actions are form posts (redirect back with a message); the photo
// actions are called from the bulk uploader / selection bar and return a result.

const GALLERY = "/api/admin/yubidemo/gallery";

export async function createGalleryFolderAction(fd: FormData) {
  await requireAuth();
  const name = str(fd, "name").slice(0, 60);
  if (!name) redirect(`${GALLERY}?error=name`);
  await ensureGallerySaved();
  const id = await saveDoc<GalleryFolder>("galleryFolders", { name, order: Date.now() });
  refreshPublic();
  redirect(`${GALLERY}?folder=${id}&saved=1`);
}

export async function renameGalleryFolderAction(fd: FormData) {
  await requireAuth();
  const id = str(fd, "id");
  const name = str(fd, "name").slice(0, 60);
  if (!id || !name) redirect(`${GALLERY}?error=name`);
  await ensureGallerySaved();
  await saveDoc<GalleryFolder>("galleryFolders", { id, name, order: Number(str(fd, "order") || Date.now()) });
  refreshPublic();
  redirect(`${GALLERY}?folder=${id}&saved=1`);
}

export async function deleteGalleryFolderAction(fd: FormData) {
  await requireAuth();
  const id = str(fd, "id");
  await ensureGallerySaved();
  const inFolder = (await getGallery()).filter((g) => g.folderId === id).length;
  // Never delete photos by accident: a folder must be emptied first.
  if (inFolder > 0) redirect(`${GALLERY}?folder=${id}&error=notempty`);
  await deleteDoc("galleryFolders", id);
  refreshPublic();
  redirect(`${GALLERY}?deleted=1`);
}

export type GalleryResult = { ok: true } | { ok: false; error: string };

const isOwnUpload = (url: string) =>
  url.startsWith("https://storage.googleapis.com/") || url.startsWith("https://firebasestorage.googleapis.com/");

/** Saves photos that the bulk uploader has already put in Firebase Storage. */
export async function addGalleryPhotosAction(folderId: string, urls: string[]): Promise<GalleryResult> {
  await requireAuth();
  const clean = urls.filter((u) => typeof u === "string" && isOwnUpload(u)).slice(0, 500);
  if (!folderId || !clean.length) return { ok: false, error: "Nothing to add." };
  try {
    await ensureGallerySaved();
    const start = Date.now();
    await addGalleryImages(clean.map((url, i) => ({ url, alt: "Yubi Demolition project photo", folderId, order: start + i })));
    refreshPublic();
    return { ok: true };
  } catch (err) {
    console.error("[gallery] Adding photos failed", err);
    return { ok: false, error: "Couldn't save the photos. Please try again." };
  }
}

export async function moveGalleryPhotosAction(ids: string[], folderId: string): Promise<GalleryResult> {
  await requireAuth();
  if (!ids.length || !folderId) return { ok: false, error: "Choose photos and a folder." };
  try {
    await ensureGallerySaved();
    await moveGalleryImages(ids.slice(0, 1000), folderId);
    refreshPublic();
    return { ok: true };
  } catch (err) {
    console.error("[gallery] Moving photos failed", err);
    return { ok: false, error: "Couldn't move the photos. Please try again." };
  }
}

export async function deleteGalleryPhotosAction(ids: string[]): Promise<GalleryResult> {
  await requireAuth();
  if (!ids.length) return { ok: false, error: "Choose photos to delete." };
  try {
    await ensureGallerySaved();
    await deleteGalleryImages(ids.slice(0, 1000));
    refreshPublic();
    return { ok: true };
  } catch (err) {
    console.error("[gallery] Deleting photos failed", err);
    return { ok: false, error: "Couldn't delete the photos. Please try again." };
  }
}

/* ---------------------------- QUOTES ---------------------------- */

export async function forwardQuoteAction(fd: FormData) {
  await requireAuth();
  const company = await getCompany();
  const to = parseEmails(company.quoteRecipients || process.env.QUOTE_TO_EMAIL || company.email);
  try {
    await forwardQuote(str(fd, "id"), to);
  } catch (err) {
    console.error("[quote] Forward failed", err);
    redirect("/api/admin/yubidemo/quotes?error=1");
  }
  redirect("/api/admin/yubidemo/quotes?forwarded=1");
}

export async function deleteQuoteAction(fd: FormData) {
  await requireAuth();
  await deleteDoc("quotes", str(fd, "id"));
  redirect("/api/admin/yubidemo/quotes?deleted=1");
}

/* ---------------------------- CAREERS ---------------------------- */

export async function saveJobAction(fd: FormData) {
  await requireAuth();
  const type = str(fd, "type") as JobType;
  const data: Job = {
    id: str(fd, "id") || undefined,
    title: str(fd, "title"),
    type: JOB_TYPES.includes(type) ? type : "Full-time",
    location: str(fd, "location"),
    summary: str(fd, "summary"),
    details: lines(fd, "details"),
    open: fd.get("open") === "on",
    order: Number(str(fd, "order") || 0),
  };
  await saveDoc("jobs", data);
  refreshPublic();
  redirect("/api/admin/yubidemo/careers?saved=1");
}

export async function deleteJobAction(fd: FormData) {
  await requireAuth();
  await deleteDoc("jobs", str(fd, "id"));
  refreshPublic();
  redirect("/api/admin/yubidemo/careers?deleted=1");
}

export async function deleteApplicationAction(fd: FormData) {
  await requireAuth();
  await deleteApplication(str(fd, "id"));
  redirect("/api/admin/yubidemo/careers?deleted=1#applications");
}
