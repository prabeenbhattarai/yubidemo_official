import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import { getServices } from "@/lib/content";
import { ArrowRight, ServiceIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Structural demolition, selective demolition, labour hire, concrete cutting, site preparation and contract cleaning — full-service demolition solutions from Yubi.",
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageBanner title="Our Services" crumb="Services" />
      <section className="bg-[#fafafa] py-20 md:py-24">
        <div className="container-x">
          <p className="mx-auto max-w-2xl text-center text-[16px] leading-relaxed text-muted">
            Yubi Demolition delivers a complete, integrated solutions package — handling everything
            from planning and demolition to safety, environmental management and final cleaning.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.slug}
                className="group flex flex-col overflow-hidden border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                {s.image && (
                  <div className="h-44 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image}
                      alt={s.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-8">
                  <div className="flex h-16 w-16 items-center justify-center bg-brand text-white transition-colors group-hover:bg-ink">
                    <ServiceIcon name={s.icon} className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-ink">{s.title}</h3>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">{s.excerpt}</p>
                  <Link
                    href={`/service/${s.slug}`}
                    className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-brand"
                  >
                    Read More <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
