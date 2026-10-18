import Flash from "@/components/admin/Flash";
import GalleryManager from "@/components/admin/GalleryManager";
import { ensureGallerySaved, getGallery, getGalleryFolders } from "@/lib/content";
import { isFirebaseConfigured } from "@/lib/firebase-admin";

const ERRORS: Record<string, string> = {
  notempty: "That folder still has photos. Move them to another folder or delete them first.",
  name: "Please enter a folder name.",
};

export default async function GalleryAdmin({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; saved?: string; deleted?: string; error?: string }>;
}) {
  const configured = isFirebaseConfigured();
  // Save the built-in photos for real the first time, so every photo has an ID
  // and can be selected, moved and deleted.
  if (configured) await ensureGallerySaved().catch((err) => console.error("[gallery] Initial save failed", err));

  const [images, folderList, sp] = await Promise.all([getGallery(), getGalleryFolders(), searchParams]);
  const folders = [...folderList]
    .sort((a, b) => a.order - b.order)
    .map((f) => ({ id: f.id!, name: f.name, order: f.order, count: images.filter((g) => g.folderId === f.id).length }));
  const active = folders.find((f) => f.id === sp.folder) ?? folders[0] ?? null;
  // Built-in photos have no ID until Firebase is connected; they're shown view-only.
  const photos = images
    .filter((g) => g.folderId === active?.id)
    .sort((a, b) => a.order - b.order)
    .map((g) => ({ id: g.id ?? g.url, url: g.url }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-poppins)" }}>
        Gallery
      </h1>
      <p className="mt-1 text-muted">
        Organise photos into folders. Each folder with photos shows on the Gallery page. Upload many photos at once,
        then click photos to select them for moving or deleting.
      </p>

      {!configured && (
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Firebase isn&apos;t connected yet, so folders and uploads are disabled. You&apos;re seeing the built-in photos.
        </p>
      )}

      <div className="mt-6">
        <Flash saved={sp.saved === "1"} deleted={sp.deleted === "1"} />
        {sp.error && ERRORS[sp.error] && (
          <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {ERRORS[sp.error]}
          </p>
        )}
        <GalleryManager folders={folders} active={active} photos={photos} canEdit={configured} />
      </div>
    </div>
  );
}
