import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE } from "@/data/project";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
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

export const viewport = {
  themeColor: "#0a1730",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-navy-950">
        {children}
      </body>
    </html>
  );
}
