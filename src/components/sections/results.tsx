import { RevealText, RevealBlock, RevealStagger } from "@/components/motion/reveal";
import { resultados as r } from "@/lib/content";

/**
 * Bloco 13. Os pares negação/afirmação lêem-se em duas colunas: a recusa
 * apagada à esquerda, a escolha em dourado à direita. A composição é a
 * mensagem — menos excesso, mais precisão.
 */
export function Results() {
  return (
    <section
      id="resultados"
      aria-labelledby="resultados-titulo"
      className="gutter bg-verde py-section text-fundo"
    >
      <p className="label mb-8 text-center text-fundo/70">{r.label}</p>

      <RevealText
        as="h2"
        id="resultados-titulo"
        // Maior e ao meio: em `--text-title` com 14ch de limite, o título
        // ocupava uma coluna estreita à esquerda e deixava dois terços de
        // verde vazio à direita. Passa a `--text-display`, o mesmo corpo do
        // fecho, e a 18ch — cabe em menos linhas e enche a largura. Centrado
        // como bloco E como linhas: aqui são três frases curtas empilhadas,
        // que é o caso em que centrar o texto funciona; no resto do site o
        // alinhamento à esquerda mantém-se.
        className="mx-auto mb-20 max-w-[18ch] text-center text-[length:calc(var(--text-display)*0.85)]"
      >
        {r.title.split("\n").map((line) => (
          <span key={line} className="ouro-metal-linhas block w-fit">
            {line}
          </span>
        ))}
      </RevealText>

      <RevealStagger className="mb-20 divide-y divide-verde-linha border-y border-verde-linha">
        {r.pares.map((par) => (
          <div
            key={par.sim}
            data-stagger-item
            className="grid gap-2 py-8 sm:grid-cols-2 sm:gap-12"
          >
            <p className="text-[length:var(--text-lead)] leading-[1.4] text-fundo/40">{par.nao}</p>
            <p className="font-display text-[length:var(--text-sub)] leading-[1.15]">
              <span className="ouro-metal-linhas">
              {par.sim}
            </span>
            </p>
          </div>
        ))}
      </RevealStagger>

      <RevealBlock>
        <p className="max-w-[38ch] font-display text-[length:var(--text-sub)] leading-[1.2]">
          {r.close}
        </p>
      </RevealBlock>
    </section>
  );
}
