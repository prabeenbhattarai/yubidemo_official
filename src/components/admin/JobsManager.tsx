"use client";

import { useState } from "react";
import { JOB_TYPES, type Job } from "@/lib/content-types";
import { deleteJobAction, saveJobAction } from "@/app/api/admin/yubidemo/actions";
import Modal from "./Modal";

export default function JobsManager({ jobs, counts }: { jobs: Job[]; counts: Record<string, number> }) {
  const [editing, setEditing] = useState<Job | "new" | null>(null);
  const current = editing === "new" ? undefined : editing ?? undefined;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing("new")} className="a-btn a-btn-primary">
          + Post a job
        </button>
      </div>

      <div className="a-card divide-y divide-gray-100">
        {jobs.length === 0 && (
          <p className="p-6 text-sm text-muted">
            No jobs posted. The Careers page shows “No open positions right now” until you post one.
          </p>
        )}
        {jobs.map((j) => (
          <div key={j.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <span className="truncate">{j.title}</span>
                <span
                  className={`rounded border px-2 py-0.5 text-xs font-medium ${
                    j.open ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-muted"
                  }`}
                >
                  {j.open ? "Open" : "Closed"}
                </span>
              </p>
              <p className="truncate text-xs text-muted">
                {j.type} · {j.location} · {counts[j.id!] ?? 0} application{(counts[j.id!] ?? 0) === 1 ? "" : "s"}
              </p>
            </div>
            <button onClick={() => setEditing(j)} className="a-btn a-btn-ghost">
              Edit
            </button>
            <form action={deleteJobAction}>
              <input type="hidden" name="id" value={j.id} />
              <button
                className="a-btn a-btn-danger"
                onClick={(e) => {
                  if (!confirm(`Delete “${j.title}”? Its applications stay in the list below.`)) e.preventDefault();
                }}
              >
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Post a job" : "Edit job"}>
        <form action={saveJobAction} className="grid gap-4">
          {current?.id && <input type="hidden" name="id" value={current.id} />}
          <div className="a-field">
            <label className="a-label">Job title</label>
            <input name="title" defaultValue={current?.title ?? ""} className="a-input" required placeholder="Demolition Labourer" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="a-field">
              <label className="a-label">Type</label>
              <select name="type" defaultValue={current?.type ?? "Full-time"} className="a-select">
                {JOB_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="a-field">
              <label className="a-label">Location</label>
              <input name="location" defaultValue={current?.location ?? "Sydney, NSW"} className="a-input" required />
            </div>
            <div className="a-field">
              <label className="a-label">Order</label>
              <input name="order" type="number" defaultValue={current?.order ?? jobs.length + 1} className="a-input" />
            </div>
          </div>
          <div className="a-field">
            <label className="a-label">Short summary (shown on the job card)</label>
            <textarea
              name="summary"
              defaultValue={current?.summary ?? ""}
              className="a-textarea"
              placeholder="Join our strip-out crew on commercial sites across Sydney."
            />
          </div>
          <div className="a-field">
            <label className="a-label">Details — one point per line (duties, requirements, what&apos;s on offer)</label>
            <textarea
              name="details"
              defaultValue={(current?.details ?? []).join("\n")}
              className="a-textarea min-h-[140px]"
              placeholder={"White Card required\nPrevious demolition experience preferred\nMonday–Friday, early starts"}
            />
          </div>
          <label className="flex items-center gap-3 text-sm font-medium text-ink">
            <input type="checkbox" name="open" defaultChecked={current?.open ?? true} className="h-4 w-4 accent-[var(--brand-red)]" />
            Open — show on the Careers page and accept applications
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="a-btn a-btn-ghost">
              Cancel
            </button>
            <button className="a-btn a-btn-primary">Save job</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
