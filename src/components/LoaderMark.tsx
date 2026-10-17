/**
 * The Yubi logo used by the loaders, inside a thin outline that a red stroke
 * traces around while loading. The logo itself stays still; only the
 * jackhammer (a separate image layer) drills, with dust puffing from its tip.
 */
export default function LoaderMark({ animate = true, className = "" }: { animate?: boolean; className?: string }) {
  return (
    <div className={`relative aspect-square ${className}`}>
      {/* Outline ring: a faint track plus a red arc that sweeps around it. */}
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-ink/15" />
        {animate && (
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            strokeWidth="2.6"
            strokeLinecap="round"
            pathLength={100}
            className="loader-ring stroke-brand"
          />
        )}
      </svg>

      <div className="absolute inset-[13%] flex items-center justify-center">
        <div className="loader-logo-in relative w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/loader-logo.png" alt="" width={418} height={342} className="block h-auto w-full" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/loader-jackhammer.png"
            alt=""
            width={418}
            height={342}
            className={`absolute inset-0 h-auto w-full ${animate ? "loader-drill" : ""}`}
          />
          {animate && (
            // Dust puffs from the jackhammer's tip (73.7% across, at the bottom of the logo).
            <span aria-hidden className="absolute left-[73.7%] top-[101%]">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="loader-dust absolute rounded-full" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
