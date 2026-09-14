import { VERTEX_SHADER, FRAGMENT_SHADER } from "./flores-shader";

/**
 * O desenhador. Cinco texturas, uma grelha, um `requestAnimationFrame`.
 *
 * Toda a decisão interessante está comentada no sítio onde é tomada. As duas
 * que vale a pena saber antes de ler:
 *
 * **Folga nas arestas.** A grelha é maior do que a composição em `FOLGA` px
 * de cada lado, e a textura está em `CLAMP_TO_EDGE`. Sem isto, deslocar a
 * folhagem para dentro abriria uma fresta de background do lado de onde ela
 * sangra. Com isto, o pior que acontece é a coluna de pixéis da aresta
 * esticar meia dúzia de px — invisível dentro de folhagem densa.
 *
 * **Textura ao tamanho exato do ecrã, e sem mipmaps.** Isto foi medido, não
 * arbitrado. A primeira versão enviava a textura a `largura × min(dpr, 2)` e
 * gerava mipmaps, e o resultado era mais MACIO do que o CSS que substituía:
 * 0,85× a 1440@1x, 0,77× a 1440@2x e 0,64× a 390@3x — pior justamente no
 * telemóvel, que era o caso que estava bom.
 *
 * Duas causas, ambas minhas: limitar o buffer a DPR 2 num ecrã DPR 3 é o
 * browser a ampliar 1,5× por cima; e o mipmap trilinear mistura dois níveis
 * sempre que a escala não é exatamente 1.
 *
 * A correção é fazer o blit a 1:1 — textura do tamanho em pixéis físicos que
 * vai ocupar. Sem minificação não há aliasing, e sem aliasing os mipmaps não
 * servem para nada. O tecto de `TEXTURA_MAX` continua a fazer sentido por
 * outra razão: o detalhe real dos ficheiros é de ~1000px (reduzir o PNG a
 * 900px e reampliar dá um erro médio de 1,09/255 contra o original), por isso
 * passar de 2048 seria pagar VRAM por pixéis que não existem.
 */

/** Vértices da grelha. 40×28 chega para uma onda suave a esta amplitude. */
const COLUNAS = 40;
const LINHAS = 28;

/** Margem de segurança em px, de cada lado da composição. */
const FOLGA = 10;

/**
 * Multiplicador do tempo — a velocidade do vento.
 *
 * Está aqui e não no GLSL de propósito: escalar `uTempo` uma vez escala as
 * CINCO frequências do shader ao mesmo tempo, o que preserva por construção
 * as relações entre elas e as fases. Mexer nos cinco números à mão arriscava
 * sincronizá-los e transformar a brisa num metrónomo.
 *
 * Porque é que subiu: com amplitude correta (±4,7px nas pontas a 1440) o
 * efeito continuava a ler-se como parado. Medida a velocidade aparente das
 * pontas, dava **0,77 px/s de mediana**. Uma massa de folhagem densa, sem uma
 * única aresta reta a servir de referência, é indistinguível de parada abaixo
 * de ~1-2 px/s — foi a mesma parede que apareceu no início deste efeito, aos
 * 0,86 px/s. O que faltava não era percurso, era ritmo.
 */
const VELOCIDADE = 1.65;

/**
 * Amplitude da agitação das pontas, em fração da amplitude do balanço.
 *
 * É uma fração e não px fixos pela mesma razão que a amplitude principal:
 * assim escala sozinha com a composição e o telemóvel recebe a sua parte sem
 * `VENTO_MOVEL` ter de ser tocado. A 1440 a amplitude nominal do balanço é
 * 9,65, por isso 0,104 dava ~1px nas pontas e 0,208 dava ~2px.
 *
 * Foram medidos os três. A 0,208 as pontas passavam para ±6,62 a 1440 (fora
 * da banda pedida), a cintilação da silhueta quase duplicava e o corpo
 * começava a mostrar movimento de alta frequência — o princípio de shake.
 *
 * Chegou a descer para 0,085 na tentativa de corrigir a amplitude nas telas
 * grandes, e não corrigiu nada: medido sem micro nenhuma, 1920 já dava ±6,87
 * e 2560 ±8,66. O excesso vinha do balanço, não daqui — nas pontas a micro
 * vale ±0,8px contra ±7 do balanço, e raramente somam no mesmo sentido.
 * Voltou a 0,104 e o balanço é que desceu, via `FRACAO_DESKTOP`.
 */
