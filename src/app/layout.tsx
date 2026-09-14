import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { SiteHeader } from "@/components/site-header";
import { ProgressCounter } from "@/components/motion/progress-counter";
import { Preloader } from "@/components/motion/preloader";
import { Cursor } from "@/components/motion/cursor";
import { brand, sectionIds, counterLabels } from "@/lib/content";

const display = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Fica fora da pesquisa por omissão, e deve continuar assim.
 *
 * Isto é uma clínica fictícia com dados estruturados que descrevem um
 * negócio numa morada de Lisboa. Indexada, apareceria em pesquisa a parecer
 * uma clínica de estética real — que é exatamente a confusão que este
 * projeto inteiro foi desenhado para evitar. É uma peça de portefólio:
 * visita-se porque alguém enviou o link, não porque apareceu no Google.
 */
const indexavel = process.env.SITE_INDEXAVEL === "1";

const description =
  "Site de clínica de estética fictícia, criado como demonstração de design. Estética avançada em Lisboa: medicina estética, microagulhamento com radiofrequência, laser, modelação corporal e emagrecimento com acompanhamento médico.";

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: {
    default: `${brand.name} — Medicina Estética Avançada em ${brand.city}`,
    template: `%s · ${brand.name}`,
  },
  description,
  keywords: [
    "template site clínica de estética",
    "web design clínica estética",
    "medicina estética Lisboa",
    "microagulhamento radiofrequência",
    "preenchimentos",
    "depilação a laser",
    "modelação corporal",
    "emagrecimento com acompanhamento médico",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: brand.url,
    siteName: brand.name,
    title: `${brand.name} — ${brand.tagline}`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — ${brand.tagline}`,
    description,
  },
  // Deixar isto desligado. Ver a nota sobre `indexavel` acima.
  robots: indexavel
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#0d322f",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  name: brand.full,
  description,
  url: brand.url,
  telephone: brand.booking.replace("tel:", ""),
  email: brand.email,
  sameAs: [brand.instagram.url],
  address: {
    "@type": "PostalAddress",
    streetAddress: brand.address.street,
    postalCode: brand.address.postal,
    addressLocality: brand.address.city,
    addressCountry: brand.address.country,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "16:00",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT" className={`${display.variable} ${sans.variable}`}>
      <body className="antialiased">
        <a
          href="#introducao"
          className="label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-verde focus:px-5 focus:py-3 focus:text-fundo"
        >
          Saltar para o conteúdo
        </a>

        <Preloader />
        <Cursor />

        <SmoothScroll>
          {/* Um único canvas para a página inteira, fixo por trás de tudo.
              As secções translúcidas deixam-no ver — é assim que as flores
              existem em todas elas sem multiplicar contextos WebGL. */}

          <SiteHeader />
          <main id="site" className="relative z-10">
            {children}
          </main>
          <ProgressCounter ids={sectionIds} labels={counterLabels} />
        </SmoothScroll>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
