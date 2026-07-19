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

    // Shared — accessibility
    "a11y.skipToContent": "Skip to main content",

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

    // How it works — page meta
    "howitworks.meta.title": "How it works",
    "howitworks.meta.description":
      "The four-step process to go from an open role to a vetted, curated hire working on your team — in weeks.",

    // How it works — page hero
    "howitworks.hero.eyebrow": "How it works",
    "howitworks.hero.h1": "From open role to vetted hire — in four steps",
    "howitworks.hero.subtitle":
      "No stacks of résumés, no guesswork on fit. Here's exactly how we get a curated, English-fluent operator working on your team in weeks — not months.",

    // How it works — 4-step stepper
    "howitworks.steps.aria": "The four-step hiring process",
    "howitworks.steps.eyebrow": "The process",
    "howitworks.steps.heading": "Four steps, from brief to hire",
    "howitworks.steps.intro":
      "Every search follows the same disciplined process — so you always know what's happening and when.",
    "howitworks.step1.title": "Tell us the role",
    "howitworks.step1.body":
      "A 20-minute call or a short brief — the role, the tools, the rate you have in mind. We use it to define exactly who we're looking for.",
    "howitworks.step2.title": "We curate and vet a shortlist",
    "howitworks.step2.body":
      "Our recruiters source, screen, and verify English, experience, and references — you never see a résumé that hasn't already been checked.",
    "howitworks.step3.title": "You interview and choose",
    "howitworks.step3.body":
      "We hand you a shortlist of 3–5 vetted candidates. You run the interviews, we coordinate scheduling — you pick who joins your team.",
    "howitworks.step4.title": "They start — through Zyeth, for the first 3 months",
    "howitworks.step4.body":
      "Your new hire starts working with your team right away. We carry payroll and compliance while the fit proves itself, then you convert them directly.",

    // How it works — 3-month model explainer
    "howitworks.model.eyebrow": "The 3-month model",
    "howitworks.model.heading": "Low-risk from day one",
    "howitworks.model.intro":
      "For the first 3 months, your new hire is employed through Zyeth — not you. That means:",
    "howitworks.model.point1.title": "We carry payroll & compliance",
    "howitworks.model.point1.body":
      "Local labor law, benefits, and payments are on us — one predictable invoice for you.",
    "howitworks.model.point2.title": "You manage the work",
    "howitworks.model.point2.body":
      "Day-to-day, tools, and goals stay entirely with your team from day one.",
    "howitworks.model.point3.title": "Convert whenever you're ready",
    "howitworks.model.point3.body":
      "When the fit is proven, we hand off employment directly to you — no lock-in, no extra fee.",

    // How it works — closing CTA
    "howitworks.cta.heading": "Ready to see your shortlist?",
    "howitworks.cta.body":
      "Tell us the role and we'll have curated candidates in front of you this week.",

    // Careers — page meta
    "careers.meta.title": "Careers",
    "careers.meta.description":
      "Apply to join Zyeth's curated network of Colombian operations talent working US hours.",

    // Careers — page hero
    "careers.hero.eyebrow": "Join our talent network",
    "careers.hero.h1": "Work with US teams, from Medellín",
    "careers.hero.subtitle":
      "We're always curating operators for US operations teams — logistics, payables, and customer support. Apply once and we'll reach out when there's a fit.",

    // Careers — application form
    "careers.form.heading": "Tell us about you",
    "careers.form.intro":
      "Share your background and a copy of your CV — our recruiters review every application.",
    "careers.form.requiredHint": "* Required",
    "careers.form.nameLabel": "Full name",
    "careers.form.namePlaceholder": "Valentina Ramírez",
    "careers.form.emailLabel": "Email",
    "careers.form.emailPlaceholder": "you@example.com",
    "careers.form.roleExperienceLabel": "Role & experience",
    "careers.form.roleExperiencePlaceholder":
      "e.g. Logistics coordinator with 3 years booking freight and tracking exceptions",
    "careers.form.englishLevelLabel": "English level",
    "careers.form.englishLevel.placeholder": "Select your level",
    "careers.form.englishLevel.basic": "Basic",
    "careers.form.englishLevel.intermediate": "Intermediate",
    "careers.form.englishLevel.advanced": "Advanced",
    "careers.form.englishLevel.native": "Native",
    "careers.form.cvLabel": "CV / résumé",
    "careers.form.cvHelper": "PDF, DOC, or DOCX — max 5 MB.",
    "careers.form.submit": "Submit application",
    "careers.form.submitting": "Submitting…",
    "careers.form.success": "Thanks — your application is in. We'll be in touch if there's a fit.",
    "careers.form.error.validation": "Please check your answers and try again.",
    "careers.form.error.fileType": "Your CV must be a PDF, DOC, or DOCX file.",
    "careers.form.error.fileSize": "Your CV is too large — the maximum size is 5 MB.",
    "careers.form.error.rateLimit": "Too many attempts — please try again in a few minutes.",
    "careers.form.error.generic":
      "Something went wrong and we couldn't submit your application. Please try again later.",

    // About — page meta
    "about.meta.title": "About us",
    "about.meta.description":
      "Zyeth connects US operations teams with curated, vetted talent in Medellín — same timezone, hand-picked, and ready to work.",

    // About — page hero
    "about.hero.eyebrow": "About Zyeth",
    "about.hero.h1": "Curated talent, built on trust",
    "about.hero.subtitle":
      "We connect US operations teams with hand-picked, English-fluent talent in Medellín — vetted before you ever see a résumé.",

    // About — who we are
    "about.intro.eyebrow": "Who we are",
    "about.intro.heading": "A curated bridge between US teams and Colombian talent",
    "about.intro.body1":
      "Zyeth exists because hiring shouldn't mean sorting through hundreds of résumés hoping to find the right fit. We built a recruiting operation focused on one region — Medellín, Colombia — and one outcome: operators who are ready to work on US operations teams from day one.",
    "about.intro.body2":
      "We work in your timezone, speak your language, and understand the roles we place — logistics, payables, and operations support — because we've built our own process around them.",

    // About — mission
    "about.mission.eyebrow": "Our mission",
    "about.mission.heading":
      "Make hiring across borders feel as safe as hiring down the hall",
    "about.mission.body":
      "Every operator we place has been checked before you meet them — English, hands-on experience, and references verified up front. We carry payroll and compliance for the first three months so the fit proves itself before it's permanent. That's the standard we hold every placement to.",

    // About — how we curate (vetting)
    "about.vetting.eyebrow": "How we curate",
    "about.vetting.heading": "Every candidate earns their spot on the shortlist",
    "about.vetting.intro":
      "Curated isn't a marketing word for us — it's the process. Before anyone reaches your inbox, they clear three checks.",
    "about.vetting.pillar1.title": "English fluency, verified",
    "about.vetting.pillar1.body":
      "We assess spoken and written English directly — not a self-reported checkbox — so communication is never the risk.",
    "about.vetting.pillar2.title": "Hands-on experience, confirmed",
    "about.vetting.pillar2.body":
      "We screen for real, role-specific experience — the tools, workflows, and judgment the job actually requires.",
    "about.vetting.pillar3.title": "References, checked",
    "about.vetting.pillar3.body":
      "We speak with past employers or clients before a candidate reaches your shortlist — not after you've already hired them.",

    // About — closing CTA
    "about.cta.heading": "Ready to meet your shortlist?",
    "about.cta.body":
      "Tell us the role you're hiring for and we'll bring you curated, vetted candidates — not a stack of résumés.",

    // Shared — honeypot field (hidden from real users, never localized visually)
    "honeypot.label": "Leave this field blank",
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

    // Compartido — accesibilidad
    "a11y.skipToContent": "Saltar al contenido principal",

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

    // Cómo funciona — meta de la página
    "howitworks.meta.title": "Cómo funciona",
    "howitworks.meta.description":
      "El proceso de cuatro pasos para pasar de un rol abierto a una contratación curada y verificada trabajando en tu equipo — en semanas.",

    // Cómo funciona — hero de página
    "howitworks.hero.eyebrow": "Cómo funciona",
    "howitworks.hero.h1": "Del rol abierto a la contratación verificada — en cuatro pasos",
    "howitworks.hero.subtitle":
      "Nada de pilas de currículums ni apuestas a ciegas. Así es exactamente cómo ponemos a un operador curado y con inglés fluido a trabajar en tu equipo en semanas — no en meses.",

    // Cómo funciona — proceso de 4 pasos
    "howitworks.steps.aria": "El proceso de contratación de cuatro pasos",
    "howitworks.steps.eyebrow": "El proceso",
    "howitworks.steps.heading": "Cuatro pasos, del brief a la contratación",
    "howitworks.steps.intro":
      "Cada búsqueda sigue el mismo proceso disciplinado — para que siempre sepas qué está pasando y cuándo.",
    "howitworks.step1.title": "Contanos el rol",
    "howitworks.step1.body":
      "Una llamada de 20 minutos o un brief corto — el rol, las herramientas, la tarifa que tenés en mente. Lo usamos para definir exactamente a quién buscamos.",
    "howitworks.step2.title": "Curamos y verificamos una preselección",
    "howitworks.step2.body":
      "Nuestro equipo de reclutamiento busca, filtra y verifica inglés, experiencia y referencias — nunca ves un currículum que no haya sido chequeado antes.",
    "howitworks.step3.title": "Entrevistás y elegís",
    "howitworks.step3.body":
      "Te entregamos una preselección de 3 a 5 candidatos verificados. Vos hacés las entrevistas, nosotros coordinamos la agenda — elegís quién se suma a tu equipo.",
    "howitworks.step4.title": "Arranca — a través de Zyeth, los primeros 3 meses",
    "howitworks.step4.body":
      "Tu nueva contratación empieza a trabajar con tu equipo de inmediato. Nos hacemos cargo de la nómina y el cumplimiento mientras el encaje se demuestra, y después la pasás directo a tu equipo.",

    // Cómo funciona — modelo de 3 meses
    "howitworks.model.eyebrow": "El modelo de 3 meses",
    "howitworks.model.heading": "Bajo riesgo desde el día uno",
    "howitworks.model.intro":
      "Durante los primeros 3 meses, tu nueva contratación está empleada a través de Zyeth — no de vos. Eso significa:",
    "howitworks.model.point1.title": "Nos encargamos de la nómina y el cumplimiento",
    "howitworks.model.point1.body":
      "La legislación laboral local, los beneficios y los pagos corren por nuestra cuenta — una sola factura predecible para vos.",
    "howitworks.model.point2.title": "Vos manejás el trabajo",
    "howitworks.model.point2.body":
      "El día a día, las herramientas y los objetivos quedan enteramente con tu equipo desde el primer día.",
    "howitworks.model.point3.title": "Convertí cuando estés listo",
    "howitworks.model.point3.body":
      "Cuando el encaje está probado, te pasamos el empleo directamente — sin ataduras, sin costo extra.",

    // Cómo funciona — CTA de cierre
    "howitworks.cta.heading": "¿Listo para ver tu preselección?",
    "howitworks.cta.body":
      "Contanos el rol y tenés candidatos curados frente a vos esta misma semana.",

    // Postulate — meta de la página
    "careers.meta.title": "Postulate",
    "careers.meta.description":
      "Postulate a la red curada de talento operativo colombiano de Zyeth, trabajando en horario de EE. UU.",

    // Postulate — hero de página
    "careers.hero.eyebrow": "Sumate a nuestra red de talento",
    "careers.hero.h1": "Trabajá con equipos de EE. UU., desde Medellín",
    "careers.hero.subtitle":
      "Siempre estamos curando operadores para equipos de operaciones de EE. UU. — logística, cuentas por pagar y atención al cliente. Postulate una vez y te contactamos cuando haya un encaje.",

    // Postulate — formulario de postulación
    "careers.form.heading": "Contanos sobre vos",
    "careers.form.intro":
      "Compartí tu experiencia y una copia de tu CV — nuestro equipo de reclutamiento revisa cada postulación.",
    "careers.form.requiredHint": "* Obligatorio",
    "careers.form.nameLabel": "Nombre completo",
    "careers.form.namePlaceholder": "Valentina Ramírez",
    "careers.form.emailLabel": "Email",
    "careers.form.emailPlaceholder": "vos@ejemplo.com",
    "careers.form.roleExperienceLabel": "Rol y experiencia",
    "careers.form.roleExperiencePlaceholder":
      "ej: Coordinadora de logística con 3 años reservando fletes y siguiendo excepciones",
    "careers.form.englishLevelLabel": "Nivel de inglés",
    "careers.form.englishLevel.placeholder": "Elegí tu nivel",
    "careers.form.englishLevel.basic": "Básico",
    "careers.form.englishLevel.intermediate": "Intermedio",
    "careers.form.englishLevel.advanced": "Avanzado",
    "careers.form.englishLevel.native": "Nativo",
    "careers.form.cvLabel": "CV / currículum",
    "careers.form.cvHelper": "PDF, DOC o DOCX — máximo 5 MB.",
    "careers.form.submit": "Enviar postulación",
    "careers.form.submitting": "Enviando…",
    "careers.form.success": "Listo — recibimos tu postulación. Te contactamos si hay un encaje.",
    "careers.form.error.validation": "Revisá tus respuestas e intentá de nuevo.",
    "careers.form.error.fileType": "Tu CV debe ser un archivo PDF, DOC o DOCX.",
    "careers.form.error.fileSize": "Tu CV es demasiado grande — el tamaño máximo es 5 MB.",
    "careers.form.error.rateLimit": "Demasiados intentos — probá de nuevo en unos minutos.",
    "careers.form.error.generic":
      "Algo salió mal y no pudimos enviar tu postulación. Probá de nuevo más tarde.",

    // Nosotros — meta de la página
    "about.meta.title": "Nosotros",
    "about.meta.description":
      "Zyeth conecta equipos de operaciones de EE. UU. con talento curado y verificado en Medellín — mismo horario, elegido a mano y listo para trabajar.",

    // Nosotros — hero de página
    "about.hero.eyebrow": "Sobre Zyeth",
    "about.hero.h1": "Talento curado, construido sobre confianza",
    "about.hero.subtitle":
      "Conectamos equipos de operaciones de EE. UU. con talento elegido a mano y con inglés fluido en Medellín — verificado antes de que veas un currículum.",

    // Nosotros — quiénes somos
    "about.intro.eyebrow": "Quiénes somos",
    "about.intro.heading": "Un puente curado entre equipos de EE. UU. y talento colombiano",
    "about.intro.body1":
      "Zyeth existe porque contratar no debería significar revisar cientos de currículums esperando encontrar el encaje correcto. Armamos una operación de reclutamiento enfocada en una región — Medellín, Colombia — y un solo resultado: operadores listos para trabajar en equipos de operaciones de EE. UU. desde el primer día.",
    "about.intro.body2":
      "Trabajamos en tu horario, hablamos tu idioma y entendemos los roles que ubicamos — logística, cuentas por pagar y soporte de operaciones — porque construimos todo nuestro proceso alrededor de ellos.",

    // Nosotros — misión
    "about.mission.eyebrow": "Nuestra misión",
    "about.mission.heading":
      "Que contratar del otro lado de la frontera se sienta tan seguro como contratar en tu propia oficina",
    "about.mission.body":
      "Cada operador que ubicamos fue verificado antes de que lo conozcas — inglés, experiencia real y referencias chequeadas de antemano. Nos hacemos cargo de la nómina y el cumplimiento durante los primeros tres meses para que el encaje se demuestre antes de ser definitivo. Ese es el estándar que sostenemos en cada contratación.",

    // Nosotros — cómo curamos (vetting)
    "about.vetting.eyebrow": "Cómo curamos",
    "about.vetting.heading": "Cada candidato se gana su lugar en la preselección",
    "about.vetting.intro":
      "Curado no es una palabra de marketing para nosotros — es el proceso. Antes de que alguien llegue a tu bandeja de entrada, pasa tres chequeos.",
    "about.vetting.pillar1.title": "Inglés fluido, verificado",
    "about.vetting.pillar1.body":
      "Evaluamos el inglés hablado y escrito de forma directa — no es una casilla autodeclarada — para que la comunicación nunca sea el riesgo.",
    "about.vetting.pillar2.title": "Experiencia real, confirmada",
    "about.vetting.pillar2.body":
      "Filtramos por experiencia real y específica del rol — las herramientas, los flujos de trabajo y el criterio que el puesto realmente exige.",
    "about.vetting.pillar3.title": "Referencias, chequeadas",
    "about.vetting.pillar3.body":
      "Hablamos con empleadores o clientes anteriores antes de que un candidato llegue a tu preselección — no después de que ya lo contrataste.",

    // Nosotros — CTA de cierre
    "about.cta.heading": "¿Listo para conocer tu preselección?",
    "about.cta.body":
      "Contanos qué rol estás buscando y te traemos candidatos curados y verificados — no una pila de currículums.",

    // Compartido — campo honeypot (oculto para usuarios reales, sin localización visual)
    "honeypot.label": "Dejá este campo vacío",
  },
} as const;

export type UIKey = keyof (typeof ui)[typeof defaultLang];
