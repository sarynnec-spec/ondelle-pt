"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { CurvedHeading, RotatingBadge } from "@/components/motion/flourishes";
import { cn } from "@/lib/utils";

/**
 * A cúpula.
 *
 * Um disco muito mais largo do que o ecrã sobe a partir de baixo enquanto se
 * rola, e a borda superior lê-se como um arco raso a cobrir a secção
 * anterior. O título assenta nessa curva.
 *
 * Sobe por `translateY` — a alternativa (animar `height` ou `top`) pediria
 * layout a cada frame.
 */
export function Dome({
  titulo,
  legendaEsq,
  legendaDir,
  selo,
  children,
  decoracao,
  semParallax = false,
  className,
}: {
  titulo: string;
  legendaEsq?: string;
  legendaDir?: string;
  selo?: string;
  children?: React.ReactNode;
  /**
   * Decoração ancorada à RAIZ da secção, não ao conteúdo.
   *
   * Existe como prop própria em vez de vir por `children` porque o conteúdo
   * vive dentro de `data-cupula-conteudo`, que só começa depois do recuo de
   * topo e ainda leva um parallax próprio. Uma faixa que tem de pender da
   * borda superior não pode estar lá dentro: nascia a 26vh do topo e depois
   * andava com o parallax do texto.
   */
  decoracao?: React.ReactNode;
  /**
   * Desliga o parallax do conteudo interior.
   *
   * Existe para quando a cupula e um painel de uma faixa horizontal: la
   * dentro a seccao deixa de subir no ecra, mas o ScrollTrigger continua a
   * mapear "top bottom -> bottom top" contra a posicao natural do elemento, e
   * o texto derivava 18% da sua altura enquanto o painel deslizava para o
   * lado. A SUBIDA DA CUPULA fica ligada mesmo assim: essa acontece na
   * aproximacao, antes de o sticky prender, e e o gesto que entrega a seccao.
   */
  semParallax?: boolean;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // A cúpula entra enquanto a secção atravessa o ecrã.
      gsap.fromTo(
        "[data-cupula]",
        { yPercent: 26 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "top 30%",
            scrub: 0.7,
          },
        },
      );

      // Parallax do conteúdo interior, mais lento do que a cúpula.
      if (semParallax) return;
      gsap.fromTo(
        "[data-cupula-conteudo]",
        { yPercent: 14 },
        {
          yPercent: -4,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.9,
          },
        },
      );
    },
    { scope: root, dependencies: [semParallax] },
  );

  return (
    // O disco é mais largo do que o ecrã de propósito; sem recorte aqui,
    // transborda e cria scroll horizontal.
    <div ref={root} className={cn("relative overflow-hidden", className)}>
      {/* Disco largo: a borda de topo desenha o arco raso. */}
      <div
        data-cupula
        className="pointer-events-none absolute left-1/2 top-0 -z-10 aspect-square w-[210vw] -translate-x-1/2 rounded-full bg-fundo-2 will-change-transform sm:w-[165vw] lg:w-[135vw]"
      />

      {/* `md:pl-[9%]` empurra o conteúdo centrado uns 4,5% para a direita.
          É o que tira o título em arco de cima da buganvília do canto
          esquerdo — e é também como o era-residence.com o faz: o bloco de
          texto não está no eixo do ecrã, está no eixo do espaço que sobra
          entre os dois ramos. Só a partir de `md`: em telemóvel não há
          largura para dar e o ramo é proporcionalmente menor. */}
      {/* Ancorada à raiz, antes do conteúdo: é o que a deixa pender da borda
          superior da secção em vez de nascer depois do recuo de topo. */}
      {decoracao}

      {/* `h-full` + `justify-center`: o conteúdo assenta ao meio do espaço que
          sobra em vez de ficar agarrado ao topo.

          O recuo de topo (`pt-[26vh]`, dado por quem usa a cúpula) existe para
          o título em arco não bater na buganvília — não é para ser removido.
          Mas o conteúdo é bastante mais curto do que o painel, e alinhado ao
          topo deixava a metade de baixo vazia. Centrar reparte essa folga
          pelos dois lados e afasta ainda mais o título das flores. */}
      <div
        data-cupula-conteudo
        className="relative flex h-full flex-col justify-center will-change-transform md:pl-[9%]"
      >
        <CurvedHeading
          text={titulo}
          className="mx-auto max-w-6xl px-4 text-texto"
          id="curva-cupula"
        />

        {/* `flex-1` nas duas legendas.
            Sem isso a linha centrava-se pelo conjunto, e como uma legenda é
            mais comprida do que a outra o selo era empurrado para a esquerda
            do eixo — o fio que desce por baixo, esse sim centrado na secção,
            aparecia à direita do selo. Com as legendas a ocupar metades
            iguais, o selo cai no eixo e o fio nasce mesmo do meio dele. */}
        <div className="-mt-4 flex items-center justify-center gap-6">
          {legendaEsq ? (
            <span className="label flex-1 text-right text-texto-suave">{legendaEsq}</span>
          ) : null}
          {selo ? <RotatingBadge text={selo} size={72} className="text-texto" id="selo-cupula" /> : null}
          {legendaDir ? (
            <span className="label flex-1 text-left text-texto-suave">{legendaDir}</span>
          ) : null}
        </div>

        {/* Fio vertical que desce do centro, como na referência. */}
        <div aria-hidden className="mx-auto mt-10 h-24 w-px bg-texto/20" />

        {children}
      </div>
    </div>
  );
}
