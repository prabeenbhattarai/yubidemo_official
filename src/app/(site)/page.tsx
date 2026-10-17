import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Services from "@/components/home/Services";
import WhyUs from "@/components/home/WhyUs";
import Sustainability from "@/components/home/Sustainability";
import Projects from "@/components/home/Projects";
import ContactFaq from "@/components/home/ContactFaq";
import Reveal from "@/components/Reveal";
import { getCompany, getFaqs, getHome, getProjects, getServices } from "@/lib/content";

export default async function Home() {
  const [company, home, services, projects, faqs] = await Promise.all([
    getCompany(),
    getHome(),
    getServices(),
    getProjects(),
    getFaqs(),
  ]);
  const serviceLinks = services.map((s) => ({ slug: s.slug, title: s.title }));

  return (
    <>
      <Hero home={home} />
      <About home={home} />
      <Services home={home} services={services} />
      <WhyUs home={home} />
      <Sustainability home={home} />
      <Reveal>
        <Projects projects={projects} title={home.projectsTitle} text={home.projectsText} />
      </Reveal>
      <Reveal>
        <ContactFaq services={serviceLinks} faqs={faqs} phone={{ display: company.phone, href: company.phoneHref }} />
      </Reveal>
    </>
  );
}
