"use client";

import { useState } from "react";
import type { Project } from "@/lib/content-types";
import { deleteProjectAction, saveProjectAction } from "@/app/api/admin/yubidemo/actions";
import ImageUploader from "./ImageUploader";
import PhotoListField from "./PhotoListField";
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
              <p className="truncate text-xs text-muted">
                {p.category} · {p.location} · order {p.order} ·{" "}
                <a href={`/our-projects/${p.slug}`} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                  view page ↗
                </a>
              </p>
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
          {current?.slug && <input type="hidden" name="slug" value={current.slug} />}
          <p className="-mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Card</p>
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
            <label className="a-label">Short description (shown on the card)</label>
            <textarea name="blurb" defaultValue={current?.blurb ?? ""} className="a-textarea" maxLength={300} />
          </div>
          <div className="a-field">
            <label className="a-label">Placeholder colour (used when no image)</label>
            <input name="color" type="color" defaultValue={current?.color ?? "#7c8590"} className="h-10 w-20 rounded border border-gray-200" />
          </div>
          <ImageUploader name="image" defaultValue={current?.image ?? ""} folder="projects" label="Main photo" />

          <p className="-mb-1 mt-2 border-t border-gray-100 pt-4 text-xs font-semibold uppercase tracking-wider text-muted">
            Project page — all optional
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="a-field">
              <label className="a-label">Client</label>
              <input name="client" defaultValue={current?.client ?? ""} className="a-input" placeholder="e.g. ABC Constructions" />
            </div>
            <div className="a-field">
              <label className="a-label">Completed</label>
              <input name="completed" defaultValue={current?.completed ?? ""} className="a-input" placeholder="e.g. March 2025" />
            </div>
            <div className="a-field">
              <label className="a-label">Duration</label>
              <input name="duration" defaultValue={current?.duration ?? ""} className="a-input" placeholder="e.g. 6 weeks" />
            </div>
            <div className="a-field">
              <label className="a-label">Project size</label>
              <input name="size" defaultValue={current?.size ?? ""} className="a-input" placeholder="e.g. 2,400 m² over 3 levels" />
            </div>
          </div>
          <div className="a-field">
            <label className="a-label">Project overview — leave a blank line between paragraphs</label>
            <textarea
              name="overview"
              defaultValue={(current?.overview ?? []).join("\n\n")}
              className="a-textarea min-h-[140px]"
              placeholder="The site, what the client needed, and how we approached it."
            />
          </div>
          <div className="a-field">
            <label className="a-label">What we did — one point per line</label>
            <textarea
              name="scope"
              defaultValue={(current?.scope ?? []).join("\n")}
              className="a-textarea min-h-[110px]"
              placeholder={"Full internal strip-out of 3 levels\nServices made safe before demolition\nWaste sorted for recycling"}
            />
          </div>
          <div className="a-field">
            <label className="a-label">The result</label>
            <textarea
              name="outcome"
              defaultValue={current?.outcome ?? ""}
              className="a-textarea"
              placeholder="e.g. Handed over two days early, ready for the fit-out team."
            />
          </div>
          <PhotoListField name="images" defaultValue={current?.images ?? []} folder="projects" label="More photos for the project page" />
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
