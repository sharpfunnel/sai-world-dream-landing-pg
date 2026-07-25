import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ReactNode } from "react";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import { SITE } from "@/data/project";
import { Analytics } from "@/components/Analytics";

const GTM_ID = "GTM-W7MFGWFW";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.seoTitle,
  description: SITE.metaDescription,
  keywords: [SITE.primaryKeyword, ...SITE.secondaryKeywords],
  openGraph: {
    title: SITE.seoTitle,
    description: SITE.metaDescription,
    siteName: SITE.projectName,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.seoTitle,
    description: SITE.metaDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1730",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`}>
      <GoogleTagManager gtmId={GTM_ID} />
      <body className="min-h-full flex flex-col bg-white text-navy-950">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
