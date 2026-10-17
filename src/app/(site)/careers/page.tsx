import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import { ArrowRight, CheckCircle } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the Yubi Demolition team. Explore current openings for demolition and site roles across Sydney and NSW.",
};

const roles = [
  { title: "Demolition Labourer", type: "Full-time", location: "Sydney, NSW" },
  { title: "Excavator Operator", type: "Full-time", location: "Western Sydney, NSW" },
  { title: "Site Supervisor", type: "Full-time", location: "Sydney, NSW" },
  { title: "Concrete Cutter", type: "Casual", location: "Sydney, NSW" },
];

const perks = [
  "Competitive, above-award pay rates",
  "Ongoing training and ticket support",
  "A genuine safety-first culture",
  "Steady pipeline of varied projects",
];

export default function CareersPage() {
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

            <div className="mt-10 space-y-4">
              {roles.map((r) => (
                <div
                  key={r.title}
                  className="flex flex-col gap-3 border border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{r.title}</h3>
                    <p className="mt-1 text-[14px] text-muted">
                      {r.type} · {r.location}
                    </p>
                  </div>
                  <Link href="/contacts" className="btn btn-outline shrink-0">
                    Apply Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
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
            <Link href="/contacts" className="btn btn-red mt-8 w-full justify-center">
              Send Your Resume
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
