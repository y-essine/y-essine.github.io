"use client";

// Lazy chunk: loaded by command-palette-host.tsx on first open. Never import
// this file statically from anything that ships in the initial bundle.

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { flushSync } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Briefcase,
  Check,
  Code2,
  Copy,
  CornerDownLeft,
  FileText,
  Github,
  Globe,
  GraduationCap,
  House,
  Languages,
  Link2,
  Linkedin,
  Mail,
  Search,
  SearchX,
  Shapes,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { defaultLocale, type Locale } from "@/lib/i18n";
import { getPortfolioData, isLocale } from "@/lib/portfolio";
import { personSchema } from "@/lib/seo";

/**
 * Where "Open résumé" points. There is no résumé file on the site yet, so the
 * command stays hidden until this is set (e.g. "/resume.pdf" once the PDF is
 * in public/, or an external URL).
 */
const RESUME_URL: string | null = null;

type GroupId = "navigate" | "projects" | "actions" | "fun";

type Command = {
  id: string;
  group: GroupId;
  label: string;
  /** Extra search terms, never displayed. */
  keywords: string;
  /** Muted text on the right of the row. */
  hint?: string;
  icon: LucideIcon;
  /** Leaves the site (shows an arrow instead of the return key). */
  external?: boolean;
  /** Runs without closing the palette; the command closes it itself. */
  keepOpen?: boolean;
  run: () => void;
};

const GROUP_ORDER: GroupId[] = ["navigate", "projects", "actions", "fun"];

const STRINGS = {
  en: {
    title: "Command palette",
    placeholder: "Search or jump to…",
    groups: {
      navigate: "Navigate",
      projects: "Projects",
      actions: "Actions",
      fun: "Fun",
    },
    home: "Home",
    switchLanguage: "Switch to French",
    copyEmail: "Copy email",
    copied: "Copied!",
    resume: "Open résumé",
    open: (name: string) => `Open ${name}`,
    morph: (name: string) => `Morph: ${name}`,
    empty: (query: string) => `No results for “${query}”`,
    emptyHint: "Try a section, a project or a technology.",
    close: "Close",
    toNavigate: "navigate",
    toSelect: "select",
    toClose: "close",
  },
  fr: {
    title: "Palette de commandes",
    placeholder: "Rechercher ou aller à…",
    groups: {
      navigate: "Navigation",
      projects: "Projets",
      actions: "Actions",
      fun: "Fun",
    },
    home: "Accueil",
    switchLanguage: "Passer en anglais",
    copyEmail: "Copier l’e-mail",
    copied: "Copié !",
    resume: "Ouvrir le CV",
    open: (name: string) => `Ouvrir ${name}`,
    morph: (name: string) => `Morphing : ${name}`,
    empty: (query: string) => `Aucun résultat pour « ${query} »`,
    emptyHint: "Essayez une section, un projet ou une technologie.",
    close: "Fermer",
    toNavigate: "naviguer",
    toSelect: "valider",
    toClose: "fermer",
  },
} as const;

// Section ids as rendered by app/[lang]/page.tsx, with search synonyms in both
// languages so "skills" works on the French page and "formation" on the
// English one.
const SECTIONS = [
  { id: "proficiencies", icon: Sparkles, keywords: "skills competences stack tech technologies" },
  { id: "experience", icon: Briefcase, keywords: "work jobs career travail parcours emploi" },
  { id: "education", icon: GraduationCap, keywords: "formation school studies degree etudes diplome ecole" },
  { id: "projects", icon: Code2, keywords: "projects projets work portfolio realisations" },
  { id: "languages", icon: Languages, keywords: "languages langues spoken parlees" },
  { id: "contact", icon: Mail, keywords: "email mail phone telephone github location adresse" },
] as const;

const PROFILE_ICONS: Record<string, { name: string; icon: LucideIcon }> = {
  "github.com": { name: "GitHub", icon: Github },
  "linkedin.com": { name: "LinkedIn", icon: Linkedin },
};

/* ------------------------------------------------------------------------ */
/* Fuzzy matching                                                            */
/* ------------------------------------------------------------------------ */

/** Lowercase and strip accents, so "francais" finds "Français". */
function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function isWordStart(text: string, index: number) {
  return index === 0 || !/[a-z0-9]/.test(text[index - 1]);
}

