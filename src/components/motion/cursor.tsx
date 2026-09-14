"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Cursor personalizado com atraso elástico e estado de foco.
 *
 * Só aparece em dispositivos com ponteiro fino — num ecrã tátil seria um
 * elemento inútil a consumir frames. A posição é escrita com `quickTo`, que
 * evita criar um tween por movimento do rato.
 */
export function Cursor() {
  const ponto = useRef<HTMLDivElement>(null);
  const anel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fino = window.matchMedia("(pointer: fine)").matches;
    if (!fino || prefersReducedMotion()) return;

    const p = ponto.current;
    const a = anel.current;
    if (!p || !a) return;

    gsap.set([p, a], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

    const px = gsap.quickTo(p, "x", { duration: 0.14, ease: "power3" });
    const py = gsap.quickTo(p, "y", { duration: 0.14, ease: "power3" });
    const ax = gsap.quickTo(a, "x", { duration: 0.5, ease: "power3" });
    const ay = gsap.quickTo(a, "y", { duration: 0.5, ease: "power3" });

    let visivel = false;
    const mover = (e: PointerEvent) => {
      if (!visivel) {
        visivel = true;
        gsap.to([p, a], { autoAlpha: 1, duration: 0.3 });
      }
      px(e.clientX);
      py(e.clientY);
      ax(e.clientX);
      ay(e.clientY);
    };

    // O anel cresce sobre elementos interativos.
    const alvo = "a, button, [role='radio'], [role='region']";
    const entrar = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.(alvo)) {
        gsap.to(a, { scale: 2.1, borderColor: "rgba(214,172,96,0.9)", duration: 0.35, ease: "expo.out" });
        gsap.to(p, { scale: 0.4, duration: 0.35, ease: "expo.out" });
      }
    };
    const sair = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.(alvo)) {
        gsap.to(a, { scale: 1, borderColor: "rgba(243,239,231,0.45)", duration: 0.4, ease: "expo.out" });
        gsap.to(p, { scale: 1, duration: 0.4, ease: "expo.out" });
      }
    };

    const esconder = () => gsap.to([p, a], { autoAlpha: 0, duration: 0.2 });

    window.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("pointerover", entrar, true);
    document.addEventListener("pointerout", sair, true);
    document.addEventListener("pointerleave", esconder);

    return () => {
      window.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerover", entrar, true);
      document.removeEventListener("pointerout", sair, true);
      document.removeEventListener("pointerleave", esconder);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95] hidden [@media(pointer:fine)]:block">
      <div
        ref={anel}
        className="absolute left-0 top-0 size-9 rounded-full border will-change-transform"
        style={{ borderColor: "rgba(243,239,231,0.45)", mixBlendMode: "difference" }}
      />
      <div
        ref={ponto}
        className="absolute left-0 top-0 size-1.5 rounded-full bg-ouro will-change-transform"
      />
    </div>
  );
}

/**
 * Botão magnético: o elemento persegue ligeiramente o ponteiro dentro do
 * seu raio. É um dos gestos que mais distingue um site premiado — desde
 * que discreto. Acima de ~0.35 do raio começa a parecer um brinquedo.
 */
export function Magnetic({
  children,
  className,
  forca = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  forca?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;

    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * forca);
      y((e.clientY - (r.top + r.height / 2)) * forca);
    };
    const soltar = () => {
      x(0);
      y(0);
    };

    el.addEventListener("pointermove", mover);
    el.addEventListener("pointerleave", soltar);
    return () => {
      el.removeEventListener("pointermove", mover);
      el.removeEventListener("pointerleave", soltar);
    };
  }, [forca]);

  return (
    <span ref={ref} className={className} style={{ display: "inline-block", willChange: "transform" }}>
      {children}
    </span>
  );
}
