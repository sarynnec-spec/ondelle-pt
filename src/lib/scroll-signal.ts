/**
 * Ponte entre o scroll (Lenis/GSAP) e o loop de render do R3F.
 *
 * Objeto mutável de propósito: ler isto dentro de `useFrame` não provoca
 * re-render nem aloca nada por frame. `setState` dentro do loop seria o
 * caminho mais curto para jank.
 */
export const scrollSignal = {
  /** Velocidade normalizada do scroll, suavizada. ~-1..1 */
  velocity: 0,
  /** Progresso 0..1 da abertura da íris, conduzido pelo ScrollTrigger da hero. */
  hero: 0,
  /** Posição do ponteiro em coordenadas -1..1. */
  pointerX: 0,
  pointerY: 0,
  /** Alterna o ambiente dia/noite: 0 = dia, 1 = noite. */
  night: 0,
};

export function resetScrollSignal() {
  scrollSignal.velocity = 0;
  scrollSignal.hero = 0;
  scrollSignal.pointerX = 0;
  scrollSignal.pointerY = 0;
}
