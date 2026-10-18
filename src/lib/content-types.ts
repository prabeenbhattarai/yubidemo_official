// Single source of truth for the shape of all editable content, plus the
// default values. Defaults are used as a fallback whenever Firebase is not yet
// configured or a document is missing — so the public site always renders.

export type Company = {
  name: string;
  legalName: string;
  tagline: string;
  phone: string;
  phoneHref: string;
  email: string;
  supportEmail: string;
  address: string;
  addressShort: string;
  website: string;
  abn: string;
  /** Comma-separated. Quote requests are emailed here; the first address also gets possible-spam ones. */
  quoteRecipients: string;
};

export type Stat = { value: string; label: string };
export type SafetyCard = { title: string; text: string };

export type Home = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroImages?: string[];
  responseTitle: string;
  responseText: string;
  aboutTitle: string;
  aboutP1: string;
  aboutP2: string;
  stats: Stat[];
  missionText: string;
  visionText: string;
  servicesTitle: string;
  servicesSubtitle: string;
  whyTitle: string;
  whySubtitle: string;
  whyPoints: string[];
  whyImage: string;
  sustainEyebrow: string;
  sustainTitle: string;
  sustainText: string;
  sustainImage: string;
  safetyCards: SafetyCard[];
  projectsTitle: string;
  projectsText: string;
};

export type ServiceIconName = "worker" | "saw" | "excavator" | "broom" | "site";

export type Service = {
  id?: string;
  slug: string;
  title: string;
  icon: ServiceIconName;
  excerpt: string;
  description: string[];
  image: string;
  order: number;
};

export type Project = {
  id?: string;
  title: string;
  location: string;
  category: string;
  blurb: string;
  image: string;
  color: string;
  order: number;
};

export type Faq = {
  id?: string;
  question: string;
  answer: string;
  order: number;
};

export type GalleryImage = {
  id?: string;
  url: string;
  /** Kept for screen readers only; not shown on the page. */
  alt: string;
  /** Project title this photo belongs to. Empty = general (only in the "Yubi Demolition" folder). */
  folder?: string;
  order: number;
};

/* ------------------------------- DEFAULTS ------------------------------- */

export const defaultCompany: Company = {
  name: "Yubi Demolition",
  legalName: "Yubi Demolition Pty Ltd",
  tagline:
    "The trusted demolition partner you need for safe, efficient, and reliable site solutions",
  phone: "+61 450686535",
  phoneHref: "+61450686535",
  email: "Sydney@yubidemo.com.au",
  supportEmail: "support@yubidemo.com.au",
  address: "Unit 5, 71-83 Asquith Street, Silverwater NSW 2128",
  addressShort: "Unit 5, 71-83 Asquith St, Silverwater NSW",
  website: "www.yubidemo.com.au",
  abn: "ABN 682 315 377",
  quoteRecipients: "",
};

