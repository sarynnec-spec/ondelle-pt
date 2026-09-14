"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { scrollSignal } from "@/lib/scroll-signal";

/**
 * A âncora do site: um diafragma circular que abre com o scroll.
 *
 * Feito só com `transform` — a abertura escala e o conteúdo interior
 * contra-escala para se manter em tamanho natural. `clip-path` daria o
 * mesmo desenho mas pediria repaint a cada frame.
 */
export function IrisMask({
  children,
  overlay,
  from = 0.16,
  to = 1.55,
}: {
  children: React.ReactNode;
  overlay?: React.ReactNode;
  from?: number;
  to?: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const aperture = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const ap = aperture.current;
      const ct = counter.current;
      if (!ap || !ct) return;

      // A abertura é centrada por posicionamento absoluto, por isso o
      // translate tem de viajar junto com a escala no mesmo transform.
      const setScale = (s: number) => {
        ap.style.transform = `translate(-50%, -50%) scale(${s})`;
        ct.style.transform = `scale(${1 / s})`;
      };

      if (prefersReducedMotion()) {
        // Sem movimento: a íris fica aberta e o conteúdo legível.
        setScale(to);
        scrollSignal.hero = 1;
        return;
      }

      setScale(from);

      const state = { s: from };

      const tween = gsap.to(state, {
        s: to,
        ease: "none",
        onUpdate: () => setScale(state.s),
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=135%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => {
            scrollSignal.hero = self.progress;
          },
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
      };
    },
    { scope: root, dependencies: [from, to] },
  );

  return (
    <div ref={root} className="relative h-svh w-full overflow-hidden">
      <div className="absolute inset-0">
        {/* Centragem por posição absoluta, não por grid: com 100vmax o item
            é maior do que a área e o alinhamento centrado deixa de centrar. */}
        <div
          ref={aperture}
          className="absolute left-1/2 top-1/2 aspect-square w-[100vmax] overflow-hidden rounded-full will-change-transform"
          style={{ transform: `translate(-50%, -50%) scale(${from})` }}
        >
          <div
            ref={counter}
            className="relative h-full w-full will-change-transform"
            style={{ transform: `scale(${1 / from})` }}
          >
            <div className="absolute left-1/2 top-1/2 h-svh w-screen -translate-x-1/2 -translate-y-1/2">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* O texto vive no DOM, por cima — nunca dentro do canvas. */}
      {overlay}
    </div>
  );
}

/**
 * Transição circular entre secções — a mesma gramática da hero, aplicada
 * em pequeno. Usa `transform` pela mesma razão.
 */
export function IrisWipe({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = disc.current;
      if (!el || prefersReducedMotion()) return;

      // Mesma razão da abertura: o disco excede a largura em retrato, por
      // isso é centrado por posição e o translate viaja com a escala.
      const state = { s: 0.2 };
      gsap.to(state, {
        s: 2.6,
        ease: "none",
        onUpdate: () => {
          el.style.transform = `translate(-50%, -50%) scale(${state.s})`;
        },
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className} aria-hidden>
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={disc}
          className="absolute left-1/2 top-1/2 aspect-square w-[62vmax] rounded-full bg-paper-2 will-change-transform"
          style={{ transform: "translate(-50%, -50%) scale(0.2)" }}
        />
      </div>
    </div>
  );
}

export { ScrollTrigger };
