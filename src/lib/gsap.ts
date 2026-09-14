"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

// Registo num único módulo: evita registo duplicado e problemas de SSR.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);

  // cubic-bezier(0.76, 0, 0.24, 1) — o GSAP não lê a sintaxe do CSS, por
  // isso a curva é registada uma vez com o nome "cine".
  if (!CustomEase.get("cine")) CustomEase.create("cine", "M0,0 C0.76,0 0.24,1 1,1");
  // cubic-bezier(0.65, 0, 0.35, 1) — arranque quase impercetível.
  if (!CustomEase.get("cine-lento")) CustomEase.create("cine-lento", "M0,0 C0.65,0 0.35,1 1,1");
  // Arranque suave e cauda MUITO longa: o movimento perde velocidade até
  // quase parar sozinho. É isto que dispensa uma paragem seca antes da pausa.
  // Arranque contido (x1 alto atrasa a subida) e cauda longuíssima (x2
  // baixo estica a desaceleração). Com x1=0.30 a porta disparava nos
  // primeiros 800ms antes de abrandar.
  if (!CustomEase.get("cine-cauda")) CustomEase.create("cine-cauda", "M0,0 C0.62,0.02 0.04,1 1,1");
  // cubic-bezier(0.16, 1, 0.3, 1) — a curva de entrada do sistema de
  // movimento (ver lib/animations.ts). Arranca com energia e tem cauda
  // longa: o elemento perde velocidade ate assentar, sem paragem seca e sem
  // passar do sitio. E a curva do era-residence.com.
  if (!CustomEase.get("cine-saida")) CustomEase.create("cine-saida", "M0,0 C0.16,1 0.3,1 1,1");
}

export { gsap, ScrollTrigger, SplitText, CustomEase, useGSAP };

/** `true` quando o utilizador pediu menos movimento. Lido no cliente. */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
