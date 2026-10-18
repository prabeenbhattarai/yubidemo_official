"use client";

import { useState } from "react";
import type { Project } from "@/lib/content-types";
import { deleteProjectAction, saveProjectAction } from "@/app/api/admin/yubidemo/actions";
import ImageUploader from "./ImageUploader";
import Modal from "./Modal";

export default function ProjectsManager({ projects }: { projects: Project[] }) {
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const current = editing === "new" ? undefined : editing ?? undefined;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing("new")} className="a-btn a-btn-primary">
          + Add new project
        </button>
      </div>

      <div className="a-card divide-y divide-gray-100">
        {projects.length === 0 && (
          <p className="p-6 text-sm text-muted">No projects yet. Click “Add new project”.</p>
        )}
        {projects.map((p) => (
          <div key={p.id ?? p.title} className="flex items-center gap-4 p-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100"
              style={{ background: p.image ? undefined : p.color }}
            >
              {p.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{p.title}</p>
              <p className="truncate text-xs text-muted">{p.category} · {p.location} · order {p.order}</p>
            </div>
            <button onClick={() => setEditing(p)} className="a-btn a-btn-ghost">
              Edit
            </button>
            <form action={deleteProjectAction}>
              <input type="hidden" name="id" value={p.id} />
              <button
                className="a-btn a-btn-danger"
                onClick={(e) => {
                  if (!confirm(`Delete “${p.title}”?`)) e.preventDefault();
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
        title={editing === "new" ? "Add project" : "Edit project"}
      >
        <form action={saveProjectAction} className="grid gap-4">
          {current?.id && <input type="hidden" name="id" value={current.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="a-field">
              <label className="a-label">Title</label>
              <input name="title" defaultValue={current?.title ?? ""} className="a-input" required />
            </div>
            <div className="a-field">
              <label className="a-label">Category</label>
              <input name="category" defaultValue={current?.category ?? ""} className="a-input" placeholder="Strip-Out" />
            </div>
            <div className="a-field">
              <label className="a-label">Location</label>
              <input name="location" defaultValue={current?.location ?? ""} className="a-input" placeholder="Sydney CBD, NSW" />
            </div>
            <div className="a-field">
              <label className="a-label">Order</label>
              <input name="order" type="number" defaultValue={current?.order ?? 99} className="a-input" />
            </div>
          </div>
          <div className="a-field">
            <label className="a-label">Description</label>
            <textarea name="blurb" defaultValue={current?.blurb ?? ""} className="a-textarea" />
          </div>
          <div className="a-field">
            <label className="a-label">Placeholder colour (used when no image)</label>
            <input name="color" type="color" defaultValue={current?.color ?? "#7c8590"} className="h-10 w-20 rounded border border-gray-200" />
          </div>
          <ImageUploader name="image" defaultValue={current?.image ?? ""} folder="projects" label="Project image (optional)" />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="a-btn a-btn-ghost">
              Cancel
            </button>
            <button className="a-btn a-btn-primary">Save project</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
