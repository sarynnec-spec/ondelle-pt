"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fio que contorna uma moldura, desenhando-se quando ela entra no ecrã.
 *
 * ## Porquê SVG e não uma `border`
 *
 * Uma borda aparece toda de uma vez. O que se quer aqui é o traço a correr o
 * perímetro, e isso pede um caminho com comprimento — `stroke-dasharray` mais
 * `stroke-dashoffset` sobre um `rect`. Com `pathLength="1"` o perímetro passa
 * a valer 1 seja qual for o tamanho da moldura, por isso a mesma animação
 * serve um cartão estreito e um largo sem contas de proporção.
 *
 * ## Porquê `non-scaling-stroke`
 *
 * O `viewBox` é 0 0 100 100 e a moldura não é quadrada — o SVG estica. Sem
 * isto, o fio saía mais grosso num eixo do que no outro. Com isto, a espessura
 * é sempre a mesma em píxeis de ecrã.
 *
 * ## Porquê um observador e não uma animação simples
 *
 * Uma animação CSS começa no instante em que a página carrega. Os cartões
 * estão a vários ecrãs de distância: quando lá se chegasse, o traço já teria
 * corrido e via-se apenas o resultado. O observador dispara uma vez, à entrada,
 * e desliga-se.
 */
export function MolduraFio({
  cor,
  raio = 14,
  raioY,
  espessura = 1,
  continuo = false,
}: {
  /** `ouro` sobre fundo verde, `verde` sobre fundo claro. */
  cor: "ouro" | "verde";
  /** Tem de acompanhar o arredondamento da moldura, senão o fio descola. */
  raio?: number;
  /**
   * Raio vertical, quando o horizontal não serve.
   *
   * O `viewBox` é 0 0 100 100 esticado (`preserveAspectRatio="none"`), por
   * isso `rx` vale uma percentagem da LARGURA e `ry` da ALTURA. Numa moldura
   * quase quadrada dá no mesmo e um valor só chega — é o caso dos cartões.
   * Num retângulo alto, como um vídeo vertical, o mesmo número dá um canto
   * muito mais fundo em baixo do que ao lado. Aí passa-se `raioY` = `raio` ×
   * (largura ÷ altura) e o canto volta a ser redondo.
   *
   * Por omissão é igual ao `raio`: quem não o passa fica como estava.
   */
  raioY?: number;
  espessura?: number;
  /**
   * Acrescenta um segmento curto a percorrer o contorno, em ciclo.
   *
   * O traço de entrada desenha-se uma vez e fica; este anda sempre por cima
   * dele. São dois `rect` e não um: com um só, ou se tem o contorno inteiro
   * ou se tem o segmento a andar — para ter os dois ao mesmo tempo é preciso
   * um traço para cada coisa.
   *
   * Por omissão está desligado: os cartões de tratamento continuam com o
   * desenho de entrada e mais nada.
   */
  continuo?: boolean;
}) {
  const raiz = useRef<SVGSVGElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisivel(true);
      return;
    }
    const io = new IntersectionObserver(
      (entradas) => {
        if (!entradas[0].isIntersecting) return;
        setVisivel(true);
        io.disconnect();
      },
      // Não à tangente: começa a desenhar quando o cartão está mesmo a entrar,
      // não quando ainda falta meio ecrã.
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={raiz}
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      data-visivel={visivel ? "true" : "false"}
      className="fio-moldura pointer-events-none absolute inset-0 h-full w-full"
      style={{ color: cor === "ouro" ? "var(--color-ouro)" : "var(--color-verde)" }}
    >
      <rect
        x={espessura / 2}
        y={espessura / 2}
        width={100 - espessura}
        height={100 - espessura}
        rx={raio}
        ry={raioY ?? raio}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={espessura}
        vectorEffect="non-scaling-stroke"
      />

      {continuo ? (
        <rect
          className="fio-passante"
          x={espessura / 2}
          y={espessura / 2}
          width={100 - espessura}
          height={100 - espessura}
          rx={raio}
          ry={raioY ?? raio}
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={espessura}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
    </svg>
  );
}
