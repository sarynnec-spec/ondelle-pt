"use client";

import { useEffect, useRef } from "react";

import { ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Corrida horizontal comandada pelo scroll vertical.
 *
 * A secção fica alta o suficiente para haver percurso, o filho fica `sticky`
 * a ocupar o ecrã, e a faixa lá dentro desloca-se para a esquerda à medida
 * que se rola. Quem rola sente que continua a descer; o que atravessa o ecrã
 * é o conteúdo, na horizontal.
 *
 * ## Porque não é o `HorizontalScroll` que já existe
 *
 * O site tem um (`motion/horizontal-scroll.tsx`, na secção dos rituais) e faz
 * o mesmo com `ScrollTrigger` + `pin`. Não foi reutilizado aqui por uma razão
 * concreta: este bloco envolve a cúpula, que tem `ScrollTrigger`s próprios. O
 * `pin` do GSAP substitui o elemento por um espaçador e reescreve as posições
 * de tudo o que está dentro — os gatilhos da cúpula passariam a ser medidos
 * contra um elemento congelado. `position: sticky` não mexe no documento: as
 * posições que o ScrollTrigger calculou continuam válidas.
 *
 * Também evita um segundo `pin` na mesma página, que é onde estes dois
 * sistemas costumam entrar em conflito.
 *
 * ## Um só `requestAnimationFrame`, e só quando está à vista
 *
 * A página já tem o loop do shader das flores. Este arranca no
 * `IntersectionObserver` e pára assim que a secção sai do ecrã e a
 * interpolação assenta — fora da secção custa zero.
 *
 * A leitura de `getBoundingClientRect()` é **uma por quadro**, e nada é
 * escrito no DOM antes dela: ler e escrever alternadamente no mesmo quadro é
 * o que provoca layout thrashing.
 */

/**
 * Suavização por quadro. O Lenis já interpola o scroll (`lerp: 0.095`), por
 * isso isto é uma segunda camada e tem de ser leve — baixo de mais e a faixa
 * fica a arrastar-se atrás do dedo, o que se lê como atraso e não como
 * suavidade.
 */
const SUAVIZACAO = 0.14;

/** Abaixo disto encosta ao alvo e o loop adormece. */
const ASSENTE = 0.05;

/**
 * Fração do percurso guardada para o fim, onde a faixa já não anda.
 *
 * Sem ela a corrida terminava tarde de mais. O `sticky` solta-se quando o
 * fundo da secção alcança o fundo do ecrã, e nesse instante a suavização
 * ainda vinha atrás: medido a 1440, a secção já estava a subir (topo a
 * −1465) com a faixa em −1399 de −1440. Os últimos 40px de deslocamento
 * lateral aconteciam com o painel a sair do ecrã.
 *
 * Com a reserva, o percurso completa-se antes de a secção começar a sair e
 * sobra um trecho curto em que o último painel fica quieto e inteiro — que é
 * também o remate pedido: o conteúdo final permanece visível antes de a
 * página retomar a vertical.
 */
const RESERVA = 0.12;

export function HorizontalExperience({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  const secao = useRef<HTMLElement>(null);
  const faixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = secao.current;
    const track = faixa.current;
    if (!sec || !track) return;

    // Com movimento reduzido a faixa fica em coluna (ver CSS abaixo): não há
    // percurso para percorrer e a secção volta à altura natural.
    if (prefersReducedMotion()) return;

    let distancia = 0;
    let alvo = 0;
    let atual = 0;
    let visivel = false;
    let quadro = 0;

    const preso = sec.firstElementChild as HTMLElement;
    let alturaPresa = 0;

    /** Só aqui se escreve altura — nunca dentro do loop. */
    const medir = () => {
      // A altura vem do elemento preso, não de `window.innerHeight`: em
      // telemóvel o `h-svh` é o ecrã PEQUENO e o `innerHeight` é o atual, que
      // muda com as barras do browser. Misturar os dois punha a libertação do
      // sticky num sítio diferente do previsto pela conta.
      alturaPresa = preso.offsetHeight;
      distancia = Math.max(0, track.scrollWidth - window.innerWidth);
      const nova = alturaPresa + distancia;
      const antiga = parseFloat(sec.style.height) || 0;
      sec.style.height = `${nova}px`;
      if (distancia === 0) track.style.transform = "";

      // Avisar o ScrollTrigger de que o documento mudou de tamanho.
      //
      // Esta secção decide a própria altura aqui, em JS, e cresce mais de mil
      // pixéis — é o percurso da corrida horizontal. O ScrollTrigger já tinha
      // medido a página ANTES disso, por isso todos os gatilhos abaixo ficavam
      // deslocados por essa diferença. O mais visível era o `pin` do Rosto:
      // dava-se por terminado cedo de mais e deixava o elemento com o
      // deslocamento do fim já aplicado, ou seja mil pixéis de espaçador vazio
      // por cima da fotografia — o ecrã branco.
      //
      // Só quando o valor muda, senão o `ResizeObserver` entrava em ciclo:
      // recalcular mexe em alturas, que voltam a disparar o observador.
      if (Math.abs(nova - antiga) > 1) ScrollTrigger.refresh();
    };

    const desenhar = () => {
      const caixa = sec.getBoundingClientRect();
      // O denominador é encurtado pela reserva: a faixa chega ao fim antes de
      // a secção se soltar, e o resto do percurso é o painel final parado.
      const percurso = (caixa.height - alturaPresa) * (1 - RESERVA);
      const progresso = percurso > 0 ? Math.min(1, Math.max(0, -caixa.top / percurso)) : 0;
      alvo = progresso * distancia;

      const falta = alvo - atual;
      atual = Math.abs(falta) < ASSENTE ? alvo : atual + falta * SUAVIZACAO;
      track.style.transform = `translate3d(${-atual}px, 0, 0)`;

      // Dorme quando já não há nada a perseguir. O scroll acorda-o.
      if (visivel && Math.abs(alvo - atual) >= ASSENTE) quadro = requestAnimationFrame(desenhar);
      else quadro = 0;
    };

    const acordar = () => {
      if (!quadro && visivel) quadro = requestAnimationFrame(desenhar);
    };

    medir();
    // Sem o primeiro desenho, entrar na secção a meio (recarregar a página
    // com o scroll restaurado) mostrava a faixa no princípio até se mexer.
    desenhar();

    const io = new IntersectionObserver(
      (e) => {
        visivel = e[0].isIntersecting;
        acordar();
      },
      { rootMargin: "200px" },
    );
    io.observe(sec);

    window.addEventListener("scroll", acordar, { passive: true });

    const ro = new ResizeObserver(() => {
      medir();
      acordar();
    });
    ro.observe(track);

    return () => {
      if (quadro) cancelAnimationFrame(quadro);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", acordar);
      sec.style.height = "";
      track.style.transform = "";
    };
  }, []);

  return (
    <section
      ref={secao}
      aria-label={label}
      className={cn("horizontal-experience relative", className)}
    >
      {/* `max-md:h-lvh`: em telemóvel o painel passa a medir-se pela altura
          GRANDE do ecrã, não pela pequena.

          O `svh` é a altura de quando a barra do browser está aberta. No iOS,
          ao rolar, a barra encolhe e a área visível cresce — e o painel, preso
          a `svh`, ficava mais curto do que o ecrã. A diferença (~116px medidos
          num iPhone de 430pt) aparecia como faixa branca por baixo, com a
          figura recortada no limite do painel a parecer que flutuava.

          `lvh` e não `dvh` de propósito: o `dvh` muda enquanto se rola, e a
          altura daqui é lida em `medir()` para calcular o percurso — mudá-la a
          meio do scroll dava recálculos e solavancos. O `lvh` é fixo, cobre a
          área visível nos dois estados da barra, e no estado aberto o que
          sobra fica apenas fora do ecrã, que é o comportamento normal.

          Só em telemóvel: em computador `svh`, `lvh` e `vh` são o mesmo valor,
          por isso nada muda lá. */}
      <div className="horizontal-sticky sticky top-0 h-svh overflow-hidden max-md:h-lvh">
        <div ref={faixa} className="horizontal-track flex h-full will-change-transform">
          {children}
        </div>
      </div>

      <style>{`
        /* Com movimento reduzido os painéis empilham-se e a secção volta ao
           fluxo normal — nada fica inacessível. O efeito nunca chega a ligar
           nesse caso, por isso não há altura inline para desfazer. */
        @media (prefers-reduced-motion: reduce) {
          .horizontal-experience { height: auto !important; }
          .horizontal-experience .horizontal-sticky { position: static; height: auto; }
          .horizontal-experience .horizontal-track { flex-direction: column; }
          .horizontal-experience .painel-horizontal { width: 100%; height: auto; }
        }

        /* Abaixo de 1200 px acontece o mesmo, e pela mesma razão do cabeçalho:
           os painéis são \`w-screen\` e a figura é posicionada em absoluto à
           conta de um ecrã largo. Em tablet ao alto ela passava POR CIMA do
           texto — "O seu rosto não precisa de ser transformado" ficava ilegível
           sobre a fotografia clara. Empilhados, os painéis voltam ao fluxo e
           cada um fica com a largura toda. */
        @media (max-width: 1199px) {
          .horizontal-experience { height: auto !important; }
          .horizontal-experience .horizontal-sticky { position: static; height: auto; }
          .horizontal-experience .horizontal-track { flex-direction: column; }
          .horizontal-experience .painel-horizontal { width: 100%; height: auto; }
        }
      `}</style>
    </section>
  );
}

/**
 * Um painel da faixa. Largura de um ecrã, altura do sticky.
 *
 * `w-screen` e não `w-full`: dentro de um `flex` a largura percentual seria
 * calculada contra a faixa, que é maior do que o ecrã.
 */
export function PainelHorizontal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("painel-horizontal h-full w-screen shrink-0 overflow-hidden", className)}>
      {children}
    </div>
  );
}
