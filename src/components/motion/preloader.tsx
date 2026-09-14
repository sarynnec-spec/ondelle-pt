"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { abertura, brand } from "@/lib/content";
import { Wordmark } from "@/components/ui/wordmark";

/**
 * Abertura: o logótipo no portal de luz, que abre sobre o site.
 *
 * ## Entrada arquitetónica: NASCE DO CHÃO → CRESCE → ARCO → PAUSA → AMPLIA
 *
 * Duas decisões geométricas sustentam o efeito:
 *
 *   · a base do vão vive FORA do viewport (H + FORA), por isso nunca há
 *     linha horizontal de rodapé e a porta parece nascer do chão;
 *   · o traço da moldura é um caminho ABERTO — sem `Z` — para a borda
 *     inferior não ser desenhada.
 *
 * ## Porque já não há vídeo aqui
 *
 * O `videoinicio.mp4` trazia um foco de luz no fundo — canal verde de 26 nos
 * cantos a 67 no topo-centro, contra 50 do verde da casa — que se lia como
 * uma mancha. Cinco tentativas de o domar falharam: pintar o portal com a
 * cor média do filme, remover-lhe o fundo por `lighten`, uma cópia desfocada
 * a cobrir o ecrã, faixas com a linha de verde esticada, e um véu em
 * degradê. A mancha sobrevivia a todas porque não é uniforme.
 *
 * O PNG transparente resolve por não haver fundo nenhum.
 * **Não reintroduzir o vídeo aqui.**
 *
 * ## A entrada do logótipo
 *
 * Segue a sequência que ela desenhou a partir de uma referência em 3D:
 * pequena → profundidade → movimento 3D → brilho → posição final → portal.
 *
 * O 3D é feito com `transformPerspective` e rotação em Y/X, não com WebGL.
 * A razão não é preguiça: uma cena Three.js no preloader obrigaria a um
 * `logo.glb` que não existe, e esta página já corre uma cena 3D noutra
 * secção — duas ao mesmo tempo é onde a GPU de um telemóvel de gama média
 * começa a falhar. Com perspetiva em CSS a leitura é a mesma e o custo é
 * praticamente nulo.
 *
 * ## E é dimensionado PELO VÃO, não pela viewport
 *
 * `LOGO_DO_VAO` é a fração da largura do vão que ele ocupa. Amarrá-lo ao vão
 * em vez de a `vw` é o que garante que fica dentro do arco em qualquer ecrã:
 * o vão é proporcionalmente mais estreito em telemóvel, e um tamanho em `vw`
 * transbordava lá.
 */

/** A cor do portal: o verde da casa. */
const VERDE_PORTAL = "var(--color-verde)";

/** Quanto a base fica abaixo do limite inferior, em px. */
const FORA = 80;

/** Larguras de ecrã entre as quais tudo o que é responsivo aqui interpola. */
const MOBILE = 480;
const DESKTOP = 1024;

function progressoEcra(vw: number) {
  return Math.min(1, Math.max(0, (vw - MOBILE) / (DESKTOP - MOBILE)));
}

/**
 * Altura visível do vão no fim do crescimento, em % da altura do ecrã.
 * Em telemóvel é −15%: num ecrã estreito e alto, os mesmos 66% davam um
 * portal esguio de mais.
 */
const ALTURA_FINAL_DESKTOP = 66;
// Em telemóvel o vão é mais BAIXO do que os 85% de outrora (56,1% da altura
// do ecrã): a 44% fica com a proporção da fotografia e deixa de a cortar.
// Reposta a altura original a pedido dela: 85% da de computador, ou seja
// 56,1% da altura do ecrã. Cheguei a descê-la para 42% para o vão ficar com
// a proporção da fotografia — com a altura de volta, a fotografia volta a
// ser cortada pelos lados (ver medição no relatório).
const ALTURA_FINAL_MOVEL = ALTURA_FINAL_DESKTOP * 0.85 * 1.02 * 1.05;

function alturaFinal(vw: number) {
  return ALTURA_FINAL_MOVEL + (ALTURA_FINAL_DESKTOP - ALTURA_FINAL_MOVEL) * progressoEcra(vw);
}

/** Pausa antes de o arco nascer — o tempo de a marca se ler sozinha. */
const INTRO = 0.4;

