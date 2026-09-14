/**
 * Sistema de movimento — um só sítio para o ritmo do site.
 *
 * Os valores vêm da leitura do era-residence.com feita a 2026-08-10: corre
 * GSAP 3.15 com ScrollTrigger, SplitText e CustomEase sobre Lenis, e tem 194
 * ScrollTriggers, praticamente todos com `scrub: 0.5`. Duas consequências que
 * definem a sensação daquele site e que este ficheiro reproduz:
 *
 *  1. **O scroll comanda o tempo.** As revelações de secção não "tocam" ao
 *     entrar no ecrã — seguem a posição do scroll. Por isso desfazem-se ao
 *     subir, e por isso parecem coreografadas em vez de disparadas.
 *  2. **A entrada é que é temporal.** A primeira dobra corre num relógio
 *     próprio, em cascata, e é a única parte com `delay`.
 *
 * Mudar o ritmo do site é mudar os números aqui, não em vinte componentes.
 */

/** Distâncias de deslocação. Em telemóvel o percurso é mais curto: o mesmo
 *  deslocamento num ecrã estreito lê-se como salto. */
export const DESLOCACAO = {
  /** Percentagem da própria linha. Acima de 100% a máscara esconde por
   *  completo antes de entrar — é isto que faz o texto "nascer" da linha. */
  texto: 112,
  textoMovel: 106,
  bloco: 34,
  blocoMovel: 22,
} as const;

/** Durações em segundos. Escala editorial: quanto maior o elemento, mais
 *  lento entra. */
export const DURACAO = {
  titulo: 1.25,
  subtitulo: 0.95,
  pequeno: 0.75,
  imagem: 1.35,
} as const;

/** Intervalo entre elementos de uma mesma onda. Abaixo de 20ms lê-se como
 *  simultâneo; acima de 60ms começa a parecer letra-a-letra. */
export const STAGGER = {
  linhas: 0.055,
  palavras: 0.03,
  itens: 0.07,
} as const;

/**
 * Curvas. A principal equivale a `cubic-bezier(0.16, 1, 0.3, 1)`: arranca com
 * energia e tem uma cauda longa, que é o que evita a paragem seca.
 *
 * Registadas em `lib/gsap.ts` — aqui ficam só os nomes, para não haver duas
 * fontes de verdade.
 */
export const CURVA = {
  /** Entrada principal. cubic-bezier(0.16, 1, 0.3, 1). */
  entrada: "cine-saida",
  /** Movimento ligado ao scroll. Com scrub, uma travagem forte faria o
   *  elemento chegar ao fim cedo demais e ficar parado o resto do percurso. */
  scroll: "power2.out",
  /** Two-way, para o que abre e fecha. */
  simetrica: "cine",
} as const;

/**
 * Percursos de ScrollTrigger. `start` é quando o elemento começa a revelar-se;
 * `end` quando termina. Entre os dois, o scroll comanda.
 */
export const PERCURSO = {
  texto: { start: "top 88%", end: "top 52%" },
  bloco: { start: "top 90%", end: "top 62%" },
  imagem: { start: "top 92%", end: "top 55%" },
  /** Segundos de atraso entre o scroll e a animação. É o amortecedor que
   *  transforma um seguimento rígido num movimento com peso. */
  scrub: 0.5,
} as const;

/**
 * Coreografia da primeira dobra, em segundos a partir do fim do preloader.
 * A ordem é a do briefing: estrutura → logótipo → navegação → título →
 * subtítulo → ações → indicador de scroll. As diferenças são pequenas de
 * propósito: o que se quer é uma cascata, não seis animações separadas.
 */
export const ENTRADA = {
  fundo: 0,
  logo: 0.15,
  navegacao: 0.3,
  titulo: 0.45,
  subtitulo: 0.75,
  acoes: 0.95,
  indicador: 1.25,
} as const;

/** Imagem: entra por máscara e um resto de escala. Nunca zoom percetível. */
export const IMAGEM = {
  recorteInicial: "inset(8% 0% 8% 0%)",
  recorteFinal: "inset(0% 0% 0% 0%)",
  escalaInicial: 1.04,
} as const;

/** `true` em ecrãs estreitos. Usado para encurtar percursos, não para
 *  desligar movimento — o telemóvel mantém a mesma linguagem. */
export function ecraEstreito() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}
