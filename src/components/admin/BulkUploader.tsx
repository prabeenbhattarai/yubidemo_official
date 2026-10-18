"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addGalleryPhotosAction } from "@/app/api/admin/yubidemo/actions";

type Item = {
  key: string;
  name: string;
  status: "waiting" | "shrinking" | "uploading" | "done" | "failed";
  progress: number;
  error?: string;
  url?: string;
};

const MAX_SIDE = 2400; // px — plenty for full-screen viewing
const QUALITY = 0.85;
const MAX_BYTES = 3.5 * 1024 * 1024;
const PARALLEL = 3;

/**
 * Resizes a photo in the browser before upload. Phone photos are often
 * 3–8 MB; this brings them to roughly 0.5–1.5 MB, which keeps uploads under
 * Vercel's 4.5 MB request limit and makes the gallery load faster.
 */
async function shrink(file: File): Promise<File> {
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
function upload(file: File, onProgress: (p: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "gallery");
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

export default function BulkUploader({ folderId, folderName }: { folderId: string; folderName: string }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const patch = (key: string, p: Partial<Item>) => setItems((list) => list.map((it) => (it.key === key ? { ...it, ...p } : it)));

  async function start(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (!images.length || busy) return;
    setBusy(true);
    setMessage(null);
    const queue: (Item & { file: File })[] = images.map((file, i) => ({
      key: `${Date.now()}-${i}`,
      name: file.name,
      status: "waiting",
      progress: 0,
      file,
    }));
    setItems(queue.map((it) => ({ key: it.key, name: it.name, status: it.status, progress: it.progress })));

    const urls: string[] = [];
    let next = 0;
    const worker = async () => {
      while (next < queue.length) {
        const job = queue[next++];
        try {
          patch(job.key, { status: "shrinking" });
          const small = await shrink(job.file);
          patch(job.key, { status: "uploading", progress: 0 });
          const url = await upload(small, (progress) => patch(job.key, { progress }));
          urls.push(url);
          patch(job.key, { status: "done", progress: 100, url });
        } catch (err) {
          patch(job.key, { status: "failed", error: err instanceof Error ? err.message : "Upload failed" });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(PARALLEL, queue.length) }, worker));

    if (urls.length) {
      const res = await addGalleryPhotosAction(folderId, urls);
      const failed = queue.length - urls.length;
      setMessage(
        res.ok
          ? { ok: true, text: `${urls.length} photo${urls.length === 1 ? "" : "s"} added to “${folderName}”.${failed ? ` ${failed} failed — see below.` : ""}` }
          : { ok: false, text: res.error }
      );
      router.refresh();
    } else {
      setMessage({ ok: false, text: "No photos were uploaded — see the errors below." });
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const done = items.filter((i) => i.status === "done").length;

  return (
    <div className="a-card p-5">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          start([...e.dataTransfer.files]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
          busy ? "pointer-events-none opacity-60" : dragging ? "border-brand bg-brand/5" : "border-gray-300 hover:border-brand/60"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3M12 4v12M7 9l5-5 5 5" />
        </svg>
        <span className="text-sm font-semibold text-ink">
          {busy ? `Uploading… ${done} of ${items.length}` : `Drop photos here, or click to choose — they'll go into “${folderName}”`}
        </span>
        <span className="text-xs text-muted">Select as many as you like. JPG, PNG or WEBP — large photos are resized automatically.</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={busy}
          onChange={(e) => start([...(e.currentTarget.files ?? [])])}
        />
      </label>

      {message && (
        <p className={`mt-4 rounded-md px-4 py-3 text-sm font-medium ${message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </p>
      )}

      {items.length > 0 && (
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {items.map((it) => (
            <li key={it.key} className="flex items-center gap-3 text-sm">
              <span className="min-w-0 flex-1 truncate text-ink">{it.name}</span>
              {it.status === "failed" ? (
                <span className="shrink-0 text-xs text-red-600" title={it.error}>
                  {it.error}
                </span>
              ) : (
                <span className="flex w-40 shrink-0 items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <span
                      className={`block h-full rounded-full transition-all ${it.status === "done" ? "bg-green-500" : "bg-brand"}`}
                      style={{ width: `${it.status === "shrinking" ? 5 : it.status === "waiting" ? 0 : it.progress}%` }}
                    />
                  </span>
                  <span className="w-14 text-right text-xs text-muted">
                    {it.status === "done" ? "Done" : it.status === "waiting" ? "Waiting" : it.status === "shrinking" ? "Resizing" : `${it.progress}%`}
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
