import { locales, type Locale } from "@/lib/i18n";
import { type Metadata } from "next";

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return {
    alternates: {
      languages: {
        "en-US": "/en",
        "fr-FR": "/fr",
      },
    },
  };
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = await params;

  return <div lang={lang}>{children}</div>;
}
