import { type Metadata } from "next";

export const BASE_URL = "https://yessine.dev";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  url?: string;
  /** Path after the locale, e.g. "/projects/fomo-app", for hreflang alternates. */
  path?: string;
  locale?: string;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    url = BASE_URL,
    path = "",
    locale = "en",
  } = config;

  // Share images come from the opengraph-image/twitter-image routes.

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
      languages: {
        "en-US": `${BASE_URL}/en${path}`,
        "fr-FR": `${BASE_URL}/fr${path}`,
        "x-default": `${BASE_URL}/fr${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Yassine Karoui",
      // Open Graph wants fr_FR, not fr-FR.
      locale: locale.replace("-", "_"),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
  };
}

export function generateJsonLd(
  type: string,
  data: Record<string, unknown>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };
}

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Yassine Karoui",
  url: BASE_URL,
  jobTitle: "Product Engineer & SaaS Builder",
  image: `${BASE_URL}/pfp.jpg`,
  sameAs: ["https://github.com/y-essine", "https://linkedin.com/in/y-essine"],
  email: "yassine.karoui.x@gmail.com",
  location: {
    "@type": "Place",
    name: "Nabel, Tunisia",
  },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Yassine Karoui - Portfolio",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};
