import Flash from "@/components/admin/Flash";
import GalleryManager from "@/components/admin/GalleryManager";
import { getGallery } from "@/lib/content";

export default async function GalleryAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [images, sp] = await Promise.all([getGallery(), searchParams]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-poppins)" }}>
        Gallery
      </h1>
      <p className="mt-1 text-muted">Upload and manage the site photos shown on the Gallery page.</p>

      <div className="mt-6">
        <Flash saved={sp.saved === "1"} deleted={sp.deleted === "1"} />
        <GalleryManager images={images} />
      </div>
    </div>
  );
}
