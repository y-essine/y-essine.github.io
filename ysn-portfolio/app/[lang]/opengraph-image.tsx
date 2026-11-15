import { locales } from "@/lib/i18n";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";
import { getPortfolioData } from "@/lib/portfolio";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Yassine Karoui - Product Engineer";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { hero } = getPortfolioData(lang);

  return renderOgCard({
    eyebrow: hero.title,
    title: hero.name,
    description: hero.description,
    image: "/pfp.jpg",
    imageShape: "portrait",
    tags: ["React", "TypeScript", "Node.js", "Vue / Nuxt"],
  });
}
