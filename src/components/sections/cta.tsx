import Image from "next/image";

import { RevealText, RevealBlock } from "@/components/motion/reveal";
import { SurfaceFill } from "@/components/ui/surface";
import { cta, brand } from "@/lib/content";

/** Bloco 14 — CTA principal. */
export function Cta() {
  return (
    <section
      id="marcar"
      aria-labelledby="marcar-titulo"
      className="relative overflow-hidden bg-verde-fundo text-fundo"
    >
      <SurfaceFill tone="escuro" className="opacity-80" />

      <div className="gutter relative py-section">
        {/* A fotografia ocupa o lado direito, que estava vazio. Ancorada ao
            canto e em `object-contain` para não ser cortada; o recuo negativo
            anula a goteira deste bloco, senão parava à distância da margem do
            texto em vez de encostar à borda. Vem antes do texto no documento,
            logo por baixo dele — e nem lá chega, porque o texto está limitado
            a 12ch e ela ocupa 42% da largura.
            Em telemóvel não entra: a coluna é única e o texto ocupa-a toda. */}
        {/* O deslocamento de 5% para a esquerda vale só na faixa estreita em
            que esta imagem aparece (md–lg). Abaixo de `md` ela está escondida:
            a coluna é única e o texto ocupa-a toda. Em `lg` volta ao sítio,
            que aí há largura de sobra.

            O bloco que estes dois comentários descrevem tinha sido apagado
            no fork e os comentários ficaram sozinhos, a explicar uma imagem
            que não existia. Reposto com a ficha de avaliação da Ondelle —
            gerada de raiz para esta marca, com o wordmark dela no ecrã. */}
        {/* `right-0` e não o recuo negativo de uma goteira que aqui estava.
            O recuo era do desenho original, onde o tablet SANGRAVA de
            propósito pela borda direita. Medido neste ficheiro, isso cortava
            45px a 1440 e 72px a 1920 — porque nem esta imagem nem a do
            original têm um único pixel de vazio à direita (0,0% nas duas),
            logo o que sai do ecrã é tablet a sério, não margem.

            A pedido dela, passa a assentar na linha da goteira, alinhado com
            a margem direita do resto do site.

            Três posições foram experimentadas, e as duas primeiras falharam
            por razões opostas:

              · recuo negativo de uma goteira (o do desenho original) —
                cortava 45px a 1440 e 72px a 1920, porque esta imagem não tem
                um único pixel de vazio à direita (0,0%);
              · `right-[var(--spacing-gutter)]` — não cortava nada, mas
                afastava-a 43 a 76px da borda e as mãos ficavam a PAIRAR no
                meio do verde, sem nada que as segurasse.

            Fica `right-0`. Um filho absoluto mede-se pela caixa de padding do
            pai, por isso isto ignora a goteira do `.gutter` e assenta na
            própria borda do ecrã: o tablet encosta sem perder um pixel, e as
            mãos leem-se a entrar de fora em vez de flutuar. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] md:block md:-translate-x-[5%] lg:translate-x-0">
          <Image
            // Recorte com fundo transparente (1199×1312, RGBA), por isso
            // assenta sobre o verde sem moldura nem fundo próprio.
            src="/imagens/destaque/tablet-ficha.png"
            alt=""
            aria-hidden
            fill
            sizes="42vw"
            // Ancorada em baixo e não ao meio: centrada, a mão ficava a
            // meia altura com verde vazio por baixo e o cimo do tablet
            // cortado. Encostada ao fundo da caixa, desce até à margem.
            className="object-contain [object-position:100%_100%]"
          />
        </div>

        <p className="label mb-8 text-fundo/70">{cta.label}</p>

        <RevealText
          as="h2"
          id="marcar-titulo"
          className="mb-10 max-w-[12ch] text-[length:var(--text-display)]"
        >
          {cta.title.split("\n").map((line) => (
            <span key={line} className="ouro-metal-linhas block w-fit">
              {line}
            </span>
          ))}
        </RevealText>

        <RevealBlock>
          <p className="mb-14 max-w-[44ch] text-[length:var(--text-lead)] leading-[1.62] text-fundo/70">
            {cta.body}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {/* Chapa dourada com reflexo a passar, portada do atelier
                (`ouro-vivo`). Dourado chapado lia-se como mostarda; o que
                faz parecer metal é a rampa escuro→médio→especular. */}
            {/* Aponta ao formulário logo abaixo, não a `mailto:`. Um botão
                que diz "Marcar consulta" e abre o cliente de email deixava a
                marcação — que está a três dedos de scroll — por encontrar. */}
            <a
              href="#marcacao"
              className="label ouro-vivo rounded-full px-8 py-4 transition-shadow duration-500 hover:shadow-[0_0_40px_-12px_var(--color-ouro)]"
            >
              {cta.primary}
            </a>
            <a
              href={brand.booking}
              className="label rounded-full border border-fundo/35 px-8 py-4 text-fundo transition-colors duration-300 hover:border-fundo hover:bg-fundo/10"
            >
              {cta.secondary}
            </a>
          </div>

          <p className="label mt-12 text-fundo/40">{cta.note}</p>
        </RevealBlock>
      </div>
    </section>
  );
}
