"use client";

import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollSignal } from "@/lib/scroll-signal";
import {
  irisVertexShader,
  irisFragmentShader,
  stemVertexShader,
  stemFragmentShader,
} from "./shaders";

const FLOWERS = 9;
const PETALS_PER_FLOWER = 6;
const TOTAL_PETALS = FLOWERS * PETALS_PER_FLOWER;

/** Disposição do campo: leque raso, a flor central mais à frente e maior. */
const layout = Array.from({ length: FLOWERS }, (_, i) => {
  const spread = (i / (FLOWERS - 1)) * 2 - 1; // -1..1
  return {
    x: spread * 1.62 + Math.sin(i * 2.7) * 0.12,
    // Alturas desencontradas: alinhadas, as flores lêem-se como uma sebe.
    y: -0.58 + Math.sin(i * 2.3) * 0.19 + Math.cos(i * 5.1) * 0.08,
    z: -Math.abs(spread) * 1.35 + Math.sin(i * 4.1) * 0.18,
    scale: 0.86 - Math.abs(spread) * 0.26 + Math.sin(i * 3.3) * 0.09,
    yaw: i * 1.21,
    open: (1 - Math.abs(spread)) * 0.22,
  };
});

export function IrisField({ reduced = false }: { reduced?: boolean }) {
  const petals = useRef<THREE.InstancedMesh>(null!);
  const stems = useRef<THREE.InstancedMesh>(null!);
  const group = useRef<THREE.Group>(null!);

  const time = useRef(0);
  const vel = useRef(0);
  const px = useRef(0);
  const py = useRef(0);
  const night = useRef(0);
  const hero = useRef(0);

  // Geometrias criadas manualmente → têm de ser dispostas manualmente.
  const petalGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 10, 22), []);
  const stemGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.008, 0.016, 1, 6, 8, true),
    [],
  );

  const petalUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uScroll: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uNight: { value: 0 },
      // Dourado da marca (#d6ac60) na base, escurecido na raiz e a
      // clarear na ponta — a flor lê-se como o monograma em movimento.
      uColorDeep: { value: new THREE.Color("#8f6a2e") },
      uColorBase: { value: new THREE.Color("#d6ac60") },
      uColorTip: { value: new THREE.Color("#f0dcae") },
    }),
    [],
  );

  const stemUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uNight: { value: 0 },
      // Caule no verde da marca clareado: presente, mas a recuar.
      uColor: { value: new THREE.Color("#8c4753") },
    }),
    [],
  );

  // Matrizes e atributos por instância — calculados uma vez.
  useEffect(() => {
    const dummy = new THREE.Object3D();
    const phase = new Float32Array(TOTAL_PETALS);
    const petalIndex = new Float32Array(TOTAL_PETALS);
    const openOffset = new Float32Array(TOTAL_PETALS);

    let i = 0;
    for (let f = 0; f < FLOWERS; f++) {
      const L = layout[f];
      for (let p = 0; p < PETALS_PER_FLOWER; p++) {
        dummy.position.set(L.x, L.y, L.z);
        dummy.rotation.set(0, L.yaw + (p * Math.PI * 2) / PETALS_PER_FLOWER, 0);
        dummy.scale.setScalar(L.scale * (p >= 3 ? 1.08 : 0.94));
        dummy.updateMatrix();
        petals.current.setMatrixAt(i, dummy.matrix);

        phase[i] = f * 1.7 + p * 0.9;
        petalIndex[i] = p;
        openOffset[i] = L.open;
        i++;
      }
    }
    petals.current.instanceMatrix.needsUpdate = true;
    petalGeometry.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phase, 1));
    petalGeometry.setAttribute("aPetal", new THREE.InstancedBufferAttribute(petalIndex, 1));
    petalGeometry.setAttribute("aOpen", new THREE.InstancedBufferAttribute(openOffset, 1));

    const stemPhase = new Float32Array(FLOWERS);
    for (let f = 0; f < FLOWERS; f++) {
      const L = layout[f];
      const height = 1.5 * L.scale;
      dummy.position.set(L.x, L.y - height / 2, L.z);
      dummy.rotation.set(0, L.yaw, 0);
      dummy.scale.set(L.scale, height, L.scale);
      dummy.updateMatrix();
      stems.current.setMatrixAt(f, dummy.matrix);
      stemPhase[f] = f * 1.7;
    }
    stems.current.instanceMatrix.needsUpdate = true;
    stemGeometry.setAttribute("aPhase", new THREE.InstancedBufferAttribute(stemPhase, 1));
  }, [petalGeometry, stemGeometry]);

  useEffect(() => {
    return () => {
      petalGeometry.dispose();
      stemGeometry.dispose();
    };
  }, [petalGeometry, stemGeometry]);

  useFrame((_, delta) => {
    // Nada de alocação aqui dentro: cada `new` no loop gera GC e jank.
    const d = Math.min(delta, 0.05);
    time.current += reduced ? 0 : d;

    const ease = Math.min(1, d * 5);
    vel.current += (scrollSignal.velocity - vel.current) * ease;
    px.current += (scrollSignal.pointerX - px.current) * ease;
    py.current += (scrollSignal.pointerY - py.current) * ease;
    night.current += (scrollSignal.night - night.current) * Math.min(1, d * 2.4);
    hero.current += (scrollSignal.hero - hero.current) * Math.min(1, d * 4);

    petalUniforms.uTime.value = time.current;
    petalUniforms.uProgress.value = hero.current;
    petalUniforms.uScroll.value = vel.current;
    petalUniforms.uPointer.value.set(px.current, py.current);
    petalUniforms.uNight.value = night.current;

    stemUniforms.uTime.value = time.current;
    stemUniforms.uScroll.value = vel.current;
    stemUniforms.uPointer.value.set(px.current, py.current);
    stemUniforms.uNight.value = night.current;

    // Deriva lenta do campo inteiro, contrária ao ponteiro.
    group.current.rotation.y = px.current * -0.12;
    group.current.position.y = hero.current * 0.14;
  });

  return (
    <group ref={group}>
      <instancedMesh
        ref={stems}
        args={[stemGeometry, undefined, FLOWERS]}
        frustumCulled={false}
      >
        <shaderMaterial
          vertexShader={stemVertexShader}
          fragmentShader={stemFragmentShader}
          uniforms={stemUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      <instancedMesh
        ref={petals}
        args={[petalGeometry, undefined, TOTAL_PETALS]}
        frustumCulled={false}
      >
        <shaderMaterial
          vertexShader={irisVertexShader}
          fragmentShader={irisFragmentShader}
          uniforms={petalUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}
