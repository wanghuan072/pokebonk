import type { Metadata } from "next";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import { searchIndex } from "@/lib/search";
import { site } from "@/config/site";
import "@/style/globals.css";
import "@/style/content/catalog.css";
import "@/style/content/wiki-navigation.css";
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  robots: { index: site.configured, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "96x96" },
      { url: "/images/logo/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/images/logo/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-JS9T51RF8S"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-JS9T51RF8S');`,
          }}
        ></script>
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": site.url + "/#website",
                  url: site.url + "/",
                  name: site.name,
                  inLanguage: "en",
                  publisher: { "@id": site.url + "/#publisher" },
                },
                {
                  "@type": "Organization",
                  "@id": site.url + "/#publisher",
                  name: site.name,
                  url: site.url + "/",
                  logo: site.url + "/images/logo-mark.png",
                  email: site.contactEmail,
                  description:
                    "Independent fan guides and planning tools for PokeBonk.",
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AppHeader searchIndex={searchIndex} />
        <main id="main-content">{children}</main>
        <AppFooter />
      </body>
    </html>
  );
}
