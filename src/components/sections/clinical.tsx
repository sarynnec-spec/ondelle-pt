import { RevealText, RevealBlock } from "@/components/motion/reveal";
import { RetratoRotativo } from "@/components/sections/retrato-rotativo";
import { direcaoClinica as d } from "@/lib/content";

export function Clinical() {
  return (
    <section
      id="direcao-clinica"
      aria-labelledby="direcao-clinica-titulo"
      // Metade do recuo de topo. A secção anterior é verde e fecha com o seu
      // próprio `py-section`; somados davam quase 400px de verde vazio entre
      // duas frases, e como a cor não muda lia-se como um buraco e não como
      // respiração. O rodapé fica inteiro — esse separa de uma secção clara.
      className="gutter bg-verde py-section pt-[calc(var(--spacing-section)/2)] text-fundo"
    >
      <p className="label mb-8 text-fundo/70">{d.label}</p>

      <div className="grid gap-14 md:grid-cols-[1fr_0.8fr] md:gap-20">
        <div>
          <RevealText
            as="h2"
            id="direcao-clinica-titulo"
            className="mb-12 max-w-[14ch] text-[length:var(--text-title)]"
          >
            {d.title.split("\n").map((line) => (
              <span key={line} className="ouro-metal-linhas block w-fit">
                {line}
              </span>
            ))}
          </RevealText>

          <RevealBlock>
            <p className="mb-10 max-w-[52ch] text-[length:var(--text-lead)] leading-[1.62] text-fundo/70">
              {d.body}
            </p>
            <p className="label mb-4 text-fundo/45">{d.purpose}</p>
            {/* O fio fica no <p> e o dourado num <span> por dentro. Juntos,
                o `box-decoration-break: clone` do metal clonava também a
                borda: cada linha ganhava o seu próprio risco por cima. */}
            <p className="max-w-[40ch] border-t border-verde-linha pt-8 font-display text-[length:var(--text-sub)] leading-[1.2]">
              <span className="ouro-metal-linhas">{d.close}</span>
            </p>
          </RevealBlock>
        </div>

        <RevealBlock delay={0.1}>
          {/* Roda de cinco em cinco segundos entre a direção clínica e a
              equipa, com a legenda a mudar com a fotografia. */}
          <RetratoRotativo retratos={d.retratos} intervalo={3200} className="w-full" />
        </RevealBlock>
      </div>
    </section>
  );
}
