import { ImageResponse } from "next/og";
import { brand } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${brand.name} — ${brand.tagline}`;

/** Verde e dourado da marca, iguais aos tokens de `globals.css`.
 *
 * O dourado estava aqui a #D6AC60 e o site inteiro corre a #CE9A44 — este
 * cartão é a miniatura que aparece no LinkedIn e no WhatsApp, e mostrava um
 * dourado que não existe em lado nenhum da página. Alinhado a 2026-09-08. */
const VERDE = "#0d322f";
const OURO = "#ce9a44";
const CREME = "#f3efe7";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: `radial-gradient(60% 55% at 50% 105%, #123c39 0%, transparent 70%), linear-gradient(168deg, ${VERDE} 25%, #092623 100%)`,
          color: CREME,
        }}
      >
        <div style={{ display: "flex", letterSpacing: "0.3em", fontSize: 26, color: OURO }}>
          {brand.name}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 78, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
            Beleza avançada.
          </div>
          <div style={{ fontSize: 78, lineHeight: 1.05, letterSpacing: "-0.03em", color: OURO }}>
            Resultados naturais.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 21,
            letterSpacing: "0.16em",
            color: "rgba(243,239,231,0.6)",
          }}
        >
          <span>CLÍNICA DE ESTÉTICA AVANÇADA</span>
          <span>{brand.city.toUpperCase()}</span>
        </div>
      </div>
    ),
    size,
  );
}
