import portfolioData from "@/data/portfolio.json";
import { defaultLocale, locales, type Locale } from "@/lib/i18n";

type PortfolioData = typeof portfolioData;
export type PortfolioLocaleData = PortfolioData[Locale];
export type PortfolioProject = PortfolioLocaleData["projects"][number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getPortfolioData(lang: string): PortfolioLocaleData {
  const locale = isLocale(lang) ? lang : defaultLocale;
  return portfolioData[locale] as PortfolioLocaleData;
}

export function getProjectBySlug(
  lang: string,
  slug: string
): PortfolioProject | undefined {
  return getPortfolioData(lang).projects.find((project) => project.slug === slug);
}

export function getAllProjectParams() {
  return locales.flatMap((lang) =>
    getPortfolioData(lang).projects.map((project) => ({
      lang,
      slug: project.slug,
    }))
  );
}