export const defaultHome: Home = {
  heroTitle: "Demolition Today, Foundations for Tomorrow.",
  heroSubtitle:
    "The trusted demolition partner you need for safe, efficient, and reliable site solutions across Sydney and NSW.",
  heroImage: "/images/demo12.jpeg",
  heroImages: [
    "/images/demo12.jpeg",
    "/images/structural-demo.jpeg",
    "/images/demo9.jpeg",
    "/images/demo8.jpeg",
  ],
  responseTitle: "Response to Yubi",
  responseText:
    "At Yubi Demolition, the health and safety of our employees, clients, suppliers, and the communities we serve is our top priority.",
  aboutTitle: "A Company to Transform the Landscape.",
  aboutP1:
    "Yubi Demolition is your go-to partner for comprehensive demolition and site services. We specialize in structural demolition, strip-outs, labour hire, site establishment, contract cleaning, and stair penetrations. With a focus on safety and precision, we deliver efficient, high-quality results for every project.",
  aboutP2:
    "Yubi Demolition drives innovations that streamline construction, enhance site safety, reduce environmental impact, and deliver reliable solutions. Today's expertise builds a safer, smarter tomorrow.",
  stats: [
    { value: "15+", label: "Years of experience" },
    { value: "500+", label: "Projects completed" },
    { value: "100%", label: "Safety commitment" },
  ],
  missionText:
    "As a leading provider of demolition and site services, Yubi Demolition is committed to delivering tailored, efficient solutions for every project. Our clients trust us because we handle every aspect of demolition with precision, safety, and expertise.",
  visionText:
    "To lead the industry in safe, sustainable and innovative demolition — transforming sites responsibly and laying strong foundations for the communities of tomorrow.",
  servicesTitle: "Service We Provide",
  servicesSubtitle: "Yubi — Perfecting Demolition for Modern Industries.",
  whyTitle: "Shaping safer, cleaner communities",
  whySubtitle:
    "Our people are our greatest asset. By investing in the right tools, systems, and ethical practices, we empower our team to drive innovation and deliver exceptional results.",
  whyPoints: [
    "We pursue innovative and efficient demolition methods that help us lead the industry, ensuring safe and precise outcomes for every project.",
    "Integrity is at the core of our operations, guiding the way we manage projects, prioritize safety, and build lasting relationships with clients and partners.",
    "We collaborate with trusted partners to address key challenges in the demolition sector, ensuring solutions that benefit both businesses and communities.",
  ],
  whyImage: "/images/demo1.jpeg",
  sustainEyebrow: "Technical Solutions",
  sustainTitle: "Sustainability Goals",
  sustainText:
    "Yubi is an integrated demolition company specializing in the safe and efficient demolition, site preparation, and waste management services. Our agile and experienced team applies engineering principles to deliver precise, reliable, and environmentally responsible demolition solutions for various industries.",
  sustainImage: "/images/demo11.jpeg",
  safetyCards: [
    {
      title: "Health & Safety",
      text: "We pursue innovative and efficient demolition methods that help us lead the industry, ensuring safe and precise outcomes for every project.",
    },
    {
      title: "Environment",
      text: "We reduce environmental impact through responsible waste management, material recovery, and recycling on every site.",
    },
    {
      title: "Quality Assurance",
      text: "Rigorous processes and experienced supervision ensure consistent, high-quality delivery from start to finish.",
    },
  ],
  projectsTitle: "Our Latest Projects",
  projectsText:
    "Yubi Demolition provides a complete, integrated solutions package, handling everything from project planning and demolition to safety, environmental management, and final cleaning, ensuring efficiency and precision throughout.",
};

export const defaultServices: Service[] = [
  {
    slug: "labour-hire",
    title: "Labour Hire",
    icon: "worker",
    excerpt:
      "Skilled, safety-inducted demolition and site labour ready to scale with your project's needs.",
    description: [
      "Our labour hire service gives you access to experienced, fully inducted demolition and construction workers exactly when you need them.",
      "Every crew member is white-card certified and trained in safe work practices, so you can scale your workforce up or down without compromising site safety or productivity.",
    ],
    image: "/images/demo10.jpeg",
    order: 1,
  },
  {
    slug: "concrete-cutting",
    title: "Concrete Cutting",
    icon: "saw",
    excerpt:
      "Precise concrete cutting, coring and sawing for clean, controlled structural modifications.",
    description: [
      "We deliver accurate concrete cutting, drilling and coring for walls, floors and slabs using industry-leading equipment.",
      "From wall sawing to core drilling, our operators produce clean, dust-controlled cuts that keep your project on schedule and to spec.",
    ],
    image: "/images/demo8.jpeg",
    order: 2,
  },
  {
    slug: "selective-demolition",
    title: "Selective Demolition",
    icon: "excavator",
    excerpt:
      "Careful dismantling and removal of specific parts of a structure, rather than demolishing an entire building.",
    description: [
      "Selective demolition involves the careful dismantling and removal of specific parts of a structure, rather than demolishing an entire building.",
      "This approach preserves elements you want to keep, minimises disruption, and allows for material recovery and recycling wherever possible.",
    ],
    image: "/images/structural-demo.jpeg",
    order: 3,
  },
  {
    slug: "site-preparation",
    title: "Site Preparation & Clearance",
    icon: "site",
    excerpt:
      "Complete site establishment, clearance and preparation to get your project ready to build.",
    description: [
      "We handle every aspect of getting your site ready — from clearance and grubbing to site establishment and hoarding.",
      "Our team ensures the site is safe, compliant and prepared so the next stage of construction can begin without delay.",
    ],
    image: "/images/demo7.jpeg",
    order: 4,
  },
  {
    slug: "contract-cleaning",
    title: "Contract Cleaning",
    icon: "broom",
    excerpt:
      "Post-demolition and builders cleaning that leaves sites tidy, safe and handover-ready.",
    description: [
      "Our contract cleaning service delivers thorough post-demolition and builders cleans for commercial and residential sites.",
      "We remove debris, manage waste responsibly, and leave every site clean, safe and ready for handover.",
    ],
    image: "/images/demo.jpeg",
    order: 5,
  },
];

