"use client";

import { useRef, useState } from "react";
import { shrink, upload } from "@/lib/admin-upload";

/**
 * A list of photos for a form: upload several at once, remove, or move a
 * photo earlier. Submits as JSON in a hidden input named `name`.
 */
export default function PhotoListField({
  name,
  defaultValue = [],
  folder,
  label,
}: {
  name: string;
  defaultValue?: string[];
  folder: string;
  label: string;
}) {
  const [urls, setUrls] = useState<string[]>(defaultValue);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function add(files: File[]) {
    if (!files.length) return;
    setBusy(true);
    const failed: string[] = [];
    for (const [i, f] of files.entries()) {
      setStatus(`Uploading ${i + 1} of ${files.length}…`);
      try {
        const url = await upload(await shrink(f), () => {}, folder);
        setUrls((list) => [...list, url]);
      } catch (err) {
        failed.push(`${f.name}: ${err instanceof Error ? err.message : "failed"}`);
      }
    }
    setStatus(failed.length ? `Some photos failed — ${failed.join("; ")}` : null);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const moveUp = (i: number) =>
    setUrls((list) => {
      const n = [...list];
      [n[i - 1], n[i]] = [n[i], n[i - 1]];
      return n;
    });

  return (
    <div className="a-field">
      <label className="a-label">{label}</label>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      {urls.length > 0 && (
        <div className="mb-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {urls.map((u, i) => (
            <div key={u} className="group relative aspect-square overflow-hidden rounded bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 p-1 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => moveUp(i)}
                  className="rounded px-1.5 text-xs text-white hover:bg-white/20 disabled:opacity-30"
                  title="Move earlier"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setUrls((list) => list.filter((x) => x !== u))}
                  className="rounded px-1.5 text-xs text-white hover:bg-red-600"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <label className={`a-btn a-btn-ghost w-fit cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
        {busy ? "Uploading…" : "+ Add photos"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => add([...(e.currentTarget.files ?? [])])}
        />
      </label>
      {status && <p className="mt-1 text-xs text-muted">{status}</p>}
    </div>
  );
}
