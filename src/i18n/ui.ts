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

    // Home — hero
    "hero.eyebrow": "Curated talent · Medellín → US timezone",
    "hero.h1Before": "",
    "hero.h1Highlight": "Curated",
    "hero.h1After": " talent for the teams that keep US operations running.",
    "hero.subBefore":
      "We don't hand you a stack of résumés to sift through. Every candidate is ",
    "hero.subStrong": "hand-picked and vetted before you meet them",
    "hero.subAfter":
      " — logistics coordinators, payables specialists, and ops managers who work in your timezone and start in weeks.",
    "hero.ctaSecondary": "See how it works",
    "hero.trustTimezone": "≤ 1 hr behind New York",
    "hero.trustVetted": "Vetted before you meet them",
    "hero.trustMonths": "First 3 months through Zyeth",

    // Home — hero: example candidate card
    "hero.card.aria": "Example of a curated candidate",
    "hero.card.pick": "Curated pick",
    "hero.card.verified": "Verified",
    "hero.card.name": "Valentina R.",
    "hero.card.role": "Logistics Coordinator",
    "hero.card.location": "Medellín, Colombia",
    "hero.card.chipEnglish": "English C1",
    "hero.card.chipExperience": "5 yrs ops",
    "hero.card.chipTools": "Excel · NetSuite",
    "hero.card.chipAvailable": "Available now",
    "hero.card.rateHead": "Monthly cost vs. equivalent US hire",
    "hero.card.save": "Save 57%",
    "hero.card.barUsLabel": "US hire",
    "hero.card.barUsValue": "$7,300",
    "hero.card.barZyethLabel": "With Zyeth",
    "hero.card.barZyethValue": "$3,150",
    "hero.footnote": "One of 40+ operators vetted this month — you only ever see the shortlist.",
    "hero.footnoteExample": "Example profile · illustrative rates",
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

    // Home — hero
    "hero.eyebrow": "Talento curado · Medellín → horario de EE. UU.",
    "hero.h1Before": "Talento ",
    "hero.h1Highlight": "curado",
    "hero.h1After": " para los equipos que sostienen la operación en EE. UU.",
    "hero.subBefore":
      "No te entregamos una pila de currículums para filtrar. Cada candidato es ",
    "hero.subStrong": "elegido a mano y verificado antes de que lo conozcas",
    "hero.subAfter":
      " — coordinadores de logística, especialistas en cuentas por pagar y gerentes de operaciones que trabajan en tu horario y arrancan en semanas.",
    "hero.ctaSecondary": "Mirá cómo funciona",
    "hero.trustTimezone": "≤ 1 h detrás de Nueva York",
    "hero.trustVetted": "Verificados antes de que los conozcas",
    "hero.trustMonths": "Los primeros 3 meses a través de Zyeth",

    // Home — hero: example candidate card
    "hero.card.aria": "Ejemplo de un candidato curado",
    "hero.card.pick": "Selección curada",
    "hero.card.verified": "Verificado",
    "hero.card.name": "Valentina R.",
    "hero.card.role": "Coordinadora de Logística",
    "hero.card.location": "Medellín, Colombia",
    "hero.card.chipEnglish": "Inglés C1",
    "hero.card.chipExperience": "5 años en ops",
    "hero.card.chipTools": "Excel · NetSuite",
    "hero.card.chipAvailable": "Disponible ahora",
    "hero.card.rateHead": "Costo mensual vs. contratación equivalente en EE. UU.",
    "hero.card.save": "Ahorrás 57%",
    "hero.card.barUsLabel": "En EE. UU.",
    "hero.card.barUsValue": "$7,300",
    "hero.card.barZyethLabel": "Con Zyeth",
    "hero.card.barZyethValue": "$3,150",
    "hero.footnote": "Uno de más de 40 operadores verificados este mes — solo ves la preselección.",
    "hero.footnoteExample": "Perfil de ejemplo · tarifas ilustrativas",
  },
} as const;

export type UIKey = keyof (typeof ui)[typeof defaultLang];
