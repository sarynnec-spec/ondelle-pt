"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { CURVA, DURACAO, STAGGER } from "@/lib/animations";

export type Retrato = {
  /** `null` enquanto não houver fotografia real — a moldura fica no tom da marca. */
  readonly src: string | null;
  readonly alt: string;
  /** Linha grande por baixo da moldura. */
  readonly nome: string;
  /** Linha pequena. A fotografia de grupo não leva nenhuma. */
  readonly papel?: string;
  /** Texto de apresentação. Só a primeira fotografia dela o leva. */
  readonly bio?: string;
};

/**
 * Moldura que troca de retrato virando lâminas verticais.
 *
 * É a mesma linguagem do `Laminas` da filosofia — a fotografia partida em
 * tiras — mas aqui as tiras não se juntam: **rodam sobre si próprias** e do
 * outro lado está a fotografia seguinte. Como cada uma roda com o seu atraso,
 * a passagem varre a moldura de um lado ao outro em vez de acontecer toda ao
 * mesmo tempo.
 *
 * ## Porque cada lâmina tem DUAS faces
 *
 * A alternativa era rodar até ficar de perfil, trocar a fotografia e voltar.
 * Não funciona com atraso entre lâminas: a troca é uma só mudança de estado e
 * apanharia a meio caminho todas as tiras que ainda não chegaram ao perfil,
 * que mudariam de imagem à vista. Com a seguinte já montada no verso, cada
 * lâmina revela-a quando lhe chega a vez, sozinha.
 *
 * ## Porque o reposicionamento é `useLayoutEffect`
 *
 * Ao fim da volta a fotografia da frente passa a ser a que estava no verso, e
 * a rotação tem de voltar a zero. Feito num `useEffect` normal, havia um
 * quadro pintado com a rotação ainda em 180° e a frente já trocada — via-se
 * um salto. O `useLayoutEffect` corre depois do DOM e ANTES de pintar.
 *
 * ## Movimento reduzido
 *
 * Quem o pediu fica com a primeira fotografia, parada e inteira. Uma troca
 * automática não se pode dispensar com um clique, por isso não é de impor a
 * quem declarou que não a quer.
 */

/** Quantas lâminas. O mesmo número da filosofia, para o site ter um só gesto. */
const LAMINAS = 7;

/**
 * Raio dos cantos de cada lâmina — o contorno que ela pediu para manter.
 *
 * 14px é o mesmo valor das molduras com contorno do site (`Surface`), por isso
 * não introduz uma forma nova. Fica sempre: ao contrário da filosofia, onde os
 * cantos vão a zero para a fotografia fechar sem costura, aqui as lâminas são
 * para se lerem como peças separadas.
 */
const RAIO = 14;

export function RetratoRotativo({
  retratos,
  intervalo = 5000,
  aspeto = "4 / 5",
  sizes = "(min-width: 768px) 40vw, 100vw",
  className,
}: {
  retratos: readonly Retrato[];
  /** Milissegundos em cada fotografia. */
  intervalo?: number;
  aspeto?: string;
  sizes?: string;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const raiz = useRef<HTMLDivElement>(null);
  const moldura = useRef<HTMLDivElement>(null);
  /** Impede que uma volta comece antes de a anterior acabar. */
  const aRodar = useRef(false);

  const comFoto = retratos.filter((r) => r.src !== null);
  const total = comFoto.length;
  const atual = comFoto[i % total] ?? retratos[0];
  const proximo = comFoto[(i + 1) % total] ?? atual;

  // A rotação volta a zero DEPOIS de a frente trocar e ANTES de pintar.
  useLayoutEffect(() => {
    if (!moldura.current) return;
    gsap.set(moldura.current.querySelectorAll("[data-lamina-retrato]"), { rotateY: 0 });
    aRodar.current = false;
  }, [i]);

  useGSAP(
    () => {
      if (total < 2 || prefersReducedMotion()) return;
      const el = raiz.current;
      if (!el) return;

      const virar = () => {
        if (aRodar.current) return;
        const tiras = moldura.current?.querySelectorAll("[data-lamina-retrato]");
        if (!tiras?.length) return;
        aRodar.current = true;
        gsap.to(tiras, {
          rotateY: 180,
          duration: DURACAO.subtitulo,
          ease: CURVA.entrada,
          stagger: STAGGER.itens,
          onComplete: () => setI((n) => n + 1),
        });
      };

      let relogio: ReturnType<typeof setInterval> | null = null;
      const parar = () => {
        if (relogio) clearInterval(relogio);
        relogio = null;
      };
      // Um temporizador a correr numa secção que ninguém vê é bateria deitada
      // fora. O observador liga e desliga o ciclo.
      const arrancar = () => {
        if (!relogio) relogio = setInterval(virar, intervalo);
      };

      const io = new IntersectionObserver((e) => (e[0].isIntersecting ? arrancar() : parar()));
      io.observe(el);
      return () => {
        parar();
        io.disconnect();
      };
    },
    { scope: raiz, dependencies: [total, intervalo] },
  );

  return (
    <div ref={raiz} className={className}>
      <div
        ref={moldura}
        className="relative w-full"
        // A perspetiva vive na moldura e não nas lâminas: partilhada, todas
        // rodam para o mesmo ponto de fuga e o movimento lê-se como um só
        // objeto. Em cada uma, cada tira teria a sua e o conjunto empenava.
        style={{ aspectRatio: aspeto, perspective: "1400px" }}
      >
        {Array.from({ length: LAMINAS }, (_, n) => (
          <div
            key={n}
            data-lamina-retrato
            className="absolute inset-y-0 will-change-transform"
            style={{
              left: `${(n * 100) / LAMINAS}%`,
              width: `${100 / LAMINAS}%`,
              transformStyle: "preserve-3d",
            }}
          >
            {[atual, proximo].map((r, face) => (
              <div
                key={face}
                className="absolute inset-0 overflow-hidden bg-fundo-2"
                style={{
                  borderRadius: RAIO,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: face === 1 ? "rotateY(180deg)" : undefined,
                }}
              >
                {/* A fatia: a fotografia à largura TOTAL da moldura, empurrada
                    para a esquerda tantas lâminas quantas as que já passaram.
                    É o mesmo ficheiro em todas — uma descarga só. */}
                <div
                  className="absolute inset-y-0"
                  style={{ width: `${LAMINAS * 100}%`, left: `${-n * 100}%` }}
                >
                  {r.src ? (
                    <Image
                      src={r.src}
                      alt=""
                      aria-hidden
                      fill
                      sizes={sizes}
                      className="object-cover"
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* `key` pelo CONTEÚDO e não pelo índice: remontar é o que faz o
          esbatimento correr de novo, mas só deve correr quando o texto muda
          mesmo. Há três retratos seguidos com o mesmo nome — pela contagem de
          voltas, a legenda reanimava nas três e lia-se como um piscar. */}
      <p
        key={atual.nome}
        className="mt-6 animate-[surgir_0.7s_ease-out_both] font-display text-[length:var(--text-sub)]"
      >
        {atual.nome}
      </p>
      {atual.papel ? (
        <p key={atual.papel} className="label mt-2 animate-[surgir_0.7s_ease-out_both] text-fundo/45">
          {atual.papel}
        </p>
      ) : null}
      {atual.bio ? (
        <p
          key={atual.bio}
          className="mt-5 max-w-[46ch] animate-[surgir_0.7s_ease-out_both] leading-[1.62] text-fundo/65"
        >
          {atual.bio}
        </p>
      ) : null}
    </div>
  );
}
