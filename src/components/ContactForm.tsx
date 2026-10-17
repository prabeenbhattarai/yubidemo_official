"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { submitQuote } from "@/app/(site)/quote-action";
import { MESSAGE_MIN, validateQuoteFields, type FieldErrors, type QuoteFields } from "@/lib/quote-validation";
import Turnstile from "./Turnstile";
import BrandLoader, { type LoaderStatus } from "./BrandLoader";
import { ChevronDown } from "./Icons";

const FIELD = "w-full border px-4 py-4 text-[14px] tracking-wide text-ink outline-none focus:border-brand";

function readFields(form: HTMLFormElement): QuoteFields {
  const fd = new FormData(form);
  const get = (k: string) => String(fd.get(k) ?? "");
  return {
    name: get("name"),
    company: get("company"),
    email: get("email"),
    phone: get("phone"),
    inquiry: get("inquiry"),
    message: get("message"),
  };
}

export default function ContactForm({
  heading = true,
  services = [],
  bare = false,
  onSuccess,
  phone,
}: {
  heading?: boolean;
  services?: { slug: string; title: string }[];
  /** Drop the white card styling, e.g. when the form sits inside the quote popup. */
  bare?: boolean;
  onSuccess?: () => void;
  /** Offered as a fallback on the loader's error screen. */
  phone?: { display: string; href: string };
}) {
  const uid = useId();
  const [state, action, pending] = useActionState(submitQuote, null);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  // Fields edited since the last server reply — their server error is stale.
  const [edited, setEdited] = useState<Set<string>>(new Set());
  const startedAt = useRef(0);
  // The loader stays up at least this long so a fast reply doesn't just flash.
  const MIN_LOADER_MS = 1100;
  const [holding, setHolding] = useState(false);
  // The reply whose result screen was closed, so it isn't shown again.
  const [dismissed, setDismissed] = useState<typeof state>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!state?.ok) return;
    formRef.current?.reset();
    onSuccess?.();
  }, [state, onSuccess]);

  const serverErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const errorFor = (k: keyof QuoteFields) => clientErrors[k] ?? (edited.has(k) ? undefined : serverErrors[k]);

  // Re-check a field when the visitor leaves it, so mistakes show up straight away.
  const onBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    const field = e.target as EventTarget as HTMLInputElement;
    const name = field.name as keyof QuoteFields;
    if (!formRef.current || !(name in clientErrors || field.value)) return;
    const err = validateQuoteFields(readFields(formRef.current))[name];
    setClientErrors((prev) => ({ ...prev, [name]: err }));
  };

  const onChange = (e: React.FormEvent<HTMLFormElement>) => {
    const name = (e.target as HTMLInputElement).name;
    setEdited((prev) => (prev.has(name) ? prev : new Set(prev).add(name)));
    if (clientErrors[name as keyof QuoteFields]) {
      const err = validateQuoteFields(readFields(e.currentTarget))[name as keyof QuoteFields];
      setClientErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  // Submitting through onSubmit (rather than the action prop) keeps what the
  // visitor typed when the server returns an error.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const errors = validateQuoteFields(readFields(form));
    setClientErrors(errors);
    const first = Object.keys(errors)[0];
    if (first) {
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setEdited(new Set());
    setHolding(true);
    setTimeout(() => setHolding(false), MIN_LOADER_MS);
    const fd = new FormData(form);
    fd.set("page", window.location.pathname);
    fd.set("t", String(startedAt.current));
    startTransition(() => action(fd));
  };

  // Loader: "loading" while the server checks and emails the request, then the
  // result. Field mistakes go back to the form instead (no result screen).
  let loader: LoaderStatus = "idle";
  if (pending || holding) loader = "loading";
  else if (state && state !== dismissed && (state.ok || !state.fieldErrors)) loader = state.ok ? "success" : "error";

  useEffect(() => {
    if (loader !== "success") return;
    const t = setTimeout(() => setDismissed(state), 2400);
    return () => clearTimeout(t);
  }, [loader, state]);

  const errorText = (k: keyof QuoteFields) => {
    const err = errorFor(k);
    return err ? (
      <p id={`${uid}-${k}-error`} className="mt-1.5 text-[13px] text-red-600">
        {err}
      </p>
    ) : null;
  };
  const a11y = (k: keyof QuoteFields) => ({
    "aria-invalid": Boolean(errorFor(k)),
    "aria-describedby": errorFor(k) ? `${uid}-${k}-error` : undefined,
  });
  const border = (k: keyof QuoteFields) => (errorFor(k) ? "border-red-500" : "border-gray-200");

  return (
    <div className={bare ? "" : "bg-white p-8 shadow-xl md:p-10"}>
      {heading && (
        <>
          <h3 className="text-center text-3xl font-bold text-ink">Get In Touch</h3>
          <p className="mx-auto mt-3 max-w-xs text-center text-[15px] text-muted">
            Tell us about your project and we&apos;ll get back to you with a quote.
          </p>
        </>
      )}

      <form
        ref={formRef}
        noValidate
        onSubmit={onSubmit}
        onBlur={onBlur}
        onChange={onChange}
        className={`${bare ? "" : "mt-8"} space-y-4`}
      >
        {/* Bot trap: hidden from people, so only bots fill it in. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Leave this empty
            <input type="text" name="contact_ref" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div>
          <input name="name" autoComplete="name" placeholder="YOUR NAME*" className={`${FIELD} ${border("name")}`} {...a11y("name")} />
          {errorText("name")}
        </div>
        <div>
          <input
            name="company"
            autoComplete="organization"
            placeholder="COMPANY / ORGANISATION"
            className={`${FIELD} ${border("company")}`}
            {...a11y("company")}
          />
          {errorText("company")}
        </div>
        <div>
          <input type="email" name="email" autoComplete="email" placeholder="EMAIL*" className={`${FIELD} ${border("email")}`} {...a11y("email")} />
          {errorText("email")}
        </div>
        <div>
          <div className={`flex border focus-within:border-brand ${border("phone")}`}>
            <span className="flex items-center border-r border-gray-200 bg-gray-50 px-4 text-[14px] font-medium text-ink">
              +61
            </span>
            <input
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="CONTACT NUMBER* e.g. 412 345 678"
              aria-label="Contact number (Australian)"
              className="w-full px-4 py-4 text-[14px] tracking-wide text-ink outline-none"
              {...a11y("phone")}
            />
          </div>
          {errorText("phone")}
        </div>
        <div>
          {/* appearance-none: Safari otherwise draws its own small rounded control
              and ignores the padding, so we style it and add our own arrow. */}
          <div className="relative">
          <select
            required
            name="inquiry"
            defaultValue=""
            className={`${FIELD} ${border("inquiry")} appearance-none rounded-none bg-white pr-12 text-ink invalid:text-muted`}
            {...a11y("inquiry")}
          >
            <option value="" disabled>
              YOUR INQUIRY ABOUT*
            </option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>
          {errorText("inquiry")}
        </div>
        <div>
          <textarea
            name="message"
            rows={5}
            minLength={MESSAGE_MIN}
            placeholder="YOUR MESSAGE* — what needs doing, where, and when"
            className={`${FIELD} ${border("message")} resize-y`}
            {...a11y("message")}
          />
          {errorText("message")}
        </div>

        {/* Turnstile tokens are single-use, so each server reply gets a fresh check. */}
        <Turnstile resetKey={state} />
        <button type="submit" disabled={pending} className="btn btn-red w-full justify-center py-4 disabled:opacity-60">
          {pending ? "Sending…" : "Request a Quote"}
        </button>
        <BrandLoader
          status={loader}
          title={state?.ok ? "Request sent!" : "We couldn't send your request"}
          message={
            state?.ok
              ? state.emailed
                ? "Our team has your request and will be in touch shortly."
                : "We've received your request and will be in touch shortly."
              : state?.error
          }
          phone={phone}
          onClose={() => setDismissed(state)}
        />
        <p role="status" aria-live="polite" className="text-center text-sm font-medium">
          {state?.ok && (
            <span className="text-green-600">
              Thanks — your request has been sent. We&apos;ll be in touch shortly.
            </span>
          )}
          {state && !state.ok && <span className="text-red-600">{state.error}</span>}
        </p>
      </form>
    </div>
  );
}
