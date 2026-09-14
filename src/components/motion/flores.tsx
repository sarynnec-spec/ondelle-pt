"use client";

import { useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/lib/gsap";
import { iniciarVento, type Ajuste } from "./flores-webgl";

/**
 * Buganvília suspensa do topo — cinco camadas, uma composição, vento por
 * shader.
 *
 * ## As camadas nunca se movem umas em relação às outras
 *
 * Esta é a regra que sustenta tudo, e foi aprendida a errar. Os cinco
 * ficheiros são a separação de UMA fotografia: os galhos atravessam-se entre
 * eles — o que na camada 02 é uma pendente continua, no mesmo pixel, num ramo
 * da 01. Mover uma sem a outra parte ramos ao meio, e foi exatamente isso que
 * aconteceu na primeira versão, que animava as cinco independentemente.
 *
 * A regra sobrevive à mudança para WebGL: as cinco texturas são desenhadas
 * sobre a MESMA grelha deformada, no mesmo quadro. Não têm deslocamento
 * próprio e não podem separar-se, tal como não podiam quando o movimento
 * vivia num contentor CSS.
 *
 * NÃO reintroduzir animação por camada.
 *
 * ## Porque é que o movimento saiu do CSS
 *
 * Três tentativas em CSS, todas rejeitadas por parecerem o que são:
 * `translate` no contentor (a imagem desliza), `translate` por camada (parte
 * a composição) e `skewX` com origem no topo (gradiente correto, mas afim —
 * uma transformação afim leva retas em retas, por isso toda a fileira
 * horizontal de folhas anda igual e lê-se como uma placa a inclinar).
 *
 * O que falta às três é deslocamento que varie **ao longo da largura**, e
 * isso pede acesso a vértices. Está em `flores-shader.ts`.
 *
 * ## As imagens continuam no DOM
 *
 * Não são decorativas: são a fonte das texturas e são o que se vê se o WebGL
 * faltar, se o contexto se perder, ou se o utilizador pedir menos movimento.
 * Só desaparecem — por `opacity`, nunca por `transform` — depois de o canvas
 * ter desenhado o primeiro quadro, para não haver salto nem duplicação.
 */

/** A tela partilhada pelos cinco ficheiros. */
const TELA = { largura: 3300, altura: 2050 };

/**
 * Largura da faixa em fração da secção. O conteúdo ocupa os 70% esquerdos da
 * tela (x 0–2304 de 3300), por isso 88% desenha flores em ~62% da viewport.
 */
const LARGURA_DESKTOP = 0.88;
const LARGURA_MOVEL = 1.0;

/**
 * Recuo vertical em desktop, em `vw` e não em `vh`.
 *
 * A altura da composição vem da largura (é a tela 3300×2050 a 88% da secção),
 * por isso um recuo em `vh` corrigia a 1440 e falhava a 1920. Em `vw` cresce
 * com a composição. −8vw é o menor valor que liberta o título nos dois.
 */
const TOPO_DESKTOP = "-8vw";

/** Ordem de empilhamento: a primeira é a mais atrás. */
const CAMADAS = [
  "01_esquerda_superior",
  "02_esquerda_pendente",
  "03_centro",
  "04_direita_centro",
  "05_direita_pendente",
] as const;

/**
 * Amplitude do vento.
 *
 * ## Porque é uma FRAÇÃO da composição, e não px fixos
 *
 * Esteve em px fixos e a queixa foi "no PC as flores parecem paradas". Não
 * era o loop nem o `uTempo` — medido, ambos corriam a 60fps com o tempo a
 * avançar 9,05s em 9s reais. Era isto:
 *
 *     viewport   banda    pontas   pontas ÷ banda
 *      390px      390      ±1,95       0,50%
 *     1440px     1254      ±5,34       0,43%
 *     1920px     1676      ±5,01       0,30%
 *     2560px     2239      ±5,0        0,22%
 *
 * A faixa é 88% da largura do ecrã, por isso a 2560 as flores são desenhadas
 * 5,7× maiores do que no telemóvel — mas as pontas continuavam a percorrer os
 * mesmos 5px. O que o olho lê não é o deslocamento absoluto, é o deslocamento
 * relativo à flor que está a olhar, e esse caía para menos de metade do que o
 * telemóvel faz. Uma constante em px onde devia estar uma fração.
 *
 * `FRACAO_DESKTOP` é a fração do telemóvel — cujo numerador é o `amp` de
 * `VENTO_MOVEL` e o denominador a largura da sua banda — descontada a pedido
 * dela. A paridade exata (`4 / 390`) foi medida e punha as rajadas em ±8,4px
 * a 1440 e ±12,8px a 1920, o que ela achou de mais. Passou a `3 / 390` e
 * depois a `2,6 / 390`, este último para acertar as pontas nas telas grandes:
 * a `3 / 390` o 1920 media ±7,3 e o 2560 ±9,1, acima das bandas pedidas.
 *
 * O denominador continua a ser 390 mesmo já não havendo paridade: é o que
 * deixa visível, na própria constante, de onde veio o número e quanto se
 * desceu dele.
 *
 * O que NÃO se pode fazer é voltar a px fixos: com a constante antiga o
 * desktop fazia 0,43% da banda a 1440 e 0,22% a 2560, contra 0,87% no
 * telemóvel — era isso que fazia as flores parecerem paradas no PC.
 *
 * A rampa dentro da vegetação (raiz : meio : ponta ≈ 1 : 4 : 7) não muda — vive no
 * expoente do shader e não é tocada aqui. Só o tamanho global escala, que é o
 * que tem de escalar.
 *
 * ## O telemóvel fica com a constante
 *
 * De propósito: é o caso que ela diz estar certo, e a fração pura dar-lhe-ia
 * o mesmo valor de qualquer maneira. Deixá-lo fora da conta garante que
 * nenhum ajuste futuro no desktop lhe toca.
 */
const FRACAO_DESKTOP = 2.6 / 390;

/** Tecto, para a proporção não disparar numa ultrawide. */
const AMP_MAX = 18;

/** Razão X:Y, mantida em qualquer largura. */
const RACIO_Y = 2.6 / 7.5;

const VENTO_MOVEL: Ajuste = { amp: [4, 1.3], ponta: 0.82 };

function ventoDesktop(larguraDaFaixa: number): Ajuste {
  const x = Math.min(AMP_MAX, larguraDaFaixa * FRACAO_DESKTOP);
  return { amp: [x, x * RACIO_Y], ponta: 0.82 };
}

export function Flores({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [aVento, setAVento] = useState(false);

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    if (!el || !cv || prefersReducedMotion()) return;

    let limpar: (() => void) | undefined;
    let cancelado = false;

    const imgs = [...el.querySelectorAll<HTMLImageElement>(".flower-layer")];
    const prontas = Promise.all(
      imgs.map(
        (i) =>
          new Promise<void>((ok) => {
            if (i.complete && i.naturalWidth > 0) return ok();
            i.addEventListener("load", () => ok(), { once: true });
            i.addEventListener("error", () => ok(), { once: true });
          }),
      ),
    );

    prontas
      .then(() => {
        if (cancelado || imgs.some((i) => !i.naturalWidth)) return;
        return iniciarVento(
          cv,
          imgs,
          () =>
            window.matchMedia("(max-width: 767px)").matches
              ? VENTO_MOVEL
              : ventoDesktop(cv.clientWidth || 1254),
          () => setAVento(true),
        );
      })
      .then((fn) => {
        if (cancelado) return fn?.();
        limpar = fn;
      })
      // Sem WebGL, ou com o shader a falhar, ficam as cinco imagens paradas.
      // É uma decoração: não vale um ecrã em branco.
      .catch(() => setAVento(false));

    return () => {
      cancelado = true;
      limpar?.();
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      data-vento={aVento ? "" : undefined}
      className={`floral-decoration pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      <div
        className="faixa-floral absolute left-0"
        // A largura vive na folha de estilo abaixo, não aqui: um `style`
        // inline vence sempre a media query e a variante de telemóvel nunca
        // chegava a aplicar-se.
        style={{ aspectRatio: `${TELA.largura} / ${TELA.altura}` }}
      >
        <div className="flower-composition absolute inset-0">
          {CAMADAS.map((nome, i) => (
            <img
              key={nome}
              data-camada={i}
              src={`/imagens/flores/${nome}.webp`}
              alt=""
              width={TELA.largura}
              height={TELA.altura}
              decoding="async"
              // `inset-0` + 100%: as cinco exatamente sobrepostas, sem
              // `object-fit`, sem recorte, sem escala — e sem transform, aqui
              // como no canvas.
              className={`flower-layer flower-${i + 1} absolute inset-0 h-full w-full`}
            />
          ))}

          {/* Exatamente sobre a pilha, com a mesma caixa: o canvas herda a
              geometria da faixa e não precisa de saber nada sobre ela. */}
          <canvas ref={canvas} className="flower-canvas absolute inset-0 h-full w-full" />
        </div>
      </div>

      <style>{`
        .floral-decoration .faixa-floral {
          width: ${LARGURA_DESKTOP * 100}%;
          top: ${TOPO_DESKTOP};
        }
        .floral-decoration .flower-canvas { opacity: 0; }
        .floral-decoration[data-vento] .flower-canvas { opacity: 1; }
        .floral-decoration[data-vento] .flower-layer { opacity: 0; }
        @media (max-width: 767px) {
          .floral-decoration .faixa-floral { width: ${LARGURA_MOVEL * 100}%; top: 0; }
        }
      `}</style>
    </div>
  );
}
