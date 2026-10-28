import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import ProjectPhotos from "@/components/projects/ProjectPhotos";
import QuoteButton from "@/components/projects/QuoteButton";
import { ArrowRight, CheckCircle } from "@/components/Icons";
import { getCompany, getProjectBySlug } from "@/lib/content";
import { OG_BASE } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const found = await getProjectBySlug(slug);
  if (!found) return { title: "Project" };
  const { project } = found;
  return {
    title: project.title,
    description: project.blurb,
    alternates: { canonical: `/our-projects/${project.slug}` },
    openGraph: { ...OG_BASE, url: `/our-projects/${project.slug}`, ...(project.image ? { images: [project.image] } : {}) },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const [found, company] = await Promise.all([getProjectBySlug(slug), getCompany()]);
  if (!found) notFound();
  const { project: p, prev, next } = found;

  const photos = [p.image, ...(p.images ?? [])]
    .filter((u, i, all): u is string => Boolean(u) && all.indexOf(u) === i)
    .map((url) => ({ url, alt: p.title }));
  const overview = p.overview?.length ? p.overview : [p.blurb];
  const facts = [
    ["Category", p.category],
    ["Location", p.location],
    ["Client", p.client],
    ["Completed", p.completed],
    ["Duration", p.duration],
    ["Project size", p.size],
  ].filter((f): f is [string, string] => Boolean(f[1]));

  return (
    <>
      <PageBanner title={p.title} crumb="Our Projects" />

      <section className="bg-white py-16 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="min-w-0">
            <Link href="/our-projects" className="inline-flex items-center gap-2 text-[14px] font-semibold text-muted hover:text-brand">
              <ArrowRight className="h-4 w-4 rotate-180" /> All projects
            </Link>

            <div className="mt-6">
              {photos.length ? (
                <ProjectPhotos title={p.title} photos={photos} />
              ) : (
                <div className="aspect-[16/9] w-full" style={{ background: p.color }} />
              )}
            </div>

            <p className="eyebrow mt-10">Project overview</p>
            <h2 className="mt-2 text-3xl font-bold text-ink md:text-4xl">{p.title}</h2>
            {overview.map((para, i) => (
              <p key={i} className="mt-5 text-[16px] leading-relaxed text-muted">
                {para}
              </p>
            ))}

            {p.scope && p.scope.length > 0 && (
              <>
                <h3 className="mt-10 text-2xl font-bold text-ink">What we did</h3>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {p.scope.map((s) => (
                    <li key={s} className="flex gap-3 text-[15px] leading-relaxed text-ink/85">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {p.outcome && (
              <div className="mt-10 border-l-4 border-brand bg-[#f7f8f9] p-6 md:p-8">
                <h3 className="text-xl font-bold text-ink">The result</h3>
                <p className="mt-3 text-[16px] leading-relaxed text-muted">{p.outcome}</p>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28">
            <div className="border border-gray-200 bg-white">
              <h3 className="border-b border-gray-200 px-6 py-4 text-lg font-semibold text-ink">Project details</h3>
              <dl className="divide-y divide-gray-100">
                {facts.map(([k, val]) => (
                  <div key={k} className="flex items-start justify-between gap-4 px-6 py-3.5">
                    <dt className="text-[13px] uppercase tracking-wide text-muted">{k}</dt>
                    <dd className="text-right text-[15px] font-semibold text-ink">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="bg-ink p-7 text-white">
              <h3 className="text-xl font-bold">Planning something similar?</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-white/75">
                Tell us about your site and get a free, no-obligation quote.
              </p>
              <QuoteButton className="mt-6 w-full justify-center" />
              <a href={`tel:${company.phoneHref}`} className="mt-4 block text-center text-[14px] text-white/80 hover:text-white">
                or call {company.phone}
              </a>
            </div>
          </aside>
        </div>
      </section>

      {(prev || next) && (
        <nav aria-label="More projects" className="border-t border-gray-200 bg-[#fafafa]">
          <div className="container-x grid sm:grid-cols-2">
            {[prev, next].map((q, i) =>
              q ? (
                <Link
                  key={q.slug}
                  href={`/our-projects/${q.slug}`}
                  className={`group flex items-center gap-4 py-8 ${i === 1 ? "justify-end text-right sm:border-l sm:border-gray-200 sm:pl-8" : "sm:pr-8"}`}
                >
                  {i === 0 && <ArrowRight className="h-5 w-5 shrink-0 rotate-180 text-brand transition-transform group-hover:-translate-x-1" />}
                  <span>
                    <span className="block text-[12px] uppercase tracking-wider text-muted">{i === 0 ? "Previous project" : "Next project"}</span>
                    <span className="mt-1 block text-lg font-semibold text-ink group-hover:text-brand">{q.title}</span>
                  </span>
                  {i === 1 && <ArrowRight className="h-5 w-5 shrink-0 text-brand transition-transform group-hover:translate-x-1" />}
                </Link>
              ) : (
                <span key={i} />
              )
            )}
          </div>
        </nav>
      )}
    </>
  );
}
