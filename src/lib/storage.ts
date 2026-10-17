import "server-only";
import { randomUUID } from "crypto";
import { bucket, isFirebaseConfigured } from "./firebase-admin";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

/** Upload an image to Firebase Storage and return its public URL. */
export async function uploadImage(file: File, folder = "uploads"): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured — image uploads need FIREBASE_* env vars.");
  }
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Unsupported file type. Use JPG, PNG, WEBP, AVIF or GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image is too large (max 8 MB).");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const objectName = `${folder}/${Date.now()}-${randomUUID()}.${ext}`;

  const b = bucket();
  const object = b.file(objectName);
  await object.save(bytes, {
    resumable: false,
    metadata: { contentType: file.type, cacheControl: "public, max-age=31536000" },
  });
  await object.makePublic();

  return `https://storage.googleapis.com/${b.name}/${objectName}`;
}
