/**
 * GLSL como template literal em .ts — sem loader, sem config de webpack.
 *
 * A pétala não é uma textura num plano: a forma é gerada em `petalPos()`,
 * o que permite calcular a normal por diferenças finitas e obter um fresnel
 * correto sem geometria pesada.
 */

export const irisVertexShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uProgress;   // abertura da íris, conduzida pelo GSAP
  uniform float uScroll;     // velocidade de scroll
  uniform vec2  uPointer;

  attribute float aPhase;    // dessincroniza o vento por pétala
  attribute float aPetal;    // 0..5 — 0..2 erguidas, 3..5 pendentes
  attribute float aOpen;     // desfasamento de abertura por flor

  varying vec2  vUv;
  varying float vFresnel;
  varying float vPetal;

  vec3 petalPos(vec2 uv) {
    float t = clamp(uv.y, 0.0, 1.0);
    float x = uv.x - 0.5;

    // Silhueta: estreita na base, larga a meio, ponta arredondada.
    float width = sin(pow(t, 0.72) * 3.14159265) * 0.92 + 0.08;
    vec3 pos = vec3(x * width, t, 0.0);

    float isFall = step(3.0, aPetal);
    float open = clamp(uProgress + aOpen, 0.0, 1.0);

    // Fechada, a pétala enrola sobre si; aberta, desdobra — mas guarda
    // sempre alguma concha. Achatada por completo, lê-se como uma lâmina.
    float curl = mix(1.18, 0.42, open);
    float bend = t * t * curl;
    pos.z -= bend * mix(0.52, 0.95, isFall);
    pos.y -= bend * mix(0.16, 0.52, isFall);

    // A pétala é uma calha, não um plano.
    pos.z += x * x * mix(1.45, 0.65, t) * 0.5;

    // Vento em duas frequências + respiração lenta.
    float w = sin(uTime * 0.6 + aPhase + t * 2.1) * 0.034
            + sin(uTime * 1.37 + aPhase * 2.3) * 0.013;
    w *= t * t;
    pos.x += w;
    pos.z += w * 0.55;
    pos.y += sin(uTime * 0.5 + aPhase) * 0.011 * t;

    // Inclina na direção do ponteiro e reage à velocidade do scroll.
    pos.x += uPointer.x * t * t * 0.075;
    pos.z += uPointer.y * t * t * 0.055;
    pos.x += uScroll * t * t * 0.20;

    return pos;
  }

  // normalize() de um vetor nulo devolve NaN e a pétala sai preta.
  vec3 safeNormalize(vec3 v) {
    float l = length(v);
    return l > 1e-6 ? v / l : vec3(0.0, 0.0, 1.0);
  }

  void main() {
    vUv = uv;
    vPetal = aPetal;

    vec3 p = petalPos(uv);

    // Diferenças centrais: na fila de vértices do topo, petalPos() satura
    // em t=1 e uma diferença para a frente daria exatamente zero.
    const float E = 0.012;
    vec3 du = petalPos(uv + vec2(E, 0.0)) - petalPos(uv - vec2(E, 0.0));
    vec3 dv = petalPos(uv + vec2(0.0, E)) - petalPos(uv - vec2(0.0, E));
    vec3 n  = safeNormalize(cross(du, dv));

    vec4 mvPos = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
    vec3 viewDir = safeNormalize(-mvPos.xyz);
    vec3 nrm = safeNormalize(normalMatrix * mat3(instanceMatrix) * n);

    // Borda luminosa — é o termo que faz o material parecer caro.
    vFresnel = pow(1.0 - abs(dot(nrm, viewDir)), 2.6);

    gl_Position = projectionMatrix * mvPos;
  }
`;

export const irisFragmentShader = /* glsl */ `
  precision mediump float;

  uniform vec3  uColorDeep;
  uniform vec3  uColorBase;
  uniform vec3  uColorTip;
  uniform float uNight;

  varying vec2  vUv;
  varying float vFresnel;
  varying float vPetal;

  void main() {
    float t = clamp(vUv.y, 0.0, 1.0);
    float x = abs(vUv.x - 0.5) * 2.0;

    vec3 col = mix(uColorDeep, uColorBase, smoothstep(0.0, 0.55, t));
    col = mix(col, uColorTip, smoothstep(0.42, 1.0, t));

    // Nervura central, mais forte junto à base.
    float vein = smoothstep(0.15, 0.0, x) * (1.0 - t * 0.55);
    col = mix(col, uColorDeep, vein * 0.38);

    // Nervuras finas em leque.
    float fine = sin(x * 32.0 + t * 4.0) * 0.5 + 0.5;
    col *= 1.0 - fine * 0.05 * (1.0 - x) * (1.0 - t * 0.4);

    // As pétalas pendentes recebem menos luz.
    col *= mix(1.0, 0.88, step(3.0, vPetal));

    col += vFresnel * 0.26;

    // À noite a flor arrefece e perde saturação.
    vec3 cool = vec3(dot(col, vec3(0.299, 0.587, 0.114)));
    col = mix(col, mix(cool, col, 0.55) * 0.62 + vec3(0.02, 0.03, 0.06), uNight);

    // Bordas suaves e ponta translúcida — evita silhueta recortada.
    float alpha = smoothstep(1.0, 0.84, x);
    alpha *= smoothstep(0.0, 0.05, t);
    alpha *= mix(1.0, 0.80, t);

    gl_FragColor = vec4(col, alpha);

    #include <colorspace_fragment>
  }
`;

export const stemVertexShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uScroll;
  uniform vec2  uPointer;

  attribute float aPhase;

  varying float vY;

  void main() {
    vY = uv.y;
    vec3 pos = position;

    // O caule dobra a partir da base, com a mesma assinatura de vento
    // das pétalas — senão a flor parece colada.
    float t = clamp((position.y + 0.5), 0.0, 1.0);
    float w = sin(uTime * 0.6 + aPhase + t * 2.1) * 0.030
            + sin(uTime * 1.37 + aPhase * 2.3) * 0.011;
    w *= t * t;

    pos.x += w + uPointer.x * t * t * 0.06 + uScroll * t * t * 0.17;
    pos.z += w * 0.55 + uPointer.y * t * t * 0.045;

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
  }
`;

export const stemFragmentShader = /* glsl */ `
  precision mediump float;

  uniform vec3  uColor;
  uniform float uNight;

  varying float vY;

  void main() {
    vec3 col = uColor * mix(0.72, 1.0, vY);
    vec3 cool = vec3(dot(col, vec3(0.299, 0.587, 0.114)));
    col = mix(col, mix(cool, col, 0.5) * 0.55 + vec3(0.02, 0.03, 0.05), uNight);

    gl_FragColor = vec4(col, mix(0.0, 0.9, smoothstep(0.0, 0.12, vY)));

    #include <colorspace_fragment>
  }
`;