type Match = { score: number; hits: number[] };

/** Substring match first; otherwise a subsequence anchored on a word start. */
function matchLabel(token: string, text: string): Match | null {
  let at = -1;
  for (let i = text.indexOf(token); i !== -1; i = text.indexOf(token, i + 1)) {
    if (at === -1) at = i;
    if (isWordStart(text, i)) {
      at = i;
      break;
    }
  }
  if (at !== -1) {
    const bonus = at === 0 ? 30 : isWordStart(text, at) ? 20 : 0;
    return {
      score: 100 + bonus,
      hits: Array.from(token, (_, offset) => at + offset),
    };
  }

  let best: Match | null = null;
  for (let start = 0; start < text.length; start++) {
    if (text[start] !== token[0] || !isWordStart(text, start)) continue;
    const hits = [start];
    let score = 50;
    for (let i = start + 1; i < text.length && hits.length < token.length; i++) {
      if (text[i] !== token[hits.length]) continue;
      const gap = i - hits[hits.length - 1] - 1;
      score += gap === 0 ? 6 : (isWordStart(text, i) ? 3 : -2) - gap;
      hits.push(i);
    }
    if (hits.length === token.length && score >= 40 && score > (best?.score ?? 0)) {
      best = { score, hits };
    }
  }
  return best;
}

function matchKeywords(token: string, keywords: string) {
  if (` ${keywords}`.includes(` ${token}`)) return 60;
  if (token.length >= 3 && keywords.includes(token)) return 35;
  return 0;
}

type Indexed = Command & { foldedLabel: string; foldedKeywords: string };
type Result = { command: Indexed; score: number; hits: Set<number> };

function search(commands: Indexed[], query: string): Result[] {
  const tokens = fold(query).split(/\s+/).filter(Boolean);
  const results: Result[] = [];
  for (const command of commands) {
    let score = 0;
    const hits = new Set<number>();
    let matched = true;
    for (const token of tokens) {
      const label = matchLabel(token, command.foldedLabel);
      const keywordScore = matchKeywords(token, command.foldedKeywords);
      if (!label && !keywordScore) {
        matched = false;
        break;
      }
      score += Math.max(label?.score ?? 0, keywordScore);
      label?.hits.forEach((hit) => hits.add(hit));
    }
    if (matched) results.push({ command, score, hits });
  }
  return results;
}

/** Bolds the matched characters of a label. */
function Highlighted({ text, hits }: { text: string; hits: Set<number> }) {
  if (hits.size === 0) return text;
  const parts: { text: string; hit: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const hit = hits.has(i);
    const last = parts[parts.length - 1];
    if (last && last.hit === hit) last.text += text[i];
    else parts.push({ text: text[i], hit });
  }
  return parts.map((part, index) =>
    part.hit ? (
      <mark key={index} className="bg-transparent font-medium text-white">
        {part.text}
      </mark>
    ) : (
      part.text
    )
  );
}

/* ------------------------------------------------------------------------ */
/* Helpers                                                                   */
/* ------------------------------------------------------------------------ */

type MorphApi = { morph?: (name: string) => boolean; shapes?: unknown };

/** Shapes exposed by the morphing object (window.yessine), if it is there. */
function readMorphShapes(): string[] {
  try {
    const api = (window as unknown as { yessine?: MorphApi }).yessine;
    if (typeof api?.morph !== "function" || !Array.isArray(api.shapes)) return [];
    return api.shapes.filter((name): name is string => typeof name === "string");
  } catch {
    return [];
  }
}

