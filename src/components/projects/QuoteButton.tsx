"use client";

import { openQuotePopup } from "@/lib/quote-popup";
import { ArrowRight } from "../Icons";

export default function QuoteButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openQuotePopup} className={`btn btn-red ${className}`}>
      Request a Quote <ArrowRight className="h-4 w-4" />
    </button>
  );
}
