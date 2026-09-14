"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { scrollSignal } from "@/lib/scroll-signal";

/**
 * Um único ponto de verdade para o scroll.
 *
 * O erro clássico é o ScrollTrigger ler a posição nativa enquanto o Lenis
 * interpola — daí o `autoRaf: false` e o RAF conduzido pelo ticker do GSAP.
 * Dois loops a competir produzem jitter.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    document.documentElement.classList.add("js-ready");

    const reduced = prefersReducedMotion();
    const lenis = lenisRef.current?.lenis;

    if (reduced) {
      // Scroll interpolado provoca desconforto vestibular real. Desligar.
      lenis?.destroy();
      return;
    }

    // Se a instância ainda não existe, sair aqui deixaria o Lenis a
    // capturar a roda do rato sem nada a fazê-lo avançar — a página
    // ficava presa no desktop. Com `autoRaf` ligado, o loop é do Lenis e
    // não depende deste efeito.
    if (!lenis) return;

    // Uma única subscrição alimenta o ScrollTrigger e a cena 3D.
    lenis.on("scroll", () => {
      ScrollTrigger.update();
      const v = lenis.velocity / 34;
      scrollSignal.velocity = Math.max(-1, Math.min(1, v));
    });

    // O foco por teclado dispara scrollIntoView nativo, que o Lenis ignora.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const rect = target.getBoundingClientRect();
      const offscreen = rect.top < 0 || rect.bottom > window.innerHeight;
      if (offscreen) lenis.scrollTo(target, { immediate: true, offset: -120 });
    };
    document.addEventListener("focusin", onFocusIn);

    // Parallax global: qualquer elemento com `data-parallax` desloca-se a
    // uma fração do scroll. Um só lugar em vez de repetir em cada secção,
    // e sempre por `transform`.
    const parallaxes = gsap.utils.toArray<HTMLElement>("[data-parallax]").map((el) => {
      const forca = parseFloat(el.dataset.parallax || "0.12");
      return gsap.fromTo(
        el,
        { yPercent: -forca * 50 },
        {
          yPercent: forca * 50,
          ease: "none",
          scrollTrigger: {
            trigger: el.closest("section") ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );
    });

    // Posições de trigger ficam erradas se as fontes chegarem depois.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    /**
     * E ficam erradas outra vez a cada imagem que chega.
     *
     * As fotografias são `lazy`: só descarregam quando se aproximam do ecrã,
     * ou seja MUITO depois do `load`. Cada uma que chega pode mudar a altura
     * do documento, e o ScrollTrigger continua a usar as coordenadas que
     * mediu no início — o `pin` da secção Rosto passava a prender e a soltar
     * no sítio errado, e via-se a fotografia a entrar tarde com o ecrã branco
     * por baixo.
     *
     * O evento `load` das imagens não borbulha, mas é captável na fase de
     * captura. Agrupado em 250ms para que uma grelha de catorze cartões a
     * chegar ao mesmo tempo custe um recálculo e não catorze.
     */
    let agendado: ReturnType<typeof setTimeout> | null = null;
    const refrescarDepois = () => {
      if (agendado) clearTimeout(agendado);
      agendado = setTimeout(() => {
        agendado = null;
        ScrollTrigger.refresh();
      }, 250);
    };
    const aoCarregarMedia = (e: Event) => {
      const alvo = e.target as HTMLElement | null;
      if (!alvo) return;
      const t = alvo.tagName;
      if (t === "IMG" || t === "VIDEO" || t === "IFRAME") refrescarDepois();
    };
    document.addEventListener("load", aoCarregarMedia, true);

    return () => {
      if (agendado) clearTimeout(agendado);
      document.removeEventListener("load", aoCarregarMedia, true);
      parallaxes.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("load", refresh);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: true,
        lerp: 0.095,
        smoothWheel: true,
        touchMultiplier: 1.4,
        // Sem isto, clicar no menu faz o salto nativo: a página muda de
        // sítio de repente e o destino fica por baixo do cabeçalho fixo. O
        // recuo de 120px cobre os 116px do cabeçalho em desktop e deixa
        // folga nos 92px do telemóvel — o mesmo valor do `focusin` acima.
        anchors: { offset: -120 },
      }}
    >
      {children}
    </ReactLenis>
  );
}
