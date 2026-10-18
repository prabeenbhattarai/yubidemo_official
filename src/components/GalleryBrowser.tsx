"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import type { GalleryFolder } from "@/lib/gallery";
import { ALL_FOLDER } from "@/lib/gallery";
import Lightbox from "./Lightbox";
import { ArrowRight } from "./Icons";

// The open folder lives in the URL hash (#folder-slug) so the browser's back
// button returns to the folder list and a folder can be linked to directly.
const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readHash = () => decodeURIComponent(window.location.hash.slice(1));

function setHash(slug: string) {
  const url = window.location.pathname + window.location.search + (slug ? `#${slug}` : "");
  window.history.pushState(null, "", url);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function FolderCard({ folder, onOpen }: { folder: GalleryFolder; onOpen: () => void }) {
  const isAll = folder.name === ALL_FOLDER;
  const [cover, ...rest] = folder.photos;
  return (
    <button type="button" onClick={onOpen} className="group block text-left">
      {/* Stacked-photo look: two offset sheets peek out behind the cover. */}
      <div className="relative pr-3 pt-3">
        {rest[1] && (
          <span className="absolute right-0 top-0 h-[calc(100%-12px)] w-[calc(100%-12px)] overflow-hidden rounded-xl bg-gray-300 opacity-60 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={rest[1].url} alt="" loading="lazy" className="h-full w-full object-cover" />
          </span>
        )}
        {rest[0] && (
          <span className="absolute right-1.5 top-1.5 h-[calc(100%-12px)] w-[calc(100%-12px)] overflow-hidden rounded-xl bg-gray-200 opacity-85 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={rest[0].url} alt="" loading="lazy" className="h-full w-full object-cover" />
          </span>
        )}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink shadow-[0_12px_30px_rgba(15,20,25,0.15)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover.url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {isAll && (
            <span className="absolute left-4 top-4 bg-brand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
              All photos
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white">
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-[17px] font-semibold leading-tight">
                <FolderIcon className="h-5 w-5 shrink-0 text-brand" />
                <span className="truncate">{folder.name}</span>
              </span>
              <span className="mt-1 block text-[13px] text-white/75">
                {folder.photos.length} photo{folder.photos.length === 1 ? "" : "s"}
              </span>
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition group-hover:bg-brand">
              <ArrowRight className="h-4 w-4" />
            </span>
          </span>
        </div>
      </div>
    </button>
  );
}

export default function GalleryBrowser({ folders }: { folders: GalleryFolder[] }) {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const open = folders.find((f) => f.slug === hash) ?? null;
  const [photo, setPhoto] = useState<number | null>(null);
  const top = useRef<HTMLDivElement>(null);

  const show = (slug: string) => {
    setPhoto(null);
    setHash(slug);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={top} className="scroll-mt-28">
      {!open ? (
        <>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Photo gallery</p>
              <h2 className="mt-2 text-3xl font-bold text-ink md:text-4xl">Browse by project</h2>
            </div>
            <p className="text-[15px] text-muted">
              {folders.length} folder{folders.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {folders.map((f) => (
              <FolderCard key={f.slug} folder={f} onOpen={() => show(f.slug)} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => show("")}
                aria-label="Back to all folders"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-ink transition hover:border-brand hover:text-brand"
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
              </button>
              <div>
                <button type="button" onClick={() => show("")} className="text-[13px] font-medium text-muted hover:text-brand">
                  All folders
                </button>
                <h2 className="text-2xl font-bold text-ink md:text-3xl">{open.name}</h2>
              </div>
            </div>
            <p className="text-[15px] text-muted">
              {open.photos.length} photo{open.photos.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {open.photos.map((p, i) => (
              <button
                key={p.url}
                type="button"
                onClick={() => setPhoto(i)}
                aria-label={`Open photo ${i + 1} of ${open.photos.length}`}
                className="group relative aspect-square overflow-hidden rounded-lg bg-gray-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Hover hint only — no caption text. */}
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                  <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {open && photo !== null && (
        <Lightbox photos={open.photos} index={photo} onIndex={setPhoto} onClose={() => setPhoto(null)} />
      )}
    </div>
  );
}
