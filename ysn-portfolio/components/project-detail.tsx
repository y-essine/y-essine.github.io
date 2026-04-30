import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowLeft, CheckCircle2, Code2, Sparkles } from "lucide-react";
import Image from "next/image";
import { type Locale } from "@/lib/i18n";
import { type PortfolioProject } from "@/lib/portfolio";
import { getProjectTransitionName } from "@/components/project-card";
import { getProjectLogo } from "@/lib/project-assets";

type ProjectDetailProps = {
  lang: Locale;
  project: PortfolioProject;
};

const copy = {
  en: {
    back: "Back to projects",
    overview: "Overview",
    stack: "Technology Stack",
    highlights: "Key Highlights",
    outcomes: "What shipped",
  },
  fr: {
    back: "Retour aux projets",
    overview: "Vue d'ensemble",
    stack: "Stack technique",
    highlights: "Points cles",
    outcomes: "Ce qui a ete livre",
  },
} as const;

export default function ProjectDetail({ lang, project }: ProjectDetailProps) {
  const labels = copy[lang];
  const logoSrc = getProjectLogo(project.slug);

  return (
    <div
      id="project-detail-hero"
      className="mx-auto max-w-5xl px-5 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-20 lg:pt-32"
    >
      <Link
        href={`/${lang}#projects`}
        className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        {labels.back}
      </Link>

      <ViewTransition name={getProjectTransitionName(project.slug, "card")}>
        <article
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8"
          style={{
            viewTransitionName: getProjectTransitionName(project.slug, "card"),
          }}
        >
          <header className="border-b border-zinc-800 pb-8">
            <ViewTransition name={getProjectTransitionName(project.slug, "header")}>
              <div
                className="flex items-start justify-between gap-6"
                style={{
                  viewTransitionName: getProjectTransitionName(
                    project.slug,
                    "header"
                  ),
                }}
              >
                <ViewTransition
                  name={getProjectTransitionName(project.slug, "title")}
                >
                  <h1
                    className="min-w-0 flex-1 pt-1 text-3xl font-medium leading-tight text-zinc-50 sm:text-5xl"
                    style={{
                      viewTransitionName: getProjectTransitionName(
                        project.slug,
                        "title"
                      ),
                    }}
                  >
                    {project.title}
                  </h1>
                </ViewTransition>
                {logoSrc ? (
                  <ViewTransition
                    name={getProjectTransitionName(project.slug, "logo")}
                  >
                    <div
                      className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:h-28 sm:w-28"
                      style={{
                        viewTransitionName: getProjectTransitionName(
                          project.slug,
                          "logo"
                        ),
                      }}
                    >
                      <Image
                        src={logoSrc}
                        alt={`${project.title} logo`}
                        width={96}
                        height={96}
                        className="h-24 w-24 object-cover sm:h-28 sm:w-28"
                      />
                    </div>
                  </ViewTransition>
                ) : null}
              </div>
            </ViewTransition>
            <ViewTransition
              name={getProjectTransitionName(project.slug, "description")}
            >
              <p
                className="mt-6 max-w-3xl text-base text-zinc-400 sm:text-lg"
                style={{
                  viewTransitionName: getProjectTransitionName(
                    project.slug,
                    "description"
                  ),
                }}
              >
                {project.description}
              </p>
            </ViewTransition>
          </header>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-zinc-500">
                <Sparkles className="h-4 w-4" />
                {labels.overview}
              </h2>
              <p className="text-base leading-7 text-zinc-300">
                {project.longDescription}
              </p>

              <h2 className="mb-4 mt-10 flex items-center gap-2 text-sm uppercase tracking-wide text-zinc-500">
                <CheckCircle2 className="h-4 w-4" />
                {labels.outcomes}
              </h2>
              <ul className="space-y-3 text-sm text-zinc-300 sm:text-base">
                {project.achievements.map((achievement) => (
                  <li key={achievement} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500" />
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="space-y-8">
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-zinc-500">
                  <Code2 className="h-4 w-4" />
                  {labels.stack}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-1.5 text-sm text-zinc-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-zinc-500">
                  <Sparkles className="h-4 w-4" />
                  {labels.highlights}
                </h2>
                <ul className="space-y-3">
                  {project.keyHighlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-300"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </article>
      </ViewTransition>
    </div>
  );
}
