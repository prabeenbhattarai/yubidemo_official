import type { Faq, Project, Service } from "./content-types";

export type SearchItem = {
  title: string;
  description: string;
  href: string;
  type: "Page" | "Service" | "Project" | "FAQ";
  keywords?: string;
};

const STATIC_PAGES: SearchItem[] = [
  { title: "Home", description: "Yubi Demolition — safe, efficient and reliable demolition.", href: "/", type: "Page" },
  { title: "About / Who Are We", description: "Learn about Yubi Demolition, our mission, safety and sustainability.", href: "/company", type: "Page", keywords: "about company mission vision who are we" },
  { title: "Our Services", description: "Demolition, strip-outs, labour hire, concrete cutting and more.", href: "/services", type: "Page", keywords: "services" },
  { title: "Gallery", description: "Photos of our projects, crews and equipment on site.", href: "/gallery", type: "Page", keywords: "gallery photos images" },
  { title: "Careers", description: "Join the Yubi Demolition team — send us your resume.", href: "/careers", type: "Page", keywords: "careers jobs work employment hiring" },
  { title: "Our Projects", description: "Completed demolition and site projects across Sydney and NSW.", href: "/our-projects", type: "Page", keywords: "projects portfolio work" },
  { title: "Contact Us", description: "Get in touch or request a quote.", href: "/contacts", type: "Page", keywords: "contact quote phone email address get in touch" },
];

export function buildSearchIndex(
  services: Service[],
  projects: Project[],
  faqs: Faq[]
): SearchItem[] {
  return [
    ...STATIC_PAGES,
    ...services.map((s) => ({
      title: s.title,
      description: s.excerpt,
      href: `/service/${s.slug}`,
      type: "Service" as const,
      keywords: s.description.join(" "),
    })),
    ...projects.map((p) => ({
      title: p.title,
      description: `${p.category} · ${p.location}`,
      href: `/our-projects/${p.slug}`,
      type: "Project" as const,
      keywords: p.blurb,
    })),
    ...faqs.map((f) => ({
      title: f.question,
      description: f.answer,
      href: "/contacts",
      type: "FAQ" as const,
    })),
  ];
}

/** Rank items against a query. Returns the best matches, most relevant first. */
export function searchItems(items: SearchItem[], query: string, limit = 8): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    const title = item.title.toLowerCase();
    const desc = item.description.toLowerCase();
    const kw = (item.keywords ?? "").toLowerCase();
    let score = 0;
    if (title === q) score = 100;
    else if (title.startsWith(q)) score = 80;
    else if (title.includes(q)) score = 60;
    else if (desc.includes(q)) score = 30;
    else if (kw.includes(q)) score = 20;
    if (score > 0) scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}
