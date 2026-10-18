import Flash from "@/components/admin/Flash";
import GalleryManager from "@/components/admin/GalleryManager";
import { getGallery, getProjects } from "@/lib/content";

export default async function GalleryAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [images, projects, sp] = await Promise.all([getGallery(), getProjects(), searchParams]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-poppins)" }}>
        Gallery
      </h1>
      <p className="mt-1 text-muted">
        Upload site photos and choose a project folder for each. Every photo also appears in the
        “Yubi Demolition” folder, and each project&apos;s main photo is added to its folder automatically.
      </p>

      <div className="mt-6">
        <Flash saved={sp.saved === "1"} deleted={sp.deleted === "1"} />
        <GalleryManager images={images} folders={projects.map((p) => p.title)} />
      </div>
    </div>
  );
}
