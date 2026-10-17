export type NavChild = { label: string; href: string; description?: string };
export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

// Base navigation. The Services dropdown children are injected at render time
// from the live services list so the menu always matches your content.
export const baseNav: NavItem[] = [
  {
    label: "Company",
    href: "/company",
    children: [
      { label: "Who Are We", href: "/company", description: "Our story, mission and the values we work by." },
      { label: "Sustainability", href: "/company#sustainability", description: "Material recovery, recycling and responsible waste." },
      { label: "Health & Safety", href: "/company#safety", description: "How we keep crews, clients and sites safe." },
      { label: "Our Projects", href: "/our-projects", description: "Strip-outs, demolition and site works we've delivered." },
      { label: "Careers", href: "/careers", description: "Join the Yubi team — current openings." },
    ],
  },
  { label: "Services", href: "/services", children: [] },
  { label: "Gallery", href: "/gallery" },
  { label: "Careers", href: "/careers" },
  { label: "Our Projects", href: "/our-projects" },
  {
    label: "Contacts",
    href: "/contacts",
    children: [
      { label: "Get in Touch", href: "/contacts", description: "Phone, email and our Silverwater address." },
      { label: "Request a Quote", href: "/contacts#quote", description: "Tell us about your job — free and no obligation." },
    ],
  },
];
