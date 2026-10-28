import Link from "next/link";
import type { Project } from "@/lib/content-types";
import { ArrowRight } from "./Icons";

/** Project card that opens the project's own page. */
export default function ProjectCard({ project: p, className = "" }: { project: Project; className?: string }) {
  const photos = (p.images?.length ?? 0) + (p.image ? 1 : 0);
  return (
    <Link
      href={`/our-projects/${p.slug}`}
      className={`group flex flex-col overflow-hidden bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl ${className}`}
    >
      <div className="relative h-56 shrink-0 overflow-hidden">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image}
            alt={p.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: p.color }} />
            <div
              className="absolute inset-0 opacity-25"
              style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0 16px, rgba(0,0,0,.15) 16px 17px)" }}
            />
          </>
        )}
        <span className="absolute left-4 top-4 bg-brand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {p.category}
        </span>
        {photos > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {photos} photos
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">{p.location}</p>
        <h3 className="mt-2 text-lg font-semibold text-ink transition-colors group-hover:text-brand">{p.title}</h3>
        <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-muted">{p.blurb}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[13px] font-semibold uppercase tracking-wide text-ink">
          View project <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