function morphTo(name: string) {
  try {
    (window as unknown as { yessine?: MorphApi }).yessine?.morph?.(name);
  } catch {
    // The object is decorative; never let it break the palette.
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API unavailable (insecure context, old WebView): fall back.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const optionId = (id: string) => `cmdk-option-${id}`;

const KBD =
  "inline-flex h-5 min-w-5 items-center justify-center rounded border border-zinc-700/80 bg-zinc-900 px-1 font-sans text-[10px] font-medium text-zinc-400";

/* ------------------------------------------------------------------------ */
/* Component                                                                 */
/* ------------------------------------------------------------------------ */

export default function CommandPalette({
  lang,
  onClose,
}: {
  lang: string;
  onClose: () => void;
}) {
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const t = STRINGS[locale];
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  // Read once per open: the palette is unmounted while closed.
  const [shapes] = useState(readMorphShapes);

  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus the input, lock page scroll, and undo both on close.
  useLayoutEffect(() => {
    const previous = document.activeElement;
    const root = document.documentElement;
    const { overflow, scrollbarGutter, backgroundColor } = root.style;
    // Classic (non-overlay) scrollbars: keep their gutter so the page does not
    // shift, and paint it like the dimmed page so no bright strip is left.
    if (window.innerWidth > root.clientWidth) {
      root.style.scrollbarGutter = "stable";
      root.style.backgroundColor = "#080809";
    }
    root.style.overflow = "hidden";
    inputRef.current?.focus({ preventScroll: true });

    // Phones: keep the panel above the on-screen keyboard, which shrinks the
    // visual viewport but not 100dvh.
    const viewport = window.visualViewport;
    const fit = () => {
      if (viewport) {
        dialogRef.current?.style.setProperty("--cmdk-vh", `${viewport.height}px`);
      }
    };
    fit();
    viewport?.addEventListener("resize", fit);

    return () => {
      viewport?.removeEventListener("resize", fit);
      root.style.overflow = overflow;
      root.style.scrollbarGutter = scrollbarGutter;
      root.style.backgroundColor = backgroundColor;
      if (previous instanceof HTMLElement && previous.isConnected) {
        previous.focus({ preventScroll: true });
      }
    };
  }, []);

  // Let the "Copied!" confirmation show for a beat, then get out of the way.
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(onClose, 900);
    return () => window.clearTimeout(timer);
  }, [copied, onClose]);

  const commands = useMemo<Indexed[]>(() => {
    const data = getPortfolioData(locale);
    const other: Locale = locale === "fr" ? "en" : "fr";
    const home = `/${locale}`;
    const onHome = pathname === home;

    const goToSection = (id: string) => {
      const hash = id === "hero" ? "" : `#${id}`;
      if (!onHome) {
        router.push(`${home}${hash}`);
        return;
      }
      const behavior = prefersReducedMotion() ? "auto" : "smooth";
      if (id === "hero") window.scrollTo({ top: 0, behavior });
      else document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
      window.history.replaceState(null, "", `${home}${hash}`);
    };

    const list: Command[] = [
      {
        id: "section-hero",
        group: "navigate",
        label: t.home,
        keywords: "home accueil top haut intro hero about a propos",
        icon: House,
        run: () => goToSection("hero"),
      },
      ...SECTIONS.map(
        (section): Command => ({
          id: `section-${section.id}`,
          group: "navigate",
          label: data.sections[section.id],
          keywords: section.keywords,
          icon: section.icon,
          run: () => goToSection(section.id),
        })
      ),
      ...data.projects.map(
        (project): Command => ({
          id: `project-${project.slug}`,
          group: "projects",
          label: project.title,
          keywords: `${project.slug} ${project.technologies.join(" ")} project projet`,
          hint: project.technologies.slice(0, 2).join(" · "),
          icon: Code2,
          run: () => router.push(`${home}/projects/${project.slug}`),
        })
      ),
      {
        id: "action-language",
        group: "actions",
        label: t.switchLanguage,
        keywords: "language langue lang locale translate traduire english anglais french francais fr en",
        hint: `${locale.toUpperCase()} → ${other.toUpperCase()}`,
        icon: Globe,
        // Same swap as language-switcher.tsx, keeping the section hash too.
        run: () => {
          const rest = pathname.replace(/^\/(fr|en)(?=\/|$)/, "");
          router.push(`/${other}${rest}${window.location.hash}`);
        },
      },
      {
        id: "action-copy-email",
        group: "actions",
        label: t.copyEmail,
        keywords: "email e-mail mail courriel contact copy copier clipboard presse-papiers",
        hint: data.contact.email,
        icon: Copy,
        keepOpen: true,
        run: () => {
          void copyText(data.contact.email).then((ok) => {
            if (ok) setCopied(true);
          });
        },
      },
    ];

    if (RESUME_URL) {
      const url = RESUME_URL;
      list.push({
        id: "action-resume",
        group: "actions",
        label: t.resume,
        keywords: "resume cv curriculum vitae pdf download telecharger",
        icon: FileText,
        external: true,
        run: () => window.open(url, "_blank", "noopener,noreferrer"),
      });
    }

    for (const url of personSchema.sameAs) {
      const host = new URL(url).hostname.replace(/^www\./, "");
      const profile = PROFILE_ICONS[host] ?? { name: host, icon: Link2 };
      list.push({
        id: `link-${host}`,
        group: "actions",
        label: t.open(profile.name),
        keywords: `${host} profile profil link lien social code`,
        hint: url.replace(/^https?:\/\//, ""),
        icon: profile.icon,
        external: true,
        run: () => window.open(url, "_blank", "noopener,noreferrer"),
      });
    }

    for (const name of shapes) {
      list.push({
        id: `morph-${name}`,
        group: "fun",
        label: t.morph(name),
        keywords: "morph morphing shape forme object objet 3d fun",
        icon: Shapes,
        run: () => morphTo(name),
      });
    }

    return list.map((command) => ({
      ...command,
      foldedLabel: fold(command.label),
      foldedKeywords: fold(command.keywords),
    }));
  }, [locale, pathname, router, shapes, t]);

  // Grouped results. With a query, best matches come first (groups ordered by
  // their best item); without one, everything in its natural order.
  const groups = useMemo(() => {
    const results = search(commands, query);
    const filtering = query.trim() !== "";
    if (filtering) results.sort((a, b) => b.score - a.score);
    const byGroup = new Map<GroupId, Result[]>();
    for (const id of filtering ? results.map((r) => r.command.group) : GROUP_ORDER) {
      if (!byGroup.has(id)) byGroup.set(id, []);
    }
    for (const result of results) byGroup.get(result.command.group)?.push(result);
    return [...byGroup].filter(([, items]) => items.length > 0);
  }, [commands, query]);

  const flat = useMemo(() => groups.flatMap(([, items]) => items), [groups]);
  const activeIndex = Math.min(active, flat.length - 1);
  const activeCommand = flat[activeIndex]?.command;

  const perform = (command: Command) => {
    if (command.keepOpen) {
      command.run();
      return;
    }
    // Close first (unlocks scroll, restores focus), then act on the page.
    flushSync(onClose);
    command.run();
  };

  const moveTo = (index: number) => {
    setActive(index);
    const list = listRef.current;
    if (!list) return;
    if (index === 0) list.scrollTop = 0; // also reveals the first heading
    else if (index === flat.length - 1) list.scrollTop = list.scrollHeight;
    else {
      document
        .getElementById(optionId(flat[index].command.id))
        ?.scrollIntoView({ block: "nearest" });
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.nativeEvent.isComposing) return;
    const count = flat.length;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (count) moveTo((activeIndex + 1) % count);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (count) moveTo((activeIndex - 1 + count) % count);
        break;
      case "Home":
        event.preventDefault();
        if (count) moveTo(0);
        break;
      case "End":
        event.preventDefault();
        if (count) moveTo(count - 1);
        break;
      case "Enter":
        // Enter on the close button should just click it.
        if (event.target !== inputRef.current) break;
        event.preventDefault();
        if (activeCommand) perform(activeCommand);
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        onClose();
        break;
      case "Tab": {
        // Focus trap: cycle between the dialog's own controls.
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          "input, button:not([disabled])"
        );
        if (!focusable?.length) break;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const current = document.activeElement;
        if (event.shiftKey && current === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && current === last) {
          event.preventDefault();
          first.focus();
        }
        break;
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-[13vh]"
      // click, not pointerdown: on touch the follow-up click would otherwise
      // land on whatever sits under the scrim once it is gone.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/* Scrim. Blur is tiny and desktop-only: the WebGL object animates
          underneath, so a backdrop-filter would be re-run every frame. */}
      <div
        aria-hidden="true"
        className="command-palette-scrim pointer-events-none absolute inset-0 bg-black/65 sm:bg-black/50 sm:backdrop-blur-[2px]"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        onKeyDown={onKeyDown}
        className="command-palette-panel relative flex max-h-[calc(var(--cmdk-vh,100dvh)-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[#141415] shadow-2xl shadow-black/70 sm:max-h-[min(30rem,74vh)]"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800 px-4">
          <Search className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-listbox"
            aria-activedescendant={
              activeCommand ? optionId(activeCommand.id) : undefined
            }
            aria-autocomplete="list"
            aria-label={t.placeholder}
            placeholder={t.placeholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
              if (listRef.current) listRef.current.scrollTop = 0;
            }}
            // 16px on phones so iOS does not zoom the page on focus.
            className="h-12 min-w-0 flex-1 bg-transparent text-base text-zinc-100 outline-none placeholder:text-zinc-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className={`${KBD} h-6 shrink-0 px-1.5 transition-colors hover:border-zinc-600 hover:text-zinc-200 focus-visible:border-zinc-500 focus-visible:text-zinc-200 focus-visible:outline-none`}
          >
            Esc
          </button>
        </div>

        <div
          ref={listRef}
          id="cmdk-listbox"
          role="listbox"
          aria-label={t.title}
          // Keep focus in the input when a row is clicked.
          onMouseDown={(event) => event.preventDefault()}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 [scrollbar-color:#3f3f46_transparent] [scrollbar-width:thin]"
        >
          {flat.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
              <SearchX className="mb-2 h-5 w-5 text-zinc-600" aria-hidden="true" />
              <p className="text-sm text-zinc-300">{t.empty(query.trim())}</p>
              <p className="text-xs text-zinc-500">{t.emptyHint}</p>
            </div>
          ) : (
            groups.map(([groupId, items]) => (
              <div
                key={groupId}
                role="group"
                aria-labelledby={`cmdk-group-${groupId}`}
                className="mb-1 last:mb-0"
              >
                <div
                  id={`cmdk-group-${groupId}`}
                  className="px-2.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500"
                >
                  {t.groups[groupId]}
                </div>
                {items.map(({ command, hits }) => {
                  const index = flat.findIndex((r) => r.command === command);
                  const isActive = index === activeIndex;
                  const done = copied && command.id === "action-copy-email";
                  const Icon = done ? Check : command.icon;
                  return (
                    <div
                      key={command.id}
                      id={optionId(command.id)}
                      role="option"
                      aria-selected={isActive}
                      onPointerMove={() => {
                        if (!isActive) setActive(index);
                      }}
                      onClick={() => perform(command)}
                      className={`flex h-10 cursor-pointer select-none items-center gap-3 rounded-lg px-2.5 text-sm ${
                        isActive ? "bg-zinc-800/70 text-zinc-50" : "text-zinc-300"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? "text-zinc-200" : "text-zinc-500"
                        }`}
                        aria-hidden="true"
                      />
                      {/* The label wins the space; the hint truncates. */}
                      <span className="max-w-[70%] shrink-0 truncate">
                        <Highlighted text={command.label} hits={hits} />
                      </span>
                      <span
                        className={`min-w-0 flex-1 truncate text-right text-xs ${
                          done ? "text-zinc-100" : "text-zinc-500"
                        }`}
                      >
                        {done ? t.copied : command.hint}
                      </span>
                      {command.external ? (
                        <ArrowUpRight
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isActive ? "text-zinc-400" : "text-zinc-600"
                          }`}
                          aria-hidden="true"
                        />
                      ) : (
                        <CornerDownLeft
                          className={`hidden h-3.5 w-3.5 shrink-0 text-zinc-500 sm:block ${
                            isActive ? "" : "invisible"
                          }`}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Keyboard legend: pointless on touch screens. */}
        <div className="hidden shrink-0 items-center gap-4 border-t border-zinc-800 px-4 py-2 text-[11px] text-zinc-500 sm:flex">
          <span className="flex items-center gap-1.5">
            <kbd className={KBD}>↑</kbd>
            <kbd className={KBD}>↓</kbd>
            {t.toNavigate}
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className={KBD}>↵</kbd>
            {t.toSelect}
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <kbd className={KBD}>esc</kbd>
            {t.toClose}
          </span>
        </div>

        <div aria-live="polite" className="sr-only">
          {copied ? t.copied : ""}
        </div>
      </div>
    </div>
  );
}
