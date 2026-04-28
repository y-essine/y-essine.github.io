import { type Metadata } from "next";

export const BASE_URL = "https://yessine.dev";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  locale?: string;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = "/og-image.png",
    url = BASE_URL,
    locale = "en",
  } = config;

  const imageUrl = image.startsWith("http") ? image : `${BASE_URL}${image}`;

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
      languages: {
        "en-US": `${BASE_URL}/en`,
        "fr-FR": `${BASE_URL}/fr`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Yassine Karoui",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@yassine_karoui",
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
  jobTitle: "Product Engineer & Fullstack Builder",
  image: `${BASE_URL}/pfp.jpg`,
  sameAs: ["https://github.com/y-essine", "https://linkedin.com/in/y-essine"],
  email: "yassine.karoui.x@gmail.com",
  location: {
    "@type": "Place",
    name: "Paris, France",
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
