"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import ApplyForm, { type JobOption } from "./ApplyForm";
import { ArrowRight, CheckCircle, CloseIcon, PinIcon } from "../Icons";

export type JobCard = JobOption & { summary: string; details: string[] };

// Jobs this browser has applied for, so the button can say "Applied". The
// server is what actually blocks a second application.
const KEY = "yubi-applied";
const EVENT = "yubi:applied";
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};
const readApplied = () => {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
};
function rememberApplied(jobId: string) {
  try {
    const list: string[] = JSON.parse(readApplied());
    if (!list.includes(jobId)) localStorage.setItem(KEY, JSON.stringify([...list, jobId]));
  } catch {
    // Storage blocked — the button just won't say "Applied".
  }
  window.dispatchEvent(new Event(EVENT));
}

function JobItem({ job, applied, onApply }: { job: JobCard; applied: boolean; onApply: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="border border-gray-200 bg-white p-6 transition-shadow hover:shadow-[0_12px_30px_rgba(15,20,25,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-ink">{job.title}</h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted">
            <span className="bg-brand/10 px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wide text-brand">{job.type}</span>
            <span className="flex items-center gap-1">
              <PinIcon className="h-4 w-4" /> {job.location}
            </span>
          </p>
          {job.summary && <p className="mt-3 text-[15px] leading-relaxed text-muted">{job.summary}</p>}
        </div>
        {applied ? (
          <span className="flex shrink-0 items-center gap-2 border border-green-200 bg-green-50 px-5 py-3 text-[13px] font-semibold uppercase tracking-wide text-green-700">
            <CheckCircle className="h-4 w-4" /> Applied
          </span>
        ) : (
          <button type="button" onClick={onApply} className="btn btn-red shrink-0">
            Apply Now <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {job.details.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="text-[14px] font-semibold text-ink hover:text-brand"
          >
            {open ? "Hide details" : "View job details"}
          </button>
          {open && (
            <ul className="mt-3 space-y-2">
              {job.details.map((d) => (
                <li key={d} className="flex gap-3 text-[15px] text-ink/80">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-brand" />
                  {d}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}

export default function JobBoard({ jobs, phone }: { jobs: JobCard[]; phone?: { display: string; href: string } }) {
  const applied: string[] = JSON.parse(useSyncExternalStore(subscribe, readApplied, () => "[]"));
  const [applyFor, setApplyFor] = useState<JobCard | null>(null);
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => !busy && setApplyFor(null), [busy]);
  const finish = useCallback(() => setApplyFor(null), []);

  useEffect(() => {
    if (!applyFor) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [applyFor, close]);

  return (
    <>
      <div className="space-y-4">
        {jobs.map((j) => (
          <JobItem key={j.id} job={j} applied={applied.includes(j.id)} onApply={() => setApplyFor(j)} />
        ))}
      </div>

      {applyFor &&
        createPortal(
          <div
            className="popup-backdrop fixed inset-0 z-[85] flex items-start justify-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm sm:items-center"
            onMouseDown={(e) => e.target === e.currentTarget && close()}
          >
            <div
              ref={dialogRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="apply-title"
              className="popup-panel relative my-auto w-full max-w-2xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] outline-none"
            >
              <div className="h-1 bg-brand" />
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5 sm:px-8">
                <div>
                  <p className="eyebrow">Job application</p>
                  <h2 id="apply-title" className="mt-1 text-2xl font-bold text-ink">
                    Apply for {applyFor.title}
                  </h2>
                  <p className="mt-1 text-[14px] text-muted">
                    {applyFor.type} · {applyFor.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-ink transition hover:rotate-90 hover:bg-gray-200"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="px-6 py-6 sm:px-8">
                <ApplyForm
                  jobs={jobs}
                  initialJobId={applyFor.id}
                  phone={phone}
                  onApplied={rememberApplied}
                  onBusy={setBusy}
                  onFinished={finish}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
