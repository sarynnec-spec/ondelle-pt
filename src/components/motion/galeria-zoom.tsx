"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Uma fotografia só, que amplia com o scroll e vai trocando de imagem.
 *
 * Substitui o par que entrava desencontrado e se juntava: a cliente não quis
 * esse gesto. Aqui as fotografias estão juntas desde o início — ocupam a
 * mesma moldura — e o movimento é outro: enquanto se rola, a imagem aproxima-se
 * e, em dois momentos do percurso, dá lugar à seguinte.
 *
 * ## O que cresce
 *
 * Cresce a MOLDURA, não a fotografia lá dentro. A imagem entra pequena, ao
 * fundo da secção, e vai ganhando tamanho até assentar na largura toda do
 * bloco — que é o gesto pedido. Se fosse a fotografia a crescer dentro de uma
 * moldura fixa, o tamanho no ecrã era sempre o mesmo e só o enquadramento
 * fechava.
 *
 * ## Porque a troca é por índice e não por temporizador
 *
 * Quem manda é o scroll. Um relógio a correr por baixo trocava a imagem com
 * a página parada e tirava à pessoa o controlo do que está a ver. O estado
 * só muda quando o índice muda, por isso rolar não redesenha a cada frame.
 */
type Foto = { src: string; alt: string };

export function GaleriaZoom({
  imagens,
  racio = "16 / 9",
  className,
  de = 0.82,
}: {
  imagens: readonly Foto[];
  /** Proporção da moldura, no formato `L / A`. */
  racio?: string;
  className?: string;
  /** Tamanho no início do percurso, em fração do tamanho final. */
  de?: number;
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);

  useGSAP(
    () => {
      const st = {
        trigger: raiz.current,
        start: "top 92%",
        end: "bottom 10%",
        scrub: 0.85,
      };

      // A troca acontece na mesma para quem pediu movimento reduzido: é o
      // scroll dela que a provoca, não uma animação imposta. O que se
      // dispensa é a ampliação contínua.
      gsap.timeline({
        scrollTrigger: {
          ...st,
          onUpdate: (self) => {
            const n = Math.min(imagens.length - 1, Math.floor(self.progress * imagens.length));
            setI((atual) => (atual === n ? atual : n));
          },
        },
      });

      if (prefersReducedMotion()) return;

      // Cresce a moldura inteira, e não a fotografia dentro dela: é isso que
      // faz a imagem ENTRAR pequena e ganhar presença enquanto se rola, em vez
      // de ficar do mesmo tamanho com o enquadramento a fechar-se.
      gsap.fromTo(
        "[data-galeria-moldura]",
        { scale: de },
        {
          scale: 1,
          ease: "none",
          transformOrigin: "center center",
          scrollTrigger: st,
        },
      );
    },
    { scope: raiz, dependencies: [imagens.length, de] },
  );

  return (
    <div ref={raiz} className={cn("relative z-10", className)}>
      <div
        data-galeria-moldura
        className="relative w-full overflow-hidden bg-fundo-2 will-change-transform"
        style={{ aspectRatio: racio }}
      >
        <div className="absolute inset-0">
          {imagens.map((f, n) => (
            <Image
              key={f.src}
              src={f.src}
              alt={n === i ? f.alt : ""}
              fill
              sizes="100vw"
              aria-hidden={n === i ? undefined : true}
              priority={n === 0}
              className={`object-cover transition-opacity duration-700 ease-out ${
                n === i ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
