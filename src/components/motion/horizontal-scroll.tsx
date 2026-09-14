"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Scroll lateral: a secção fixa-se e o conteúdo corre na horizontal
 * enquanto se rola na vertical.
 *
 * A distância de pin é calculada a partir da largura real da faixa, por
 * isso funciona com qualquer número de painéis sem afinação à mão.
 *
 * Com movimento reduzido, degrada para uma faixa de scroll nativo — nunca
 * fica conteúdo inacessível.
 */
export function HorizontalScroll({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const faixa = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = faixa.current;
      const secao = root.current;
      if (!el || !secao || prefersReducedMotion()) return;

      // `scrollWidth` NÃO conta a goteira do fim.
      //
      // Num contentor flex cujo conteúdo transborda, o navegador inclui o
      // recuo do início mas descarta o do fim — é o comportamento
      // especificado, não um defeito. A faixa tem `gutter`, ou seja recuo dos
      // dois lados, por isso o percurso ficava curto exatamente por essa
      // largura e o último cartão nunca chegava a afastar-se da margem
      // direita: parecia cortado. Somá-la devolve-lhe o remate.
      const recuoFinal = () => parseFloat(getComputedStyle(el).paddingRight) || 0;
      const distancia = () =>
        Math.max(0, el.scrollWidth + recuoFinal() - window.innerWidth);
      if (distancia() <= 0) return;

      const tween = gsap.to(el, {
        x: () => -distancia(),
        ease: "none",
        scrollTrigger: {
          trigger: secao,
          start: "top top",
          end: () => `+=${distancia()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label={label}
      className={cn("relative overflow-hidden", className)}
    >
      <div
        ref={faixa}
        // `items-stretch` (o padrão, daí a ausência de `items-center`): todos
        // os painéis passam a ter a mesma altura. Era `items-center`, que
        // centrava cada um pela sua própria altura e desalinhava as molduras
        // de cartões com textos de tamanhos diferentes. O recuo vertical
        // substitui a centragem que se perdeu.
        className="flex h-svh gap-[clamp(1.5rem,4vw,4rem)] gutter py-[6vh] will-change-transform motion-reduce:overflow-x-auto"
      >
        {children}
      </div>
    </section>
  );
}

/**
 * Recorte vegetal no canto, a balançar.
 *
 * Precisa de um PNG com transparência real. Sem ficheiro, não desenha nada —
 * um marcador de posição aqui pareceria um erro de carregamento.
 *
 * O balanço combina uma oscilação lenta contínua com a velocidade do scroll,
 * e a rotação parte do canto de fixação, como um ramo preso à parede.
 */
export function CornerFoliage({
  src,
  alt = "",
  canto = "top-left",
  largura = "38vw",
}: {
  src: string | null;
  alt?: string;
  canto?: "top-left" | "top-right";
  largura?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || !src || prefersReducedMotion()) return;

      // Oscilação de repouso, em duas frequências para não parecer metronómica.
      gsap.to(el, { rotate: 1.5, duration: 4.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(el, { y: 8, duration: 6.1, ease: "sine.inOut", yoyo: true, repeat: -1 });

      // O scroll empurra o ramo e ele volta ao lugar.
      const rot = gsap.quickTo(el, "rotate", { duration: 0.9, ease: "power3" });
      let ultimo = window.scrollY;
      const aoRolar = () => {
        const v = gsap.utils.clamp(-5, 5, (window.scrollY - ultimo) * 0.14);
        ultimo = window.scrollY;
        rot(v);
      };
      window.addEventListener("scroll", aoRolar, { passive: true });
      return () => window.removeEventListener("scroll", aoRolar);
    },
    { scope: root, dependencies: [src] },
  );

  if (!src) return null;

  return (
    <div
      ref={root}
      aria-hidden={alt ? undefined : true}
      className={cn(
        "pointer-events-none absolute top-0 z-20 will-change-transform",
        canto === "top-left" ? "left-0 origin-top-left" : "right-0 origin-top-right",
      )}
      style={{ width: largura }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-auto w-full select-none" draggable={false} />
    </div>
  );
}
