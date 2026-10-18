import Link from "next/link";
import { getFaqs, getGallery, getProjects, getServices } from "@/lib/content";

export default async function AdminDashboard() {
  const [services, projects, faqs, gallery] = await Promise.all([
    getServices(),
    getProjects(),
    getFaqs(),
    getGallery(),
  ]);

  const cards = [
    { label: "Quote Requests", href: "/api/admin/yubidemo/quotes", desc: "Enquiries from the website, with spam checks" },
    { label: "Careers", href: "/api/admin/yubidemo/careers", desc: "Post jobs and review applications with CVs" },
    { label: "Company & Contact", href: "/api/admin/yubidemo/company", desc: "Phone, email, address, ABN, tagline" },
    { label: "Homepage Content", href: "/api/admin/yubidemo/homepage", desc: "Hero, about, mission, why-us, sustainability" },
    { label: "Services", href: "/api/admin/yubidemo/services", desc: `${services.length} service${services.length === 1 ? "" : "s"}` },
    { label: "Projects", href: "/api/admin/yubidemo/projects", desc: `${projects.length} project${projects.length === 1 ? "" : "s"}` },
    { label: "FAQs", href: "/api/admin/yubidemo/faqs", desc: `${faqs.length} question${faqs.length === 1 ? "" : "s"}` },
    { label: "Gallery", href: "/api/admin/yubidemo/gallery", desc: `${gallery.length} photo${gallery.length === 1 ? "" : "s"}` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-poppins)" }}>
        Dashboard
      </h1>
      <p className="mt-1 text-muted">Manage every part of your website from here.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="a-card group p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink">{c.label}</h2>
              <span className="text-brand transition-transform group-hover:translate-x-1">→</span>
            </div>
            <p className="mt-1 text-sm text-muted">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
