import Link from "next/link";
import { ArrowRight } from "../Icons";
import type { Home } from "@/lib/content-types";
import Reveal from "../Reveal";
import MissionVision from "./MissionVision";

export default function About({ home }: { home: Home }) {
  return (
    <section id="about" className="scroll-mt-24 bg-white py-20 md:py-28">
      <div className="container-x grid gap-14 lg:grid-cols-2 lg:items-center">
        <Reveal variant="left">
          <h2 className="text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-[44px]">
            {home.aboutTitle}
          </h2>
          <p className="mt-6 text-[16px] leading-relaxed text-muted">{home.aboutP1}</p>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">{home.aboutP2}</p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {home.stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-brand md:text-4xl">{s.value}</div>
                <div className="mt-1 text-[13px] text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          <Link href="/company" className="btn btn-red mt-9">
            Read More About Us <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <Reveal variant="right">
          <MissionVision mission={home.missionText} vision={home.visionText} />
        </Reveal>
      </div>
    </section>
  );
}
