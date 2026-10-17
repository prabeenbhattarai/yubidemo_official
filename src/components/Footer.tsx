import Link from "next/link";
import Logo from "./Logo";
import type { Company } from "@/lib/content-types";
import { GlobeIcon, MailIcon, PhoneIcon, PinIcon } from "./Icons";
import { mapsLink } from "@/lib/maps";
import NewsletterForm from "./NewsletterForm";

export default function Footer({ company }: { company: Company }) {
  return (
    <footer className="bg-ink text-white">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-white/70">
            A leading provider of top-tier demolition and site preparation services for commercial,
            industrial, and residential projects across Australia. Since our inception, we&apos;ve been
            committed to safety, precision, and excellence in every project.
          </p>
          <p className="mt-6 text-[14px] font-medium tracking-wide text-white/60">{company.abn}</p>
        </div>

        <div>
          <h4 className="text-lg font-semibold">Contact Company</h4>
          <ul className="mt-6 space-y-4 text-[15px] text-white/75">
            <li className="flex items-center gap-3">
              <PhoneIcon className="h-5 w-5 shrink-0 text-brand" />
              <a href={`tel:${company.phoneHref}`} className="hover:text-white">{company.phone}</a>
            </li>
            <li className="flex items-start gap-3">
              <MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <span className="flex flex-col">
                <a href={`mailto:${company.email}`} className="hover:text-white">{company.email}</a>
                <a href={`mailto:${company.supportEmail}`} className="hover:text-white">{company.supportEmail}</a>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <a href={mapsLink(company.address)} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {company.address}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <GlobeIcon className="h-5 w-5 shrink-0 text-brand" />
              <span>{company.website}</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold">Quick Links</h4>
          <ul className="mt-6 space-y-3 text-[15px] text-white/75">
            {[
              { label: "Who Are We", href: "/company" },
              { label: "News and events", href: "/company#news" },
              { label: "Careers", href: "/careers" },
              { label: "Our Projects", href: "/our-projects" },
              { label: "Gallery", href: "/gallery" },
            ].map((l) => (
              <li key={l.label} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 bg-brand" />
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold">Newsletter</h4>
          <p className="mt-6 text-[15px] text-white/70">
            Subscribe to our Newsletter &amp; Event right now to be updated.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-[14px] text-white/60 md:flex-row">
          <p>© {new Date().getFullYear()} {company.legalName}. Designed by Prabin Bhattarai.</p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
