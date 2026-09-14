"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Tipografia cinética: a linha corre em contínuo e a velocidade do scroll
 * empurra-a. Só `transform` — o loop é um `x` infinito com `modifiers`,
 * que evita reflow e não precisa de duplicar nós a cada volta.
 */
export function KineticLine({
  text,
  className,
  repeat = 4,
  baseSpeed = 38,
  direction = 1,
}: {
  text: string;
  className?: string;
  repeat?: number;
  baseSpeed?: number;
  direction?: 1 | -1;
}) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el || prefersReducedMotion()) return;

      const half = () => el.scrollWidth / 2;
      const wrap = gsap.utils.wrap(-half(), 0);

      const tween = gsap.to(el, {
        x: direction === 1 ? `-=${half()}` : `+=${half()}`,
        duration: half() / baseSpeed,
        ease: "none",
        repeat: -1,
        modifiers: { x: (v) => `${wrap(parseFloat(v))}px` },
      });

      // O scroll acelera, trava e inverte a linha.
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity() / 480;
          const clamped = gsap.utils.clamp(-9, 9, v);
          tween.timeScale(Math.max(0.12, Math.abs(1 + clamped)) * (clamped < -1 ? -1 : 1));
          gsap.to(el, {
            skewX: gsap.utils.clamp(-9, 9, -v * 1.4),
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto",
          });
        },
      });

      const onResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", onResize);

      return () => {
        tween.kill();
        st.kill();
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: root, dependencies: [text, baseSpeed, direction] },
  );

  const items = Array.from({ length: repeat * 2 });

  return (
    <div ref={root} className={cn("relative w-full overflow-hidden", className)}>
      {/* A fita também herda o gradiente, senão a herança dos `span` parte
          aqui: `inherit` vai buscar ao pai DIRETO, e o pai direto é esta fita,
          não a raiz que traz o `ouro-metal`. E leva o recorte pela mesma
          razão que a raiz: sem ele pinta o gradiente como um rectângulo de
          ouro por trás das letras em vez de o dar às letras. Como não tem
          texto próprio, recortado não desenha nada — só serve de ponte. */}
      <div
        ref={track}
        className="flex w-max will-change-transform [-webkit-background-clip:text] [background-clip:text] [background-image:inherit]"
        aria-hidden
      >
        {/* As três declarações herdadas são o que faz o ouro aparecer.
            `ouro-metal` pinta um gradiente e recorta-o pelo texto com
            `background-clip: text`, deixando a cor transparente. Mas esse
            recorte só apanha o texto do PRÓPRIO elemento, e aqui as letras
            vivem nestes `span` — que herdavam a cor transparente e não o
            gradiente, e desapareciam. Isto já acontecia na faixa da
            Tecnologia antes de existir esta.

            Herdar o gradiente dá a cada repetição a rampa completa em vez de
            uma esticada por toda a fita, que é o que se quer numa fita que
            corre: cada passagem lê-se como metal. Numa faixa sem gradiente,
            `inherit` traz `none` e o recorte não tem efeito sobre uma cor
            opaca — não estraga as faixas em texto. */}
        {items.map((_, i) => (
          <span
            key={i}
            className="whitespace-nowrap pr-[0.28em] [-webkit-background-clip:text] [background-clip:text] [background-image:inherit]"
          >
            {text}
            {/* O ponto leva o mesmo tratamento ou desaparecia com ele: a cor
                de preenchimento transparente do `ouro-metal` também lhe
                chega, e sem gradiente próprio não sobrava nada para pintar.
                Onde não há gradiente, continua clay. */}
            <span className="px-[0.22em] align-middle text-clay [-webkit-background-clip:text] [background-clip:text] [background-image:inherit]">
              ·
            </span>
          </span>
        ))}
      </div>
      {/* O texto real, uma vez, para leitores de ecrã e indexação. */}
      <span className="sr-only">{text}</span>
    </div>
  );
}
