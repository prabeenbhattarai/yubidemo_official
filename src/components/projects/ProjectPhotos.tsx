"use client";

import { useState } from "react";
import Lightbox from "../Lightbox";
import type { GalleryPhoto } from "@/lib/gallery";

/** Main photo + gallery grid for a project page; any photo opens full screen. */
export default function ProjectPhotos({ title, photos }: { title: string; photos: GalleryPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!photos.length) return null;
  const [main, ...rest] = photos;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(0)}
        className="group relative block aspect-[16/9] w-full overflow-hidden bg-gray-100"
        aria-label={`View photos of ${title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={main.url} alt={main.alt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        {photos.length > 1 && (
          <span className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-2 text-[13px] font-medium text-white backdrop-blur-sm">
            View all {photos.length} photos
          </span>
        )}
      </button>

      {rest.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {rest.slice(0, 8).map((p, i) => {
            const more = i === 7 && rest.length > 8 ? rest.length - 8 : 0;
            return (
              <button
                key={p.url}
                type="button"
                onClick={() => setOpen(i + 1)}
                className="group relative aspect-square overflow-hidden bg-gray-100"
                aria-label={`Open photo ${i + 2} of ${photos.length}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                {more > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">+{more}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
