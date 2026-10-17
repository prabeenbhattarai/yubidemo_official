"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Service } from "@/lib/content-types";
import { ArrowRight, ServiceIcon } from "../Icons";

export default function ServicesSlider({ services }: { services: Service[] }) {
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);
  const hovering = useRef(false);

  // responsive cards-per-view
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const maxIndex = Math.max(0, services.length - perView);
  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const next = useCallback(
    () => setIndex((i) => (i >= maxIndex ? 0 : i + 1)),
    [maxIndex]
  );
  const prev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1));

  // autoplay
  useEffect(() => {
    if (services.length <= perView) return;
    const t = setInterval(() => {
      if (!hovering.current) next();
    }, 4500);
    return () => clearInterval(t);
  }, [next, perView, services.length]);

  const dots = useMemo(() => Array.from({ length: maxIndex + 1 }), [maxIndex]);

  return (
    <div
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
    >
      <div className="relative">
        {/* arrows */}
        {services.length > perView && (
          <>
            <button
              onClick={prev}
              aria-label="Previous services"
              className="absolute -left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-ink shadow-md transition-all hover:border-brand hover:bg-brand hover:text-white lg:flex"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
            <button
              onClick={next}
              aria-label="Next services"
              className="absolute -right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-ink shadow-md transition-all hover:border-brand hover:bg-brand hover:text-white lg:flex"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* track */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
          >
            {services.map((s) => (
              <div
                key={s.id ?? s.slug}
                className="shrink-0 px-3"
                style={{ flex: `0 0 ${100 / perView}%` }}
              >
                <ServiceCard service={s} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* dots */}
      {dots.length > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {dots.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-8 bg-brand" : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="group flex h-full flex-col overflow-hidden border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-2 hover:border-brand/40 hover:shadow-2xl">
      {service.image && (
        <div className="h-44 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-8">
        <div className="flex h-16 w-16 items-center justify-center bg-brand text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-ink">
          <ServiceIcon name={service.icon} className="h-8 w-8" />
        </div>
        <h3 className="mt-6 text-xl font-semibold text-ink">{service.title}</h3>
        <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">{service.excerpt}</p>
        <Link
          href={`/service/${service.slug}`}
          className="mt-6 inline-flex items-center gap-2 self-start border border-gray-200 px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white"
        >
          Read More <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
