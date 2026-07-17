export const languages = {
  en: "English",
  es: "Español",
} as const;

export const defaultLang = "en";

export type Lang = keyof typeof languages;

/**
 * UI copy dictionaries. Foundation strings only (nav, footer, shared UI);
 * page/section copy is added per section as it's built. See PLAN.md §5.
 */
export const ui = {
  en: {
    "site.name": "Zyeth",
    "site.tagline": "Curated talent from Colombia for US teams",

    "nav.home": "Home",
    "nav.howItWorks": "How it works",
    "nav.resources": "Resources",
    "nav.about": "About us",
    "nav.careers": "Apply",
    "nav.cta": "Book a call",
    "nav.menu": "Menu",
    "nav.langLabel": "Language",

    "footer.tagline": "Curated Colombian talent for US teams. Operations & logistics, on US time.",
    "footer.explore": "Explore",
    "footer.connect": "Connect",
    "footer.rights": "All rights reserved.",
  },
  es: {
    "site.name": "Zyeth",
    "site.tagline": "Talento curado de Colombia para equipos de EE. UU.",

    "nav.home": "Inicio",
    "nav.howItWorks": "Cómo funciona",
    "nav.resources": "Recursos",
    "nav.about": "Nosotros",
    "nav.careers": "Postulate",
    "nav.cta": "Agendá una llamada",
    "nav.menu": "Menú",
    "nav.langLabel": "Idioma",

    "footer.tagline": "Talento colombiano curado para equipos de EE. UU. Operaciones y logística, en horario de EE. UU.",
    "footer.explore": "Explorar",
    "footer.connect": "Conectá",
    "footer.rights": "Todos los derechos reservados.",
  },
} as const;

export type UIKey = keyof (typeof ui)[typeof defaultLang];
