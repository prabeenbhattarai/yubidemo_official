import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import { ArrowRight, BriefcaseIcon, CheckCircle } from "@/components/Icons";
import { getCompany } from "@/lib/content";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the Yubi Demolition team. Send us your resume for future demolition and site roles across Sydney and NSW.",
};

const perks = [
  "Competitive, above-award pay rates",
  "Ongoing training and ticket support",
  "A genuine safety-first culture",
  "Steady pipeline of varied projects",
];

export default async function CareersPage() {
  const company = await getCompany();
  const resumeHref = `mailto:${company.email}?subject=${encodeURIComponent("Resume — Yubi Demolition")}`;

  return (
    <>
      <PageBanner title="Careers" />
      <section className="bg-white py-20 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <p className="eyebrow">Work With Us</p>
            <h2 className="mt-2 text-3xl font-bold text-ink md:text-4xl">
              Build your career with Yubi
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-muted">
              Our people are our greatest asset. If you take pride in safe, high-quality work and
              want to grow with a company that invests in its team, we&apos;d love to hear from you.
            </p>

            {/* No open roles at the moment. Add listings back here when hiring. */}
            <div className="mt-10 flex flex-col items-start gap-5 border border-dashed border-gray-300 bg-[#fafafa] p-8 sm:flex-row sm:items-center">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-brand/10 text-brand">
                <BriefcaseIcon className="h-7 w-7" />
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-ink">No open positions right now</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">
                  We&apos;re not advertising any roles at the moment, but we&apos;re always keen to hear from
                  skilled people. Send us your resume and we&apos;ll keep it on file for future openings.
                </p>
              </div>
              <a href={resumeHref} className="btn btn-outline shrink-0">
                Send Your Resume <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <aside className="bg-[#f4f5f7] p-8">
            <h3 className="text-xl font-semibold text-ink">Why join Yubi?</h3>
            <ul className="mt-6 space-y-4">
              {perks.map((p) => (
                <li key={p} className="flex gap-3">
                  <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-brand" />
                  <span className="text-[15px] text-ink/80">{p}</span>
                </li>
              ))}
            </ul>
            <a href={resumeHref} className="btn btn-red mt-8 w-full justify-center">
              Send Your Resume
            </a>
          </aside>
        </div>
      </section>
    </>
  );
}
