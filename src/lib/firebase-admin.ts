import "server-only";
import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Firebase is considered "configured" only when all three service-account
 * values are present. Until then, the content layer falls back to the built-in
 * defaults so the public site keeps working.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

let app: App | null = null;

function getAdminApp(): App {
  if (getApps().length) return getApp();
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured (missing FIREBASE_* env vars).");
  }
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Private keys stored in env keep their newlines escaped as \n.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  return app;
}

export function db(): Firestore {
  return getFirestore(getAdminApp());
}

export function bucket() {
  return getStorage(getAdminApp()).bucket();
}
