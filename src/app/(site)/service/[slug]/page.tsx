import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import { getService, getServices } from "@/lib/content";
import { ArrowRight, CheckCircle, ServiceIcon } from "@/components/Icons";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Service" };
  return { title: service.title, description: service.excerpt };
}

export default async function ServiceDetail({ params }: Params) {
  const { slug } = await params;
  const [service, services] = await Promise.all([getService(slug), getServices()]);
  if (!service) notFound();

  return (
    <>
      <PageBanner title={service.title} crumb="Services" />
      <section className="bg-white py-20 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_320px] lg:items-start">
          <div>
            {service.image ? (
              <div className="mb-8 h-72 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={service.image} alt={service.title} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center bg-brand text-white">
                <ServiceIcon name={service.icon} className="h-10 w-10" />
              </div>
            )}
            <h2 className="mt-8 text-3xl font-bold text-ink md:text-4xl">{service.title}</h2>
            {service.description.map((p, i) => (
              <p key={i} className="mt-5 text-[16px] leading-relaxed text-muted">
                {p}
              </p>
            ))}

            <h3 className="mt-10 text-xl font-semibold text-ink">What you can expect</h3>
            <ul className="mt-5 space-y-4">
              {[
                "Fully licensed, insured and safety-inducted crews",
                "Detailed planning and site-specific risk assessment",
                "Responsible waste management and material recovery",
                "Clear communication and on-time delivery",
              ].map((point) => (
                <li key={point} className="flex gap-3">
                  <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-brand" />
                  <span className="text-[15px] text-ink/80">{point}</span>
                </li>
              ))}
            </ul>

            <Link href="/contacts" className="btn btn-red mt-10">
              Request a Quote <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <aside className="space-y-8">
            <div className="border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-ink">All Services</h3>
              <ul className="mt-4 space-y-1">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/service/${s.slug}`}
                      className={`flex items-center justify-between px-4 py-3 text-[14px] transition-colors ${
                        s.slug === service.slug
                          ? "bg-brand text-white"
                          : "bg-gray-50 text-ink/80 hover:bg-gray-100"
                      }`}
                    >
                      {s.title}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-ink p-8 text-white">
              <h3 className="text-xl font-semibold">Need help with your project?</h3>
              <p className="mt-3 text-[14px] text-white/70">
                Talk to our team about your site and get a fast, no-obligation quote.
              </p>
              <Link href="/contacts" className="btn btn-red mt-6 w-full justify-center">
                Get In Touch
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
