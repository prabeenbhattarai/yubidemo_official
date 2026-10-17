"use client";

import { useCallback, useEffect, useState } from "react";
import { TOAST_EVENT, type ToastInput } from "@/lib/toast";
import { CheckCircle, CloseIcon } from "./Icons";

type Item = ToastInput & { id: number; leaving?: boolean };
const SHOW_MS = 5000;

export default function Toaster() {
  const [items, setItems] = useState<Item[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 250);
  }, []);

  useEffect(() => {
    let next = 0;
    const onToast = (e: Event) => {
      const id = ++next;
      setItems((list) => [...list.slice(-2), { ...(e as CustomEvent<ToastInput>).detail, id }]);
      setTimeout(() => dismiss(id), SHOW_MS);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, [dismiss]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
    >
      {items.map((t) => {
        const kind = t.kind ?? "success";
        return (
          <div
            key={t.id}
            role={kind === "error" ? "alert" : "status"}
            className={`toast pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border bg-white p-4 pr-3 shadow-[0_18px_50px_rgba(15,20,25,0.18)] ${
              t.leaving ? "toast-out" : "toast-in"
            } ${kind === "error" ? "border-red-100" : "border-gray-100"}`}
          >
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                kind === "error" ? "bg-red-50 text-brand" : kind === "info" ? "bg-gray-100 text-ink" : "bg-green-50 text-green-600"
              }`}
            >
              {kind === "error" ? <span className="text-lg font-bold leading-none">!</span> : <CheckCircle className="h-5 w-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-ink">{t.title}</p>
              {t.message && <p className="mt-0.5 text-[13px] leading-snug text-muted">{t.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-gray-100 hover:text-ink"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
            <span
              aria-hidden
              className={`toast-timer absolute bottom-0 left-0 h-[3px] ${kind === "error" ? "bg-brand" : "bg-green-500"}`}
              style={{ animationDuration: `${SHOW_MS}ms` }}
            />
          </div>
        );
      })}
    </div>
  );
}
