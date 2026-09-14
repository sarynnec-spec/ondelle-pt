import { RevealText, RevealBlock } from "@/components/motion/reveal";
import { PinnedZoom } from "@/components/motion/pinned-zoom";
import { SurfaceFill } from "@/components/ui/surface";
import { rosto } from "@/lib/content";

export function Face({ decoracao }: { decoracao?: React.ReactNode }) {
  return (
    <section
      id="rosto"
      aria-labelledby="rosto-titulo"
      className="bg-fundo"
    >
      {/* Zoom fixado: a superfície aproxima-se enquanto a legenda sobe. */}
      {/* Arranca mais pequena para o zoom se ver: -5% em desktop, -15% em
          telemóvel. O ecrã do telemóvel é estreito e corta a fotografia com
          muito mais violência, por isso precisa de recuar mais para o gesto
          ler-se. A margem que sobra à volta não é branca — é o gradiente da
          marca, que o `SurfaceFill` pinta por baixo. */}
      <PinnedZoom
        from={0.95}
        // 1 e nao 0.85: abaixo de 1 a caixa fica mais pequena do que o ecra
        // e abre-se verde a toda a volta. O zoom continua a ler-se, porque
        // vai de 1 ate 1.42 dentro do ecra cheio.
        fromMovel={1}
        // O verde tem de encher o ecrã mesmo quando a fotografia está
        // encolhida. O gradiente do `SurfaceFill` vive DENTRO da caixa que
        // escala, por isso encolhe com ela e deixava aparecer o fundo da
        // secção à volta. Este fundo fica na raiz, que não escala nunca.
        className="bg-verde"
        caption={
          <div className="mx-auto max-w-6xl">
            <p className="label mb-4 text-fundo/70">{rosto.label}</p>
            <p className="max-w-[24ch] font-display text-[length:var(--text-sub)] leading-[1.08] text-fundo">
              {rosto.kicker}
            </p>
          </div>
        }
      >
        {/* `semFundo`: a fotografia é um recorte (44% do ficheiro é
            transparente) e esta moldura é escalada pelo zoom. Com o gradiente
            cá dentro, era o gradiente que crescia junto com a figura e
            desenhava um retângulo com aresta à vista. Sem ele, escala só a
            mulher, sobre o verde fixo da raiz. */}
        <SurfaceFill
          tone="escuro"
          src={rosto.imagem}
          alt={rosto.alt}
          semFundo
          inteiraNoMovel
          // Sobe 4% e anda 4% para a direita, para encaixar no topo e na
          // margem direita. É TRANSLAÇÃO e não escala: a escala de 0.95
          // encolhe a partir do centro e reparte a folga pelos quatro lados,
          // e o que se quer é ela encostada a dois deles.
          //
          // Vai aqui e não na camada que escala porque o GSAP escreve
          // `translate: none` nos elementos que anima, para as propriedades
          // individuais de transformação não lhe entrarem em conflito com o
          // `transform`. Uma classe de translação lá seria simplesmente
          // apagada — foi o que aconteceu à primeira tentativa.
          //
          // Só a partir de `md`: em telemóvel a escala arranca em 1 e já
          // enche o ecrã, por isso deslocá-la abriria uma fresta do lado
          // contrário.
          className="md:translate-x-[4%] md:-translate-y-[4%]"
        >
          {/* Véu por cima da fotografia. A legenda é fundo sobre `tone`
              escuro; com uma fotografia clara — e esta é — as letras ficavam
              a desaparecer. O gradiente só escurece o terço de baixo, que é
              onde a legenda assenta: a parte de cima da imagem fica intacta. */}
          <div
            className="pointer-events-none absolute inset-0"
            // Gradiente em estilo direto e não em classe: `bg-gradient-to-t` é
            // nome da versão 3 do Tailwind e este projeto está na 4, onde
            // passou a `bg-linear-to-t`. A classe antiga não gera regra
            // nenhuma e o véu simplesmente não aparecia.
            style={{
              backgroundImage:
                "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.34) 26%, rgba(0,0,0,0.06) 52%, transparent 72%)",
            }}
          />
        </SurfaceFill>
      </PinnedZoom>

      <div className={`gutter py-section${decoracao ? " relative isolate overflow-hidden" : ""}`}>
        {decoracao}

        <div className="grid gap-14 md:grid-cols-2 md:gap-20">
          <RevealText
            as="h2"
            id="rosto-titulo"
            className="max-w-[12ch] text-[length:var(--text-title)]"
          >
            {rosto.title.split("\n").map((line) => (
              <span key={line} className="verde-metal-linhas block w-fit">
                {line}
              </span>
            ))}
          </RevealText>

          <div>
            <RevealBlock>
              <div className="mb-10 space-y-6">
                {rosto.body.map((p) => (
                  <p
                    key={p}
                    className="max-w-[48ch] text-[length:var(--text-lead)] leading-[1.62] text-texto-suave"
                  >
                    {p}
                  </p>
                ))}
              </div>
              <p className="max-w-[34ch] border-t border-texto/15 pt-8 font-display text-[length:var(--text-sub)] leading-[1.2]">
                {rosto.close}
              </p>
            </RevealBlock>
          </div>
        </div>
      </div>
    </section>
  );
}
