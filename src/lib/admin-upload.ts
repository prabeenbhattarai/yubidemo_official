// Browser-side helpers for admin photo uploads (gallery and project photos).

const MAX_SIDE = 2400; // px — plenty for full-screen viewing
const QUALITY = 0.85;
const MAX_BYTES = 3.5 * 1024 * 1024;

/**
 * Resizes a photo in the browser before upload. Phone photos are often
 * 3–8 MB; this brings them to roughly 0.5–1.5 MB, which keeps uploads under
 * Vercel's 4.5 MB request limit and makes the gallery load faster.
 */
export async function shrink(file: File): Promise<File> {
  if (file.type === "image/gif") return file; // keep animations
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This file type can't be read — please use JPG, PNG or WEBP.");
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  // Step the quality down if a very detailed photo is still big, staying well
  // under the 4.5 MB upload limit.
  let blob: Blob | null = null;
  for (const q of [QUALITY, 0.75, 0.65, 0.55]) {
    blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", q));
    if (!blob || blob.size <= MAX_BYTES) break;
  }
  if (!blob) throw new Error("Couldn't prepare this photo.");
  if (blob.size > MAX_BYTES) throw new Error("This photo is too detailed to shrink under 3.5 MB.");
  const base = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

/** Uploads with progress (fetch can't report upload progress). */
export function upload(file: File, onProgress: (p: number) => void, folder = "gallery"): Promise<string> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let data: { url?: string; error?: string } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status === 200 && data.url) resolve(data.url);
      else if (xhr.status === 413) reject(new Error("Photo is too large even after shrinking."));
      else reject(new Error(data.error || `Upload failed (${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("Network error — check your connection."));
    xhr.send(fd);
  });
}

