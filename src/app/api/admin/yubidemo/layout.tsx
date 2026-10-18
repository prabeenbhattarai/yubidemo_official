import type { Metadata } from "next";

// Keep every admin page (login included) out of search results.
export const metadata: Metadata = {
  title: "Yubi Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
