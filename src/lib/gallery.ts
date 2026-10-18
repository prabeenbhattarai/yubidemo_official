import type { GalleryFolder, GalleryImage } from "./content-types";

export type GalleryPhoto = { url: string; alt: string };
export type GalleryFolderView = { slug: string; name: string; photos: GalleryPhoto[] };

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Folders for the Gallery page, in the order set in the admin. Empty folders
 * are hidden; photos whose folder was removed go into "More photos" so
 * nothing silently disappears.
 */
export function buildFolders(gallery: GalleryImage[], folders: GalleryFolder[]): GalleryFolderView[] {
  const known = new Set(folders.map((f) => f.id));
  const sorted = [...gallery].sort((a, b) => a.order - b.order);
  const toPhoto = (g: GalleryImage) => ({ url: g.url, alt: g.alt });

  const views = [...folders]
    .sort((a, b) => a.order - b.order)
    .map((f) => ({
      slug: slugify(f.name) || f.id!,
      name: f.name,
      photos: sorted.filter((g) => g.folderId === f.id).map(toPhoto),
    }));

  const unfiled = sorted.filter((g) => !g.folderId || !known.has(g.folderId)).map(toPhoto);
  if (unfiled.length) views.push({ slug: "more-photos", name: "More photos", photos: unfiled });

  return views.filter((v) => v.photos.length > 0);
}
