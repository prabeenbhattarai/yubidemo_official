import Flash from "@/components/admin/Flash";
import ProjectsManager from "@/components/admin/ProjectsManager";
import { getProjects } from "@/lib/content";

export default async function ProjectsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [projects, sp] = await Promise.all([getProjects(), searchParams]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-poppins)" }}>
        Projects
      </h1>
      <p className="mt-1 text-muted">Manage the projects shown on the homepage and Our Projects page.</p>

      <div className="mt-6">
        <Flash saved={sp.saved === "1"} deleted={sp.deleted === "1"} />
        <ProjectsManager projects={projects} />
      </div>
    </div>
  );
}