/** Quanto da largura do vão o logótipo ocupa. Ver a nota no cabeçalho. */
// Fração da largura do vão ocupada pelo logótipo, agora responsiva.
//
// Em computador foi descido mais um pouco (0,5775 → 0,50) porque a marca
// encostava ao fio do arco: a faixa acima do portal é curta em desktop
// (34% da altura) e um logótipo grande fica lá dentro sem respirar.
//
// No telemóvel fica no valor anterior — lá o portal já cresceu 20% em
// largura, e o logótipo cresceu com ele, que era o pedido.
const LOGO_DO_VAO_DESKTOP = 0.5;
const LOGO_DO_VAO_MOVEL = 0.5775;

function logoDoVao(vw: number) {
  return LOGO_DO_VAO_MOVEL + (LOGO_DO_VAO_DESKTOP - LOGO_DO_VAO_MOVEL) * progressoEcra(vw);
}


/** Segundo em que a porta acaba de abrir (duração do tween das fases 1 e 2). */
/** Quando a porta COMEÇA a abrir. Só depois de a marca sair de cena. */
const ABRE_INICIO = 2.4;
/** Quanto tempo demora a abrir. */
const ABRE_DURACAO = 3.2;
/** Quando a porta está aberta. */
const ABRE = ABRE_INICIO + ABRE_DURACAO;

const PAUSA_FOTO = 5;

/**
 * Quanto o logótipo sobe ACIMA do lugar dele, em centímetros, depois de a
 * porta estar aberta. Pedido dela para computador.
 *
 * O CSS define 1cm como 96/2.54 = 37,8px, e é essa a conversão usada. Só se
 * aplica em ecrã largo (`progressoEcra`) e é travada para o logótipo nunca
 * sair pelo topo: numa janela baixa não há 3cm de espaço acima do portal, e
 * sem o travão a marca ficava cortada ao meio.
 */
// Pedidos 3cm, medidos, não cabiam: numa janela de portátil só há 1,7cm
// acima da marca e o travão colava-a ao topo. 1cm é o que sobe sem encostar.
const SUBIR_LOGO_CM = 1;

/** Subida extra só em telemóvel, em fração da altura do ecrã. Pedido dela. */
const SUBIR_LOGO_MOVEL = 0.05;

/** Quando o "soltar" assoma, em segundos de timeline. Não aparece de
 *  imediato: quem chega vê primeiro a abertura, e só depois lhe é oferecida
 *  a saída. Aparecer ao mesmo tempo que a marca era convidar a saltá-la. */
const ENTRADA_SOLTAR = 3;
const PX_POR_CM = 96 / 2.54;

/** Segundo em que o logótipo começa a subir para o lugar dele. */
const SUBIDA_LOGO = 0;

/**
 * Largura do vão, responsiva. Em telemóvel a fração leva +14% (7% de cada
 * lado), porque um vão estreito e alto lia-se como fresta.
 */
function largura(vw: number) {
  const FRACAO_MOBILE = 0.71;
  const FRACAO_DESKTOP = 0.253;
  const fracao = FRACAO_MOBILE + (FRACAO_DESKTOP - FRACAO_MOBILE) * progressoEcra(vw);
  const bruta = vw * fracao;

  // TRAVÃO PELA BORDA DOURADA.
  //
  // O vão traz dois arcos concêntricos por fora, a 7,5% e a 16,1% da própria
  // largura de cada lado: o conjunto ocupa 1,3225 × a largura do vão. Num
  // telemóvel isso ultrapassava o fio dourado da página, que está recuado
  // `r` do verde do ecrã. Aqui a largura é limitada para o arco de fora
  // ACABAR no fio, alinhado com ele, em vez de passar por cima.
  const r = Math.max(14, vw * 0.022);
  const maxima = (vw - 2 * r) / 1.3225;
  return Math.min(bruta, maxima);
}
/**
 * `alturaVH` mede a altura VISÍVEL acima do limite inferior do ecrã. Com
 * altura pequena só assoma a coroa do arco — é isso que dá a leitura de uma
 * porta a emergir do chão.
 */
function caminho(vw: number, vh: number, alturaVH: number, fechado: boolean, fora = 0) {
  const w = largura(vw);
  // `fora` afasta o contorno para lá do vão mantendo a geometria: é assim
  // que nascem os ecos concêntricos.
  const r = w / 2 + fora;
  const cx = vw / 2;
  const base = vh + FORA;
  const topo = vh - (alturaVH / 100) * vh - fora;
  const ombro = topo + r;
  const d =
    `M ${cx - r} ${base} L ${cx - r} ${ombro} ` +
    `A ${r} ${r} 0 0 1 ${cx + r} ${ombro} L ${cx + r} ${base}`;
  return fechado ? `${d} Z` : d;
}

