"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Título assente numa curva.
 *
 * O texto vive num `<textPath>` sobre um arco — continua a ser texto real,
 * selecionável e legível por leitores de ecrã, ao contrário de o desenhar
 * letra a letra com transformações.
 */
export function CurvedHeading({
  text,
  className,
  raio = 620,
  id = "curva",
}: {
  text: string;
  className?: string;
  raio?: number;
  id?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const largura = 1400;
  const cx = largura / 2;
  // Arco raso: as pontas caem, o centro sobe. Segue a borda da cúpula.
  const d = `M ${cx - raio} ${raio + 60} A ${raio} ${raio} 0 0 1 ${cx + raio} ${raio + 60}`;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(root.current, {
        yPercent: 34,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 92%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("w-full", className)}>
      <svg viewBox={`0 0 ${largura} ${raio * 0.42}`} className="h-auto w-full overflow-visible">
        <defs>
          <path id={id} d={d} fill="none" />
          {/* Em SVG o `background-clip: text` não funciona — o metal faz-se
              com um gradiente aplicado ao `fill`. Mesmas paragens da rampa
              `verde-metal-linhas`, para o arco e os títulos combinarem. */}
          <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0.35">
            <stop offset="0%" stopColor="#061715" />
            <stop offset="16%" stopColor="#082321" />
            <stop offset="36%" stopColor="#1a3936" />
            <stop offset="50%" stopColor="#366561" />
            <stop offset="64%" stopColor="#1d4541" />
            <stop offset="84%" stopColor="#082321" />
            <stop offset="100%" stopColor="#061715" />
          </linearGradient>
        </defs>
        <text
          className="font-display"
          fill={`url(#${id}-metal)`}
          style={{ fontSize: 62, letterSpacing: "0.14em" }}
        >
          <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

/** Indicador vertical de scroll, com a linha a correr em ciclo. */
export function ScrollCue({ className, label = "Deslizar" }: { className?: string; label?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-cue-linha]",
        { scaleY: 0, transformOrigin: "top" },
        {
          scaleY: 1,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          repeatDelay: 0.35,
          yoyo: true,
        },
      );
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className={cn("pointer-events-none flex flex-col items-center gap-4", className)}
    >
      <span
        className="label whitespace-nowrap"
        style={{ writingMode: "vertical-rl", letterSpacing: "0.34em" }}
      >
        {label}
      </span>
      <span className="relative block h-16 w-px bg-current/25">
        <span data-cue-linha className="absolute inset-0 block bg-current will-change-transform" />
      </span>
    </div>
  );
}

/** Selo circular com o texto a acompanhar a circunferência, em rotação lenta. */
export function RotatingBadge({
  text,
  className,
  id = "selo",
  size = 128,
}: {
  text: string;
  className?: string;
  id?: string;
  size?: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const r = 42;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to("[data-selo-gira]", { rotate: 360, duration: 26, ease: "none", repeat: -1 });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full" data-selo-gira style={{ transformOrigin: "50% 50%" }}>
        <defs>
          <path id={id} d={`M 50 50 m -${r} 0 a ${r} ${r} 0 1 1 ${r * 2} 0 a ${r} ${r} 0 1 1 -${r * 2} 0`} fill="none" />
        </defs>
        <text className="fill-current" style={{ fontSize: 9.2, letterSpacing: "0.32em" }}>
          <textPath href={`#${id}`} startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>
      {/* Marca central: losango de quatro pétalas, desenhado, não importado. */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <g transform="translate(50 50)" className="fill-current">
          {[0, 90, 180, 270].map((a) => (
            <path key={a} transform={`rotate(${a})`} d="M0 -14 C 5 -7, 5 -3, 0 0 C -5 -3, -5 -7, 0 -14 Z" />
          ))}
        </g>
      </svg>
    </div>
  );
}

/** Ponto-alvo com anel pulsante, para marcar detalhes sobre uma imagem. */
export function Hotspot({
  x,
  y,
  label,
  className,
}: {
  x: string;
  y: string;
  label: string;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to("[data-anel]", {
        scale: 1.7,
        opacity: 0,
        duration: 2.1,
        ease: "power2.out",
        repeat: -1,
        transformOrigin: "center",
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className={cn("absolute -translate-x-1/2 -translate-y-1/2", className)}
      style={{ left: x, top: y }}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden className="relative block size-9">
        <span className="absolute inset-0 rounded-full border border-fundo/70" />
        <span data-anel className="absolute inset-0 block rounded-full border border-fundo/70 will-change-transform" />
        <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fundo" />
      </span>
    </div>
  );
}
