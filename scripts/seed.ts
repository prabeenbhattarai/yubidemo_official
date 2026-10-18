/**
 * Seeds Firestore with the built-in default content so the admin panel starts
 * populated. Run once after you've filled in .env.local:
 *
 *   npm run seed
 *
 * Safe to re-run: singletons are overwritten; collections are only seeded when
 * empty so you don't get duplicates.
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  defaultCompany,
  defaultFaqs,
  defaultGallery,
  defaultGalleryFolders,
  defaultHome,
  defaultProjects,
  defaultServices,
} from "../src/lib/content-types";

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`\n✖ Missing ${name}. Add it to .env.local first.\n`);
    process.exit(1);
  }
  return v;
}

async function main() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: required("FIREBASE_PROJECT_ID"),
        clientEmail: required("FIREBASE_CLIENT_EMAIL"),
        privateKey: required("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
      }),
    });
  }
  const db = getFirestore();

  console.log("Seeding singletons…");
  await db.collection("singletons").doc("company").set(defaultCompany);
  await db.collection("singletons").doc("home").set(defaultHome);

  await seedCollection(db, "services", defaultServices);
  await seedCollection(db, "projects", defaultProjects);
  await seedCollection(db, "faqs", defaultFaqs);
  await seedCollection(db, "galleryFolders", defaultGalleryFolders);
  await seedCollection(db, "gallery", defaultGallery);

  console.log("\n✓ Done. Open /api/admin/yubidemo to manage your content.\n");
  process.exit(0);
}

async function seedCollection(
  db: FirebaseFirestore.Firestore,
  name: string,
  rows: Record<string, unknown>[]
) {
  const existing = await db.collection(name).limit(1).get();
  if (!existing.empty) {
    console.log(`• ${name} already has data — skipping.`);
    return;
  }
  console.log(`Seeding ${name} (${rows.length})…`);
  const batch = db.batch();
  // Rows with an id (e.g. the default gallery folder) keep it, so photos can point at it.
  for (const { id, ...row } of rows as { id?: string }[]) {
    batch.set(id ? db.collection(name).doc(id) : db.collection(name).doc(), row);
  }
  await batch.commit();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
