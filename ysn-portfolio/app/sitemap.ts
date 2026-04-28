import { type MetadataRoute } from "next";
import { BASE_URL } from "@/lib/seo";
import { locales } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add root URL
  sitemapEntries.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  });

  // Add localized pages
  locales.forEach((locale) => {
    sitemapEntries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    });
  });

  return sitemapEntries;
}
