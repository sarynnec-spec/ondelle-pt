"use client";

import { useRef } from "react";

import { gsap, useGSAP, SplitText, prefersReducedMotion } from "@/lib/gsap";
import {
  CURVA,
  DESLOCACAO,
  DURACAO,
  IMAGEM,
  PERCURSO,
  STAGGER,
  ecraEstreito,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

/**
 * Primitivas de revelação.
 *
 * Todas partilham a mesma ideia: o elemento existe no HTML desde o início
 * (bom para SEO e para o LCP) e é o GSAP que o esconde e revela no cliente.
 * Nada aqui anima `top`, `left`, `width` ou `height` — só transform, opacity
 * e clip-path, que o compositor resolve sem recalcular layout.
 *
 * O ritmo não se decide aqui: está em `lib/animations.ts`.
 */

type ModoTexto = "linhas" | "palavras";

type RevealTextProps = {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "div" | "span";
  /** Necessário para ligar a `aria-labelledby` da secção. */
  id?: string;
  /** `linhas` para títulos grandes, `palavras` quando a onda deve ser mais
   *  fina. Letra-a-letra fica deliberadamente de fora: em títulos serifados
   *  quebra o ritmo da palavra e lê-se como efeito. */
  modo?: ModoTexto;
  delay?: number;
  stagger?: number;
  start?: string;
  end?: string;
  /**
   * Amarra a revelação ao scroll em vez de a disparar uma vez. Ligado por
   * omissão — é o que faz o texto desfazer-se ao subir, como no
   * era-residence.com. `false` volta ao disparo temporal (usado na primeira
   * dobra, onde a coreografia tem relógio próprio).
   */
  scrub?: number | false;
};

/**
 * Revelação por máscara: o texto começa abaixo da própria linha, escondido
 * por `overflow: hidden`, e sobe até assentar. Não é um fade — é o texto a
 * nascer de dentro da linha.
 */
export function RevealText({
  children,
  className,
  as: Tag = "div",
  id,
  modo = "linhas",
  delay = 0,
  stagger,
  start = PERCURSO.texto.start,
  end = PERCURSO.texto.end,
  scrub = PERCURSO.scrub,
}: RevealTextProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;

      const porPalavras = modo === "palavras";

      // `mask` faz o SplitText embrulhar cada parte num elemento com
      // overflow escondido — é a máscara, sem markup extra da nossa parte.
      const split = SplitText.create(root.current, {
        type: porPalavras ? "words" : "lines",
        mask: porPalavras ? "words" : "lines",
        autoSplit: true,
        linesClass: "will-change-transform",
        wordsClass: "will-change-transform",
      });

      const partes = porPalavras ? split.words : split.lines;
      const ligadoAoScroll = scrub !== false;
      const passo = stagger ?? (porPalavras ? STAGGER.palavras : STAGGER.linhas);

      const tween = gsap.from(partes, {
        yPercent: ecraEstreito() ? DESLOCACAO.textoMovel : DESLOCACAO.texto,
        opacity: 0,
        duration: DURACAO.titulo,
        // Com scrub o relógio é o scroll: um atraso fixo deixaria o
        // elemento parado no início do percurso.
        delay: ligadoAoScroll ? 0 : delay,
        stagger: ligadoAoScroll ? passo * 0.6 : passo,
        ease: ligadoAoScroll ? CURVA.scroll : CURVA.entrada,
        scrollTrigger: ligadoAoScroll
          ? { trigger: root.current, start, end, scrub }
          : { trigger: root.current, start, once: true },
      });

      // Texto partido em spans prejudica seleção, leitores de ecrã e SEO se
      // ficar permanente.
      return () => {
        tween.scrollTrigger?.kill();
        split.revert();
      };
    },
    { scope: root, dependencies: [modo, delay, stagger, start, end, scrub] },
  );

  return (
    <Tag ref={root as never} id={id} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Revelação de um bloco (parágrafo, cartão, grupo de botões). Entra depois do
 * título da secção — é o atraso que cria a leitura em cascata.
 */
export function RevealBlock({
  children,
  className,
  delay = 0,
  y,
  start = PERCURSO.bloco.start,
  end = PERCURSO.bloco.end,
  scrub = PERCURSO.scrub,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  start?: string;
  end?: string;
  scrub?: number | false;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;

      const ligadoAoScroll = scrub !== false;
      const distancia = y ?? (ecraEstreito() ? DESLOCACAO.blocoMovel : DESLOCACAO.bloco);

      gsap.from(root.current, {
        y: distancia,
        opacity: 0,
        duration: DURACAO.subtitulo,
        delay: ligadoAoScroll ? 0 : delay,
        ease: ligadoAoScroll ? CURVA.scroll : CURVA.entrada,
        scrollTrigger: ligadoAoScroll
          ? { trigger: root.current, start, end, scrub }
          : { trigger: root.current, start, once: true },
      });
    },
    { scope: root, dependencies: [delay, y, start, end, scrub] },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}

/**
 * Imagem que entra por recorte, não por fade.
 *
 * O `clip-path` abre de dentro para fora enquanto a escala assenta de 1.04
 * para 1. A escala existe para não haver borda vazia enquanto o recorte abre
 * — não é zoom, e a 4% não é percetível como tal.
 */
export function RevealImage({
  children,
  className,
  start = PERCURSO.imagem.start,
  end = PERCURSO.imagem.end,
  scrub = PERCURSO.scrub,
}: {
  children: React.ReactNode;
  className?: string;
  start?: string;
  end?: string;
  scrub?: number | false;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;

      const ligadoAoScroll = scrub !== false;

      gsap.fromTo(
        root.current,
        { clipPath: IMAGEM.recorteInicial, scale: IMAGEM.escalaInicial },
        {
          clipPath: IMAGEM.recorteFinal,
          scale: 1,
          duration: DURACAO.imagem,
          ease: ligadoAoScroll ? CURVA.scroll : CURVA.entrada,
          scrollTrigger: ligadoAoScroll
            ? { trigger: root.current, start, end, scrub }
            : { trigger: root.current, start, once: true },
        },
      );
    },
    { scope: root, dependencies: [start, end, scrub] },
  );

  return (
    <div ref={root} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

/** Lista com stagger — é o que faz parecer caro. */
export function RevealStagger({
  children,
  className,
  selector = "[data-stagger-item]",
  stagger = STAGGER.itens,
  start = PERCURSO.bloco.start,
  end = PERCURSO.bloco.end,
  scrub = PERCURSO.scrub,
}: {
  children: React.ReactNode;
  className?: string;
  selector?: string;
  stagger?: number;
  start?: string;
  end?: string;
  scrub?: number | false;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;

      const ligadoAoScroll = scrub !== false;

      gsap.from(selector, {
        y: ecraEstreito() ? DESLOCACAO.blocoMovel : DESLOCACAO.bloco + 12,
        opacity: 0,
        duration: DURACAO.subtitulo,
        stagger: ligadoAoScroll ? stagger * 0.7 : stagger,
        ease: ligadoAoScroll ? CURVA.scroll : CURVA.entrada,
        scrollTrigger: ligadoAoScroll
          ? { trigger: root.current, start, end, scrub }
          : { trigger: root.current, start, once: true },
      });
    },
    { scope: root, dependencies: [selector, stagger, start, end, scrub] },
  );

  return (
    <div ref={root} className={cn(className)}>
      {children}
    </div>
  );
}