const FRACAO_MICRO = 0.104;

const TEXTURA_MAX = 2200;
const TEXTURA_MIN = 640;

/** Tecto de pixéis do canvas, a proteger máquinas fracas de um DPR alto. */
const BUFFER_MAX = 6.0e6;

export type Ajuste = {
  /** Amplitude nas pontas, em px. */
  amp: [number, number];
  /** Onde acabam as flores, em fração da altura da faixa. */
  ponta: number;
};

function compilar(gl: WebGLRenderingContext, tipo: number, fonte: string) {
  const s = gl.createShader(tipo)!;
  gl.shaderSource(s, fonte);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(`shader: ${log}`);
  }
  return s;
}

/** A grelha, em coordenadas 0..1. */
function grelha() {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let y = 0; y <= LINHAS; y++)
    for (let x = 0; x <= COLUNAS; x++) pos.push(x / COLUNAS, y / LINHAS);
  for (let y = 0; y < LINHAS; y++)
    for (let x = 0; x < COLUNAS; x++) {
      const a = y * (COLUNAS + 1) + x;
      idx.push(a, a + 1, a + COLUNAS + 1, a + 1, a + COLUNAS + 2, a + COLUNAS + 1);
    }
  return { pos: new Float32Array(pos), idx: new Uint16Array(idx) };
}

/**
 * Escala de desenho. Não é `min(dpr, 2)` nem `dpr` puro.
 *
 * O tecto de 2 foi removido porque um telemóvel a DPR 3 desenhado a 2 fica com
 * o browser a ampliar 1,5× por cima, e vê-se (media 0,64× da nitidez do CSS).
 *
 * O chão de 2 é a outra metade do mesmo problema, do lado do desktop. A DPR 1
 * o blit deformado reamostra em offsets fracionários e perde ~9% de
 * micro-contraste — medido: 0,877 contra o CSS parado, quando um simples
 * `translateX(0.5px)` em CSS já custa 0,965. Desenhar a 2× e deixar o
 * compositor reduzir recupera a maior parte dessa perda. O telemóvel já vem a
 * DPR 2-3 e não é afetado por este chão.
 *
 * O que se limita é a ÁREA total, que é o que realmente custa. São cinco
 * camadas desenhadas por cima umas das outras, por isso o preço é 5× a área:
 * a 2560 a sobreamostragem cheia pediria 12,5M de pixéis por camada e media-se
 * 38fps. O tecto trava-a em 1,4× e devolve o ritmo.
 */
function escala(alvo?: HTMLCanvasElement) {
  const pedido = Math.max(devicePixelRatio || 1, 2);
  if (!alvo) return Math.min(pedido, 3);
  const area = alvo.clientWidth * alvo.clientHeight;
  return area ? Math.min(pedido, 3, Math.sqrt(BUFFER_MAX / area)) : Math.min(pedido, 3);
}