export const defaultProjects: Project[] = [
  { title: "Commercial Office Strip-Out", location: "Sydney CBD, NSW", category: "Strip-Out", blurb: "Full internal strip-out of a multi-level office fit-out, ready for refurbishment.", color: "#8a949e", image: "/images/demo9.jpeg", order: 1 },
  { title: "School Building Demolition", location: "Western Sydney, NSW", category: "Structural Demolition", blurb: "Structural demolition and clearance of an ageing school building with material recovery.", color: "#6f7681", image: "/images/demo3.jpeg", order: 2 },
  { title: "Rooftop Plant Removal", location: "Parramatta, NSW", category: "Selective Demolition", blurb: "Selective demolition and safe removal of rooftop plant and steel structures.", color: "#9aa3ad", image: "/images/structural-demo.jpeg", order: 3 },
  { title: "Retail Site Clearance", location: "Auburn, NSW", category: "Site Preparation", blurb: "Site clearance and preparation for a new retail development.", color: "#7c8590", image: "/images/retail-stripout.jpeg", order: 4 },
  { title: "Industrial Warehouse Demolition", location: "Blacktown, NSW", category: "Structural Demolition", blurb: "Large-scale warehouse demolition with full waste management.", color: "#868f9a", image: "/images/demo12.jpeg", order: 5 },
  { title: "Concrete Cutting Works", location: "North Sydney, NSW", category: "Concrete Cutting", blurb: "Precision concrete cutting and coring for structural openings.", color: "#727b86", image: "/images/demo8.jpeg", order: 6 },
];

export const defaultFaqs: Faq[] = [
  { question: "What is the history of Yubi?", answer: "Yubi Demolition is built on years of expertise and innovation in the demolition industry. With a strong foundation of safety, precision, and sustainability, we've developed a reputation for delivering efficient and responsible demolition services. Our commitment to continuous improvement and responsible practices has been at the heart of our growth and success in the industry.", order: 1 },
  { question: "How is it being developed?", answer: "We continuously invest in modern equipment, ongoing crew training, and refined safety systems. By combining engineering principles with hands-on experience, we keep improving how we plan and deliver every demolition project.", order: 2 },
  { question: "Credible international sustainability standards?", answer: "Our processes align with recognised environmental and waste-management practices. We prioritise material recovery, responsible disposal, and reduced environmental impact on every site we work on.", order: 3 },
  { question: "If I have questions, where can I find answers?", answer: "You can reach our team any time through the contact form on this page, by phone, or by email. We aim to answer every enquiry as quickly as possible.", order: 4 },
];

export const defaultGallery: GalleryImage[] = [
  { url: "/images/demo12.jpeg", alt: "Commercial interior strip-out", folder: "Industrial Warehouse Demolition", order: 1 },
  { url: "/images/structural-demo.jpeg", alt: "Structural demolition, steel frame", folder: "Rooftop Plant Removal", order: 2 },
  { url: "/images/demo1.jpeg", alt: "Hot works and cutting on site", order: 3 },
  { url: "/images/demo8.jpeg", alt: "Concrete slab cutting and removal", folder: "Concrete Cutting Works", order: 4 },
  { url: "/images/demo10.jpeg", alt: "Crew member grinding steelwork", order: 5 },
  { url: "/images/demo11.jpeg", alt: "Timber strip-out in progress", order: 6 },
  { url: "/images/demo9.jpeg", alt: "Commercial tenancy stripped back", folder: "Commercial Office Strip-Out", order: 7 },
  { url: "/images/retail-stripout.jpeg", alt: "Retail site clearance", folder: "Retail Site Clearance", order: 8 },
  { url: "/images/demo7.jpeg", alt: "Concrete cutting and site preparation", order: 9 },
  { url: "/images/demo.jpeg", alt: "Waste removal and site clearance", order: 10 },
  { url: "/images/demo3.jpeg", alt: "Residential strip-out", folder: "School Building Demolition", order: 11 },
  { url: "/images/demo4.jpeg", alt: "Room strip-out ready for refurbishment", order: 12 },
  { url: "/images/demo5.jpeg", alt: "Bathroom strip-out", order: 13 },
  { url: "/images/demo6.jpeg", alt: "Bathroom stripped to brick", order: 14 },
];
