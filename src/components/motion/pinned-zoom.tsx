"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Secção fixada em que a superfície se aproxima com o scroll.
 * O `pin` cria um spacer no DOM — se o layout partir, é quase sempre isso.
 */
export function PinnedZoom({
  children,
  caption,
  className,
  from = 1,
  fromMovel,
  to = 1.42,
}: {
  children: React.ReactNode;
  caption?: React.ReactNode;
  className?: string;
  from?: number;
  /**
   * Escala inicial em telemóvel, quando tem de ser diferente da de desktop.
   *
   * Abaixo de 1 a fotografia arranca mais pequena do que o ecrã e vê-se o
   * fundo da secção à volta — que existe e é o gradiente da marca, não branco.
   * É essa margem que torna o zoom legível: sem ela a imagem já enche tudo no
   * primeiro quadro e o crescimento passa despercebido. Em telemóvel o ecrã é
   * estreito e a fotografia é cortada com mais violência, por isso pede um
   * recuo maior do que em desktop.
   */
  fromMovel?: number;
  to?: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const cap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!media.current || prefersReducedMotion()) return;

      // `matchMedia` do GSAP e não uma leitura de `innerWidth`: refaz a
      // animação sozinho quando se atravessa o limite, e limpa a anterior.
      // Com uma leitura única, rodar o telemóvel deixava a escala do formato
      // errado.
      const mm = gsap.matchMedia();

      const montar = (inicio: number) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=115%",
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
          },
        });

        tl.fromTo(media.current, { scale: inicio }, { scale: to, ease: "none" }, 0);

        if (cap.current) {
          tl.fromTo(cap.current, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "power2.out" }, 0.15);
        }
      };

      if (fromMovel === undefined) {
        montar(from);
        return;
      }

      mm.add("(min-width: 768px)", () => montar(from));
      mm.add("(max-width: 767px)", () => montar(fromMovel));
      return () => mm.revert();
    },
    { scope: root, dependencies: [from, fromMovel, to] },
  );

  return (
    <div ref={root} className={cn("relative h-svh w-full overflow-hidden", className)}>
      <div ref={media} className="absolute inset-0 will-change-transform">
        {children}
      </div>
      {caption ? (
        <div ref={cap} className="absolute inset-x-0 bottom-0 gutter pb-16 will-change-transform">
          {caption}
        </div>
      ) : null}
    </div>
  );
}
