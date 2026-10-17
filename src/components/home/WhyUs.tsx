import { CheckCircle } from "../Icons";
import type { Home } from "@/lib/content-types";
import Reveal from "../Reveal";

export default function WhyUs({ home }: { home: Home }) {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* image */}
        <Reveal variant="left" className="relative aspect-[4/3] overflow-hidden">
          {home.whyImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={home.whyImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, #2a2f36 0%, #3a4149 60%, #1c2025 100%)" }}
              />
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 35% 55%, rgba(255,170,60,0.9) 0, rgba(255,120,20,0.25) 8%, transparent 22%)",
                }}
              />
            </>
          )}
          <span className="absolute bottom-5 left-5 rounded bg-brand px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
            Hot Works & Cutting
          </span>
        </Reveal>

        <Reveal variant="right">
          <p className="eyebrow">Why Choose Us?</p>
          <h2 className="mt-2 text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-[42px]">
            {home.whyTitle}
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-muted">{home.whySubtitle}</p>

          <ul className="mt-8 space-y-5">
            {home.whyPoints.map((p, i) => (
              <li key={i} className="flex gap-4">
                <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-brand" />
                <span className="text-[15px] leading-relaxed text-ink/80">{p}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
