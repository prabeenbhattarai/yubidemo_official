"use client";

import { useState } from "react";
import { EyeIcon, TargetIcon } from "../Icons";

const INTERVAL_MS = 5000;

/**
 * Mission and Vision, auto-advancing. The red line beside the text fills up
 * as the timer runs; when it's full the next slide shows. Hover or focus
 * pauses it, and with reduced motion it doesn't auto-advance at all.
 */
export default function MissionVision({ mission, vision }: { mission: string; vision: string }) {
  const slides = [
    { label: "Mission", heading: "What drives us", text: mission, Icon: TargetIcon },
    { label: "Vision", heading: "Where we're heading", text: vision, Icon: EyeIcon },
  ];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Bumped on manual switches so the progress line restarts from zero.
  const [cycle, setCycle] = useState(0);

  const go = (i: number) => {
    setActive(i);
    setCycle((c) => c + 1);
  };

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setPaused(false)}
    >
      {/* Pill switch with a highlight that glides to the active option. */}
      <div
        role="tablist"
        aria-label="Mission and vision"
        className="relative inline-grid grid-cols-2 rounded-full border border-gray-200 bg-white p-1 shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
      >
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(${active * 100}%)` }}
        />
        {slides.map((s, i) => (
          <button
            key={s.label}
            type="button"
            role="tab"
            id={`mv-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`mv-panel-${i}`}
            onClick={() => go(i)}
            className={`relative z-10 rounded-full px-6 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${
              active === i ? "text-white" : "text-muted hover:text-ink"
            }`}
          >
            Our {s.label}
          </button>
        ))}
      </div>

      <div className="relative mt-8 pl-7">
        {/* The line is the timer. */}
        <span aria-hidden className="absolute bottom-1 left-0 top-1 w-[3px] overflow-hidden rounded-full bg-gray-200">
          <span
            key={`${active}-${cycle}`}
            className="mv-progress absolute inset-x-0 top-0 rounded-full bg-brand"
            style={{ animationDuration: `${INTERVAL_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
            onAnimationEnd={() => setActive((a) => (a + 1) % slides.length)}
          />
        </span>

        {/* Both slides share one grid cell, so the height stays put when they swap. */}
        <div className="grid">
          {slides.map((s, i) => (
            <div
              key={s.label}
              role="tabpanel"
              id={`mv-panel-${i}`}
              aria-labelledby={`mv-tab-${i}`}
              aria-hidden={active !== i}
              className={`[grid-area:1/1] transition-all duration-700 ease-out motion-reduce:transition-none ${
                active === i ? "translate-y-0 opacity-100 blur-0" : "pointer-events-none translate-y-3 opacity-0 blur-[2px]"
              }`}
            >
              <div className="flex items-center gap-2.5 text-brand">
                <s.Icon className="h-5 w-5" />
                <span className="text-[17px] font-semibold text-ink">{s.heading}</span>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
