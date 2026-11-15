import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";
import { getAllProjectParams, getProjectBySlug } from "@/lib/portfolio";
import { getProjectLogo } from "@/lib/project-assets";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Project by Yassine Karoui";

export function generateStaticParams() {
  return getAllProjectParams();
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const project = getProjectBySlug(lang, slug);
  if (!project) throw new Error(`Unknown project ${lang}/${slug}`);

  return renderOgCard({
    eyebrow: `${lang === "fr" ? "Projet" : "Project"} · Yassine Karoui`,
    title: project.title,
    description: project.description,
    image: getProjectLogo(slug),
    tags: project.technologies,
  });
}
