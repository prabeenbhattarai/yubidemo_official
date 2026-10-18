"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/api/admin/yubidemo", label: "Dashboard" },
  { href: "/api/admin/yubidemo/quotes", label: "Quote Requests" },
  { href: "/api/admin/yubidemo/careers", label: "Careers" },
  { href: "/api/admin/yubidemo/company", label: "Company & Contact" },
  { href: "/api/admin/yubidemo/homepage", label: "Homepage Content" },
  { href: "/api/admin/yubidemo/services", label: "Services" },
  { href: "/api/admin/yubidemo/projects", label: "Projects" },
  { href: "/api/admin/yubidemo/faqs", label: "FAQs" },
  { href: "/api/admin/yubidemo/gallery", label: "Gallery" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => {
        const active = l.href === "/api/admin/yubidemo" ? pathname === "/api/admin/yubidemo" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-brand text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
