"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { cn, pad } from "@/lib/utils";

/**
 * Contador fixo de progresso: número da secção activa, total, e um traço
 * que enche ao longo da página. O traço anima por `scaleY` (transform),
 * não por `height`.
 */
export function ProgressCounter({ ids, labels }: { ids: readonly string[]; labels: readonly string[] }) {
  const [index, setIndex] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  /** A barra do telemóvel. Ver o comentário do `return`. */
  const barraMovel = useRef<HTMLDivElement>(null);
  const digits = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      // As secções vivem fora deste componente. Com `scope` activo, um
      // seletor em string seria procurado dentro do subtree — daí resolver
      // o elemento explicitamente.
      const triggers = ids
        .map((id, i) => {
          const el = document.getElementById(id);
          if (!el) return null;
          return ScrollTrigger.create({
            trigger: el,
            start: "top 55%",
            end: "bottom 55%",
            onEnter: () => setIndex(i),
            onEnterBack: () => setIndex(i),
          });
        })
        .filter(Boolean) as ScrollTrigger[];

      const progress = ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (bar.current) bar.current.style.transform = `scaleY(${self.progress})`;
          if (barraMovel.current) barraMovel.current.style.transform = `scaleX(${self.progress})`;
        },
      });

      return () => {
        triggers.forEach((t) => t.kill());
        progress.kill();
      };
    },
    { scope: root, dependencies: [ids] },
  );

  /**
   * Recua quando tem texto por baixo.
   *
   * O contador é fixo no canto inferior esquerdo e a página não lhe reserva
   * espaço nenhum, por isso ia parar em cima de títulos, parágrafos e até de
   * campos do formulário — medido em 113 de 175 pontos de scroll.
   *
   * A deteção é por COLISÃO REAL, não por coordenadas: em cada quadro
   * pergunta-se ao browser o que está pintado em nove pontos dentro da caixa
   * do contador e, se algum deles for texto ou um controlo, ele apaga-se. É o
   * que o mantém correto num layout que muda de forma com a largura do ecrã —
   * uma lista de posições Y estaria errada no primeiro `resize`.
   *
   * `elementsFromPoint` devolve a pilha toda, e é preciso: o primeiro
   * elemento é quase sempre o próprio contador ou um pai sem texto. Só se
   * olha para os nove pontos, não para a árvore inteira, por isso o custo por
   * quadro é constante.
   */
  const [recuado, setRecuado] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const TEXTO = new Set(["H1", "H2", "H3", "H4", "P", "A", "LI", "LABEL", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "ADDRESS"]);
    // Fotografia e vídeo contam como conflito tanto quanto o texto. O
    // contador é branco em `mix-blend-difference`, que sobre uma imagem
    // inverte cor a cada pixel e fica ilegível — e, medido, é o caso mais
    // frequente: 94 dos 175 pontos de scroll têm fotografia por baixo, contra
    // 39 com texto. Deixá-lo só a fugir do texto resolvia menos de metade.
    const MEDIA = new Set(["IMG", "VIDEO", "CANVAS"]);
    let agendado = 0;

    const colide = () => {
      agendado = 0;
      const c = el.getBoundingClientRect();
      if (!c.width) return;
      // Uma margem à volta: encostar sem tocar também se lê como sujo.
      const m = 10;
      const xs = [c.left - m, (c.left + c.right) / 2, c.right + m];
      const ys = [c.top - m, (c.top + c.bottom) / 2, c.bottom + m];
      let bate = false;
      for (const x of xs) {
        for (const y of ys) {
          if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
          for (const alvo of document.elementsFromPoint(x, y)) {
            if (el.contains(alvo)) continue;
            if (MEDIA.has(alvo.tagName)) {
              bate = true;
              break;
            }
            if (!TEXTO.has(alvo.tagName)) continue;
            // Um elemento sem texto visível (uma âncora que só embrulha uma
            // imagem, por exemplo) não é conflito.
            const t = (alvo.textContent || (alvo as HTMLInputElement).placeholder || "").trim();
            if (!t && alvo.tagName !== "INPUT" && alvo.tagName !== "SELECT") continue;
            bate = true;
            break;
          }
          if (bate) break;
        }
        if (bate) break;
      }
      setRecuado((antes) => (antes === bate ? antes : bate));
    };

    const pedir = () => {
      if (!agendado) agendado = requestAnimationFrame(colide);
    };

    colide();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      if (agendado) cancelAnimationFrame(agendado);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, []);

  // Pequeno salto no número a cada mudança de secção.
  useGSAP(
    () => {
      if (!digits.current) return;
      gsap.fromTo(
        digits.current,
        { yPercent: 45, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.5, ease: "expo.out" },
      );
    },
    { dependencies: [index] },
  );

  return (
    <>
    {/* Telemóvel: um fio de progresso colado à borda inferior do ecrã.
        O contador com número e etiqueta nunca apareceu em telemóvel — não há
        margem lateral onde o pousar sem ficar por cima da coluna de texto,
        que ocupa a largura toda. Em vez de o deixar sem nada, fica a mesma
        informação reduzida ao essencial: quanto falta. Encostado à aresta,
        com 2px, não tem como tapar conteúdo. */}
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-0.5 bg-white/10 mix-blend-difference md:hidden"
    >
      <div
        ref={barraMovel}
        className="h-full origin-left bg-white/70 will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
    </div>

    <div
      ref={root}
      aria-hidden
      className={cn(
        "pointer-events-none fixed bottom-8 left-[var(--spacing-gutter)] z-40 hidden items-end gap-4 mix-blend-difference transition-[opacity,transform] duration-200 ease-out md:flex",
        // Não desaparece de vez: recua para a margem e esbate-se. Quem estava
        // a segui-lo percebe que continua ali; quem está a ler deixa de o ter
        // em cima do texto.
        recuado ? "-translate-x-3 opacity-0" : "translate-x-0 opacity-100",
      )}
    >
      <div className="relative h-24 w-px bg-white/45">
        <div
          ref={bar}
          className="absolute inset-x-0 top-0 h-full origin-top bg-white will-change-transform"
          style={{ transform: "scaleY(0)" }}
        />
      </div>
      <div className="pb-0.5 text-white">
        <div className="flex items-baseline gap-1 overflow-hidden">
          <span ref={digits} className="label inline-block text-[1.05rem] leading-none">
            {pad(index)}
          </span>
          <span className="label text-[0.62rem] leading-none opacity-80">
            / {pad(ids.length - 1)}
          </span>
        </div>
        <div className="label mt-2 text-[0.6rem] opacity-85">{labels[index]}</div>
      </div>
    </div>
    </>
  );
}
