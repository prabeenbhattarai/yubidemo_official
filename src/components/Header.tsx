"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Logo from "./Logo";
import { baseNav } from "@/lib/nav";
import { mapsLink } from "@/lib/maps";
import type { Company } from "@/lib/content-types";
import type { SearchItem } from "@/lib/search";
import SearchModal from "./SearchModal";
import MegaMenu, { MEGA_WIDTH, type ServiceMenuItem } from "./MegaMenu";
import { ChevronDown, MailIcon, PhoneIcon, PinIcon, SearchIcon } from "./Icons";

export default function Header({
  company,
  services = [],
  search = [],
}: {
  company: Company;
  services?: ServiceMenuItem[];
  search?: SearchItem[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mega, setMega] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A short delay before closing lets the pointer travel from the menu label
  // down into the panel without it snapping shut.
  const openMega = useCallback((label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(label);
  }, []);
  const closeMegaSoon = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(null), 140);
  }, []);
  const closeMega = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(null);
  }, []);

  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMega(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mega]);

  const nav = useMemo(
    () =>
      baseNav.map((item) =>
        item.label === "Services"
          ? {
              ...item,
              children: services.map((s) => ({
                label: s.title,
                href: `/service/${s.slug}`,
              })),
            }
          : item
      ),
    [services]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  const floating = scrolled || mobileOpen;

  return (
    <>
      {/* The whole header is fixed and sits over the page's dark hero/banner.
          At the top it's transparent (white text and logo over a soft dark
          shade, so it stays readable on any photo). Once scrolled, the contact
          bar slides away and the nav morphs into a white glass pill. Both states
          share one shape and only animatable values change, so it's one smooth
          motion. Borders are transparent rather than unset — unset they default
          to the text colour and flash dark mid-transition. */}
      <div
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled ? "lg:-translate-y-11" : ""
        }`}
      >
        {/* Readability shade behind the transparent state. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-[190px] bg-gradient-to-b from-black/65 via-black/30 to-transparent transition-opacity duration-500 ${
            floating ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Top info bar */}
        <div
          className={`relative hidden border-b border-white/10 text-white transition-opacity duration-300 lg:block ${
            scrolled ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="container-x flex h-11 items-center justify-between gap-6 text-[13px]">
            {/* Tagline gives way first; contact details never wrap. */}
            <p className="flex min-w-0 items-center gap-2 text-white/85">
              <span className="inline-block h-2.5 w-2.5 shrink-0 bg-brand" />
              <span className="hidden truncate xl:inline">{company.tagline}</span>
            </p>
            <div className="flex shrink-0 items-center gap-6 whitespace-nowrap text-white/85">
              <a href={`tel:${company.phoneHref}`} className="flex items-center gap-2 hover:text-white">
                <PhoneIcon className="h-4 w-4 text-brand" /> {company.phone}
              </a>
              <span className="h-4 w-px bg-white/25" />
              <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-white">
                <MailIcon className="h-4 w-4 text-brand" /> {company.email}
              </a>
              <span className="h-4 w-px bg-white/25" />
              <a
                href={mapsLink(company.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white"
              >
                <PinIcon className="h-4 w-4 text-brand" /> {company.addressShort}
              </a>
            </div>
          </div>
        </div>

        <header
          className={`relative transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            floating ? "px-4 pt-3" : "px-0 pt-0"
          }`}
        >
          <div
            className={`relative mx-auto flex w-full items-center justify-between rounded-full border backdrop-saturate-150 transition-[max-width,height,padding,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              floating
                ? "h-16 max-w-[100vw] border-white/60 bg-white/85 px-6 shadow-[0_10px_30px_rgba(0,0,0,0.14)] backdrop-blur-md lg:max-w-[960px] lg:pl-7 lg:pr-5"
                : "h-[76px] max-w-[100vw] border-transparent bg-white/0 px-[var(--gutter)] shadow-[0_10px_30px_rgba(0,0,0,0)] backdrop-blur-0"
            }`}
          >
            <Logo nav light={!floating} compact={floating} />

          <nav
            className={`hidden h-full items-center transition-[gap] duration-500 lg:flex ${floating ? "gap-7" : "gap-8"}`}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && closeMegaSoon()}
          >
            {nav.map((item) => {
              const hasMenu = Boolean(item.children && item.children.length > 0);
              const open = mega === item.label;
              return (
                <div
                  key={item.label}
                  className="flex h-full items-center"
                  onMouseEnter={() => (hasMenu ? openMega(item.label) : closeMega())}
                  onMouseLeave={closeMegaSoon}
                >
                  <Link
                    href={item.href}
                    onClick={closeMega}
                    onFocus={() => (hasMenu ? openMega(item.label) : closeMega())}
                    aria-expanded={hasMenu ? open : undefined}
                    aria-haspopup={hasMenu ? "true" : undefined}
                    className={`flex h-full items-center gap-1 text-[15px] font-semibold tracking-[0.01em] transition-colors duration-500 hover:text-brand ${
                      open ? "text-brand" : floating ? "text-ink" : "text-white"
                    }`}
                  >
                    {item.label}
                    {hasMenu && (
                      <ChevronDown className={`h-4 w-4 opacity-70 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                    )}
                  </Link>
                </div>
              );
            })}

            {/* Mega menu panel, centred under the bar. pt-3 is an invisible
                bridge so the pointer can cross the gap without closing it. */}
            {nav.map((item) =>
              item.children && item.children.length > 0 ? (
                <div
                  key={item.label}
                  onMouseEnter={() => openMega(item.label)}
                  onMouseLeave={closeMegaSoon}
                  className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-200 ${
                    MEGA_WIDTH[item.label] ?? "w-[min(880px,calc(100vw-32px))]"
                  } ${mega === item.label ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-2 opacity-0"}`}
                >
                  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_24px_60px_rgba(15,20,25,0.18)]">
                    <div className="h-1 bg-gradient-to-r from-brand via-brand to-brand-dark" />
                    <MegaMenu item={item} services={services} company={company} onNavigate={closeMega} />
                  </div>
                </div>
              ) : null
            )}
          </nav>

            <div className="flex items-center gap-2">
              <button
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-500 ${
                  floating ? "bg-ink/5 text-ink hover:bg-brand/10 hover:text-brand" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <SearchIcon className="h-5 w-5" />
              </button>
              <button
                aria-label="Toggle menu"
                className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {["translate-y-[7px] rotate-45", "opacity-0", "-translate-y-[7px] -rotate-45"].map((open, i) => (
                  <span
                    key={i}
                    className={`h-0.5 w-6 transition-all duration-300 ${floating ? "bg-ink" : "bg-white"} ${mobileOpen ? open : ""}`}
                  />
                ))}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[76px] z-40 overflow-y-auto bg-white lg:hidden">
          <nav className="container-x flex flex-col py-4">
            {nav.map((item) => (
              <div key={item.label} className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 py-4 text-[17px] font-semibold text-ink"
                  >
                    {item.label}
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <button
                      aria-label={`Toggle ${item.label}`}
                      onClick={() => setOpenGroup((g) => (g === item.label ? null : item.label))}
                      className="p-3"
                    >
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${openGroup === item.label ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
                {item.children && item.children.length > 0 && openGroup === item.label && (
                  <div className="pb-3">
                    {item.children.map((c) => (
                      <Link
                        key={c.label}
                        href={c.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-2.5 pl-4 text-[15px] text-ink/70"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="btn btn-outline mt-3 justify-center"
            >
              <SearchIcon className="h-4 w-4" /> Search
            </button>
            <a href={`tel:${company.phoneHref}`} className="btn btn-red mt-3 justify-center">
              <PhoneIcon className="h-4 w-4" /> {company.phone}
            </a>
          </nav>
        </div>
      )}

      <SearchModal items={search} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
