"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addGalleryPhotosAction } from "@/app/api/admin/yubidemo/actions";
import { shrink, upload } from "@/lib/admin-upload";

type Item = {
  key: string;
  name: string;
  status: "waiting" | "shrinking" | "uploading" | "done" | "failed";
  progress: number;
  error?: string;
  url?: string;
};

const PARALLEL = 3;

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
