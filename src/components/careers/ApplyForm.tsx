"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { submitApplication } from "@/app/(site)/apply-action";
import {
  CV_ACCEPT,
  EXPERIENCE,
  WORK_RIGHTS,
  validateApplication,
  validateCvMeta,
  type ApplicationErrors,
  type ApplicationFields,
} from "@/lib/application-validation";
import BrandLoader, { type LoaderStatus } from "../BrandLoader";
import Turnstile from "../Turnstile";
import { ChevronDown, CloseIcon } from "../Icons";

export type JobOption = { id: string; title: string; type: string; location: string };

const FIELD = "w-full border px-4 py-3.5 text-[14px] text-ink outline-none focus:border-brand";
const MIN_LOADER_MS = 1100;

function readFields(form: HTMLFormElement): ApplicationFields {
  const fd = new FormData(form);
  const get = (k: string) => String(fd.get(k) ?? "");
  return {
    jobId: get("jobId"),
    name: get("name"),
    email: get("email"),
    phone: get("phone"),
    suburb: get("suburb"),
    workRights: get("workRights"),
    experience: get("experience"),
    licences: get("licences"),
    message: get("message"),
  };
}

function formatSize(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function ApplyForm({
  jobs,
  initialJobId,
  phone,
  onApplied,
  onBusy,
  onFinished,
}: {
  jobs: JobOption[];
  initialJobId: string;
  phone?: { display: string; href: string };
  /** Called once an application is accepted (or already on file). */
  onApplied: (jobId: string) => void;
  onBusy?: (busy: boolean) => void;
  /** The result screen has closed after a sent (or already-sent) application. */
  onFinished?: () => void;
}) {
  const uid = useId();
  const [state, action, pending] = useActionState(submitApplication, null);
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [edited, setEdited] = useState<Set<string>>(new Set());
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [holding, setHolding] = useState(false);
  const [dismissed, setDismissed] = useState<typeof state>(null);
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (state?.ok) onApplied(state.jobId);
    else if (state && !state.ok && state.duplicate && state.jobId) onApplied(state.jobId);
  }, [state, onApplied]);

  const busy = pending || holding;
  useEffect(() => onBusy?.(busy), [busy, onBusy]);

  const serverErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const errorFor = (k: keyof ApplicationErrors) => errors[k] ?? (edited.has(k) ? undefined : serverErrors[k]);

  let loader: LoaderStatus = "idle";
  if (busy) loader = "loading";
  else if (state && state !== dismissed && (state.ok || !state.fieldErrors)) loader = state.ok ? "success" : "error";

  const finished = state?.ok || (state && !state.ok && state.duplicate);
  const closeResult = () => {
    setDismissed(state);
    if (finished) onFinished?.();
  };

  useEffect(() => {
    if (loader !== "success") return;
    const t = setTimeout(() => {
      setDismissed(state);
      onFinished?.();
    }, 2800);
    return () => clearTimeout(t);
  }, [loader, state, onFinished]);

  // Put a chosen file into the real <input type="file"> so it's sent with the form.
  const pickFile = (f: File | null) => {
    if (fileRef.current) {
      const dt = new DataTransfer();
      if (f) dt.items.add(f);
      fileRef.current.files = dt.files;
    }
    setFile(f);
    setEdited((prev) => new Set(prev).add("cv"));
    setErrors((prev) => ({ ...prev, cv: f ? validateCvMeta(f) : undefined }));
  };

  const onBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    const el = e.target as EventTarget as HTMLInputElement;
    const name = el.name as keyof ApplicationFields;
    if (!formRef.current || el.type === "file" || !(name in errors || el.value)) return;
    const err = validateApplication(readFields(formRef.current))[name];
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const onChange = (e: React.FormEvent<HTMLFormElement>) => {
    const name = (e.target as HTMLInputElement).name;
    if (name === "cv") return;
    setEdited((prev) => (prev.has(name) ? prev : new Set(prev).add(name)));
    if (errors[name as keyof ApplicationErrors]) {
      // Read the form now: React releases the event before a state updater runs.
      const err = validateApplication(readFields(e.currentTarget))[name as keyof ApplicationFields];
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const next: ApplicationErrors = validateApplication(readFields(form));
    const cvError = validateCvMeta(file);
    if (cvError) next.cv = cvError;
    setErrors(next);
    const first = Object.keys(next).find((k) => next[k as keyof ApplicationErrors]);
    if (first) {
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setEdited(new Set());
    setHolding(true);
    setTimeout(() => setHolding(false), MIN_LOADER_MS);
    const fd = new FormData(form);
    fd.set("t", String(startedAt.current));
    startTransition(() => action(fd));
  };

  const errText = (k: keyof ApplicationErrors) => {
    const err = errorFor(k);
    return err ? (
      <p id={`${uid}-${k}`} className="mt-1.5 text-[13px] text-red-600">
        {err}
      </p>
    ) : null;
  };
  const a11y = (k: keyof ApplicationErrors) => ({
    "aria-invalid": Boolean(errorFor(k)),
    "aria-describedby": errorFor(k) ? `${uid}-${k}` : undefined,
  });
  const border = (k: keyof ApplicationErrors) => (errorFor(k) ? "border-red-500" : "border-gray-200");
  const label = "mb-1.5 block text-[13px] font-semibold text-ink";

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} onBlur={onBlur} onChange={onChange} className="space-y-4">
      {/* Bot trap: hidden from people, so only bots fill it in. */}
      <input type="text" name="app_ref" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px" />

      <div>
        <label htmlFor={`${uid}-job`} className={label}>Job *</label>
        <div className="relative">
          <select
            id={`${uid}-job`}
            name="jobId"
            required
            defaultValue={initialJobId}
            className={`${FIELD} ${border("jobId")} appearance-none rounded-none bg-white pr-12 invalid:text-muted`}
            {...a11y("jobId")}
          >
            <option value="" disabled>Choose a job</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} — {j.type}, {j.location}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </div>
        {errText("jobId")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className={label}>Full name *</label>
          <input id={`${uid}-name`} name="name" autoComplete="name" className={`${FIELD} ${border("name")}`} {...a11y("name")} />
          {errText("name")}
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className={label}>Email *</label>
          <input id={`${uid}-email`} type="email" name="email" autoComplete="email" className={`${FIELD} ${border("email")}`} {...a11y("email")} />
          {errText("email")}
        </div>
        <div>
          <label htmlFor={`${uid}-phone`} className={label}>Contact number *</label>
          <div className={`flex border focus-within:border-brand ${border("phone")}`}>
            <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3.5 text-[14px] font-medium text-ink">+61</span>
            <input
              id={`${uid}-phone`}
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="412 345 678"
              className="w-full px-4 py-3.5 text-[14px] text-ink outline-none"
              {...a11y("phone")}
            />
          </div>
          {errText("phone")}
        </div>
        <div>
          <label htmlFor={`${uid}-suburb`} className={label}>Suburb you live in *</label>
          <input id={`${uid}-suburb`} name="suburb" autoComplete="address-level2" placeholder="e.g. Parramatta" className={`${FIELD} ${border("suburb")}`} {...a11y("suburb")} />
          {errText("suburb")}
        </div>
        {([
          ["workRights", "Work rights in Australia *", WORK_RIGHTS],
          ["experience", "Experience in demolition / construction *", EXPERIENCE],
        ] as const).map(([name, text, options]) => (
          <div key={name}>
            <label htmlFor={`${uid}-${name}`} className={label}>{text}</label>
            <div className="relative">
              <select
                id={`${uid}-${name}`}
                name={name}
                required
                defaultValue=""
                className={`${FIELD} ${border(name)} appearance-none rounded-none bg-white pr-12 invalid:text-muted`}
                {...a11y(name)}
              >
                <option value="" disabled>Choose one</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
            {errText(name)}
          </div>
        ))}
      </div>

      <div>
        <label htmlFor={`${uid}-licences`} className={label}>Licences &amp; tickets</label>
        <input
          id={`${uid}-licences`}
          name="licences"
          placeholder="e.g. White Card, forklift, EWP, driver's licence"
          className={`${FIELD} ${border("licences")}`}
          {...a11y("licences")}
        />
        {errText("licences")}
      </div>

      <div>
        <label htmlFor={`${uid}-cv`} className={label}>CV / resume *</label>
        <label
          htmlFor={`${uid}-cv`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pickFile(e.dataTransfer.files?.[0] ?? null);
          }}
          className={`flex cursor-pointer items-center gap-4 border-2 border-dashed px-4 py-4 transition-colors ${
            errorFor("cv") ? "border-red-400 bg-red-50/40" : dragging ? "border-brand bg-brand/5" : "border-gray-300 hover:border-brand/60"
          }`}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-brand/10 text-brand">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5M12 18v-6M9.5 14.5 12 12l2.5 2.5" />
            </svg>
          </span>
          {file ? (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold text-ink">{file.name}</span>
              <span className="text-[12px] text-muted">{formatSize(file.size)} · click to choose a different file</span>
            </span>
          ) : (
            <span className="flex-1">
              <span className="block text-[14px] font-semibold text-ink">Drop your CV here, or click to upload</span>
              <span className="text-[12px] text-muted">PDF or Word (.doc, .docx), up to 4 MB</span>
            </span>
          )}
          {file && (
            <button
              type="button"
              aria-label="Remove file"
              onClick={(e) => {
                e.preventDefault();
                pickFile(null);
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-gray-100 hover:text-ink"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </label>
        <input
          ref={fileRef}
          id={`${uid}-cv`}
          type="file"
          name="cv"
          accept={CV_ACCEPT}
          className="sr-only"
          onChange={(e) => pickFile(e.currentTarget.files?.[0] ?? null)}
          {...a11y("cv")}
        />
        {errText("cv")}
      </div>

      <div>
        <label htmlFor={`${uid}-message`} className={label}>Anything else you&apos;d like us to know?</label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={3}
          placeholder="Availability, recent sites, why you'd be a good fit…"
          className={`${FIELD} ${border("message")} resize-y`}
          {...a11y("message")}
        />
        {errText("message")}
      </div>

      <Turnstile resetKey={state} />

      <button type="submit" disabled={busy} className="btn btn-red w-full justify-center py-4 disabled:opacity-60">
        {busy ? "Sending…" : "Submit Application"}
      </button>
      <p className="text-center text-[12px] text-muted">
        Your details and CV are only used to assess your application.
      </p>
      {state && !state.ok && state.fieldErrors && (
        <p role="status" className="text-center text-sm font-medium text-red-600">{state.error}</p>
      )}

      <BrandLoader
        status={loader}
        title={state?.ok ? "Application sent!" : state && !state.ok && state.duplicate ? "You've already applied" : "We couldn't send your application"}
        message={
          state?.ok
            ? "Thanks for applying. Our team will review your details and be in touch if you're shortlisted."
            : state && !state.ok ? state.error : undefined
        }
        phone={state && !state.ok && !state.duplicate ? phone : undefined}
        onClose={closeResult}
      />
    </form>
  );
}
