import type { MetadataRoute } from "next";
import { getGallery, getProjects, getServices } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

// Rebuilt at most once an hour, so new projects and services show up without a redeploy.
export const revalidate = 3600;

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

/** Every public page, for Google Search Console: /sitemap.xml */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, gallery] = await Promise.all([getServices(), getProjects(), getGallery()]);
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: abs("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: abs("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: abs("/our-projects"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: abs("/company"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: abs("/contacts"), lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    {
      url: abs("/gallery"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
      images: gallery.slice(0, 1000).map((g) => abs(g.url)),
    },
    { url: abs("/careers"), lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];

  const servicePages: MetadataRoute.Sitemap = services.map((s) => ({
    url: abs(`/service/${s.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
    images: s.image ? [abs(s.image)] : undefined,
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: abs(`/our-projects/${p.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
    images: [p.image, ...(p.images ?? [])].filter(Boolean).map((u) => abs(u!)),
  }));

  return [...pages, ...servicePages, ...projectPages];
}
