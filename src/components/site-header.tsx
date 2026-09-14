"use client";

import { useRef, useState } from "react";
import { Wordmark } from "@/components/ui/wordmark";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { brand, nav, ctaLabel } from "@/lib/content";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      // Recolhe ao descer, reaparece ao subir.
      const vidro = el.querySelector("[data-vidro]");

      const st = ScrollTrigger.create({
        start: "top -120",
        end: 99999,
        onUpdate: (self) => {
          const down = self.direction === 1;
          const longe = self.scroll() > 240;

          gsap.to(el, {
            yPercent: down && longe ? -104 : 0,
            duration: 0.45,
            ease: "power3.out",
            overwrite: true,
          });

          // O vidro só aparece depois da hero: sobre a hero seria uma
          // barra opaca a tapar a imagem.
          gsap.to(vidro, {
            autoAlpha: longe ? 1 : 0,
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto",
          });
        },
      });

      return () => st.kill();
    },
    { scope: root },
  );

  return (
    <header
      ref={root}
      className="fixed inset-x-0 top-0 z-50 will-change-transform"
    >
      {/* Faixa do cabeçalho: sólida nos dois formatos, com o vídeo a
          começar por baixo. O menu fica sobre verde (7,52:1) em vez de
          depender do que o vídeo mostrar naquele instante. A altura vem de
          `--altura-cabecalho`, que é 92px em telemóvel e 116px acima. */}
      {/* As duas pontas de baixo terminam em CURVA, com um fio de ouro a
          acompanhá-la — como na referência que ela mandou.

          O fio nasce da sobreposição e não de uma borda: a camada de baixo é
          ouro, a de cima é verde encolhida 1px em baixo. O que sobra do ouro
          é uma linha de 1px que segue a curva até às pontas. Uma `border`
          desenhava um traço reto que ignorava o raio.

          O raio é fluido (`clamp`) para a curva ter a mesma presença num
          telemóvel de 390px e num monitor largo. O mínimo são 32px: a menos
          do que isso, numa faixa de 83px de altura, a curva não se lê. O
          tecto são ~41px, metade da altura — a partir daí as pontas fecham
          em meia-lua. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[var(--altura-cabecalho)] rounded-b-[clamp(32px,3.6vw,58px)]"
        style={{ background: "color-mix(in srgb, var(--color-ouro) 55%, transparent)" }}
      >
        <div className="absolute inset-x-0 top-0 bottom-px rounded-b-[clamp(32px,3.6vw,58px)] bg-verde" />
      </div>

      {/* Camada de vidro por trás do conteúdo do cabeçalho. */}
      <div
        data-vidro
        aria-hidden
        // `overflow-hidden` porque o desfoque do vidro não respeita os
        // cantos arredondados sem ele: a mancha desfocada escapava-se pelas
        // pontas e desenhava lá o canto reto de volta.
        className="absolute inset-0 overflow-hidden rounded-b-[clamp(32px,3.6vw,58px)] bg-verde/55 backdrop-blur-xl backdrop-saturate-150"
        style={{ opacity: 0, visibility: "hidden" }}
      />

      <div className="gutter relative flex items-center justify-between py-2.5 md:py-3.5">
        {/* Todo o cabeçalho é dourado, por isso o `mix-blend-difference`
            saiu: inverteria a cor. O contraste sobre as zonas claras do
            vídeo vem de uma sombra curta e opaca. */}
        <a href="#inicio" aria-label={`${brand.name} — home`} className="relative block">
          <Wordmark
            id="cabecalho"
            label={brand.name}
            // Sombra curta e opaca em vez de difusa: a anterior tinha 10px
            // de desfoque e lia-se como halo, o que embaciava o metal.
            // 90px e não 100 em telemóvel: dois cortes de 5% pedidos por ela
            // (100 → 95 → 90). Em computador fica nos 126px, que não foram tocados.
            className="h-auto w-[150px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] md:w-[200px]"
          />
        </a>

        {/* Sem `mix-blend-difference`: com texto dourado, esse modo
            inverteria a cor. A legibilidade sobre as zonas claras do vídeo
            passa a vir da sombra curta. */}
        {/* Centrado a sério: com `justify-between`, o logótipo e o botão
            têm larguras diferentes e empurravam o menu para fora do eixo.

            O corte é aos 1200 px e não no `md` (768) nem no `lg` (1024).
            MEDIDO a 2026-09-08, com o menu a `md:flex`: a navegação está
            centrada em absoluto, por isso a sua largura não empurra nada —
            simplesmente passa POR CIMA do logótipo à esquerda e do botão à
            direita. As colisões, largura a largura:

              768 px  marca até 232 · nav 54..714  · botão desde 551   choca
              834 px  marca até 235 · nav 87..747  · botão desde 614   choca
              900 px  marca até 238 · nav 120..780 · botão desde 677   choca
             1024 px  marca até 243 · nav 182..842 · botão desde 796   choca
             1100 px  marca até 246 · nav 220..880 · botão desde 869   choca
             1200 px  marca até 250 · nav 270..930 · botão desde 965   ok

            Aos 1200 sobram 35 px de folga do lado do botão, que é o lado
            apertado. Abaixo disso o tablet fica com o menu de hambúrguer, que
            é o que já servia o telemóvel. */}
        <nav
          aria-label="Principal"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 min-[1200px]:flex"
        >
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              // O `-mr-[0.2em]` anula o espaço que o `letter-spacing` deixa
              // depois da última letra — sem isso os intervalos parecem
              // desiguais mesmo com `gap` igual.
              className="label ouro-metal -mr-[0.2em] transition-opacity duration-300 hover:opacity-75"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
          <a
            href="#marcacao"
            className="label ouro-metal hidden rounded-full border border-ouro/50 px-5 py-2.5 transition-opacity duration-300 hover:opacity-75 sm:inline-block"
          >
            {ctaLabel}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movel"
            className="label ouro-metal rounded-full border border-ouro/50 px-4 py-2.5 min-[1200px]:hidden"
          >
            {open ? "Fechar" : "Menu"}
          </button>
        </div>
      </div>

      <div
        id="menu-movel"
        hidden={!open}
        className={cn("gutter bg-verde pb-8 pt-4 min-[1200px]:hidden", open && "block")}
      >
        <nav aria-label="Principal (telemóvel)" className="flex flex-col gap-5">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-display text-3xl text-fundo"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#marcacao"
            onClick={() => setOpen(false)}
            className="label ouro-metal mt-2 rounded-full border border-ouro/50 px-5 py-3 text-center"
          >
            {ctaLabel}
          </a>
        </nav>
      </div>
    </header>
  );
}
