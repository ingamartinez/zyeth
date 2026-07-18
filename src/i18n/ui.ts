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

    // Home — trust band
    "trust.aria": "Why US teams work with Zyeth",
    "trust.timezone.title": "Same workday, in real time",
    "trust.timezone.body":
      "Your team is ≤ 1 hour behind New York — no overnight handoffs, no waiting until tomorrow for an answer.",
    "trust.vetting.title": "Vetted before you meet them",
    "trust.vetting.body":
      "English, hands-on experience, and references are checked up front. You only ever see the shortlist.",
    "trust.model.title": "The first 3 months through Zyeth",
    "trust.model.body":
      "We carry payroll and compliance while the fit proves itself — convert to your team when you're sure.",
    "trust.industriesLabel": "Built for US operations teams in",
    "trust.industry1": "Logistics & freight",
    "trust.industry2": "E-commerce",
    "trust.industry3": "Manufacturing",
    "trust.industry4": "3PL & fulfillment",

    // Home — services / how we help
    "services.aria": "Roles we place on US operations teams",
    "services.eyebrow": "How we help",
    "services.heading": "The operators who keep your business moving",
    "services.intro":
      "We staff the back-office and logistics roles that are hardest to fill on US time — each one hand-picked, English-fluent, and ready to plug into your team.",
    "services.role1.title": "Logistics coordinators",
    "services.role1.body":
      "Track shipments, book carriers, and chase exceptions so freight keeps moving without you watching the board.",
    "services.role2.title": "Accounts payable specialists",
    "services.role2.body":
      "Process invoices, reconcile statements, and keep vendors paid on time — accurate, audit-ready, and on your calendar.",
    "services.role3.title": "Operations managers",
    "services.role3.body":
      "Own daily workflows, keep SLAs green, and coordinate across teams so nothing falls through the cracks.",
    "services.role4.title": "Order & customer support",
    "services.role4.body":
      "Handle orders, returns, and inbound questions with the tone your customers expect — in real time, in your timezone.",
    "services.role5.title": "Supply chain & procurement",
    "services.role5.body":
      "Manage POs, follow up with suppliers, and keep inventory data clean so you never run short or over-order.",
    "services.role6.title": "Data & reporting analysts",
    "services.role6.body":
      "Turn spreadsheets and systems into the dashboards and numbers your leadership actually reads.",

    // Home — US vs Medellín cost comparison
    "compare.eyebrow": "The math",
    "compare.heading": "What the same role costs you, side by side",
    "compare.intro":
      "Pick a role and see the fully-loaded monthly cost of a US hire against the same person through Zyeth — in Medellín, on your timezone.",
    "compare.selectLabel": "Choose a role",
    "compare.role1": "Logistics coordinator",
    "compare.role2": "AP specialist",
    "compare.role3": "Operations manager",
    "compare.role4": "Customer support",
    "compare.role5": "Procurement",
    "compare.role6": "Data analyst",
    "compare.usLabel": "Equivalent US hire",
    "compare.zyethLabel": "With Zyeth",
    "compare.perMonth": "Fully-loaded cost per month",
    "compare.saveLabel": "You save",
    "compare.annual": "≈ {v} a year",
    "compare.exampleTag": "Example",
    "compare.note":
      "Illustrative rates to show the gap — you get exact numbers for your roles on a quick call.",

    // Home — why choose us
    "whychoose.aria": "Why US teams choose Zyeth",
    "whychoose.eyebrow": "Why Zyeth",
    "whychoose.heading": "Why teams pick us over a job board",
    "whychoose.intro":
      "Anyone can send you résumés. We do the vetting, carry the risk, and put someone on your team who's already working your hours.",
    "whychoose.point1.title": "Curated, not crowdsourced",
    "whychoose.point1.body":
      "Every candidate is hand-picked and vetted — English, experience, and references checked — before they reach your inbox. You interview a shortlist, not a stack.",
    "whychoose.point2.title": "On your clock, every day",
    "whychoose.point2.body":
      "Our operators work from Medellín, ≤ 1 hour behind New York. Same-day answers and live handoffs — no overnight lag between you and your team.",
    "whychoose.point3.title": "Low-risk for the first 3 months",
    "whychoose.point3.body":
      "We carry payroll and compliance while the fit proves itself. When it works, convert them to your team. If it doesn't, walk away clean.",
    "whychoose.imageAlt":
      "A Zyeth operations specialist wearing a headset, smiling at her desk in a modern office.",

    // Home — contact / lead form (client)
    "contact.eyebrow": "Ready to hire?",
    "contact.heading": "Tell us who you need — we'll bring the shortlist",
    "contact.intro":
      "Share the role and the rate you have in mind. We'll match you with vetted candidates and book a quick call to walk through the shortlist.",
    "contact.roleLabel": "Role you're hiring for",
    "contact.rolePlaceholder": "e.g. Logistics coordinator",
    "contact.rateLabel": "Typical expected rate",
    "contact.ratePlaceholder": "e.g. $3,000–$4,000/mo",
    "contact.nameLabel": "Your name",
    "contact.namePlaceholder": "Jane Smith",
    "contact.emailLabel": "Work email",
    "contact.emailPlaceholder": "jane@company.com",
    "contact.phoneLabel": "Phone number",
    "contact.phonePlaceholder": "+1 (555) 123-4567",
    "contact.optional": "Optional",
    "contact.submit": "Book a call",
    "contact.note": "You'll finish scheduling on Calendly — takes about a minute.",
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

    // Home — trust band
    "trust.aria": "Por qué los equipos de EE. UU. trabajan con Zyeth",
    "trust.timezone.title": "El mismo día laboral, en tiempo real",
    "trust.timezone.body":
      "Tu equipo está a ≤ 1 hora de Nueva York — sin entregas de un día para otro, sin esperar hasta mañana por una respuesta.",
    "trust.vetting.title": "Verificados antes de que los conozcas",
    "trust.vetting.body":
      "Inglés, experiencia real y referencias se chequean de antemano. Solo ves la preselección.",
    "trust.model.title": "Los primeros 3 meses a través de Zyeth",
    "trust.model.body":
      "Nos hacemos cargo de la nómina y el cumplimiento mientras el encaje se demuestra — pasalos a tu equipo cuando estés seguro.",
    "trust.industriesLabel": "Hecho para equipos de operaciones de EE. UU. en",
    "trust.industry1": "Logística y transporte",
    "trust.industry2": "E-commerce",
    "trust.industry3": "Manufactura",
    "trust.industry4": "3PL y fulfillment",

    // Home — services / how we help
    "services.aria": "Roles que sumamos a equipos de operaciones de EE. UU.",
    "services.eyebrow": "Cómo ayudamos",
    "services.heading": "Los operadores que mantienen tu negocio en movimiento",
    "services.intro":
      "Cubrimos los roles de back-office y logística más difíciles de llenar en horario de EE. UU. — cada uno elegido a mano, con inglés fluido y listo para sumarse a tu equipo.",
    "services.role1.title": "Coordinadores de logística",
    "services.role1.body":
      "Siguen envíos, contratan transportistas y resuelven excepciones para que la carga fluya sin que tengas que mirar el tablero.",
    "services.role2.title": "Especialistas en cuentas por pagar",
    "services.role2.body":
      "Procesan facturas, concilian estados de cuenta y mantienen a los proveedores pagos a tiempo — precisos, auditables y en tu calendario.",
    "services.role3.title": "Gerentes de operaciones",
    "services.role3.body":
      "Dueños del flujo diario, mantienen los SLA en verde y coordinan entre equipos para que nada se caiga.",
    "services.role4.title": "Soporte de pedidos y clientes",
    "services.role4.body":
      "Gestionan pedidos, devoluciones y consultas entrantes con el tono que tus clientes esperan — en tiempo real, en tu horario.",
    "services.role5.title": "Cadena de suministro y compras",
    "services.role5.body":
      "Manejan órdenes de compra, hacen seguimiento a proveedores y mantienen los datos de inventario limpios para que nunca falte ni sobre stock.",
    "services.role6.title": "Analistas de datos y reportes",
    "services.role6.body":
      "Convierten planillas y sistemas en los dashboards y números que tu liderazgo realmente lee.",

    // Home — comparación de costos EE. UU. vs. Medellín
    "compare.eyebrow": "Los números",
    "compare.heading": "Cuánto te cuesta el mismo rol, lado a lado",
    "compare.intro":
      "Elegí un rol y compará el costo mensual total de una contratación en EE. UU. contra la misma persona a través de Zyeth — en Medellín, en tu horario.",
    "compare.selectLabel": "Elegí un rol",
    "compare.role1": "Coord. de logística",
    "compare.role2": "Cuentas por pagar",
    "compare.role3": "Gerente de ops",
    "compare.role4": "Soporte al cliente",
    "compare.role5": "Compras",
    "compare.role6": "Analista de datos",
    "compare.usLabel": "Contratación en EE. UU.",
    "compare.zyethLabel": "Con Zyeth",
    "compare.perMonth": "Costo mensual total",
    "compare.saveLabel": "Ahorrás",
    "compare.annual": "≈ {v} al año",
    "compare.exampleTag": "Ejemplo",
    "compare.note":
      "Tarifas ilustrativas para mostrar la diferencia — los números exactos para tus roles te los damos en una llamada corta.",

    // Home — por qué elegirnos
    "whychoose.aria": "Por qué los equipos de EE. UU. eligen Zyeth",
    "whychoose.eyebrow": "Por qué Zyeth",
    "whychoose.heading": "Por qué nos eligen antes que a un portal de empleo",
    "whychoose.intro":
      "Cualquiera te manda currículums. Nosotros hacemos la verificación, asumimos el riesgo y sumamos a tu equipo a alguien que ya trabaja en tu horario.",
    "whychoose.point1.title": "Curado, no masivo",
    "whychoose.point1.body":
      "Cada candidato es elegido a mano y verificado — inglés, experiencia y referencias chequeadas — antes de que llegue a tu bandeja. Entrevistás una preselección, no una pila.",
    "whychoose.point2.title": "En tu horario, todos los días",
    "whychoose.point2.body":
      "Nuestros operadores trabajan desde Medellín, a ≤ 1 hora de Nueva York. Respuestas el mismo día y entregas en vivo — sin demoras de un día para otro entre vos y tu equipo.",
    "whychoose.point3.title": "Bajo riesgo los primeros 3 meses",
    "whychoose.point3.body":
      "Nos hacemos cargo de la nómina y el cumplimiento mientras el encaje se demuestra. Cuando funciona, pasalos a tu equipo. Si no, te vas sin ataduras.",
    "whychoose.imageAlt":
      "Una especialista de operaciones de Zyeth con auriculares, sonriendo en su escritorio en una oficina moderna.",

    // Home — contacto / formulario de leads (cliente)
    "contact.eyebrow": "¿Listo para contratar?",
    "contact.heading": "Contanos a quién necesitás — te traemos la preselección",
    "contact.intro":
      "Compartí el rol y la tarifa que tenés en mente. Te conectamos con candidatos verificados y agendamos una llamada corta para repasar la preselección.",
    "contact.roleLabel": "Rol que estás buscando",
    "contact.rolePlaceholder": "ej: Coordinador de logística",
    "contact.rateLabel": "Tarifa esperada habitual",
    "contact.ratePlaceholder": "ej: $3.000–$4.000/mes",
    "contact.nameLabel": "Tu nombre",
    "contact.namePlaceholder": "Jane Smith",
    "contact.emailLabel": "Email laboral",
    "contact.emailPlaceholder": "jane@empresa.com",
    "contact.phoneLabel": "Teléfono",
    "contact.phonePlaceholder": "+1 (555) 123-4567",
    "contact.optional": "Opcional",
    "contact.submit": "Agendá una llamada",
    "contact.note": "Terminás de agendar en Calendly — toma un minuto.",
  },
} as const;

export type UIKey = keyof (typeof ui)[typeof defaultLang];
