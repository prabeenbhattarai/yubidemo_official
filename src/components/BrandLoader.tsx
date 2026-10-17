"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type LoaderStatus = "idle" | "loading" | "success" | "error";

const STAGES = [
  { after: 0, text: "Checking your details…" },
  { after: 1200, text: "Sending your request to our team…" },
  { after: 4500, text: "Almost there…" },
];

/** Status line that moves through the stages while the request is in flight. */
function LoadingText() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const timers = STAGES.slice(1).map((s, i) => setTimeout(() => setStage(i + 1), s.after));
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <p key={stage} className="loader-text-in text-[15px] font-medium text-ink/80">
      {STAGES[stage].text}
    </p>
  );
}

/**
 * Full-screen branded loader shown while a quote is being sent. No card — the
 * logo floats over a frosted see-through layer. The jackhammer is a separate
 * image layer so it can "drill" (shake and kick up dust) on its own.
 */
export default function BrandLoader({
  status,
  title,
  message,
  phone,
  onClose,
}: {
  status: LoaderStatus;
  title?: string;
  message?: string;
  phone?: { display: string; href: string };
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  // Portals need document.body, which only exists after the first client render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (status === "idle") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && status !== "loading" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [status, onClose]);

  if (!mounted || status === "idle") return null;
  const busy = status === "loading";

  return createPortal(
    <div
      role={busy ? "status" : "alertdialog"}
      aria-live="assertive"
      aria-busy={busy}
      aria-label={busy ? "Sending your request" : title}
      className="loader-backdrop fixed inset-0 z-[95] flex flex-col items-center justify-center bg-white/80 px-6 text-center backdrop-blur-md"
      onMouseDown={(e) => !busy && e.target === e.currentTarget && onClose()}
    >
      <div className={`relative w-[220px] sm:w-[260px] ${busy ? "loader-bob" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/loader-logo.png" alt="" width={418} height={342} className="block h-auto w-full" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/loader-jackhammer.png"
          alt=""
          width={418}
          height={342}
          className={`absolute inset-0 h-auto w-full ${busy ? "loader-drill" : ""}`}
        />
        {busy && (
          // Dust puffs at the jackhammer's tip (73.7% across, bottom of the logo).
          <span aria-hidden className="absolute left-[73.7%] top-[97%]">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="loader-dust absolute h-1.5 w-1.5 rounded-full bg-[#6b4a42]/60" style={{ animationDelay: `${i * 0.18}s` }} />
            ))}
          </span>
        )}
      </div>

      <div className="mt-10 flex min-h-[96px] flex-col items-center">
        {busy ? (
          <>
            <span className="relative block h-[3px] w-48 overflow-hidden rounded-full bg-ink/10">
              <span className="loader-bar absolute inset-y-0 w-1/3 rounded-full bg-brand" />
            </span>
            <div className="mt-5">
              <LoadingText />
            </div>
          </>
        ) : (
          <div className="loader-text-in flex flex-col items-center">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg ${
                status === "success" ? "bg-green-600" : "bg-brand"
              }`}
            >
              {status === "success" ? (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path className="loader-tick" d="M5 12.5 10 17.5 19 7" />
                </svg>
              ) : (
                <span className="text-2xl font-bold leading-none">!</span>
              )}
            </span>
            <p className="mt-4 text-xl font-bold text-ink">{title}</p>
            {message && <p className="mt-1.5 max-w-sm text-[15px] leading-relaxed text-muted">{message}</p>}
            {status === "error" && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {phone && (
                  <a href={`tel:${phone.href}`} className="btn btn-red">
                    Call {phone.display}
                  </a>
                )}
                <button type="button" onClick={onClose} className="btn btn-outline">
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
