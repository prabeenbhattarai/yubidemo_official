import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuotePopup from "@/components/QuotePopup";
import Toaster from "@/components/Toaster";
import SiteIntro from "@/components/SiteIntro";
import { getCompany, getFaqs, getProjects, getServices } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search";
import { mapsLink } from "@/lib/maps";
import { SITE_URL } from "@/lib/site";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [company, services, projects, faqs] = await Promise.all([
    getCompany(),
    getServices(),
    getProjects(),
    getFaqs(),
  ]);
  const serviceLinks = services.map((s) => ({ slug: s.slug, title: s.title }));
  const serviceMenu = services.map((s) => ({
    slug: s.slug,
    title: s.title,
    excerpt: s.excerpt,
    icon: s.icon,
    image: s.image,
  }));
  const searchIndex = buildSearchIndex(services, projects, faqs);

  // Business details for Google (structured data), from the Company settings.
  const businessJson = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": `${SITE_URL}/#business`,
    name: company.name,
    legalName: company.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    image: `${SITE_URL}/images/demo12.jpeg`,
    description: company.tagline,
    telephone: company.phoneHref,
    email: company.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Unit 5, 71-83 Asquith Street",
      addressLocality: "Silverwater",
      addressRegion: "NSW",
      postalCode: "2128",
      addressCountry: "AU",
    },
    areaServed: [
      { "@type": "City", name: "Sydney" },
      { "@type": "State", name: "New South Wales" },
    ],
    hasMap: mapsLink(company.address),
    knowsAbout: services.map((s) => s.title),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escaping "<" keeps any text from the admin from closing the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJson).replace(/</g, "\\u003c") }}
      />
      <SiteIntro />
      <Header company={company} services={serviceMenu} search={searchIndex} />
      {/* Scroll-reveal animations start slightly off to the side; clip them so
          they never cause sideways scrolling on phones. */}
      <main className="overflow-x-clip">{children}</main>
      <Footer company={company} />
      <QuotePopup company={company} services={serviceLinks} />
      <Toaster />
    </>
  );
}
