import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { type Locale } from "@/lib/i18n";
import { type PortfolioProject } from "@/lib/portfolio";
import { getProjectLogo } from "@/lib/project-assets";

type ProjectCardProps = {
  lang: Locale;
  project: PortfolioProject;
};

export function getProjectTransitionName(slug: string, part: string) {
  return `project-${slug}-${part}`;
}

export default function ProjectCard({ lang, project }: ProjectCardProps) {
  const href = `/${lang}/projects/${project.slug}`;
  const logoSrc = getProjectLogo(project.slug);

  return (
    <ViewTransition name={getProjectTransitionName(project.slug, "card")}>
      <Link
        href={href}
        className="group block rounded-lg bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/60 sm:p-6"
        style={{
          viewTransitionName: getProjectTransitionName(project.slug, "card"),
        }}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <ViewTransition
            name={getProjectTransitionName(project.slug, "header")}
          >
            <div
              className="flex min-w-0 flex-1 items-start gap-4"
              style={{
                viewTransitionName: getProjectTransitionName(
                  project.slug,
                  "header"
                ),
              }}
            >
              {logoSrc ? (
                <ViewTransition
                  name={getProjectTransitionName(project.slug, "logo")}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80"
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
                      width={48}
                      height={48}
                      className="h-12 w-12 object-cover"
                    />
                  </div>
                </ViewTransition>
              ) : null}
              <ViewTransition
                name={getProjectTransitionName(project.slug, "title")}
              >
                <h3
                  className="min-w-0 pt-1 text-base sm:text-lg"
                  style={{
                    viewTransitionName: getProjectTransitionName(
                      project.slug,
                      "title"
                    ),
                  }}
                >
                  {project.title}
                </h3>
              </ViewTransition>
            </div>
          </ViewTransition>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-300" />
        </div>
        <ViewTransition
          name={getProjectTransitionName(project.slug, "description")}
        >
          <p
            className="mb-4 text-sm text-zinc-400 sm:text-base"
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
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-500"
            >
              {tech}
            </span>
          ))}
        </div>
      </Link>
    </ViewTransition>
  );
}
