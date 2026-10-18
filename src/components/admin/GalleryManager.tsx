"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createGalleryFolderAction,
  deleteGalleryFolderAction,
  deleteGalleryPhotosAction,
  moveGalleryPhotosAction,
  renameGalleryFolderAction,
} from "@/app/api/admin/yubidemo/actions";
import BulkUploader from "./BulkUploader";
import Modal from "./Modal";

export type AdminFolder = { id: string; name: string; order: number; count: number };
export type AdminPhoto = { id: string; url: string };

const BASE = "/api/admin/yubidemo/gallery";

export default function GalleryManager({
  folders,
  active,
  photos,
  canEdit,
}: {
  folders: AdminFolder[];
  active: AdminFolder | null;
  photos: AdminPhoto[];
  /** False until Firebase is connected — uploads and folders need it. */
  canEdit: boolean;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<"new" | "rename" | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [moveTo, setMoveTo] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      setSelected(new Set());
      router.refresh();
    });

  const others = folders.filter((f) => f.id !== active?.id);

  return (
    <div className="space-y-6">
      {/* Folder bar */}
      <div className="flex flex-wrap items-center gap-2">
        {folders.map((f) => (
          <Link
            key={f.id}
            href={`${BASE}?folder=${f.id}`}
            className={`a-btn ${f.id === active?.id ? "a-btn-primary" : "a-btn-ghost"}`}
            onClick={() => setSelected(new Set())}
          >
            📁 {f.name} <span className="opacity-70">({f.count})</span>
          </Link>
        ))}
        <button type="button" onClick={() => setModal("new")} disabled={!canEdit} className="a-btn a-btn-ghost border-dashed disabled:cursor-not-allowed disabled:opacity-50">
          + New folder
        </button>
      </div>

      {active ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-ink">{active.name}</h2>
              <p className="text-sm text-muted">
                {active.count} photo{active.count === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setModal("rename")} disabled={!canEdit} className="a-btn a-btn-ghost disabled:cursor-not-allowed disabled:opacity-50">
                Rename
              </button>
              <form action={deleteGalleryFolderAction}>
                <input type="hidden" name="id" value={active.id} />
                <button
                  disabled={!canEdit || active.count > 0}
                  title={active.count > 0 ? "Move or delete this folder's photos first" : undefined}
                  className="a-btn a-btn-danger disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={(e) => {
                    if (!confirm(`Delete the empty folder “${active.name}”?`)) e.preventDefault();
                  }}
                >
                  Delete folder
                </button>
              </form>
            </div>
          </div>

          {canEdit && <BulkUploader folderId={active.id} folderName={active.name} />}

          {/* Selection bar */}
          {photos.length > 0 && canEdit && (
            <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
              <button
                type="button"
                className="text-sm font-medium text-ink hover:underline"
                onClick={() => setSelected(selected.size === photos.length ? new Set() : new Set(photos.map((p) => p.id)))}
              >
                {selected.size === photos.length ? "Clear selection" : "Select all"}
              </button>
              <span className="text-sm text-muted">{selected.size} selected</span>
              {selected.size > 0 && canEdit && (
                <>
                  {others.length > 0 && (
                    <span className="flex items-center gap-2">
                      <select value={moveTo} onChange={(e) => setMoveTo(e.target.value)} className="a-select w-auto py-1.5">
                        <option value="">Move to…</option>
                        {others.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!moveTo || pending}
                        onClick={() => run(() => moveGalleryPhotosAction([...selected], moveTo))}
                        className="a-btn a-btn-primary py-1.5"
                      >
                        Move
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (confirm(`Delete ${selected.size} photo${selected.size === 1 ? "" : "s"} from the website?`)) {
                        run(() => deleteGalleryPhotosAction([...selected]));
                      }
                    }}
                    className="a-btn a-btn-danger py-1.5"
                  >
                    Delete
                  </button>
                </>
              )}
              {pending && <span className="text-sm text-muted">Saving…</span>}
            </div>
          )}
          {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

          {photos.length === 0 ? (
            <p className="a-card p-6 text-sm text-muted">
              This folder is empty{canEdit ? " — upload photos above." : "."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {photos.map((p) => {
                const on = selected.has(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => canEdit && toggle(p.id)}
                    disabled={!canEdit}
                    aria-pressed={on}
                    className={`group relative aspect-square overflow-hidden rounded-lg bg-gray-100 ring-offset-2 transition ${
                      on ? "ring-4 ring-brand" : "hover:opacity-90"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    {canEdit && <span
                      className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border-2 text-xs font-bold ${
                        on ? "border-brand bg-brand text-white" : "border-white bg-black/30 text-transparent group-hover:bg-black/50"
                      }`}
                    >
                      ✓
                    </span>}
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <p className="a-card p-6 text-sm text-muted">No folders yet — click “New folder” to create one.</p>
      )}

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === "new" ? "New folder" : "Rename folder"}>
        <form action={modal === "new" ? createGalleryFolderAction : renameGalleryFolderAction} className="grid gap-4">
          {modal === "rename" && active && (
            <>
              <input type="hidden" name="id" value={active.id} />
              <input type="hidden" name="order" value={active.order} />
            </>
          )}
          <div className="a-field">
            <label className="a-label">Folder name</label>
            <input
              name="name"
              required
              maxLength={60}
              autoFocus
              defaultValue={modal === "rename" ? active?.name : ""}
              placeholder="e.g. Parramatta Strip-Out 2025"
              className="a-input"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="a-btn a-btn-ghost">
              Cancel
            </button>
            <button className="a-btn a-btn-primary">{modal === "new" ? "Create folder" : "Save name"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
