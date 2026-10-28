// The site's public address, used for canonical links, the sitemap, robots.txt
// and share previews. www is the main address (yubidemo.com.au redirects here).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.yubidemo.com.au").replace(/\/$/, "");
export const SITE_NAME = "Yubi Demolition";

/**
 * Shared link-preview settings. A page that sets its own `openGraph` replaces
 * the site-wide one entirely, so spread this in to keep the site name and locale.
 */
export const OG_BASE = { type: "website" as const, siteName: SITE_NAME, locale: "en_AU" };
