"use client";

import { useState } from "react";
import type { Service } from "@/lib/content-types";
import { deleteServiceAction, saveServiceAction } from "@/app/admin/actions";
import ImageUploader from "./ImageUploader";
import Modal from "./Modal";

const ICONS = ["worker", "saw", "excavator", "broom", "site"];

export default function ServicesManager({ services }: { services: Service[] }) {
  const [editing, setEditing] = useState<Service | "new" | null>(null);
  const current = editing === "new" ? undefined : editing ?? undefined;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing("new")} className="a-btn a-btn-primary">
          + Add new service
        </button>
      </div>

      <div className="a-card divide-y divide-gray-100">
        {services.length === 0 && (
          <p className="p-6 text-sm text-muted">No services yet. Click “Add new service”.</p>
        )}
        {services.map((s) => (
          <div key={s.id ?? s.slug} className="flex items-center gap-4 p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100 text-xs text-gray-400">
              {s.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image} alt="" className="h-full w-full object-cover" />
              ) : (
                s.icon
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{s.title}</p>
              <p className="truncate text-xs text-muted">/{s.slug} · order {s.order}</p>
            </div>
            <button onClick={() => setEditing(s)} className="a-btn a-btn-ghost">
              Edit
            </button>
            <form action={deleteServiceAction}>
              <input type="hidden" name="id" value={s.id} />
              <button
                className="a-btn a-btn-danger"
                onClick={(e) => {
                  if (!confirm(`Delete “${s.title}”?`)) e.preventDefault();
                }}
              >
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add service" : "Edit service"}
      >
        <form action={saveServiceAction} className="grid gap-4">
          {current?.id && <input type="hidden" name="id" value={current.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="a-field">
              <label className="a-label">Title</label>
              <input name="title" defaultValue={current?.title ?? ""} className="a-input" required />
            </div>
            <div className="a-field">
              <label className="a-label">Slug (URL)</label>
              <input name="slug" defaultValue={current?.slug ?? ""} className="a-input" placeholder="concrete-cutting" required />
            </div>
            <div className="a-field">
              <label className="a-label">Icon</label>
              <select name="icon" defaultValue={current?.icon ?? "site"} className="a-select">
                {ICONS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div className="a-field">
              <label className="a-label">Order</label>
              <input name="order" type="number" defaultValue={current?.order ?? 99} className="a-input" />
            </div>
          </div>
          <div className="a-field">
            <label className="a-label">Excerpt (short summary on cards)</label>
            <textarea name="excerpt" defaultValue={current?.excerpt ?? ""} className="a-textarea" required />
          </div>
          <div className="a-field">
            <label className="a-label">Full description (one paragraph per line)</label>
            <textarea name="description" defaultValue={current?.description.join("\n") ?? ""} className="a-textarea" />
          </div>
          <ImageUploader name="image" defaultValue={current?.image ?? ""} folder="services" label="Service image (optional)" />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="a-btn a-btn-ghost">
              Cancel
            </button>
            <button className="a-btn a-btn-primary">Save service</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
