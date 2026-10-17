import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our Projects",
  description:
    "Explore Yubi Demolition's completed projects — structural demolition, strip-outs, site clearance and concrete cutting across Sydney and NSW.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageBanner title="Our Projects" />
      <section className="bg-[#fafafa] py-20 md:py-24">
        <div className="container-x">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <article
                key={p.id ?? p.title}
                className="group overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt={p.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0" style={{ background: p.color }} />
                      <div
                        className="absolute inset-0 opacity-25"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(45deg, transparent 0 16px, rgba(0,0,0,.15) 16px 17px)",
                        }}
                      />
                    </>
                  )}
                  <span className="absolute left-4 top-4 bg-brand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    {p.category}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-brand">
                    {p.location}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-ink">{p.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{p.blurb}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
