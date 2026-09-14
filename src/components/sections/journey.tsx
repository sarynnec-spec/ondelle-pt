import { RevealText, RevealBlock, RevealStagger } from "@/components/motion/reveal";
import { DrawPath } from "@/components/motion/draw-path";
import { protocolos as p } from "@/lib/content";

const markers = [
  { x: 40, y: 268, label: "descobrir" },
  { x: 268, y: 168, label: "avaliar" },
  { x: 496, y: 68, label: "personalizar" },
  { x: 712, y: 152, label: "tratar" },
  { x: 862, y: 62, label: "acompanhar" },
];

/**
 * Bloco 12. O percurso Descobrir → Avaliar → Personalizar → Tratar →
 * Acompanhar desenha-se ao scroll: o traço e as etapas entram em sincronia,
 * cada ponto a acender sob a palavra que lhe corresponde.
 */
export function Journey({ decoracao }: { decoracao?: React.ReactNode }) {
  return (
    <section
      id="protocolos"
      aria-labelledby="protocolos-titulo"
      className={`gutter bg-fundo py-section${decoracao ? " relative isolate overflow-hidden" : ""}`}
    >
      {decoracao}

      <p className="label mb-8 text-texto-fraca">{p.label}</p>

      <RevealText
        as="h2"
        id="protocolos-titulo"
        className="mb-16 max-w-[18ch] text-[length:var(--text-title)]"
      >
        <span className="verde-metal-linhas">{p.title}</span>
      </RevealText>

      <RevealStagger className="mb-20 flex flex-col gap-2" stagger={0.13}>
        {p.beats.map((b) => (
          <p
            key={b}
            data-stagger-item
            className="font-display text-[length:var(--text-sub)] leading-[1.15]"
          >
            {b}
          </p>
        ))}
      </RevealStagger>

      <DrawPath className="mb-6" markers={markers} />

      {/* As etapas alinham com os pontos do traço acima. */}
      <ol className="mb-20 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {p.jornada.map((etapa, i) => (
          <li key={etapa} className="border-t border-texto/15 pt-5">
            <span className="label mb-3 block text-texto-fraca">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-display text-[length:var(--text-sub)] leading-none">{etapa}</span>
          </li>
        ))}
      </ol>

      {/* Sobe 10% em ecrã grande. Em telemóvel fica onde está: lá as colunas
          empilham e o espaço acima já é o que separa este bloco da lista. */}
      <div className="grid gap-12 md:grid-cols-2 md:gap-20 lg:-translate-y-[10%]">
        <RevealBlock>
          <p className="max-w-[50ch] text-[length:var(--text-lead)] leading-[1.62] text-texto-suave">
            {p.body}
          </p>
        </RevealBlock>
        <RevealBlock delay={0.08}>
          <p className="max-w-[30ch] border-t border-texto/15 pt-8 font-display text-[length:var(--text-sub)] leading-[1.2]">
            {p.close}
          </p>
        </RevealBlock>
      </div>
    </section>
  );
}
