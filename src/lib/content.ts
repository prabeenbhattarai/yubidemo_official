import "server-only";
import { db, isFirebaseConfigured } from "./firebase-admin";
import {
  defaultCompany,
  defaultFaqs,
  defaultGallery,
  defaultHome,
  defaultJobs,
  defaultProjects,
  defaultServices,
  type Company,
  type Faq,
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

export function getProjects(): Promise<Project[]> {
  return readCollection<Project>("projects", defaultProjects);
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
