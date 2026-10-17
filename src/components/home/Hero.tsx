"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "../Icons";
import type { Home } from "@/lib/content-types";

export default function Hero({ home }: { home: Home }) {
  const slides =
    home.heroImages && home.heroImages.length > 0
      ? home.heroImages
      : home.heroImage
        ? [home.heroImage]
        : [];

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setActive((a) => (a + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* background slideshow */}
      <div className="absolute inset-0">
        {slides.length > 0 ? (
          slides.map((src, i) => (
            <div
              key={src + i}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className={`h-full w-full object-cover ${i === active ? "hero-kenburns" : ""}`}
              />
            </div>
          ))
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(115deg, #14171c 0%, #1c2127 45%, #2b3138 100%)" }}
          />
        )}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute -right-24 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-brand/20 blur-3xl" />
      </div>

      {/* Fills the whole first screen; the transparent header sits on top of it,
          so the top padding clears the 76px navbar (120px with the contact bar
          on desktop). svh keeps it steady while mobile browser bars show/hide. */}
      <div className="container-x relative grid min-h-[max(640px,100svh)] items-center gap-8 pb-20 pt-[calc(76px+3rem)] lg:min-h-[max(700px,100svh)] lg:grid-cols-[1.4fr_1fr] lg:pt-[calc(120px+3rem)]">
        <div className="fade-up max-w-2xl">
          <h1 className="text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl lg:text-[68px]">
            {home.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/75">{home.heroSubtitle}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/company" className="btn btn-red">
              Learn More <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/services" className="btn btn-white">
              Our Services
            </Link>
          </div>

          {/* slide indicators */}
          {slides.length > 1 && (
            <div className="mt-10 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Show slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === active ? "w-9 bg-brand" : "w-4 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Response card */}
        <div className="fade-up relative lg:justify-self-end">
          <div className="relative max-w-sm bg-brand p-8 text-white shadow-2xl">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 80% 20%, rgba(255,255,255,.35) 0, transparent 55%)",
              }}
            />
            <h3 className="relative text-2xl font-bold">{home.responseTitle}</h3>
            <p className="relative mt-4 text-[15px] leading-relaxed text-white/90">
              {home.responseText}
            </p>
            <Link
              href="/company#safety"
              aria-label="Read more about our response"
              className="relative mt-8 inline-flex h-14 w-14 items-center justify-center bg-white text-brand transition-transform hover:translate-x-1"
            >
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
