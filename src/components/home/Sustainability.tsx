import Link from "next/link";
import { ShieldIcon } from "../Icons";
import type { Home } from "@/lib/content-types";
import Reveal from "../Reveal";

export default function Sustainability({ home }: { home: Home }) {
  return (
    <section id="sustainability" className="bg-white">
      <div className="container-x grid gap-0 lg:grid-cols-2">
        {/* left column */}
        <Reveal variant="left" className="flex flex-col justify-center py-16 pr-0 lg:pr-14 lg:py-24">
          <p className="eyebrow">{home.sustainEyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl md:text-[44px]">
            {home.sustainTitle}
          </h2>
          <p className="mt-6 text-[16px] leading-relaxed text-muted">{home.sustainText}</p>
          <Link href="/company#sustainability" className="btn btn-red mt-8 self-start">
            About Our Sustainability
          </Link>
        </Reveal>

        {/* right image */}
        <Reveal variant="right" className="relative min-h-[360px] lg:min-h-[520px]">
          {home.sustainImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={home.sustainImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(160deg, #cfd3d8 0%, #9aa1a9 55%, #7c848d 100%)" }}
              />
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent 0 30px, rgba(0,0,0,.18) 30px 31px), repeating-linear-gradient(90deg, transparent 0 30px, rgba(0,0,0,.12) 30px 31px)",
                }}
              />
            </>
          )}
        </Reveal>
      </div>

      {/* Health & safety dark strip */}
      <div id="safety" className="bg-ink text-white">
        <div className="container-x grid gap-8 py-12 md:grid-cols-3">
          {home.safetyCards.map((c, i) => (
            <Reveal key={c.title} delay={i * 120} className="flex gap-5">
              <ShieldIcon className="h-10 w-10 shrink-0 text-white/70" />
              <div>
                <h3 className="text-xl font-semibold">{c.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/70">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
