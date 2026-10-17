import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuotePopup from "@/components/QuotePopup";
import Toaster from "@/components/Toaster";
import SiteIntro from "@/components/SiteIntro";
import { getCompany, getFaqs, getProjects, getServices } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search";

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

  return (
    <>
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
