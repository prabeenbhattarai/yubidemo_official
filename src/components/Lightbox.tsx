"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GalleryPhoto } from "@/lib/gallery";
import { ArrowRight, CloseIcon } from "./Icons";

/**
 * Full-screen photo preview: arrows, keyboard (← → Esc), swipe on touch
 * screens, and a thumbnail strip. Captions are deliberately not shown.
 */
export default function Lightbox({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: GalleryPhoto[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  // Portals need document.body, which only exists after the first client render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const count = photos.length;
  const go = useCallback((step: number) => onIndex((index + step + count) % count), [index, count, onIndex]);
  const touchX = useRef<number | null>(null);
  const thumbs = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  // Warm up the neighbours so arrowing through feels instant, and keep the
  // active thumbnail in view.
  useEffect(() => {
    [1, -1].forEach((s) => {
      const img = new Image();
      img.src = photos[(index + s + count) % count]?.url ?? "";
    });
    thumbs.current?.children[index]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index, photos, count]);

  if (!mounted || !photos[index]) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${count}`}
      className="lightbox-in fixed inset-0 z-[90] flex flex-col bg-[#0d0f12]"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-4 text-white sm:px-6">
        <span className="text-[14px] font-medium tabular-nums text-white/70">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:rotate-90 hover:bg-white/20"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={photos[index].url}
          src={photos[index].url}
          alt={photos[index].alt}
          className="lightbox-photo max-h-full max-w-full select-none rounded-md object-contain shadow-2xl"
          draggable={false}
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-brand sm:flex"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-brand sm:flex"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div ref={thumbs} className="flex gap-2 overflow-x-auto px-4 py-4 sm:justify-center sm:px-6">
          {photos.map((p, i) => (
            <button
              key={p.url}
              type="button"
              onClick={() => onIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-md transition sm:h-16 sm:w-16 ${
                i === index ? "opacity-100 ring-2 ring-brand ring-offset-2 ring-offset-[#0d0f12]" : "opacity-45 hover:opacity-80"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
