"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";
import type { Company } from "@/lib/content-types";
import type { NavItem } from "@/lib/nav";
import { openQuotePopup } from "@/lib/quote-popup";
import { mapsLink } from "@/lib/maps";
import {
  ArrowRight,
  BriefcaseIcon,
  BuildingIcon,
  ClipboardIcon,
  LeafIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  ServiceIcon,
  ShieldIcon,
  UsersIcon,
} from "./Icons";

export type ServiceMenuItem = {
  slug: string;
  title: string;
  excerpt: string;
  icon: string;
  image: string;
};

const LINK_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "Who Are We": UsersIcon,
  Sustainability: LeafIcon,
  "Health & Safety": ShieldIcon,
  "Our Projects": BuildingIcon,
  Careers: BriefcaseIcon,
  "Get in Touch": MailIcon,
  "Request a Quote": ClipboardIcon,
};

/** Panel widths, so each mega menu is only as wide as its content needs. */
export const MEGA_WIDTH: Record<string, string> = {
  Services: "w-[min(1040px,calc(100vw-32px))]",
  Company: "w-[min(880px,calc(100vw-32px))]",
  Contacts: "w-[min(780px,calc(100vw-32px))]",
};

function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors duration-200 group-hover/link:bg-brand group-hover/link:text-white">
      {children}
    </span>
  );
}

function ServicesPanel({ services, onNavigate }: { services: ServiceMenuItem[]; onNavigate: () => void }) {
  const [preview, setPreview] = useState(0);
  const current = services[preview] ?? services[0];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-6 p-6">
      <div className="flex flex-col">
        <p className="eyebrow">What we do</p>
        <div className="mt-3 grid grid-cols-2 gap-1">
          {services.map((s, i) => (
            <Link
              key={s.slug}
              href={`/service/${s.slug}`}
              onClick={onNavigate}
              onMouseEnter={() => setPreview(i)}
              onFocus={() => setPreview(i)}
              className={`group/link flex gap-4 rounded-xl p-3 transition-colors ${
                preview === i ? "bg-gray-50" : "hover:bg-gray-50"
              }`}
            >
              <IconTile>
                <ServiceIcon name={s.icon} className="h-6 w-6" />
              </IconTile>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-ink group-hover/link:text-brand">{s.title}</span>
                <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-muted">{s.excerpt}</span>
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
          <Link
            href="/services"
            onClick={onNavigate}
            className="group/all inline-flex items-center gap-2 text-[14px] font-semibold text-ink hover:text-brand"
          >
            View all services
            <ArrowRight className="h-4 w-4 transition-transform group-hover/all:translate-x-1" />
          </Link>
          <button
            type="button"
            onClick={() => {
              onNavigate();
              openQuotePopup();
            }}
            className="text-[14px] font-semibold text-brand hover:text-brand-dark"
          >
            Not sure? Ask for a quote →
          </button>
        </div>
      </div>

      {current && (
        <Link
          href={`/service/${current.slug}`}
          onClick={onNavigate}
          className="group/card relative block min-h-[300px] overflow-hidden rounded-2xl bg-ink"
        >
          {services.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.slug}
              src={s.image}
              alt=""
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover/card:scale-105 ${
                i === preview ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 p-5 text-white">
            <span className="inline-block bg-brand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider">
              Service
            </span>
            <span className="mt-3 block text-xl font-bold leading-tight">{current.title}</span>
            <span className="mt-1.5 line-clamp-2 block text-[13px] leading-snug text-white/80">{current.excerpt}</span>
            <span className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold">
              Explore service <ArrowRight className="h-4 w-4 transition-transform group-hover/card:translate-x-1" />
            </span>
          </span>
        </Link>
      )}
    </div>
  );
}

function LinksPanel({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-6 p-6">
      <div>
        <p className="eyebrow">{item.label}</p>
        <div className="mt-3 grid grid-cols-2 gap-1">
          {item.children?.map((c) => {
            const Icon = LINK_ICONS[c.label] ?? UsersIcon;
            return (
              <Link
                key={c.label}
                href={c.href}
                onClick={onNavigate}
                className="group/link flex gap-4 rounded-xl p-3 transition-colors hover:bg-gray-50"
              >
                <IconTile>
                  <Icon className="h-5 w-5" />
                </IconTile>
                <span>
                  <span className="block text-[15px] font-semibold text-ink group-hover/link:text-brand">{c.label}</span>
                  {c.description && (
                    <span className="mt-0.5 block text-[13px] leading-snug text-muted">{c.description}</span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <Link
        href="/company"
        onClick={onNavigate}
        className="group/card relative block min-h-[260px] overflow-hidden rounded-2xl bg-ink"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/demo12.jpeg"
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <span className="absolute inset-x-0 bottom-0 p-5 text-white">
          <span className="block text-lg font-bold leading-tight">Demolition Today, Foundations for Tomorrow.</span>
          <span className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold">
            Read our story <ArrowRight className="h-4 w-4 transition-transform group-hover/card:translate-x-1" />
          </span>
        </span>
      </Link>
    </div>
  );
}

function ContactsPanel({ company, onNavigate }: { company: Company; onNavigate: () => void }) {
  const rows = [
    { icon: PhoneIcon, label: "Call us", value: company.phone, href: `tel:${company.phoneHref}` },
    { icon: MailIcon, label: "Email us", value: company.email, href: `mailto:${company.email}` },
    { icon: PinIcon, label: "Visit us", value: company.address, href: mapsLink(company.address), external: true },
  ];
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-6 p-6">
      <div>
        <p className="eyebrow">Get in touch</p>
        <div className="mt-3 space-y-1">
          {rows.map((r) => (
            <a
              key={r.label}
              href={r.href}
              onClick={onNavigate}
              {...("external" in r ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group/link flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-gray-50"
            >
              <IconTile>
                <r.icon className="h-5 w-5" />
              </IconTile>
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold uppercase tracking-wider text-muted">{r.label}</span>
                <span className="block text-[15px] font-semibold leading-snug text-ink group-hover/link:text-brand">
                  {r.value}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-brand p-6 text-white">
        <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <span className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-black/10" />
        <div className="relative">
          <ClipboardIcon className="h-8 w-8" />
          <p className="mt-4 text-xl font-bold leading-tight">Planning a project?</p>
          <p className="mt-2 text-[14px] leading-relaxed text-white/85">
            Send us the details and get a free, no-obligation quote.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onNavigate();
            openQuotePopup();
          }}
          className="btn btn-white relative mt-6 justify-center"
        >
          Request a Quote <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function MegaMenu({
  item,
  services,
  company,
  onNavigate,
}: {
  item: NavItem;
  services: ServiceMenuItem[];
  company: Company;
  onNavigate: () => void;
}) {
  if (item.label === "Services") return <ServicesPanel services={services} onNavigate={onNavigate} />;
  if (item.label === "Contacts") return <ContactsPanel company={company} onNavigate={onNavigate} />;
  return <LinksPanel item={item} onNavigate={onNavigate} />;
}
