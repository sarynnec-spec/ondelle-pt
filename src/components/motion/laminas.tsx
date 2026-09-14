"use client";

import { useRef } from "react";

import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { CURVA, DURACAO, PERCURSO, STAGGER } from "@/lib/animations";
import { cn } from "@/lib/utils";

/**
 * Fotografia que entra em lâminas verticais e depois se junta.
 *
 * A imagem é cortada em `n` tiras verticais. Cada uma entra com um desvio
 * vertical próprio e os cantos arredondados, e no fim todas assentam em zero:
 * os cortes fecham, os raios vão a zero e o que fica é a fotografia inteira,
 * sem costura. É o efeito de estore que ela pediu.
 *
 * ## Como as tiras mostram pedaços diferentes da mesma imagem
 *
 * Cada tira tem `1/n` da largura e leva lá dentro a imagem à largura TOTAL,
 * deslocada `-i` tiras para a esquerda. É o mesmo ficheiro `n` vezes — o
 * browser descarrega-o uma vez só e reutiliza-o das restantes.
 *
 * ## Porque o afastamento é `clip-path` e não largura ou escala
 *
 * O intervalo entre lâminas tinha de aparecer sem deformar a fotografia.
 * `scaleX` esticava-a; mexer na largura obrigava o browser a refazer o
 * layout a cada quadro. O `clip-path` recorta as bordas sem tocar no
 * conteúdo nem no layout, e corre no compositor.
 *
 * Vai por variáveis CSS (`--corte`, `--raio`) e não por uma string
 * `inset(...)` inteira: o GSAP interpola números soltos com segurança, ao
 * passo que interpolar a string completa depende do formato coincidir dos
 * dois lados.
 *
 * ## Com movimento reduzido
 *
 * Não há lâminas nenhumas — sai a fotografia e mais nada. Quem pediu menos
 * animação não leva um estore a abrir.
 */

/** Quantas tiras. Sete dá o ritmo do exemplo dela sem picar a imagem: com
 *  muitas, cada uma fica estreita demais para se ler o que está lá dentro. */
const LAMINAS = 7;

/** Desvio vertical inicial de cada tira, em fração da própria altura. Não é
 *  alternado a direito (que lê como serrilha) nem aleatório (que muda entre
 *  servidor e cliente): é uma onda fixa, escrita à mão. */
const DESVIO = [-0.16, 0.1, -0.22, 0.14, -0.12, 0.18, -0.08];

export function Laminas({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tiras = gsap.utils.toArray<HTMLElement>("[data-lamina]", raiz.current);
      if (!tiras.length) return;

      gsap.fromTo(
        tiras,
        {
          yPercent: (i: number) => DESVIO[i % DESVIO.length] * 100,
          "--corte": "7%",
          "--raio": "64px",
          opacity: 0,
        },
        {
          yPercent: 0,
          "--corte": "0%",
          "--raio": "0px",
          opacity: 1,
          duration: DURACAO.imagem,
          ease: CURVA.entrada,
          stagger: STAGGER.itens,
          scrollTrigger: {
            trigger: raiz.current,
            start: PERCURSO.imagem.start,
            // Sem `scrub`: as revelações de texto do site seguem o scroll, mas
            // aqui o efeito TEM de completar. Amarrado ao scroll, quem parasse
            // a meio ficava com a fotografia partida em tiras no ecrã.
            //
            // Repete-se, a pedido dela. Os quatro tempos são
            // onEnter / onLeave / onEnterBack / onLeaveBack:
            //
            //   restart  — ao descer e entrar, recomeça do princípio;
            //   none     — ao sair por cima, fica como está;
            //   none     — ao voltar a entrar por cima, fica montada (subir
            //              não é motivo para a desfazer à frente de quem vê);
            //   reverse  — ao subir ATÉ ABAIXO do gatilho, desfaz-se.
            //
            // O quarto é o que a rearma, e é seguro porque nesse ponto ela já
            // saiu do ecrã por baixo: a separação acontece fora de vista, e da
            // próxima descida volta a juntar-se de novo.
            toggleActions: "restart none none reverse",
          },
        },
      );
    },
    { scope: raiz },
  );

  return (
    <div
      ref={raiz}
      aria-hidden={alt ? undefined : true}
      className={cn("relative overflow-hidden", className)}
      // O rácio vem do ficheiro (1683x935). Fica na folha e não em JS para o
      // espaço já estar reservado no primeiro pintar — sem isto a lista por
      // baixo saltava quando a imagem chegasse.
      style={{ aspectRatio: "1683 / 935" }}
    >
      {Array.from({ length: LAMINAS }, (_, i) => (
        <div
          key={i}
          data-lamina
          className="absolute inset-y-0 will-change-transform"
          style={{
            left: `${(i * 100) / LAMINAS}%`,
            width: `${100 / LAMINAS}%`,
            clipPath: "inset(0 var(--corte, 0%) 0 var(--corte, 0%) round var(--raio, 0px))",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={i === 0 ? alt : ""}
            className="absolute inset-y-0 max-w-none"
            style={{ width: `${LAMINAS * 100}%`, left: `${-i * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}
