"use client";

import { useRef, useState } from "react";

export default function ImageUploader({
  name,
  defaultValue = "",
  folder = "uploads",
  label = "Image",
}: {
  name: string;
  defaultValue?: string;
  folder?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="a-field">
      <label className="a-label">{label}</label>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-50 text-xs text-gray-400">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            "No image"
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="w-fit rounded bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "Uploading…" : url ? "Replace image" : "Upload image"}
          </button>
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="w-fit text-xs text-red-600 hover:underline"
            >
              Remove
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            className="hidden"
          />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
