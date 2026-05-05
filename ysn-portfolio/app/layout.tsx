import type { Metadata } from "next";
import Script from "next/script";
import "./fonts.css";
import "./globals.css";
import ClarityInit from "@/components/clarity-init";
import MorphingObject from "@/components/morphing-object";
import { BASE_URL, personSchema, websiteSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Yassine Karoui - Product Engineer & Fullstack Builder",
    template: "%s | Yassine Karoui",
  },
  description:
    "Product Engineer & Fullstack Builder. I design and ship useful, fast, elegant web products from idea to production.",
  keywords: [
    "Product Engineer",
    "Fullstack Developer",
    "React",
    "Node.js",
    "TypeScript",
    "Web Development",
    "Portfolio",
  ],
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: BASE_URL,
    languages: {
      "en-US": `${BASE_URL}/en`,
      "fr-FR": `${BASE_URL}/fr`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Yassine Karoui",
    title: "Yassine Karoui - Product Engineer & Fullstack Builder",
    description:
      "Product Engineer & Fullstack Builder. I design and ship useful, fast, elegant web products from idea to production.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Yassine Karoui Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yassine Karoui - Product Engineer & Fullstack Builder",
    description:
      "Product Engineer & Fullstack Builder. I design and ship useful, fast, elegant web products from idea to production.",
    images: [`${BASE_URL}/og-image.png`],
    creator: "@yassine_karoui",
  },
  icons: {
    icon: [
      {
        url: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <head>
        <Script
          id="person-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased">
        <ClarityInit />
        <MorphingObject />
        {children}
      </body>
    </html>
  );
}
