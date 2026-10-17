"use client";

import { useState } from "react";
import type { GalleryImage } from "@/lib/content-types";
import { deleteGalleryAction, saveGalleryAction } from "@/app/admin/actions";
import ImageUploader from "./ImageUploader";
import Modal from "./Modal";

export default function GalleryManager({ images }: { images: GalleryImage[] }) {
  const [editing, setEditing] = useState<GalleryImage | "new" | null>(null);
  const current = editing === "new" ? undefined : editing ?? undefined;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing("new")} className="a-btn a-btn-primary">
          + Add new photo
        </button>
      </div>

      {images.length === 0 ? (
        <p className="a-card p-6 text-sm text-muted">No photos yet. Click “Add new photo”.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="a-card overflow-hidden">
              <div className="aspect-square overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <span className="truncate text-xs text-muted" title={img.alt}>{img.alt}</span>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setEditing(img)} className="text-xs font-medium text-ink hover:underline">
                    Edit
                  </button>
                  <form action={deleteGalleryAction}>
                    <input type="hidden" name="id" value={img.id} />
                    <button
                      className="text-xs font-medium text-red-600 hover:underline"
                      onClick={(e) => {
                        if (!confirm("Delete this photo?")) e.preventDefault();
                      }}
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add photo" : "Edit photo"}
      >
        <form action={saveGalleryAction} className="grid gap-4">
          {current?.id && <input type="hidden" name="id" value={current.id} />}
          <ImageUploader name="url" defaultValue={current?.url ?? ""} folder="gallery" label="Photo" />
          <div className="a-field">
            <label className="a-label">Caption / alt text</label>
            <input name="alt" defaultValue={current?.alt ?? ""} className="a-input" placeholder="e.g. Warehouse demolition, Blacktown" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="a-btn a-btn-ghost">
              Cancel
            </button>
            <button className="a-btn a-btn-primary">Save photo</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
