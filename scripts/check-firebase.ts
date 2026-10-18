// Confirms .env.local can reach Firebase and shows what's stored.
// Run with:  npm run firebase:check   (prints counts only, never the keys)
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

async function main() {
  for (const k of ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY", "FIREBASE_STORAGE_BUCKET"]) {
    if (!process.env[k]) return console.error(`✗ ${k} is missing in .env.local`);
  }
  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  const db = getFirestore(app);
  console.log(`✓ Connected to Firestore (project ${process.env.FIREBASE_PROJECT_ID})`);
  for (const c of ["singletons", "services", "projects", "faqs", "gallery", "jobs", "quotes", "applications", "subscribers"]) {
    const n = (await db.collection(c).count().get()).data().count;
    console.log(`  ${c.padEnd(13)} ${n}`);
  }

  const bucket = getStorage(app).bucket();
  const [exists] = await bucket.exists();
  if (!exists) return console.error(`✗ Storage bucket "${bucket.name}" not found — check FIREBASE_STORAGE_BUCKET.`);
  const [meta] = await bucket.getMetadata();
  const uniform = meta.iamConfiguration?.uniformBucketLevelAccess?.enabled ?? false;
  console.log(`✓ Storage bucket "${bucket.name}" reachable`);
  if (uniform) {
    console.log(
      "  ! Uniform bucket-level access is ON: public photo links need allUsers → Storage Object Viewer on the bucket."
    );
  }
}

main().catch((err) => {
  console.error("✗ Firebase check failed:", (err as Error).message);
  process.exit(1);
});
