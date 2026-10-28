import "server-only";
import { db, isFirebaseConfigured } from "./firebase-admin";
import { slugify } from "./gallery";
import {
  defaultCompany,
  defaultFaqs,
  defaultGallery,
  defaultGalleryFolders,
  defaultHome,
  defaultJobs,
  defaultProjects,
  defaultServices,
  type Company,
  type Faq,
  type GalleryFolder,
  type GalleryImage,
  type Home,
  type Job,
  type Project,
  type Service,
} from "./content-types";

/* ------------------------------- READS ------------------------------- */

export async function getCompany(): Promise<Company> {
  if (!isFirebaseConfigured()) return defaultCompany;
  try {
    const snap = await db().collection("singletons").doc("company").get();
    return snap.exists ? { ...defaultCompany, ...(snap.data() as Company) } : defaultCompany;
  } catch {
    return defaultCompany;
  }
}

export async function getHome(): Promise<Home> {
  if (!isFirebaseConfigured()) return defaultHome;
  try {
    const snap = await db().collection("singletons").doc("home").get();
    return snap.exists ? { ...defaultHome, ...(snap.data() as Home) } : defaultHome;
  } catch {
    return defaultHome;
  }
}

async function readCollection<T>(name: string, fallback: T[]): Promise<T[]> {
  if (!isFirebaseConfigured()) return fallback;
  try {
    const snap = await db().collection(name).orderBy("order").get();
    if (snap.empty) return fallback;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as T[];
  } catch {
    return fallback;
  }
}

export function getServices(): Promise<Service[]> {
  return readCollection<Service>("services", defaultServices);
}

export async function getService(slug: string): Promise<Service | null> {
  const services = await getServices();
  return services.find((s) => s.slug === slug) ?? null;
}

export async function getProjects(): Promise<Project[]> {
  const list = await readCollection<Project>("projects", defaultProjects);
  // Older projects were saved before page addresses existed.
  return list.map((p) => ({ ...p, slug: p.slug || slugify(p.title) }));
}

export async function getProjectBySlug(slug: string): Promise<{ project: Project; prev: Project | null; next: Project | null } | null> {
  const list = (await getProjects()).sort((a, b) => a.order - b.order);
  const i = list.findIndex((p) => p.slug === slug);
  if (i < 0) return null;
  return { project: list[i], prev: list[i - 1] ?? null, next: list[i + 1] ?? null };
}

export function getFaqs(): Promise<Faq[]> {
  return readCollection<Faq>("faqs", defaultFaqs);
}

export function getJobs(): Promise<Job[]> {
  return readCollection<Job>("jobs", defaultJobs);
}

export async function getOpenJobs(): Promise<Job[]> {
  return (await getJobs()).filter((j) => j.open && j.id);
}

export function getGallery(): Promise<GalleryImage[]> {
  return readCollection<GalleryImage>("gallery", defaultGallery);
}

export function getGalleryFolders(): Promise<GalleryFolder[]> {
  return readCollection<GalleryFolder>("galleryFolders", defaultGalleryFolders);
}

/* ------------------------------- WRITES ------------------------------- */
// These are only ever called from authenticated admin server actions.

function assertConfigured() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add your FIREBASE_* values to .env.local before saving."
    );
  }
}

export async function saveCompany(data: Company): Promise<void> {
  assertConfigured();
  await db().collection("singletons").doc("company").set(data, { merge: true });
}

export async function saveHome(data: Home): Promise<void> {
  assertConfigured();
  await db().collection("singletons").doc("home").set(data, { merge: true });
}

export async function saveDoc<T extends { id?: string }>(
  collection: string,
  data: T
): Promise<string> {
  assertConfigured();
  const { id, ...rest } = data;
  if (id) {
    await db().collection(collection).doc(id).set(rest, { merge: true });
    return id;
  }
  const ref = await db().collection(collection).add(rest);
  return ref.id;
}

export async function deleteDoc(collection: string, id: string): Promise<void> {
  assertConfigured();
  await db().collection(collection).doc(id).delete();
}

/* --------------------------- GALLERY (bulk) --------------------------- */
// Firestore batches hold at most 500 writes.
async function inBatches<T>(items: T[], write: (batch: FirebaseFirestore.WriteBatch, item: T) => void) {
  for (let i = 0; i < items.length; i += 450) {
    const batch = db().batch();
    items.slice(i, i + 450).forEach((item) => write(batch, item));
    await batch.commit();
  }
}

/**
 * The site shows the built-in photos and folder only while the database is
 * empty. Before the first gallery change, save them for real so they don't
 * vanish the moment a new photo is uploaded.
 */
export async function ensureGallerySaved(): Promise<void> {
  assertConfigured();
  const [folders, photos] = await Promise.all([
    db().collection("galleryFolders").limit(1).get(),
    db().collection("gallery").limit(1).get(),
  ]);
  if (folders.empty) {
    await inBatches(defaultGalleryFolders, (b, { id, ...f }) => b.set(db().collection("galleryFolders").doc(id!), f));
  }
  if (photos.empty) {
    await inBatches(defaultGallery, (b, g) =>
      b.set(db().collection("gallery").doc(), { url: g.url, alt: g.alt, folderId: g.folderId, order: g.order })
    );
  }
}

export async function addGalleryImages(images: Omit<GalleryImage, "id">[]): Promise<void> {
  assertConfigured();
  await inBatches(images, (b, img) => b.set(db().collection("gallery").doc(), img));
}

export async function moveGalleryImages(ids: string[], folderId: string): Promise<void> {
  assertConfigured();
  await inBatches(ids, (b, id) => b.update(db().collection("gallery").doc(id), { folderId }));
}

export async function deleteGalleryImages(ids: string[]): Promise<void> {
  assertConfigured();
  await inBatches(ids, (b, id) => b.delete(db().collection("gallery").doc(id)));
}
