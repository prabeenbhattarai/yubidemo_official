import ContactForm from "../ContactForm";
import Faq from "../Faq";
import type { Faq as FaqType } from "@/lib/content-types";

export default function ContactFaq({
  services,
  faqs,
  phone,
}: {
  services: { slug: string; title: string }[];
  faqs: FaqType[];
  phone?: { display: string; href: string };
}) {
  return (
    <section id="contact" className="relative bg-[#f7f8f9] py-20 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 6% 30%, rgba(0,0,0,0.04) 0, transparent 12%), radial-gradient(circle at 12% 60%, rgba(0,0,0,0.03) 0, transparent 10%)",
        }}
      />
      <div className="container-x relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <ContactForm services={services} phone={phone} />

        <div>
          <h2 className="text-3xl font-bold text-ink sm:text-4xl md:text-[46px]">FAQ Of Customer</h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            If you have any questions please ask us and we will answer you as quickly as possible.{" "}
            <span className="font-semibold text-ink">Make a question now!</span>
          </p>
          <div className="mt-6 flex items-center gap-1">
            <span className="h-1 w-24 bg-brand" />
            <span className="h-1 w-16 bg-gray-200" />
          </div>
          <div className="mt-8">
            <Faq faqs={faqs} />
          </div>
        </div>
      </div>
    </section>
  );
}
