# Ondelle — Premium Aesthetics Clinic Template

A production-ready Next.js 15 template for medical aesthetics clinics, med spas
and cosmetic dermatology practices. Built with GSAP scroll animation, Lenis
smooth scrolling and React Three Fiber.

Live preview: https://ondelle-aesthetics.vercel.app

---

## 1. What you get

| | |
|---|---|
| Framework | Next.js 15 (App Router) + React |
| Styling | Tailwind CSS 4 |
| Animation | GSAP + @gsap/react, Lenis smooth scroll |
| 3D | React Three Fiber + drei + three |
| Language | TypeScript, strict |
| Pages | One long-form scroll page, 14 numbered sections |
| Deployment | Zero-config on Vercel; any Node host works |

Included sections: hero with ambient video, brand introduction, philosophy,
clinical leadership, the space, four treatment card grids (face, body, skin,
rituals), a horizontal scroll experience, protocols, results, CTA, contact and
closing.

## 2. Requirements

- Node.js 18.18 or newer
- npm (or pnpm/yarn)

## 3. Installation

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

Type-check without building:

```bash
npx tsc --noEmit
```

## 4. Rebranding — start here

**Every piece of visible text lives in one file: `src/lib/content.ts`.**

You do not need to open a component to change the brand. Rewrite that file and
the whole site becomes a different clinic. This is the single most important
thing to know about this template.

### 4.1 Brand identity

Open `src/lib/content.ts` and edit the `brand` export at the top:

```ts
export const brand = {
  name: "ONDELLE",                  // wordmark text
  full: "Ondelle Aesthetics",       // legal / full name
  tagline: "Advanced aesthetics. Naturally you.",
  city: "Miami",
  url: "https://your-domain.com",
  email: "hello@your-domain.com",
  phone: "(305) 555-0142",
  booking: "tel:+13055550142",
  instagram: { handle: "@yourhandle", url: "https://instagram.com/..." },
  address: { street: "...", postal: "...", city: "...", country: "US" },
  hours: [ { dias: "Monday to Friday", horas: "9:00 AM — 7:00 PM" } ],
};
```

> The demo ships a phone number in the `555-0100–0199` range, which is reserved
> for fictional use in North America. **Replace it with your real number before
> going live** — and only with a number somebody actually answers.

### 4.2 Sections and copy

The remaining exports in `content.ts` map one-to-one onto the page sections, in
page order:

`hero` · `intro` · `filosofia` · `direcaoClinica` · `espaco` ·
`medicinaEstetica` · `tecnologia` · `rosto` · `corpo` · `pele` · `rituais` ·
`experiencia` · `protocolos` · `resultados` · `cta` · `contactos` · `fecho` ·
`frases` · `footer`

Two supporting exports control chrome rather than content:

- `sectionIds` — section order and anchor ids; feeds the fixed progress counter
- `counterLabels` — the label shown next to the counter for each section
- `nav` — header navigation entries

Adding or removing a section means updating `sectionIds` and `counterLabels`
together, or the counter will run out of step with the page.

### 4.3 The wordmark

`src/components/ui/wordmark.tsx` renders the logo as **live SVG text**, not an
image, in four places (header, closing, footer and the preloader). It uses
Instrument Serif with a metallic gradient.

To use your own name, change `brand.name`. To use your own typeface, change the
font in that component — but note the `fontSize` is derived from the real
cap-height of Instrument Serif (`0.7344`). A different font needs that constant
recalculated, or the wordmark will sit off its baseline.

### 4.4 Colours and type

Design tokens live in a Tailwind 4 `@theme` block in `src/app/globals.css`.
The palette is a deep burgundy (`--color-bordo: #3b0112`) and a warm gold
(`--color-ouro: #ce9a44`), each with a family of tints, shades and glow values
around it. A rebrand is a token change, not a search-and-replace.

Typography is Instrument Serif for display and Inter for body text, both loaded
through `next/font/google` in `src/app/layout.tsx`.

## 5. Images and video

All imagery ships in `public/imagens/`, grouped by purpose:

```
public/imagens/
  destaque/      feature images (hero figure, gold band, tablet, portraits)
  equipa/        clinical leadership and team
  protocolos/    treatment card images
  flores/        decorative botanical stills
  flores-video/  decorative botanical video loops
  video/         ambient hero video + poster frame
  marca/         brand assets
  placeholder/   neutral stand-ins at the right aspect ratios
```

