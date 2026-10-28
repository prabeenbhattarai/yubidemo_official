import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import ProjectCard from "@/components/ProjectCard";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our Projects",
  description:
    "Explore Yubi Demolition's completed projects — structural demolition, strip-outs, site clearance and concrete cutting across Sydney and NSW.",
};

export default async function ProjectsPage() {
  const projects = (await getProjects()).sort((a, b) => a.order - b.order);
  return (
    <>
      <PageBanner title="Our Projects" />
      <section className="bg-[#fafafa] py-20 md:py-24">
        <div className="container-x">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id ?? p.slug} project={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
