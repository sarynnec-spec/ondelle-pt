import { HeroVideo } from "@/components/motion/hero-video";
import { ScrollCue } from "@/components/motion/flourishes";
import { RevealText } from "@/components/motion/reveal";
import { hero, brand } from "@/lib/content";

/**
 * Abertura em duas partes:
 *
 *   1. o vídeo ocupa o ecrã inteiro, sozinho — sem texto, sem véu, sem
 *      nada por cima. Quem chega vê só a imagem em movimento.
 *   2. o texto vive na secção seguinte, revelada pelo scroll.
 */
export function Hero() {
  return (
    <>
      <section id="inicio" aria-label="Início" className="relative h-svh w-full overflow-hidden bg-verde">
        {/* O vídeo começa abaixo da faixa do cabeçalho, nos dois formatos.
            A mesma variável alimenta a faixa e este recuo. */}
        <div className="absolute inset-0 top-[var(--altura-cabecalho)]">
          {hero.video ? (
            <HeroVideo desktop={hero.video} mobile={hero.videoMobile ?? hero.video} />
          ) : null}
        </div>

        {/* Só o indicador de scroll, para não deixar a página muda. */}
        <ScrollCue className="absolute bottom-10 left-[var(--spacing-gutter)] z-10 text-fundo/70" />



        <span className="sr-only">
          {/* Sem o `eyebrow`: ele já traz a cidade e o descritor, e o
              leitor de ecrã lia "Lisboa. Lisboa · Estética Avançada". */}
          {brand.full}. {brand.city}.
        </span>
      </section>

      {/* O texto que estava sobre o vídeo. */}
      <section aria-label="Introdução" className="relative bg-verde text-fundo">
        <div className="gutter flex min-h-svh flex-col justify-center py-section">
          {/* Colunas iguais. A partir de `lg` o texto vai todo para a segunda,
              porque a fotografia ocupa a esquerda: duas fotografias seguidas
              do mesmo lado do ecrã — esta e a da secção anterior — davam uma
              coluna de imagens a descer pela direita.

              O `gap-16` não é decoração. É ele que afasta o início do texto da
              borda da fotografia: a 1024px, com `gap-12`, a orelha chegava a
              tocar na primeira letra. */}
          <div className="flex flex-col gap-12 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-16">
            <div className="lg:col-start-2">
              {/* O sobretítulo vive dentro da coluna do texto, não acima da
                  grelha: acima ficava encostado à esquerda, por cima do rosto.
                  Em telemóvel dá exatamente o mesmo — coluna única, continua
                  a ser a primeira linha. */}
              <p className="label mb-8 text-fundo/60">{hero.eyebrow}</p>

              {/* O h1 continua no HTML inicial: o LCP não depende de JS. */}
              <RevealText
                as="h1"
                // A rampa metálica vai em CADA LINHA e não no bloco. Aplicada ao
                // bloco, o gradiente corre na horizontal ao longo de toda a
                // largura: as linhas curtas — "a ser seus." — caíam na ponta
                // escura (#583701) e liam-se castanhas. Linha a linha, cada uma
                // apanha a rampa completa e todas ficam com o mesmo metal.
                className="mb-12 max-w-[13ch] text-[clamp(2.4rem,7vw,7rem)] leading-[0.98]"
              >
                {hero.title.split("\n").map((line) => (
                  <span key={line} className="ouro-metal block w-fit">
                    {line}
                  </span>
                ))}
              </RevealText>

              {/* O interruptor "de dia / de noite" estava aqui, ao lado do
                  parágrafo. Saiu: não prometia nada que o site cumprisse — não
                  se percebia o que havia de mudar ao carregar. */}
              <div className="max-w-[48ch]">
                <RevealText
                  as="p"
                  delay={0.1}
                  className="text-[length:var(--text-lead)] leading-[1.55] text-fundo/75"
                >
                  {hero.lead}
                </RevealText>
                <p className="label mt-7 text-fundo/70">{hero.note}</p>
                <a
                  href="#marcacao"
                  className="label ouro-vivo mt-9 inline-block rounded-full px-8 py-4 transition-shadow duration-500 hover:shadow-[0_0_40px_-12px_var(--color-ouro)]"
                >
                  {hero.cta}
                </a>
              </div>
            </div>

            {/* A partir de `lg` a imagem sai da grelha e passa a ocupar a
                faixa ESQUERDA da secção inteira, de topo a fundo.

                PORQUÊ FORA DA GRELHA. Dentro da grelha a fotografia arrancava
                por baixo do sobretítulo e não tinha altura para respirar. Fora
                dela ocupa a faixa toda e é o desenho que manda, não o fluxo do
                texto.

                PORQUÊ NÃO ENCOSTA AO TOPO. Encostava, no tempo em que o
                ficheiro vinha com o cimo do cabelo cortado — só assim o corte
                coincidia com a aresta e se lia como sangria. O ficheiro novo
                tem a cabeça inteira, por isso o truque deixou de fazer falta:
                `top-[7%]` afasta-a da barra e dá-lhe ar por cima. Em baixo
                continua encostada.

                A coluna vazia da grelha continua a reservar o espaço, por isso
                o texto não corre por cima da fotografia.

                A largura da caixa é maior do que a metade de propósito. Com
                `object-contain`, quem manda no tamanho é o lado mais apertado:
                dando largura a mais, o limite passa a ser a ALTURA e a imagem
                fica garantidamente colada ao topo e ao fundo, seja qual for a
                altura a que o texto faça crescer a secção.

                PORQUÊ ESPELHADA. O ficheiro tem margem vazia do lado esquerdo
                (5,5% neste) e conteúdo até ao pixel da direita. Posta à esquerda
                sem espelhar, essa margem vazia caía na borda do ecrã e era o
                ombro que ia bater no texto. Espelhada, a margem passa para o
                lado do texto — que é onde faz falta — e o rosto sangra pela
                borda esquerda tal como antes sangrava pela direita. O
                `object-position` fica em 100% porque a inversão é do elemento
                inteiro: 100% antes do espelho é encostado à esquerda depois.

                Abaixo de `lg` nada disto se aplica: coluna única, imagem à
                largura toda, sem espelho e assente no fundo do verde (daí as
                margens negativas só em `max-lg`). */}
            <div className="pointer-events-none flex justify-center max-lg:-mx-gutter max-lg:-mb-section lg:absolute lg:top-[7%] lg:bottom-0 lg:right-[38%] lg:left-0 lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/imagens/destaque/figura-flor.png"
                alt=""
                className="h-auto w-full max-w-[26rem] object-contain object-bottom md:max-w-[30rem] lg:h-full lg:max-w-none lg:-scale-x-100 lg:[object-position:100%_100%]"              />
            </div>
          </div>
        </div>
      </section>    </>
  );
}

