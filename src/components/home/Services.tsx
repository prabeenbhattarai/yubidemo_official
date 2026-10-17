import type { Home, Service } from "@/lib/content-types";
import SectionHeading from "../SectionHeading";
import Reveal from "../Reveal";
import ServicesSlider from "./ServicesSlider";

export default function Services({
  home,
  services,
}: {
  home: Home;
  services: Service[];
}) {
  return (
    <section className="relative bg-[#fafafa] py-20 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(0,0,0,0.03) 0, transparent 30%), radial-gradient(circle at 85% 80%, rgba(0,0,0,0.03) 0, transparent 30%)",
        }}
      />
      <div className="container-x relative">
        <Reveal>
          <SectionHeading center title={home.servicesTitle} subtitle={home.servicesSubtitle} />
        </Reveal>

        <Reveal delay={120} className="mt-14">
          <ServicesSlider services={services} />
        </Reveal>
      </div>
    </section>
  );
}
