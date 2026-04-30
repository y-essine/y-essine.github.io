export function getProjectLogo(slug: string) {
  const logos: Record<string, string> = {
    "fomo-app": "/logos/fomo_logo.png",
    "meme-paper": "/logos/meme-paper_logo.png",
    mailtrace: "/logos/mailtrace_logo.png",
  };

  return logos[slug];
}
