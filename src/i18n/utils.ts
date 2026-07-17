import { ui, defaultLang, type Lang, type UIKey } from "./ui";

/** Extract the active locale from a URL pathname (e.g. /es/... -> "es"). */
export function getLangFromUrl(url: URL): Lang {
  const [, maybeLang] = url.pathname.split("/");
  if (maybeLang in ui) return maybeLang as Lang;
  return defaultLang;
}

/** Returns a translator bound to a locale, falling back to the default language. */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/**
 * Build a locale-aware path. The default locale has no prefix (EN at "/"),
 * other locales are prefixed (ES at "/es"). See astro.config i18n routing.
 */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === defaultLang) return clean === "/" ? "/" : clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

/** Strip a leading locale segment, returning the language-neutral path. */
export function stripLangFromPath(pathname: string): string {
  const segments = pathname.split("/");
  if (segments[1] in ui) {
    const rest = "/" + segments.slice(2).join("/");
    return rest === "/" ? "/" : rest.replace(/\/$/, "");
  }
  return pathname === "/" ? "/" : pathname.replace(/\/$/, "");
}
