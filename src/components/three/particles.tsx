"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollSignal } from "@/lib/scroll-signal";

const N = 260;

const vert = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2  uPointer;
  uniform float uPixel;

  attribute float aFase;
  attribute float aEscala;
  attribute float aProf;   // 0 = perto, 1 = longe

  varying float vProf;
  varying float vBrilho;

  void main() {
    vProf = aProf;

    vec3 pos = position;

    // Deriva lenta: sobem e oscilam, cada uma no seu tempo.
    pos.y += sin(uTime * 0.19 + aFase) * 0.30 + mod(uTime * 0.035 + aFase, 3.4) - 1.7;
    pos.x += sin(uTime * 0.27 + aFase * 1.7) * 0.22;
    pos.z += cos(uTime * 0.21 + aFase * 2.3) * 0.16;

    // As de trás reagem menos — é isso que cria profundidade real.
    float resposta = mix(1.0, 0.22, aProf);
    pos.x += uPointer.x * 0.30 * resposta;
    pos.y += uPointer.y * 0.20 * resposta + uScroll * 0.55 * resposta;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vBrilho = smoothstep(0.0, 1.0, 1.0 - aProf) * 0.75 + 0.25;

    gl_PointSize = aEscala * uPixel * mix(2.6, 0.9, aProf) * (7.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const frag = /* glsl */ `
  precision mediump float;
  uniform vec3 uCor;
  uniform float uNight;

  varying float vProf;
  varying float vBrilho;

  void main() {
    // Disco suave: sem isto os pontos ficam quadrados e baratos.
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float alfa = smoothstep(0.5, 0.06, d);
    alfa *= mix(0.55, 0.10, vProf) * vBrilho;

    vec3 cor = mix(uCor, uCor * 0.7 + vec3(0.02, 0.05, 0.06), uNight);
    gl_FragColor = vec4(cor, alfa);

    #include <colorspace_fragment>
  }
`;

/**
 * Poeira dourada em suspensão, em três planos de profundidade.
 *
 * Um `Points` único — 260 partículas numa só chamada de desenho. Anima tudo
 * no vertex shader, por isso o custo em CPU por frame é zero.
 */
export function Particles({ reduced = false }: { reduced?: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const t = useRef(0);
  const px = useRef(0);
  const py = useRef(0);
  const vel = useRef(0);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const fase = new Float32Array(N);
    const escala = new Float32Array(N);
    const prof = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      const p = Math.random();
      pos[i * 3] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
      pos[i * 3 + 2] = -p * 5.5 - 0.4;
      fase[i] = Math.random() * Math.PI * 2;
      escala[i] = 0.6 + Math.random() * 1.5;
      prof[i] = p;
    }

    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aFase", new THREE.BufferAttribute(fase, 1));
    g.setAttribute("aEscala", new THREE.BufferAttribute(escala, 1));
    g.setAttribute("aProf", new THREE.BufferAttribute(prof, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uNight: { value: 0 },
      uPixel: { value: 1 },
      uCor: { value: new THREE.Color("#e4c489") },
    }),
    [],
  );

  useFrame(({ viewport }, delta) => {
    const d = Math.min(delta, 0.05);
    t.current += reduced ? 0 : d;

    const e = Math.min(1, d * 4);
    px.current += (scrollSignal.pointerX - px.current) * e;
    py.current += (scrollSignal.pointerY - py.current) * e;
    vel.current += (scrollSignal.velocity - vel.current) * e;

    uniforms.uTime.value = t.current;
    uniforms.uPointer.value.set(px.current, py.current);
    uniforms.uScroll.value = vel.current;
    uniforms.uNight.value = scrollSignal.night;
    uniforms.uPixel.value = viewport.factor * 0.42;
  });

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
