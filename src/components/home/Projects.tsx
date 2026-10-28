"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Project } from "@/lib/content-types";
import { ArrowRight } from "../Icons";
import ProjectCard from "../ProjectCard";

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
            <ProjectCard key={p.id ?? p.slug} project={p} className="w-[320px] shrink-0" />
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
