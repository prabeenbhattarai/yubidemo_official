"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Company } from "@/lib/content-types";
import { OPEN_QUOTE_EVENT } from "@/lib/quote-popup";
import ContactForm from "./ContactForm";
import { CheckCircle, CloseIcon, PhoneIcon } from "./Icons";

const STORAGE_KEY = "yubi-quote-popup";
const SHOW_AFTER_MS = 8000;
// After someone closes it, leave them alone for a few days.
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;

type Saved = { dismissedAt?: number; submitted?: boolean };

function readSaved(): Saved {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Saved;
  } catch {
    return {};
  }
}
function writeSaved(patch: Saved) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readSaved(), ...patch }));
  } catch {
    // Private mode or blocked storage — the popup just may show again next visit.
  }
}

const POINTS = [
  "Free, no-obligation quotes",
  "Demolition, strip-outs & site services",
  "Serving Sydney & NSW",
];

export default function QuotePopup({
  company,
  services,
}: {
  company: Company;
  services: { slug: string; title: string }[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  // Show once the visitor has been on the site for a few seconds — but not on
  // the contact page (the form is already there), and not if they recently
  // closed it or already sent a request.
  useEffect(() => {
    if (pathname.startsWith("/contacts")) return;
    const saved = readSaved();
    if (saved.submitted) return;
    if (saved.dismissedAt && Date.now() - saved.dismissedAt < SNOOZE_MS) return;
    const t = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  // Buttons elsewhere (mega menu, etc.) can open it on demand.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_QUOTE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_QUOTE_EVENT, onOpen);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    writeSaved({ dismissedAt: Date.now() });
  }, []);

  const onSuccess = useCallback(() => {
    setSent(true);
    writeSaved({ submitted: true });
  }, []);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastFocus.current?.focus?.();
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="popup-backdrop fixed inset-0 z-[80] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-popup-title"
        className="popup-panel relative grid max-h-[calc(100dvh-32px)] w-full max-w-[960px] overflow-y-auto rounded-3xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] md:overflow-hidden outline-none"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:rotate-90 hover:bg-white md:bg-gray-100 md:shadow-none md:hover:bg-gray-200"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        {/* Photo side */}
        <div className="relative min-h-[200px] overflow-hidden bg-ink md:min-h-[600px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/demo1.jpeg"
            alt="Yubi Demolition crew member carrying out hot works from a scissor lift"
            className="popup-photo absolute inset-0 h-full w-full object-cover object-[center_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
            <span className="inline-flex items-center gap-2 bg-brand px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
              <span className="h-1.5 w-1.5 rounded-full bg-white" /> Free quote
            </span>
            <p className="mt-4 text-[26px] font-bold leading-[1.15] md:text-[32px]">
              Let&apos;s clear the way for your next project.
            </p>
            <ul className="mt-5 hidden space-y-2.5 md:block">
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[15px] text-white/90">
                  <CheckCircle className="h-5 w-5 shrink-0 text-brand" /> {p}
                </li>
              ))}
            </ul>
            <a
              href={`tel:${company.phoneHref}`}
              className="mt-6 hidden items-center gap-3 border-t border-white/20 pt-5 text-[14px] text-white/80 transition-colors hover:text-white md:flex"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <PhoneIcon className="h-4 w-4" />
              </span>
              <span>
                Prefer to talk? <span className="font-semibold text-white">{company.phone}</span>
              </span>
            </a>
          </div>
        </div>

        {/* Form side */}
        <div className="p-6 sm:p-8 md:max-h-[calc(100dvh-32px)] md:overflow-y-auto md:p-10">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
              <h2 id="quote-popup-title" className="mt-6 text-2xl font-bold text-ink">
                Request sent — thank you!
              </h2>
              <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted">
                Our team will review your project and get back to you shortly.
              </p>
              <button type="button" onClick={close} className="btn btn-red mt-8">
                Back to the site
              </button>
            </div>
          ) : (
            <>
              <p className="eyebrow">Request a Quote</p>
              <h2 id="quote-popup-title" className="mt-2 pr-12 text-[26px] font-bold leading-tight text-ink md:text-3xl">
                Tell us about your job
              </h2>
              <p className="mt-2 text-[15px] text-muted">
                It takes about a minute. We&apos;ll reply with a quote, not a sales pitch.
              </p>
              <div className="mt-6">
                <ContactForm
                  heading={false}
                  bare
                  services={services}
                  onSuccess={onSuccess}
                  phone={{ display: company.phone, href: company.phoneHref }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