### Recommended dimensions

Each slot has a neutral stand-in in `public/imagens/placeholder/` at the exact
aspect ratio the layout expects. Match these and nothing shifts:

| Slot | Placeholder file | Aspect | Ships at |
|---|---|---|---|
| Treatment cards, portraits | `retrato-4x5.jpg` | 4:5 | 1122 × 1402 |
| Hero figure | `hero-figura.jpg` | 3:4 | 1200 × 1600 |
| Wide plates | `lamina-4x3.jpg` | 4:3 | 1400 × 1050 |
| Full-width bands | `faixa-larga.jpg` | ~3:1 | 2203 × 714 |
| Ambient video | — | 16:9 desktop, 9:16 mobile | 1280 × 720 / 720 × 1280 |

Supply card and portrait art at **1200 × 1500 or larger**. Anything smaller
visibly softens on a retina display at full-bleed sizes.

Replacing an image is a file swap plus a path change in `content.ts`. The
`placeholder/` folder holds neutral files at each aspect ratio if you want to
strip the demo imagery before adding your own.

### Media licensing — read before you publish

The bundled imagery is **demonstration content**, AI-generated and carrying
embedded C2PA provenance identifying it as such.

**Nine treatment-card slots ship with neutral placeholder art** rather than
finished photography. They are fully wired up and correctly sized — drop your
own imagery in at the dimensions in the table above and nothing shifts. The
affected slots are eight treatment cards and the preloader opening image; you
will recognise them immediately, as they render as plain neutral plates.

This is deliberate. You were always going to replace treatment photography with
your own clinic's work, and you should not pay for pictures on the way through.
**The code, layout, animation and component library are the product.**

## 6. SEO and indexing

The template is **noindex by default**, deliberately — an unbranded demo of a
clinic should not appear in search results looking like a real practice.

Indexing is controlled by an environment variable, so you never edit code:

```bash
SITE_INDEXAVEL=1
```

Set it in your host's environment (Vercel: Project → Settings → Environment
Variables) when the site is genuinely ready to be found. Leave it unset and the
site stays out of search. Also update before launch:

- `metadata.title` and `metadata.description`
- the Open Graph image at `src/app/opengraph-image`
- the favicon at `src/app/icon.png`
- any structured data describing the business

## 7. Accessibility notes

The template ships with a skip-to-content link, a global `:focus-visible`
style, and `prefers-reduced-motion: reduce` handling in eight places across
`globals.css` and the motion components — the scroll-driven animation degrades
to static layout rather than breaking.

One known limitation, stated plainly rather than buried: the fixed progress counter and the scroll indicator use
`mix-blend-difference` over the hero video. Against a very light video frame
this caps the achievable contrast at roughly 3:1 — enough for large text, short
of the 4.5:1 that small text requires. If your hero footage is light and you
need strict WCAG AA, replace `mix-blend-difference` in
`src/components/motion/progress-counter.tsx` with a solid colour plus a scrim.

## 8. Deployment

### Vercel

```bash
npx vercel
```

**If you forked this from another project, delete `.vercel/` first.** A stale
`.vercel/project.json` points at the previous project and the deploy will
overwrite the wrong site.

### Any Node host

```bash
npm run build
npm start        # listens on PORT, default 3000
```

## 9. Support and updates

Support covers installation, configuration and bugs in the template itself. It
does not cover custom development, third-party plugins, or hosting.

## 10. Credits

| | |
|---|---|
| Next.js | MIT — Vercel |
| Tailwind CSS | MIT |
| GSAP | see gsap.com licensing |
| Lenis | MIT — Studio Freight |
| three / React Three Fiber / drei | MIT |
| Instrument Serif | SIL Open Font License |

**GSAP licensing is your responsibility to verify for your use case.** This
template uses the core library plus three plugins — `ScrollTrigger`,
`SplitText` and `CustomEase`. `SplitText` and `CustomEase` were historically
paid "Club GreenSock" plugins and were later released for free use; confirm the
current terms at gsap.com before shipping commercially, since the licence has
changed more than once.
