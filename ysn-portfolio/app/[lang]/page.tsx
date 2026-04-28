import { locales, type Locale } from "@/lib/i18n";
import portfolioData from "@/data/portfolio.json";
import Navbar from "@/components/navbar";
import Image from "next/image";
import {
  Briefcase,
  GraduationCap,
  Code2,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Github,
  Languages,
} from "lucide-react";
import HeroPicture from "@/components/hero-picture";

type PortfolioData = typeof portfolioData;

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function LocalePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const data = portfolioData[lang] as PortfolioData[Locale];

  return (
    <div className="min-h-screen overflow-x-clip bg-[#101011] text-foreground">
      <Navbar currentLocale={lang} />

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-20 lg:pt-32">
        {/* Hero Section */}
        <section
          id="hero"
          className="mb-16 grid items-center gap-8 py-8 sm:mb-20 sm:gap-10 sm:py-10 lg:mb-24 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12 lg:py-14 mt-0 lg:mt-32"
        >
          <div className="z-10 flex max-w-2xl flex-col">
            <h1 className="mb-3 text-4xl font-medium leading-tight sm:mb-4 sm:text-5xl md:text-6xl">
              {data.hero.name}
            </h1>
            <p className="text-lg text-zinc-400 sm:text-xl">
              {data.hero.title}
            </p>
            <p className="mt-5 max-w-xl text-base text-zinc-400 sm:mt-6 sm:text-lg">
              {data.hero.description}
            </p>
          </div>
          <div className="pointer-events-none justify-self-center lg:-mt-10 lg:justify-self-end xl:-mt-96">
            <HeroPicture />
          </div>
        </section>

        {/* Proficiencies Section */}
        <section
          id="proficiencies"
          className="mb-20 lg:mb-24 lg:flex lg:gap-14"
        >
          <h2 className="mb-6 flex items-center gap-2 text-lg  text-zinc-400 sm:text-xl lg:sticky lg:top-24 lg:mb-0 lg:w-1/4 lg:self-start">
            <Sparkles className="h-4 w-4 shrink-0" />
            {data.sections.proficiencies}
          </h2>
          <div className="space-y-5 lg:w-3/4 lg:space-y-6">
            {data.proficiencies.map((item) => (
              <div key={item.id} className="pb-6 border-b border-zinc-800">
                <h3 className="mb-2 text-base sm:text-lg">{item.title}</h3>
                <p className="text-sm text-zinc-400 sm:text-base">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="mb-20 lg:mb-24 lg:flex lg:gap-14">
          <h2 className="mb-6 flex items-center gap-2 text-lg text-zinc-400 sm:text-xl lg:sticky lg:top-24 lg:mb-0 lg:w-1/4 lg:self-start">
            <Briefcase className="h-4 w-4 shrink-0" />
            {data.sections.experience}
          </h2>
          <div className="space-y-6 lg:w-3/4 lg:space-y-8">
            {data.experience.map((item, idx) => {
              const logoMap: Record<number, string> = {
                0: "independant.jpg",
                1: "redesk-logo.jpg",
                2: "wowzers-logo.png",
              };
              const logoSrc = logoMap[idx];
              return (
                <div
                  key={item.id}
                  className="group pb-6 border-b border-zinc-800"
                >
                  <div className="mb-3 flex items-start gap-4 sm:justify-between">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {logoSrc && (
                        <div className="flex-shrink-0">
                          <Image
                            src={`/logos/${logoSrc}`}
                            alt={item.company}
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-medium">
                          {item.title}
                        </h3>
                        <p className="text-sm text-zinc-400 sm:text-base">
                          {item.company}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 sm:text-sm flex-shrink-0">
                      {item.period}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 sm:text-base">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="mb-20 lg:mb-24 lg:flex lg:gap-14">
          <h2 className="mb-6 flex items-center gap-2 text-lg text-zinc-400 sm:text-xl lg:sticky lg:top-24 lg:mb-0 lg:w-1/4 lg:self-start">
            <GraduationCap className="h-4 w-4 shrink-0" />
            {data.sections.education}
          </h2>
          <div className="space-y-5 lg:w-3/4 lg:space-y-6">
            {data.education.map((item, idx) => {
              const logoMap: Record<number, string> = {
                0: "esprit-logo.jpg",
              };
              const logoSrc = logoMap[idx];
              return (
                <div
                  key={item.id}
                  className="group pb-6 border-b border-zinc-800"
                >
                  <div className="mb-3 flex items-start gap-4 sm:justify-between">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {logoSrc && (
                        <div className="flex-shrink-0">
                          <Image
                            src={`/logos/${logoSrc}`}
                            alt={item.institution}
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-medium">
                          {item.degree}
                        </h3>
                        <p className="text-sm text-zinc-400 sm:text-base">
                          {item.institution}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 sm:text-sm shrink-0">
                      {item.year}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="mb-20 lg:mb-24 lg:flex lg:gap-14">
          <h2 className="mb-6 flex items-center gap-2 text-lg text-zinc-400 sm:text-xl lg:sticky lg:top-24 lg:mb-0 lg:w-1/4 lg:self-start">
            <Code2 className="h-4 w-4 shrink-0" />
            {data.sections.projects}
          </h2>
          <div className="space-y-6 lg:w-3/4 lg:space-y-8">
            {data.projects.map((item) => (
              <div key={item.id} className="group">
                <div className="rounded-lg bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-900 sm:p-6">
                  <h3 className="mb-2 text-base sm:text-lg">{item.title}</h3>
                  <p className="mb-4 text-sm text-zinc-400 sm:text-base">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs rounded-full bg-zinc-800 text-zinc-500"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="languages" className="mb-20 lg:mb-24 lg:flex lg:gap-14">
          <h2 className="mb-6 flex items-center gap-2 text-lg text-zinc-400 sm:text-xl lg:sticky lg:top-24 lg:mb-0 lg:w-1/4 lg:self-start">
            <Languages className="h-4 w-4 shrink-0" />
            {data.sections.languages}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-3/4">
            {data.languages.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 sm:px-5"
              >
                <span className="text-sm text-zinc-200 sm:text-base">
                  {item.name}
                </span>
                <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400">
                  {item.level}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="mb-20 lg:mb-24 lg:flex lg:gap-14">
          <h2 className="mb-6 flex items-center gap-2 text-lg text-zinc-400 sm:text-xl lg:sticky lg:top-24 lg:mb-0 lg:w-1/4 lg:self-start">
            <Mail className="h-4 w-4 shrink-0" />
            {data.sections.contact}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-3/4">
            <div className="rounded-lg border border-zinc-800 p-4 sm:p-5">
              <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
                <Phone className="h-3.5 w-3.5" />
                Phone
              </p>
              <p className="text-sm text-zinc-200 sm:text-base">
                {data.contact.phone}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 p-4 sm:p-5">
              <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
                <Mail className="h-3.5 w-3.5" />
                Email
              </p>
              <p className="text-sm text-zinc-200 sm:text-base">
                {data.contact.email}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 p-4 sm:p-5">
              <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
                <MapPin className="h-3.5 w-3.5" />
                Location
              </p>
              <p className="text-sm text-zinc-200 sm:text-base">
                {data.contact.location}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 p-4 sm:p-5">
              <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
                <Github className="h-3.5 w-3.5" />
                GitHub
              </p>
              <p className="text-sm text-zinc-200 sm:text-base">
                {data.contact.github}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
