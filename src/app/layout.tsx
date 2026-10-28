import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { OG_BASE, SITE_NAME, SITE_URL } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "Yubi Demolition | Safe, Efficient & Reliable Demolition in Sydney",
    template: "%s | Yubi Demolition",
  },
  description:
    "Yubi Demolition is your trusted partner for structural demolition, strip-outs, labour hire, concrete cutting, site establishment and contract cleaning across Sydney and NSW.",
  // Defaults for link previews (Facebook, LinkedIn, WhatsApp, X…); pages override the title/description.
  openGraph: {
    ...OG_BASE,
    images: [{ url: "/images/demo12.jpeg", width: 1600, height: 1200, alt: "Yubi Demolition strip-out in progress" }],
  },
  twitter: { card: "summary_large_image" },
  // Google Search Console ownership check — renders <meta name="google-site-verification"> in <head>.
  verification: { google: "1y90cnvqfY0xmgaFdRCxOa3xiyrJdYLjP8jx6ajY5WA" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU">
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