export async function iniciarVento(
  canvas: HTMLCanvasElement,
  imagens: HTMLImageElement[],
  ajuste: () => Ajuste,
  aoPrimeiroQuadro: () => void,
) {
  const gl = (canvas.getContext("webgl2", {
    premultipliedAlpha: true,
    antialias: false,
    powerPreference: "low-power",
  }) ?? canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false })) as
    | WebGL2RenderingContext
    | WebGLRenderingContext
    | null;
  if (!gl) throw new Error("sem webgl");

  const prog = gl.createProgram()!;
  gl.attachShader(prog, compilar(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(prog, compilar(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link");
  gl.useProgram(prog);

  const u = {
    quad: gl.getUniformLocation(prog, "uQuad"),
    origem: gl.getUniformLocation(prog, "uOrigem"),
    faixa: gl.getUniformLocation(prog, "uFaixa"),
    ecra: gl.getUniformLocation(prog, "uEcra"),
    amp: gl.getUniformLocation(prog, "uAmp"),
    ponta: gl.getUniformLocation(prog, "uPonta"),
    tempo: gl.getUniformLocation(prog, "uTempo"),
    micro: gl.getUniformLocation(prog, "uMicro"),
    tex: gl.getUniformLocation(prog, "uTex"),
  };

  const g = grelha();
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, g.pos, gl.STATIC_DRAW);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.idx, gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Alfa direto na textura, pré-multiplicado no fragment shader.
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // O tamanho em pixéis FÍSICOS que a composição vai ocupar. É este o número
  // que faz o blit ficar a 1:1.
  const fisico = (canvas.clientWidth || 1) * escala(canvas);
  const alvo = Math.min(
    TEXTURA_MAX,
    Math.max(TEXTURA_MIN, Math.ceil(fisico)),
    Math.max(...imagens.map((i) => i.naturalWidth || TEXTURA_MAX)),
  );

  // O redimensionamento é assíncrono, o upload é síncrono, e as duas coisas
  // TÊM de ficar separadas. Já estiveram no mesmo `map` assíncrono e o
  // resultado foi um retângulo preto: entre o `bindTexture` de uma camada e o
  // seu `texImage2D` corria o `await` das outras, os cinco uploads aterravam
  // todos na última textura ligada, e quatro ficavam incompletas — e uma
  // textura incompleta não é transparente, amostra-se a (0,0,0,1).
  //
  // `premultiplyAlpha: "none"` pelo mesmo motivo: o `createImageBitmap`
  // pré-multiplica por omissão, e o fragment shader volta a multiplicar.
  const fontes = await Promise.all(
    imagens.map((img) =>
      img.naturalWidth > alvo && typeof createImageBitmap === "function"
        ? createImageBitmap(img, {
            resizeWidth: alvo,
            resizeHeight: Math.round((alvo * img.naturalHeight) / img.naturalWidth),
            resizeQuality: "high",
            premultiplyAlpha: "none",
          }).catch(() => img)
        : Promise.resolve(img),
    ),
  );

  const texturas = fontes.map((fonte) => {
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fonte as TexImageSource);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // Sem mipmap de propósito: a textura já vem ao tamanho físico do destino,
    // não há minificação a filtrar, e o trilinear só acrescentaria macieza.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    return t;
  });
  fontes.forEach((f) => f instanceof ImageBitmap && f.close());

  let larg = 0;
  let alt = 0;
  let dpr = 0;

  function dimensionar() {
    const d = escala(canvas);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === larg && h === alt && d === dpr) return;
    larg = w;
    alt = h;
    dpr = d;
    canvas.width = Math.round(w * d);
    canvas.height = Math.round(h * d);
    gl!.viewport(0, 0, canvas.width, canvas.height);
  }

  let vivo = true;
  let visivel = true;
  let quadro = 0;
  let primeiro = true;

  function desenhar(ms: number) {
    if (!vivo) return;
    quadro = requestAnimationFrame(desenhar);
    if (!visivel) return;
    dimensionar();
    if (!larg || !alt) return;

    const { amp, ponta } = ajuste();
    gl!.uniform2f(u.quad, larg + FOLGA * 2, alt + FOLGA * 2);
    gl!.uniform2f(u.origem, -FOLGA, -FOLGA);
    gl!.uniform2f(u.faixa, larg, alt);
    gl!.uniform2f(u.ecra, larg, alt);
    gl!.uniform2f(u.amp, amp[0], amp[1]);
    gl!.uniform1f(u.ponta, ponta);
    gl!.uniform1f(u.micro, amp[0] * FRACAO_MICRO);
    gl!.uniform1f(u.tempo, (ms / 1000) * VELOCIDADE);

    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.uniform1i(u.tex, 0);
    gl!.activeTexture(gl!.TEXTURE0);
    for (const t of texturas) {
      gl!.bindTexture(gl!.TEXTURE_2D, t);
      gl!.drawElements(gl!.TRIANGLES, g.idx.length, gl!.UNSIGNED_SHORT, 0);
    }

    if (primeiro) {
      primeiro = false;
      aoPrimeiroQuadro();
    }
  }

  // Fora do ecrã não se gasta GPU.
  const io = new IntersectionObserver((e) => (visivel = e[0].isIntersecting), { rootMargin: "120px" });
  io.observe(canvas);

  const perdeu = (e: Event) => {
    e.preventDefault();
    vivo = false;
  };
  canvas.addEventListener("webglcontextlost", perdeu);

  quadro = requestAnimationFrame(desenhar);

  return () => {
    vivo = false;
    cancelAnimationFrame(quadro);
    io.disconnect();
    canvas.removeEventListener("webglcontextlost", perdeu);
    texturas.forEach((t) => gl!.deleteTexture(t));
    gl!.deleteBuffer(vbo);
    gl!.deleteBuffer(ibo);
    gl!.deleteProgram(prog);
  };
}
