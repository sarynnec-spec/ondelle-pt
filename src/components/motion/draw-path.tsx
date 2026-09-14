"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Traço SVG desenhado ao scroll.
 *
 * `stroke-dashoffset` não é transform nem opacity — é a exceção consciente
 * à regra. O custo é um repaint de um elemento pequeno e vetorial, o que é
 * aceitável; a alternativa (máscara animada) sairia mais cara.
 */
export function DrawPath({
  className,
  markers = [],
}: {
  className?: string;
  markers?: { x: number; y: number; label: string }[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const p = path.current;
      if (!p) return;

      const length = p.getTotalLength();
      gsap.set(p, { strokeDasharray: length, strokeDashoffset: prefersReducedMotion() ? 0 : length });

      if (prefersReducedMotion()) {
        gsap.set("[data-path-dot]", { scale: 1, opacity: 1 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top 78%",
          end: "bottom 62%",
          scrub: 0.8,
        },
      });

      tl.to(p, { strokeDashoffset: 0, ease: "none" }, 0);
      tl.fromTo(
        "[data-path-dot]",
        { scale: 0, opacity: 0, transformOrigin: "center" },
        { scale: 1, opacity: 1, stagger: 0.22, ease: "back.out(2)", duration: 0.4 },
        0.1,
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("relative w-full", className)}>
      <svg
        viewBox="0 0 900 320"
        fill="none"
        className="h-auto w-full overflow-visible"
        aria-hidden
      >
        <path
          ref={path}
          d="M40 268 C 150 268, 168 176, 268 168 C 372 160, 386 74, 496 68 C 604 62, 626 148, 712 152 C 792 156, 826 116, 862 62"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          className="text-clay"
        />
        {markers.map((m) => (
          <g key={m.label} data-path-dot>
            <circle cx={m.x} cy={m.y} r="4.5" className="fill-clay" />
            <circle cx={m.x} cy={m.y} r="11" className="fill-none stroke-clay/35" strokeWidth="1" />
          </g>
        ))}
      </svg>
    </div>
  );
}
