import type { GalleryImage, Project } from "./content-types";

export type GalleryPhoto = { url: string; alt: string };
export type GalleryFolder = { slug: string; name: string; photos: GalleryPhoto[] };

export const ALL_FOLDER = "Yubi Demolition";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function unique(photos: GalleryPhoto[]): GalleryPhoto[] {
  const seen = new Set<string>();
  return photos.filter((p) => p.url && !seen.has(p.url) && seen.add(p.url));
}

/**
 * Folders for the Gallery page: "Yubi Demolition" first with every photo, then
 * one folder per project — that project's own photo plus any gallery photos
 * assigned to it in the admin panel. Empty folders are left out.
 */
export function buildFolders(gallery: GalleryImage[], projects: Project[]): GalleryFolder[] {
  const projectFolders = projects
    .map((p) => ({
      slug: slugify(p.title),
      name: p.title,
      photos: unique([
        ...(p.image ? [{ url: p.image, alt: p.title }] : []),
        ...gallery.filter((g) => g.folder === p.title).map((g) => ({ url: g.url, alt: g.alt })),
      ]),
    }))
    .filter((f) => f.photos.length > 0);

  const all = unique([
    ...gallery.map((g) => ({ url: g.url, alt: g.alt })),
    ...projectFolders.flatMap((f) => f.photos),
  ]);

  return [{ slug: slugify(ALL_FOLDER), name: ALL_FOLDER, photos: all }, ...projectFolders];
}
