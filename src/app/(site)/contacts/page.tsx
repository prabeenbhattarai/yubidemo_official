import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import ContactForm from "@/components/ContactForm";
import Faq from "@/components/Faq";
import { getCompany, getFaqs, getServices } from "@/lib/content";
import { ArrowRight, GlobeIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/Icons";
import { mapsEmbed, mapsLink } from "@/lib/maps";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Yubi Demolition for a fast, no-obligation quote. Call, email or send us a message.",
  alternates: { canonical: "/contacts" },
};

export default async function ContactsPage() {
  const [company, services, faqs] = await Promise.all([
    getCompany(),
    getServices(),
    getFaqs(),
  ]);
  const serviceLinks = services.map((s) => ({ slug: s.slug, title: s.title }));

  const cards = [
    { icon: <PhoneIcon className="h-6 w-6" />, label: "Call Us", value: company.phone, href: `tel:${company.phoneHref}` },
    { icon: <MailIcon className="h-6 w-6" />, label: "Email Us", value: company.email, href: `mailto:${company.email}` },
    { icon: <PinIcon className="h-6 w-6" />, label: "Visit Us", value: company.address, href: mapsLink(company.address), external: true },
    { icon: <GlobeIcon className="h-6 w-6" />, label: "Website", value: company.website },
  ];

  return (
    <>
      <PageBanner title="Contact Us" crumb="Contacts" />

      <section className="bg-white py-16">
        <div className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="border border-gray-200 p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-brand text-white">
                {c.icon}
              </div>
              <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-ink">
                {c.label}
              </h3>
              {c.href ? (
                <a
                  href={c.href}
                  {...("external" in c ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="mt-1 block text-[14px] text-muted hover:text-brand"
                >
                  {c.value}
                </a>
              ) : (
                <p className="mt-1 text-[14px] text-muted">{c.value}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="quote" className="bg-[#f7f8f9] py-16 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <ContactForm services={serviceLinks} phone={{ display: company.phone, href: company.phoneHref }} />
          <div>
            <h2 className="text-3xl font-bold text-ink md:text-4xl">FAQ Of Customer</h2>
            <p className="mt-4 text-[16px] text-muted">
              If you have any questions please ask us and we will answer you as quickly as possible.
            </p>
            <div className="mt-8">
              <Faq faqs={faqs} />
            </div>
          </div>
        </div>
      </section>

      <section className="relative h-[420px] w-full bg-[#e5e7eb]">
        <iframe
          title={`Map showing ${company.address}`}
          src={mapsEmbed(company.address)}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="container-x pointer-events-none relative flex h-full items-end pb-6 md:items-center md:justify-end md:pb-0">
          <div className="pointer-events-auto w-full max-w-sm bg-white p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-brand text-white">
                <PinIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Find us</p>
                <p className="mt-1 font-semibold leading-snug text-ink">{company.address}</p>
              </div>
            </div>
            <a
              href={mapsLink(company.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-red mt-5 w-full justify-center"
            >
              Open in Google Maps <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
