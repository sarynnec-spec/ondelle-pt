"use client";

import { useEffect, useRef, useState } from "react";

import { MolduraFio } from "@/components/ui/moldura-fio";
import { cn } from "@/lib/utils";

/**
 * Vídeo vertical centrado numa área deitada, sem o ampliar.
 *
 * ## O problema
 *
 * O ficheiro é 9:16 e a secção é 16:9. Encher a moldura com ele obrigaria a
 * cortar ou a ampliar, e nenhuma das duas é de graça: o vídeo tem 720px de
 * largura, por isso o maior 16:9 que se lhe pode recortar é 720x405 — abaixo
 * de 720p, e ainda por cima com 68% da altura do enquadramento deitada fora.
 * Numa moldura de 1024px isso seria esticar 1,42x.
 *
 * ## O que se faz em vez disso
 *
 * O vídeo fica à ALTURA toda da área, no meio, com a proporção dele. Numa
 * área de 620x348 aparece a 196x348 — ou seja REDUZIDO a partir dos 720x1280
 * originais, e portanto mais nítido do que o ficheiro.
 *
 * ## Os lados ficam vazios de propósito
 *
 * Houve aqui um fotograma do próprio vídeo, esticado e desfocado, para a área
 * se ler cheia. Saiu: a sala é rosada e o desfoque virava duas barras cor-de-
 * rosa que se liam como moldura e não como continuação. Sem nada, o vídeo
 * assenta no fundo da secção e o que sobra é espaço, não barra.
 *
 * A área continua em 16:9 porque é ela que reserva o lugar ao lado do texto.
 * Dar-lhe a proporção do vídeo faria dele um bloco de 1100px de altura na
 * coluna, e a linha do texto ao lado deixava de ter com que se emparelhar.
 *
 * ## Não carrega antes de ser preciso
 *
 * `preload="none"` e o `src` só é atribuído quando a secção se aproxima do
 * ecrã. Fora de vista o vídeo pausa — um vídeo a correr onde ninguém o vê é
 * bateria deitada fora. É a mesma regra do `FloresVideo`.
 */
/**
 * Proporção do ficheiro: 720x1280. Serve para dois sítios que TÊM de bater
 * certo — a caixa que envolve o vídeo e o raio dos cantos do fio.
 */
const LARGURA_SOBRE_ALTURA = 720 / 1280;

/** Raio dos cantos, em percentagem da LARGURA do vídeo. */
const RAIO_PCT = 4;

export function VideoPanorama({
  src,
  fundo,
  area = "aspect-video",
  className,
}: {
  src: string;
  /** Fotograma pequeno do vídeo, usado como cartaz enquanto ele não chega. */
  fundo: string;
  /**
   * Classes que dão a ALTURA da área — é ela que manda no tamanho do vídeo,
   * que ocupa a altura toda. Mais alta, vídeo maior.
   */
  area?: string;
  className?: string;
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const aVista = useRef(false);
  const [fonte, setFonte] = useState<string | null>(null);

  useEffect(() => {
    const el = raiz.current;
    const v = video.current;
    if (!el || !v) return;

    const io = new IntersectionObserver(
      (e) => {
        const perto = e[0].isIntersecting;
        aVista.current = perto;
        if (perto) {
          setFonte(src);
          if (v.currentSrc && v.paused) void v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  // O pedido de reprodução vai ATRÁS do ficheiro e não à frente dele: na
  // primeira passagem o `<video>` ainda não tem `src` quando a secção aparece,
  // e um `play()` nesse instante rejeita em silêncio. Ver a nota longa em
  // flores-video.tsx, onde isto já custou uma flor parada.
  useEffect(() => {
    const v = video.current;
    if (!v || !fonte) return;
    const tentar = () => {
      if (aVista.current && v.paused) void v.play().catch(() => {});
    };
    tentar();
    v.addEventListener("loadeddata", tentar);
    v.addEventListener("canplay", tentar);
    return () => {
      v.removeEventListener("loadeddata", tentar);
      v.removeEventListener("canplay", tentar);
    };
  }, [fonte]);

  return (
    <div ref={raiz} className={cn("relative z-10", className)}>
      <div className={cn("relative w-full", area)}>
        {/* A caixa tem a proporção do FICHEIRO e a altura toda da área: é ela
            que dá ao fio a forma exata do vídeo. Sem esta caixa o fio teria de
            adivinhar a largura, que só se sabe depois de o vídeo carregar. */}
        <div className="absolute top-1/2 left-1/2 h-full -translate-x-1/2 -translate-y-1/2 aspect-[9/16]">
          <video
          ref={video}
          src={fonte ?? undefined}
          poster={fundo}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          controlsList="nodownload noplaybackrate"
            className="h-full w-full object-cover"
            // Raio em PERCENTAGEM e não em píxeis: assim acompanha o vídeo
            // quando ele muda de tamanho e nunca descola do fio, que também
            // trabalha em percentagem. O segundo valor é o vertical, e sai de
            // multiplicar o horizontal pela proporção do ficheiro — é o que
            // faz o canto ser redondo e não oval.
            style={{
              borderRadius: `${RAIO_PCT}% / ${(RAIO_PCT * LARGURA_SOBRE_ALTURA).toFixed(3)}%`,
            }}
          />

          {/* O fio a percorrer o contorno quando a secção entra. É o mesmo
              gesto dos cartões de tratamento — não é uma forma nova. */}
          <MolduraFio
            cor="verde"
            raio={RAIO_PCT}
            raioY={RAIO_PCT * LARGURA_SOBRE_ALTURA}
            espessura={1}
            continuo
          />
        </div>
      </div>
    </div>
  );
}
