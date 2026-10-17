"use client";

import { useState } from "react";
import type { Faq } from "@/lib/content-types";
import { deleteFaqAction, saveFaqAction } from "@/app/admin/actions";
import Modal from "./Modal";

export default function FaqsManager({ faqs }: { faqs: Faq[] }) {
  const [editing, setEditing] = useState<Faq | "new" | null>(null);
  const current = editing === "new" ? undefined : editing ?? undefined;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing("new")} className="a-btn a-btn-primary">
          + Add new FAQ
        </button>
      </div>

      <div className="a-card divide-y divide-gray-100">
        {faqs.length === 0 && (
          <p className="p-6 text-sm text-muted">No FAQs yet. Click “Add new FAQ”.</p>
        )}
        {faqs.map((f) => (
          <div key={f.id ?? f.question} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{f.question}</p>
              <p className="truncate text-xs text-muted">order {f.order}</p>
            </div>
            <button onClick={() => setEditing(f)} className="a-btn a-btn-ghost">
              Edit
            </button>
            <form action={deleteFaqAction}>
              <input type="hidden" name="id" value={f.id} />
              <button
                className="a-btn a-btn-danger"
                onClick={(e) => {
                  if (!confirm("Delete this FAQ?")) e.preventDefault();
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
        title={editing === "new" ? "Add FAQ" : "Edit FAQ"}
      >
        <form action={saveFaqAction} className="grid gap-4">
          {current?.id && <input type="hidden" name="id" value={current.id} />}
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <div className="a-field">
              <label className="a-label">Question</label>
              <input name="question" defaultValue={current?.question ?? ""} className="a-input" required />
            </div>
            <div className="a-field">
              <label className="a-label">Order</label>
              <input name="order" type="number" defaultValue={current?.order ?? 99} className="a-input" />
            </div>
          </div>
          <div className="a-field">
            <label className="a-label">Answer</label>
            <textarea name="answer" defaultValue={current?.answer ?? ""} className="a-textarea" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="a-btn a-btn-ghost">
              Cancel
            </button>
            <button className="a-btn a-btn-primary">Save FAQ</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
