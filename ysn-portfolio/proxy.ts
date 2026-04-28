import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales, type Locale } from '@/lib/i18n';

const LOCALE_COOKIE = 'preferred-locale';

function pickLocaleFromAcceptLanguage(headerValue: string | null): Locale {
  if (!headerValue) return defaultLocale;

  const requested = headerValue
    .split(',')
    .map((part) => {
      const [langPart, qPart] = part.trim().split(';');
      const baseLang = langPart.toLowerCase().split('-')[0];
      const q = qPart?.startsWith('q=') ? Number.parseFloat(qPart.slice(2)) : 1;
      return { baseLang, q: Number.isFinite(q) ? q : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const item of requested) {
    if (locales.includes(item.baseLang as Locale)) {
      return item.baseLang as Locale;
    }
  }

  return defaultLocale;
}

function getPreferredLocale(req: NextRequest): Locale {
  const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  return pickLocaleFromAcceptLanguage(req.headers.get('accept-language'));
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (hasLocalePrefix) {
    const localeInPath = pathname.split('/')[1] as Locale;
    const res = NextResponse.next();
    res.cookies.set(LOCALE_COOKIE, localeInPath, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
    return res;
  }

  const locale = getPreferredLocale(req);
  const nextUrl = req.nextUrl.clone();
  nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(nextUrl);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|assets|.*\\..*).*)'],
};