/** Moldura da página: retângulo recuado com os quatro cantos chanfrados. */
function bordaPagina(vw: number, vh: number) {
  const r = Math.max(14, Math.min(vw, vh) * 0.022);
  const c = Math.max(16, Math.min(vw, vh) * 0.028);
  return (
    `M ${r + c} ${r} L ${vw - r - c} ${r} L ${vw - r} ${r + c} ` +
    `L ${vw - r} ${vh - r - c} L ${vw - r - c} ${vh - r} ` +
    `L ${r + c} ${vh - r} L ${r} ${vh - r - c} L ${r} ${r + c} Z`
  );
}

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const foto = useRef<HTMLDivElement>(null);
  const linha = useRef<gsap.core.Timeline | null>(null);
  const [done, setDone] = useState(false);

  /** Deixa entrar já. A abertura é bonita uma vez; à segunda é um obstáculo. */
  const soltar = () => {
    linha.current?.kill();
    document.documentElement.classList.remove("is-loading");
    setDone(true);
  };

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const vao = el.querySelector<SVGPathElement>("[data-vao]");
      const moldura = el.querySelector<SVGPathElement>("[data-moldura]");
      const halo = el.querySelector<SVGPathElement>("[data-halo]");
      const reflexo = el.querySelector<SVGPathElement>("[data-reflexo]");
      const gradReflexo = el.querySelector<SVGLinearGradientElement>("#ouro-reflexo");
      const borda = el.querySelector<SVGPathElement>("[data-borda]");
      const eco1 = el.querySelector<SVGPathElement>("[data-eco1]");
      const eco2 = el.querySelector<SVGPathElement>("[data-eco2]");
      const grupoVao = el.querySelector<SVGGElement>("[data-vao-grupo]");
      const grupoMoldura = el.querySelector<SVGGElement>("[data-moldura-grupo]");
      const logo = el.querySelector<HTMLElement>("[data-logo]");
      const soltarEl = el.querySelector<HTMLElement>("[data-soltar]");

      const terminar = () => {
        setDone(true);
        document.documentElement.classList.remove("is-loading");
      };

      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 0 });
        terminar();
        return;
      }

      document.documentElement.classList.add("is-loading");

      // FRAME 0 — altura visível zero: a porta está inteiramente abaixo do
      // limite inferior. Nada de `scale(0)` nem `scaleY(0)`.
      const estado = { h: 0 };
      // 1 = no centro do ecrã · 0 = pousado acima do portal. É um valor e não
      // um `y` fixo em píxeis para a posição continuar certa se a janela
      // mudar de tamanho a meio da abertura.
      const subida = { v: 1 };
      const alvoAltura = alturaFinal(window.innerWidth);

      // O logótipo é centrado por transform, não por margens: assim o
      // `desenhar()` só tem de lhe dar largura e o ponto central.
      gsap.set(logo, { xPercent: -50, yPercent: -50 });

      // O logótipo NÃO TEM ANIMAÇÃO NENHUMA, e é decisão dela depois de ver
      // três tentativas: uma sequência em perspetiva (entrada de lado,
      // aproximação, clarão, deriva contínua) e o reflexo dos botões a
      // passar por cima do metal. As duas foram recusadas.
      //
      // Fica quieto. O único movimento da abertura é o arco.

      const desenhar = () => {
        const W = window.innerWidth;
        const H = window.innerHeight;
        vao?.setAttribute("d", caminho(W, H, estado.h, true));
        const aberto = caminho(W, H, estado.h, false);
        moldura?.setAttribute("d", aberto);
        halo?.setAttribute("d", aberto);
        reflexo?.setAttribute("d", aberto);
        borda?.setAttribute("d", bordaPagina(W, H));

        // Ecos concêntricos: mesma forma, afastada. A distância acompanha a
        // largura da porta, para o acabamento não engordar em ecrãs grandes
        // nem colar-se ao vão no telemóvel.
        const passo = Math.max(11, largura(W) * 0.075);
        eco1?.setAttribute("d", caminho(W, H, estado.h, false, passo));
        eco2?.setAttribute("d", caminho(W, H, estado.h, false, passo * 2.15));

        // O logótipo já não fica parado dentro do vão: entra no centro do
        // ecrã e sobe com a porta até à faixa de cima (ver `subida`).
        if (logo) {
          const alturaVao = (alvoAltura / 100) * H;
          // Pousado: centrado na faixa acima do portal. A meio da subida:
          // mais abaixo, até ao centro do ecrã quando `subida.v` é 1 —
          // (H - vao)/2 + vao/2 = H/2.
          const topoFinal = (H - alturaVao) / 2;
          const larguraLogo = largura(W) * logoDoVao(W);
          const alturaLogo = larguraLogo * (356 / 1330);

          // A subida extra entra a par de `subida.v`: a 1 (marca no centro)
          // vale zero, a 0 (portal aberto) vale tudo. Assim o deslocamento
          // acontece DEPOIS de a porta abrir, e não a meio do percurso.
          // Duas subidas extra, cada uma no seu formato: centímetros em
          // computador, fração da altura em telemóvel. Ambas entram só
          // depois de a porta abrir (`1 - subida.v`).
          const p = progressoEcra(W);
          const extra =
            (SUBIR_LOGO_CM * PX_POR_CM * p + SUBIR_LOGO_MOVEL * H * (1 - p)) * (1 - subida.v);
          const topo = Math.max(
            alturaLogo / 2 + 28,
            topoFinal + subida.v * (alturaVao / 2) - extra,
          );

          logo.style.width = `${larguraLogo}px`;
          logo.style.left = `${W / 2}px`;
          logo.style.top = `${topo}px`;
        }

        // O "soltar" encosta ao canto do PORTAL em telemóvel, e ao canto do
        // ECRÃ em computador. A altura não muda — só a distância à direita.
        // Em telemóvel o vão é largo e o botão ficava lá fora, no verde.
        if (soltarEl) {
          soltarEl.style.right =
            progressoEcra(W) < 0.5 ? `${(W - largura(W)) / 2 + 14}px` : "";
        }

        // A fotografia ocupa a CAIXA DO PORTAL e não o ecrã: mesma largura
        // do vão, encostada ao fundo, centrada na horizontal. O arco do vão
        // é que a recorta — o resto do ecrã continua tapado pela chapa.
        // Em ecrã inteiro, o que se via pelo vão era um pedaço do meio da
        // fotografia ampliado, e não a fotografia.
        if (foto.current) {
          const alturaVao = (alvoAltura / 100) * H;
          foto.current.style.width = `${largura(W)}px`;
          foto.current.style.height = `${alturaVao}px`;
          foto.current.style.left = `${(W - largura(W)) / 2}px`;
          foto.current.style.top = `${H - alturaVao}px`;
        }
      };
      desenhar();

      const aoRedimensionar = () => desenhar();
      window.addEventListener("resize", aoRedimensionar);

      const porta = (linha.current = gsap.timeline({
        defaults: { onUpdate: desenhar },
        delay: INTRO,
        onComplete: () => {
          window.removeEventListener("resize", aoRedimensionar);
          terminar();
        },
      }));

      // ── FASES 1 e 2 · nasce do chão e forma o arco ────────────────────
      // UM ÚNICO tween. Dois encadeados fariam o movimento chegar a
      // velocidade zero a meio e arrancar de novo. A curva `cine-cauda` tem
      // um fim longuíssimo, por isso a porta perde velocidade sozinha.
      porta.to(estado, { h: alvoAltura, duration: ABRE_DURACAO, ease: "cine-cauda" }, ABRE_INICIO);
      porta.fromTo(
        [moldura, halo],
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 1.4, ease: "power2.out" },
        ABRE_INICIO + 0.3,
      );

      // A moldura da página assoma antes da porta e fica muito discreta —
      // é enquadramento, não protagonista.
      porta.to(borda, { opacity: 0.28, duration: 1.6, ease: "power2.out" }, ABRE_INICIO + 0.15);

      // Reflexo: a banda clara percorre o traço em ciclo. Anima-se o
      // `gradientTransform` (um atributo), não a geometria — por isso não
      // engrossa a linha nem obriga a redesenhar o caminho.
      porta.to(reflexo, { opacity: 1, duration: 0.8, ease: "power2.out" }, ABRE_INICIO + 0.9);
      if (gradReflexo) {
        gsap.fromTo(
          gradReflexo,
          { attr: { gradientTransform: "translate(0 -1)" } },
          {
            attr: { gradientTransform: "translate(0 1)" },
            duration: 3.4,
            ease: "power1.inOut",
            repeat: -1,
            repeatDelay: 0.9,
            delay: INTRO,
          },
        );
      }

      // ── FASE 3 · a porta fica aberta, com a fotografia lá dentro ─────
      // O zoom que ampliava o portal até engolir o ecrã (`scale: 18`) foi
      // retirado a pedido dela: o portal não estica. Abre, mostra a
      // fotografia no seu tamanho, espera, e sai por desvanecimento.
      // ── FASE 0 · a marca ─────────────────────────────────────────────
      // Aparece no CENTRO do ecrã e sobe com a porta, ficando acima dela
      // até ao fim da abertura. Não sai a meio: é a fotografia que ocupa o
      // vão por baixo.
      porta.fromTo(
        soltarEl,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.8, ease: "power2.out" },
        ENTRADA_SOLTAR,
      );

      porta.fromTo(
        logo,
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 1.4, ease: "cine-lento" },
        SUBIDA_LOGO,
      );

      // A SUBIDA. Acompanha a porta ao segundo: o arco cresce por baixo e a
      // marca sobe à frente dele, acabando pousada na faixa de cima. Mesma
      // duração e mesma curva do vão — se fossem diferentes, um chegava
      // primeiro e a leitura de "a porta empurra a marca" desfazia-se.
      porta.to(subida, { v: 0, duration: ABRE_DURACAO, ease: "cine-cauda" }, ABRE_INICIO);

      // ── FASE 5 · transição para o site ────────────────────────────────
      // ── FASE 4 · a pausa, e só depois o site ─────────────────────────
      // A porta está aberta aos 4,2. A partir daí conta a pausa; no fim,
      // a moldura, a chapa e a fotografia saem juntas.
      const FIM = ABRE + PAUSA_FOTO;
      porta.to([moldura, halo, reflexo], { autoAlpha: 0, duration: 0.9, ease: "power2.in" }, FIM);
      porta.to(borda, { opacity: 0, duration: 0.9, ease: "power2.in" }, FIM);
      porta.to(el, { autoAlpha: 0, duration: 1.0, ease: "power2.inOut" }, FIM + 0.2);

      // A fotografia sai ao mesmo tempo que a chapa: se saísse depois,
      // ficava um retângulo dela sozinho sobre o site.
      porta.to(foto.current, { autoAlpha: 0, duration: 1.0, ease: "power2.inOut" }, FIM + 0.2);

      return () => window.removeEventListener("resize", aoRedimensionar);
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <>
    {/* A fotografia vive POR BAIXO da abertura (z-89 contra z-90) e do
        TAMANHO DO PORTAL: é o que se vê pelo vão quando a porta acaba de
        abrir. As medidas são dadas em `desenhar()`, com a geometria do vão.
        Irmã e não filha da raiz, para poder sair no seu próprio tempo. */}
    <div ref={foto} className="fixed z-[89] overflow-hidden bg-verde">
      <Image
        // Escolha dela. Substituiu a moldura de espera em degradê.
        //
        // ATENÇÃO À PROPORÇÃO: este ficheiro é 736x1313, ou seja 0,561 —
        // bem mais estreito do que os 0,79 a que o vão foi alargado (ver a
        // nota do `object-cover` em baixo). Com `cover`, o que se vê é 71%
        // da altura da fotografia (0,561 / 0,79) e perdem-se ~14,5% em cima
        // e outro tanto em baixo. Em cima é cabelo; em baixo é a ponta das
        // luvas. O rosto e as seringas ficam inteiros, que é o que importa.
        //
        // Se algum dia se quiser a fotografia toda, o que se mexe é a
        // proporção do VÃO em `desenhar()`, não este `object-fit`.
        src="/imagens/destaque/abertura.jpg"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        // `cover` centrado: a fotografia enche o vão, sem barras. Para não
        // lhe cortar os braços, quem se ajustou foi o PORTAL — alargado até
        // a proporção do vão passar a da fotografia (0,79). Passada essa
        // marca, o que sobra corta-se em cima e em baixo, não pelos lados,
        // e os braços ficam inteiros.
        className="object-cover object-center"
      />
    </div>

    <div ref={root} className="intro-transition fixed inset-0 z-[90] overflow-hidden">
      {/* Saltar a abertura. Fica no canto, fora do caminho do portal e da
          fotografia, e é o único elemento clicável de toda a sequência. */}
      <button
        type="button"
        data-soltar
        onClick={soltar}
        style={{ opacity: 0, visibility: "hidden" }}
        // A rampa metálica do site e não o dourado chapado, que a este tamanho
        // se lia amarelo. O sublinhado leva a cor à parte: o `background-clip`
        // torna o texto transparente e levaria o traço com ele.
        className="label ouro-metal absolute right-[var(--spacing-gutter)] bottom-8 z-30 underline decoration-[#ce9a44] underline-offset-4"
      >
        soltar
      </button>

      <svg className="intro-mask absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <mask id="vao-porta" maskUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="white" />
            {/* Preto = recortado. É por aqui que o site aparece. */}
            <g data-vao-grupo>
              <path data-vao fill="black" />
            </g>
          </mask>

          {/* Ouro metálico: escuro nas pontas, claro ao centro. É este
              contraste dentro da própria linha que lê como metal polido —
              uma cor chapada lê sempre como risco amarelo. */}
          <linearGradient id="ouro-metal" gradientUnits="objectBoundingBox" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#5C430F" />
            <stop offset="17%" stopColor="#A9822B" />
            <stop offset="37%" stopColor="#E8D08A" />
            <stop offset="46%" stopColor="#FFFDF4" />
            <stop offset="55%" stopColor="#E8D08A" />
            <stop offset="76%" stopColor="#A9822B" />
            <stop offset="100%" stopColor="#4E3A0D" />
          </linearGradient>

          {/* Reflexo: banda estreita e transparente que percorre o traço.
              Não engrossa a linha porque partilha a espessura. */}
          <linearGradient id="ouro-reflexo" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF6D8" stopOpacity="0" />
            <stop offset="42%" stopColor="#FFF6D8" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFBEF" stopOpacity="0.95" />
            <stop offset="58%" stopColor="#FFF6D8" stopOpacity="0" />
            <stop offset="100%" stopColor="#FFF6D8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Verde em todo o lado MENOS no vão. É o que faz o vão mostrar o
            site — não há fundo nenhum por trás dele. */}
        <rect width="100%" height="100%" fill={VERDE_PORTAL} mask="url(#vao-porta)" />

        {/* Moldura da página: fica por trás da porta e não amplia com ela. */}
        <path data-borda fill="none" stroke="url(#ouro-metal)" strokeWidth="0.75" opacity="0" />

        <g data-moldura-grupo>
          <path data-eco2 fill="none" stroke="url(#ouro-metal)" strokeWidth="0.6" opacity="0.16" />
          <path data-eco1 fill="none" stroke="url(#ouro-metal)" strokeWidth="0.7" opacity="0.34" />
          <path data-halo fill="none" stroke="url(#ouro-metal)" strokeWidth="2.5" opacity="0.09" />
          <path data-moldura fill="none" stroke="url(#ouro-metal)" strokeWidth="0.9" opacity="0.95" />
          <path data-reflexo fill="none" stroke="url(#ouro-reflexo)" strokeWidth="0.9" opacity="0" />
        </g>
      </svg>

      {/* O logótipo. Sem fundo, sem mistura, sem filtro e sem animação — a
          largura e o sítio vêm do `desenhar()`, em proporção ao vão.

          Era aqui o último `ondelle-wordmark.png`: o cabeçalho, o fecho e o
          rodapé já tinham passado ao `Wordmark` em vetor, e a abertura ficou
          para trás por o logótipo viver dentro do preloader e não sair do
          componente. Dava a única marca do site em ouro CHAPADO — e logo na
          primeira coisa que se vê.

          O `viewBox` do `Wordmark` é o mesmo 1330×356 do ficheiro que aqui
          estava, por isso o `desenhar()` continua a poder mandar na largura
          da mesma maneira: mede o vão, escreve `style.width` no `[data-logo]`
          e a marca acompanha. */}
      <div data-logo aria-hidden className="pointer-events-none absolute w-0">
        <Wordmark
          id="abertura"
          label={brand.name}
          className="block h-auto w-full select-none"
        />
      </div>
    </div>
    </>
  );
}
