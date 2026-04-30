import { type Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import ProjectDetail from "@/components/project-detail";
import { type Locale } from "@/lib/i18n";
import {
  BASE_URL,
  generateJsonLd,
  generateMetadata as generateSeoMetadata,
} from "@/lib/seo";
import {
  getAllProjectParams,
  getPortfolioData,
  getProjectBySlug,
  isLocale,
} from "@/lib/portfolio";

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export function generateStaticParams() {
  return getAllProjectParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = getProjectBySlug(lang, slug);

  if (!project) {
    return {};
  }

  return generateSeoMetadata({
    title: `${project.title} - Yassine Karoui`,
    description: project.description,
    keywords: project.technologies,
    url: `${BASE_URL}/${lang}/projects/${slug}`,
    locale: lang === "en" ? "en-US" : "fr-FR",
  });
}

export default async function ProjectPage({ params }: PageProps) {
  const { lang, slug } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const project = getProjectBySlug(lang, slug);

  if (!project) {
    notFound();
  }

  const data = getPortfolioData(lang);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#101011] text-foreground">
      <Script
        id={`project-breadcrumb-schema-${lang}-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateJsonLd("BreadcrumbList", {
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: BASE_URL,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: data.sections.projects,
                  item: `${BASE_URL}/${lang}#projects`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: project.title,
                  item: `${BASE_URL}/${lang}/projects/${project.slug}`,
                },
              ],
            })
          ),
        }}
      />

      <Navbar currentLocale={lang as Locale} />
      <main>
        <ProjectDetail lang={lang as Locale} project={project} />
      </main>
    </div>
  );
}
