"use client";

import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { IrisField } from "./iris-field";
import { Particles } from "./particles";
import { scrollSignal } from "@/lib/scroll-signal";
import { prefersReducedMotion } from "@/lib/gsap";

const FOV = 32;
/** Largura de mundo que queremos manter visível em qualquer formato. */
const TARGET_WIDTH = 3.05;

/**
 * O FOV de uma câmara perspetiva é vertical: em retrato, o campo horizontal
 * colapsa e uma única pétala passa a ocupar meio ecrã. A distância compensa
 * o aspeto, com limite para a flor não ficar minúscula.
 */
function ResponsiveCamera() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const halfFov = (FOV * Math.PI) / 360;
    const z = TARGET_WIDTH / (2 * Math.tan(halfFov) * Math.max(0.3, aspect));

    const cam = camera as THREE.PerspectiveCamera;
    cam.position.z = THREE.MathUtils.clamp(z, 3.3, 7.6);
    cam.position.y = aspect < 1 ? 0.05 : 0.28;
    cam.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

export default function IrisScene() {
  const [reduced, setReduced] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);

    // Manter o loop a correr numa aba escondida é desperdício puro de bateria.
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    const onPointer = (e: PointerEvent) => {
      scrollSignal.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      scrollSignal.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      mq.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <Canvas
      // Retina 3x quadruplica o custo sem ganho visível numa cena difusa.
      dpr={[1, 1.75]}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        alpha: true,
        toneMapping: THREE.NoToneMapping,
      }}
      camera={{ fov: FOV, position: [0, 0.28, 3.3], near: 0.1, far: 24 }}
      frameloop={reduced || hidden ? "demand" : "always"}
      style={{ pointerEvents: "none" }}
    >
      <ResponsiveCamera />
      <IrisField reduced={reduced} />
      <Particles reduced={reduced} />
    </Canvas>
  );
}
