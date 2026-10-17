import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import WhyUs from "@/components/home/WhyUs";
import Sustainability from "@/components/home/Sustainability";
import { CheckCircle } from "@/components/Icons";
import { getHome } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Yubi Demolition — an integrated demolition company delivering safe, precise and sustainable site solutions across Sydney and NSW.",
};

const values = [
  { t: "Safety First", d: "Every decision starts with the safety of our people, clients and community." },
  { t: "Precision", d: "Engineering-led planning delivers accurate, controlled and reliable outcomes." },
  { t: "Sustainability", d: "Responsible waste management, recovery and recycling on every site." },
  { t: "Integrity", d: "Honest, transparent partnerships built to last." },
];

export default async function CompanyPage() {
  const home = await getHome();
  return (
    <>
      <PageBanner title="Who Are We" crumb="Company" />

      <section className="bg-white py-20 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">About Yubi Demolition</p>
            <h2 className="mt-2 text-3xl font-bold text-ink md:text-[42px]">{home.aboutTitle}</h2>
            <p className="mt-6 text-[16px] leading-relaxed text-muted">{home.aboutP1}</p>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">{home.aboutP2}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.t} className="border border-gray-200 p-6">
                <CheckCircle className="h-7 w-7 text-brand" />
                <h3 className="mt-4 text-lg font-semibold text-ink">{v.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhyUs home={home} />
      <Sustainability home={home} />
    </>
  );
}
