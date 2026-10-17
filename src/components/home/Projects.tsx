"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Project } from "@/lib/content-types";
import { ArrowRight } from "../Icons";

export default function Projects({
  projects,
  title,
  text,
}: {
  projects: Project[];
  title: string;
  text: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="bg-[#f7f8f9] py-20 md:py-28">
      <div className="container-x">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-ink sm:text-4xl md:text-[44px]">{title}</h2>
            <p className="mt-5 text-[16px] leading-relaxed text-muted">{text}</p>
            <div className="mt-6 flex items-center gap-1">
              <span className="h-1 w-16 bg-brand" />
              <span className="h-1 w-24 bg-gray-200" />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Previous projects"
              className="flex h-14 w-14 items-center justify-center border border-gray-300 text-ink transition-colors hover:border-brand hover:bg-brand hover:text-white"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Next projects"
              className="flex h-14 w-14 items-center justify-center border border-gray-300 text-ink transition-colors hover:border-brand hover:bg-brand hover:text-white"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scroller}
          className="mt-12 flex gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {projects.map((p) => (
            <article
              key={p.id ?? p.title}
              className="group w-[320px] shrink-0 overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={p.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0" style={{ background: p.color }} />
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, transparent 0 16px, rgba(0,0,0,.15) 16px 17px)",
                      }}
                    />
                  </>
                )}
                <span className="absolute left-4 top-4 bg-brand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {p.category}
                </span>
              </div>
              <div className="p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-brand">{p.location}</p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{p.blurb}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/our-projects" className="btn btn-red">
            View All Projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
