# Zyeth — Plan del proyecto

> Documento vivo. Estado: **plan + modelo de desarrollo + infra 100% definidos (dominio `zyeth.work`).
> A la espera de LUZ VERDE para el primer commit (fundación + hero).** Los API tokens de Cloudflare
> se usan recién al ejecutar el #2.
> Última actualización: 2026-07-17

---

## 1. Qué es Zyeth

Sitio informativo (marketing / captación de leads) para una **agencia de reclutamiento** que
conecta **clientes de Estados Unidos** con **talento de Colombia** (base en Medellín).
Referencia de producto: [recruit.work](https://recruit.work).

### Propuesta de valor
- "Vos buscás emplear a alguien — yo te lo consigo." **Curated talent.**
- ⭐ **GANCHO CENTRAL: "Curated talent".** La clienta quiere énfasis fuerte en esto — es el
  diferenciador principal. Debe liderar el hero y repetirse como hilo conductor en todo el sitio.
- Enfoque de mercado: **operaciones y logística** (ej. coordinador logístico, payables),
  aunque reclutan para cualquier rol; el posicionamiento es ops/logística.
- **US timezone** — el talento trabaja en horario de EE. UU.
- **No** entrenan al talento.

### Modelo de negocio
- El candidato se contrata **a través de Zyeth durante los primeros 3 meses**, y luego pasa
  directo al cliente.
- Posible **primera contratación gratis** (⚠️ a confirmar).
- Gancho comercial fuerte: **comparación monetaria US vs Medellín**.

---

## 2. Stack

| Decisión | Elección | Por qué |
|---|---|---|
| Framework | **Astro** | Sitio ~95% contenido estático. Cero JS por defecto → SEO y performance de punta (crítico para rankear y convertir). Islas solo donde hace falta interactividad. |
| Estilos | **Tailwind CSS v4** | Config CSS-first con `@theme`. Ya instalado. |
| Tipografías | **@fontsource** (Poppins + Inter) | Self-hosted, rápido, sin llamadas externas. Ya instalado. |
| Output | **Static (SSG)** | Sitio de contenido → HTML estático servido por nginx en el server. (Ver §11 sobre forms.) |
| Deploy | **Server propio DigitalOcean + dominio en Cloudflare** | Ver §11. |

**Estado del repo:** Astro + Tailwind scaffoldeado en la raíz. Repo git conectado a
`github.com/ingamartinez/zyeth` (branch `main`, sin commits todavía).

---

## 3. Diseño (fuente: Figma)

- Archivo: `WEB_Evōps` (fileKey `cjoDoh6ih3aJsDEciwTyOd`, página HOME).
- El Figma tiene **4 variaciones de estilo de UNA landing (el home)**, no páginas distintas.
- **El Figma es la base de PALETA y TONO, no un molde a clonar.** Es un template genérico
  (Lorem ipsum, cards glassmorphism, layout absoluto no responsive). Hacemos **diseño propio
  mejorado** sobre su sistema visual (ver §3b). Base de layout: Slide 3 + form del Slide 2.
- **Marca:** el nombre del sitio es **Zyeth**, pero se usa la **identidad visual / logo / branding de Evōps**.
  - ✅ **Logo:** se reusa el mismo logo de Evōps (ícono circular), solo cambia el **texto del
    wordmark a "Zyeth"**. → Recrear el wordmark con Poppins (matcheando el estilo) + ícono Evōps.

### Sistema de diseño extraído

**Colores**
| Token | Hex | Uso |
|---|---|---|
| `brand-green` | `#124944` | Primario: títulos, bordes de botón, footer |
| `brand-green-dark` | `#0a2a25` | Verde más oscuro: heading hero, caja "Needs Experience" |
| `brand-teal` | `#2bafa3` | Acento / fin de gradiente |
| `brand-lime` | `#88b33f` | Botones "Scale Your Business" |
| `brand-gold` | `#f0c71d` | Acento (label "Services", ícono) |
| `brand-gray` | `#8e8e8e` | Texto body / muted |
| Gradiente banda | `#124944 → #2bafa3` | Strip de clientes, banda de servicios |
| Gradiente barra | `#e1fab8 → #cee12f → #136750` | Barra decorativa bajo el hero |

Neutros con **sesgo verde** (no gris puro): fondo claro `#f5f8f6`, texto muted `#5c6b66`,
near-white `#eef5f1` para fondos oscuros. Reemplazan al `#8e8e8e` del template (contraste al límite).

**Tipografía**
- **Poppins** (500/600/700) → títulos, UI, wordmark.
- **Inter** (400/500) → body.
- Escala con `clamp()` (responsive). Headings en **sentence case**, no TODO-MAYÚSCULA (más
  legible, se ve premium). Labels/eyebrows sí uppercase con `letter-spacing` amplio.
- Fuentes self-hosted vía `@fontsource` (ya instalado). En mockups/artifacts se embeben como data URI.

**Assets ya descargados** (`public/images/`): `hero-support.jpg`, `why-choose.jpg`.
Los decorativos (círculos concéntricos, gradientes) se recrean con CSS, no como imágenes.
⚠️ Falta: **ícono/logo real de Evōps** (SVG). Por ahora placeholder (círculo + marca).

---

## 3b. Dirección visual validada + mejoras UI/UX

**✅ Dirección aprobada por la clienta** vía mockup del hero:
🔗 https://claude.ai/code/artifact/c8b70cd1-23fe-4a55-adad-db4744903554

- **Mundo visual: verde oscuro premium** (decisión deliberada, se diferencia de recruit.work que
  es claro; comunica "curated/high-end", no "template de agencia").
- **"Curated" LIDERA** el hero (primera palabra, subrayado gradiente lima→teal) y se repite como
  hilo conductor (eyebrow, subtítulo, card).
- **Card de candidato curado** que hace tangible el gancho: fusiona candidate-showcase + tabla
  comparativa + "curated" en un solo módulo.

**Mejoras UI/UX adoptadas** (sobre el template genérico):
| # | Mejora | Por qué |
|---|---|---|
| 1 | **Showcase de talento curado** (perfiles: rol, rate, verificado, disponible) | Arma de conversión #1 de recruit.work; el template no la tiene. |
| 2 | **Tabla comparativa US vs Medellín** como módulo estrella (interactiva por rol) | El gancho comercial más fuerte; ausente en el template. |
| 3 | **Hero que vende la oferta** con CTA claro (primario + secundario) | "Solution For Your Needs" no dice nada. |
| 4 | **Banda de confianza real** (timezone, modelo 3 meses) en vez de marquee de logos falso | Social proof que convierte. |
| 5 | **Cards sólidas de alto contraste** (adiós glassmorphism) | Legibilidad + accesibilidad AA. |
| 6 | **Mobile-first real** (grid/flex, no posición absoluta) | La mayoría de founders US entran por mobile. |
| 7 | **Sistema consistente** (escala 8px, sentence case, micro-animaciones sutiles + reduced-motion) | Se ve premium, no template. |

---

## 4. Estructura del sitio

**Referencia de estructura:** [recruit.work](https://www.recruit.work/) (páginas + tabla comparativa).
⚠️ **Ojo modelo:** recruit.work es un **marketplace self-serve** (browse candidates, fee flat
$2,999). Zyeth es una **agencia done-for-you** ("yo te lo consigo", 3 meses a través de Zyeth).
→ Tomamos de recruit.work la **arquitectura de páginas** y la **idea de tabla US vs Medellín**,
**no** su pricing ni su mecánica de marketplace.

### Navegación (header)
- **Home**
- **How it works**
- **Resources** (▾ desplegable):
  - **About us**
  - **Apply / Careers** (formulario para talento)
- Selector de idioma **EN / ES**.
- (¿CTA primario en el nav? ej. "Book a call" → form de clientes.)

### Las 4 páginas

**1. Home** — diseño propio (ver §3b). Secciones (top→bottom):
1. **Hero** — "Curated talent…" + CTA + card de candidato curado (✅ mockeado y aprobado).
2. **Banda de confianza** — timezone, modelo 3 meses, vetting (reemplaza el marquee falso).
3. **Servicios / cómo ayudamos** — cards sólidas (no glass).
4. **Tabla comparativa US vs Medellín** (interactiva por rol; foco ops/logística). ⚠️ datos reales pendientes.
5. **Why Choose Us** — foto + bullets del diferencial.
6. **Form de clientes** (diseño Slide 2, "Needs Experience") → Calendly.
7. **Footer**.
   _(El showcase de talento puede vivir en el hero + expandirse en una sección propia.)_

**2. How it works** — el **proceso en 4 pasos** (para el cliente). Extrapolar del sistema de diseño.
   Posible: incluir también la tabla comparativa y/o el modelo de "3 meses a través de Zyeth".

**3. Resources → About us** — quiénes somos, misión, el equipo. Extrapolar del diseño.

**4. Resources → Apply / Careers** — **FORM DE TALENTO**: página donde personas de Colombia se
   postulan para trabajar con clientes de US. Distinto público y distintos campos que el form de clientes.

### Los DOS formularios (públicos opuestos)
| Form | Público | Ubicación | Acción | Campos (borrador) |
|---|---|---|---|---|
| **Clientes** | Empresas US que quieren contratar | Home (§7) + posible CTA nav | → Calendly | cargo que busca, typical expected rate, nombre, email, teléfono |
| **Talento** | Personas de Colombia que quieren trabajar | Resources → Apply/Careers | → captar postulación | nombre, email, rol/experiencia, CV, inglés, etc. ⚠️ a definir |

---

## 5. Contenido / copy

- El Figma está **todo en Lorem ipsum** — el copy real hay que traerlo de las notas + la dueña.
- Material crudo disponible (de las notas): propuesta de valor, enfoque ops/logística,
  modelo de 3 meses, "curated talent", US timezone, roles ejemplo (coordinador logístico, payables).
- ⚠️ Falta copy real y definitivo para: hero, servicios, los 4 pasos, textos de About/Careers,
  y los datos concretos de la comparación salarial (rangos US vs Medellín por rol).

---

## 6. Integraciones / técnico

- **Formulario → Calendly** — el form de abajo lleva a Calendly. Campos mencionados en notas:
  **cargo que busca** + **typical expected rate**. ⚠️ Falta: link de Calendly, ¿el form
  captura leads (email/DB) además de llevar a Calendly, o es solo embed/redirect?
- **SEO**: sitemap, meta tags, Open Graph (Astro nativo).
- **Idioma**: ✅ **Bilingüe (EN / ES).** → Usar el sistema de i18n de Astro (routing por
  locale + diccionarios de copy). Toda sección/página se escribe con textos en ambos idiomas.
  ⚠️ Falta: ¿idioma por defecto (EN, por el mercado US)? ¿selector de idioma en el nav?
- **Dominio**: ⚠️ a definir.

---

## 7. Preguntas abiertas (para refinar el plan)

1. ✅ **Idioma**: bilingüe EN/ES. _(Falta: default locale + selector en nav.)_
2. ✅ **Logo**: mismo logo Evōps, solo cambia el texto a "Zyeth".
3. ✅ **Arquitectura de páginas**: 4 páginas (Home, How it works, Resources▾ → About us +
   Apply/Careers). Basada en recruit.work. _(Falta: ¿CTA primario en nav? default locale.)_
4. **Formularios** (son DOS): (a) clientes → Calendly (link pendiente + ¿capta leads?);
   (b) talento → postulación (campos + destino/backend pendientes).
5. **Comparación US vs Medellín**: datos reales (rangos por rol, foco ops/logística).
6. **Copy real**: hero, servicios, 4 pasos, About, Careers (en EN y ES).
7. **Datos de contacto reales** (el Figma tiene los de Evōps: teléfono, emails).
8. **Deploy / dominio**.
9. **Primera contratación gratis**: ¿confirmado? ¿va en el sitio?

---

## 8. Lo que faltaba que me contaras — ✅ resuelto

- ✅ Arquitectura de 4 páginas basada en recruit.work (§4).
- ✅ Los dos formularios (clientes vs talento).
- ✅ Diseño propio mejorado + gancho "Curated talent" (§3b).

_(Si aparece algo nuevo del proyecto, se agrega acá.)_

---

## 9. Plan de construcción (orden de ejecución)

1. **Fundación** — `@theme` tokens (paleta §3 + §3b) en `global.css`, tipografías, i18n de Astro,
   `Layout.astro` (SEO/meta/OG), `Nav` + `Footer`, `Button` y el sistema de componentes base.
2. **Home** — traducir el hero aprobado a componentes Astro + el resto de secciones (§4).
3. **Módulos reutilizables** — card de candidato, tabla comparativa, cards de servicio, formularios.
4. **Páginas** — How it works, About us, Apply/Careers (extrapolando el sistema).
5. **Integraciones** — Calendly (form clientes), destino del form de talento, sitemap/SEO, responsive QA.
6. **Deploy**.

> Nota de método: se construye **por secciones con checkpoints** (mostrar → ajustar → seguir),
> no todo de una. El home arranca por el hero ya validado.

---

## 10. Definición de "listo para implementar" — qué falta para arrancar

### 🔴 Bloqueadores para ARRANCAR la fundación + home
1. ✅ **Locale por defecto: EN** (mercado US) con `/es` para español.
2. ✅ **Logo extraído del Figma** → `public/logo-mark.svg` (ícono real, `currentColor`, escalable).
   El wordmark "Zyeth" se pone en texto Poppins al lado.
3. ⏳ **Modelo de desarrollo del proyecto** (ver §11) — se define antes de la luz verde.
4. ⏳ **Luz verde para el primer commit.**

**Política de data faltante** (acordado): lo que no tengamos, se **mockea con info plausible**
marcada como "ejemplo". La clienta revisa y ajusta a medida que desarrollamos. No frena el avance.

### 🟡 Necesario sobre la marcha (por sección, no frena el arranque)
4. **Link de Calendly** + definir si el form de clientes solo redirige o **también capta el lead**
   (email/DB). → necesario para la sección del form.
5. **Datos reales de la tabla comparativa** (rate US vs Medellín por rol, foco ops/logística).
6. **Campos + destino del form de talento** (¿a dónde van las postulaciones? email, Airtable, DB…).
7. **Copy real EN + ES** por sección/página (arranco con el copy del hero ya aprobado + borradores).
8. **Datos de contacto reales** (el Figma tiene los de Evōps: teléfono, emails).
9. **¿CTA primario en el nav?** (ej. "Book a call"). Recomiendo sí.
10. **"Primera contratación gratis"**: ¿confirmado? ¿va en el sitio?

### ⚪ Para el final / antes del primer deploy a staging
11. **Infra del server DO** (ver §11): cómo sirve los otros proyectos (nginx? Docker?), IP,
    acceso SSH/deploy key, y el **dominio real** (TLD) para configurar subdominios + Cloudflare.

---

## 11. Modelo de desarrollo (acordado)

### Git flow
- **Feature branches** (`amartinez/feature/…` o similar) → **PR → `staging`**.
- Todo el trabajo se integra en **`staging`** (rama de integración/preview).
- Cuando la **clienta aprueba** en staging → merge **`staging` → `main`** (= producción).
- Conventional commits. Sin atribución AI en los commits.

### Hosting & deploy — infra REAL (descubierta del droplet)
- **Droplet DigitalOcean**: `147.182.138.79` (NYC3, Ubuntu 24.04). Compartido con otros proyectos
  (`findash`, `photoshowcase`). Acceso SSH: `ssh -i ~/.ssh/findash_do root@147.182.138.79`.
- **Reverse proxy: Caddy 2.11** (NO nginx). Config en `/etc/caddy/Caddyfile` (bloque por sitio).
- **Patrón del server**: un dir `/srv/<proyecto>` + un **usuario por proyecto**; el usuario `deploy`
  (uid 1001) es el target de CD. Cada sitio = un bloque Caddy con su **origin cert de Cloudflare**
  (Full strict). Los certs NO son wildcard — cada host tiene el suyo (`origin.pem` findash,
  `alejoframes-origin.pem` apex+www).
- **Zyeth = estático** → su bloque Caddy usa `root * <dir>` + `file_server` (sin `reverse_proxy`,
  sin puerto, sin proceso). Mucho más simple que findash/photoshowcase (que son apps Node).
- **Dominio: `zyeth.work`** (zona propia en Cloudflare, NO alejoframes).
- **Dos entornos** (ramas → dirs que Caddy sirve):
  - `staging.zyeth.work` ← rama `staging` → `/srv/zyeth/staging/current`
  - `zyeth.work` (prod, apex; `www.zyeth.work` redirige al apex) ← rama `main` → `/srv/zyeth/prod/current`
- **Pipeline**: GitHub Actions → `npm run build` (SSG) → `rsync dist/` al droplet (usuario `deploy`,
  secrets `DEPLOY_SSH_KEY/HOST/USER`). Push a `staging` → staging; push a `main` → prod.
- **Cloudflare** (zona `zyeth.work`): A records `@`, `www`, `staging` → `147.182.138.79`, proxied,
  Full (strict). **Origin cert que incluya `zyeth.work` + `*.zyeth.work`** (el wildcard NO cubre el
  apex, hay que listar ambos).
- **Forms**: sitio estático. Form de clientes → Calendly (sin backend). Form de talento → destino
  a definir (servicio de forms / endpoint / email) — no bloquea.
- 🔑 **Al ejecutar el #2**: el usuario pasa los **API tokens de Cloudflare** para linkear la zona
  `zyeth.work` con el droplet DO (DNS records + origin cert). Se usan solo durante el setup.
- **Canonical/SEO**: base `https://zyeth.work`; EN en `/`, ES en `/es`.

### Cadencia & calidad
- **Por secciones con checkpoints**: mostrar (en staging) → la clienta ajusta → seguir.
- **Definition of Done** por sección: responsive (mobile+desktop), EN+ES, accesible (contraste AA,
  semántico, teclado), matchea diseño aprobado, sin errores de consola.
- **Data faltante**: mockeada como "ejemplo"; la clienta ajusta sobre la marcha.

### Tracking
- **GitHub Issues + Projects**: un issue por sección/página; tablero de Projects para el estado.
- `PLAN.md` sigue siendo la fuente de verdad del diseño/arquitectura.

### SDD
- **Liviano** (no full-SDD): `PLAN.md` + checkpoints + Issues. Suficiente para un sitio de marketing.
