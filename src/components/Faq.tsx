"use client";

import { useState } from "react";
import type { Faq as FaqType } from "@/lib/content-types";

export default function Faq({ faqs }: { faqs: FaqType[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="space-y-3">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.id ?? f.question} className="border border-gray-200">
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className={`flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[17px] font-semibold transition-colors ${
                isOpen ? "bg-ink text-white" : "bg-white text-ink hover:bg-gray-50"
              }`}
            >
              {f.question}
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center text-xl leading-none ${
                  isOpen ? "text-white" : "bg-brand text-white"
                }`}
              >
                {isOpen ? "–" : "+"}
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 py-5 text-[15px] leading-relaxed text-muted">{f.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
