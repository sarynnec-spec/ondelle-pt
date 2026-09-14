/**
 * O vento, em GLSL.
 *
 * ## Porque é que isto não podia ficar em CSS
 *
 * Passou-se por três tentativas antes de chegar aqui, e vale a pena deixar
 * escrito para ninguém repetir o caminho:
 *
 * 1. `translate` no contentor — todos os pontos andam o mesmo vetor. Lê-se
 *    como "a imagem mudou de sítio". Subir a amplitude só torna o defeito
 *    mais visível.
 * 2. `translate` por camada — os galhos atravessam-se entre os cinco
 *    ficheiros (são a separação de UMA fotografia); mover uma camada sem as
 *    outras parte ramos ao meio.
 * 3. `skewX` com origem no topo — dá um gradiente honesto (raiz presa,
 *    ponta solta) mas continua a ser **afim**, e uma transformação afim leva
 *    retas em retas: toda a linha horizontal de folhas anda exatamente o
 *    mesmo. Vê-se uma placa a inclinar.
 *
 * O CSS não tem forma de exprimir a quarta hipótese, que é a certa: cada
 * ponto da folhagem com o seu próprio deslocamento. Isso pede vértices, e
 * vértices pedem WebGL.
 *
 * ## O que o shader faz
 *
 * A composição é uma grelha de ~1200 vértices sobre a qual as cinco texturas
 * são desenhadas pela mesma ordem de sempre. Cada vértice desloca-se por:
 *
 *     rigidez = h^1.6              h = distância ao topo, normalizada
 *     onda    = Σ sin(t·ω + h·k + x·φ)
 *     desloc  = onda · (PRESO + (1-PRESO)·rigidez) · amplitude
 *
 * Duas coisas a reter:
 *
 * **`h^1.6` é a raiz presa.** O expoente é o declive da rampa e foi ajustado
 * contra medições, não escolhido à mão: com `h²` o meio da vegetação ficava
 * em ±1,4px quando a especificação pedia ±2-3; com `h^1.8` as pontas
 * passavam para ±6,9 quando o tecto era ±6. 1,6 põe os três pontos dentro
 * das bandas pedidas ao mesmo tempo.
 *
 * **`x·φ` é o que faz disto vento.** É o termo que o CSS não consegue: a
 * fase muda ao longo da largura, por isso o lado esquerdo de uma fileira
 * está a ir enquanto o direito ainda está a vir. A rajada atravessa a
 * folhagem em vez de a empurrar em bloco. Sem este termo, com tudo o resto
 * igual, o resultado voltaria a ser indistinguível de um skew.
 *
 * As três frequências não são múltiplas umas das outras (0,62 / 0,41 / 0,23),
 * por isso a soma não tem período audível — não há vaivém mecânico.
 *
 * As cinco texturas partilham a MESMA grelha deformada. Continuam a não se
 * poder separar, exatamente como quando a regra vivia num contentor CSS.
 *
 * ## A segunda componente: a agitação das pontas
 *
 * O balanço acima, sozinho, não chega — e não é por ser lento de mais. Foi-se
 * de ×1,0 a ×1,65 na velocidade e continuava a ler-se como deriva. A razão é
 * que acelerar o balanço acelera TAMBÉM o balanço: mesmo a ×1,65 a onda mais
 * rápida tem período de 6,1s, e a ponta demora 3s a ir de um extremo ao
 * outro. Isso é sempre deriva suave, por maior que seja o multiplicador.
 *
 * O que o olho lê como "vento a passar pelas folhas" é uma coisa diferente:
 * um estremecimento pequeno e rápido POR CIMA do balanço lento. Numa planta
 * real são as duas coisas ao mesmo tempo — o ramo baloiça em segundos, a
 * folha na ponta agita-se em frações de segundo.
 *
 * Daí `uMicro`: duas ondas a ~1,8 e ~2,3 Hz, com amplitude de 1 a 2px APENAS
 * nas pontas, e fase que muda muito mais depressa ao longo da largura do que
 * a do balanço (`fx * 9.7` contra `fx * 4.1`). É essa frequência espacial
 * alta que faz cada punhado de flores tremer por sua conta em vez de o painel
 * todo vibrar — a diferença entre agitação e "shake".

/** Fração da amplitude que sobra na raiz. Não é zero: raiz "quase" imóvel. */
const PRESO = 0.06;

export const VERTEX_SHADER = /* glsl */ `
  attribute vec2 aPos;

  uniform vec2  uQuad;    // tamanho do quad em px, com a margem de folga
  uniform vec2  uOrigem;  // canto superior esquerdo do quad, em px
  uniform vec2  uFaixa;   // tamanho real da composição em px
  uniform vec2  uEcra;    // tamanho do canvas em px
  uniform vec2  uAmp;     // amplitude nas pontas, em px
  uniform float uMicro;   // amplitude da agitação nas pontas, em px
  uniform float uPonta;   // altura, em fração da faixa, onde acabam as flores
  uniform float uTempo;

  varying vec2 vUv;

  void main() {
    vec2 px = uOrigem + aPos * uQuad;
    vUv = px / uFaixa;

    // A folhagem não chega ao fundo da faixa. Normalizar pela extensão real
    // das flores é o que põe as PONTAS na amplitude máxima — normalizar pela
    // faixa toda deixava-as a 70% do percurso pedido.
    float h = clamp(vUv.y / uPonta, 0.0, 1.0);
    float rigidez = pow(h, 1.6);
    float fx = aPos.x;

    float ondaX =
        sin(uTempo * 0.62 + h * 2.3 + fx * 4.1) * 0.55
      + sin(uTempo * 0.41 - h * 3.7 + fx * 2.3) * 0.30
      + sin(uTempo * 0.23 + fx * 1.3) * 0.15;

    // Vertical noutra fase: o que dá o baloiço em oito, e não um vaivém reto.
    float ondaY =
        sin(uTempo * 0.53 + h * 3.1 + fx * 3.4) * 0.62
      + sin(uTempo * 0.29 - fx * 2.7 + 1.7) * 0.38;

    float peso = ${PRESO.toFixed(2)} + ${(1 - PRESO).toFixed(2)} * rigidez;
    vec2 desloc = vec2(ondaX * uAmp.x, ondaY * uAmp.y) * peso;

    // A agitação. Os coeficientes somam 1,0, por isso o pico é exatamente
    // uMicro. As frequências ficam em 1,80 / 2,26 / 2,00 Hz depois de uTempo
    // ser escalado pela VELOCIDADE — estão acopladas a ela de propósito: é
    // tudo o mesmo vento, e se ele acelerar as folhas aceleram com ele.
    //
    // O piso é 0,05 e não 0,06 como no balanço: a raiz fica em ~0,1px, que é
    // o "praticamente imóvel" pedido.
    float agita = 0.05 + 0.95 * rigidez;
    float microX =
        sin(uTempo * 6.85 + fx *  9.7 + h * 5.7) * 0.60
      + sin(uTempo * 8.60 - fx * 13.3 + h * 3.1) * 0.40;
    // O vertical entra a 45%: uma folha ao vento não se agita só na
    // horizontal, e sem ele a agitação lê-se mecânica.
    float microY = sin(uTempo * 7.60 + fx * 11.5 - h * 4.3);
    desloc += vec2(microX * uMicro, microY * uMicro * 0.45) * agita;

    vec2 clip = (px + desloc) / uEcra * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  }
`;

export const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;

  uniform sampler2D uTex;
  varying vec2 vUv;

  void main() {
    // As texturas vão com alfa direto (não pré-multiplicado) para o resample
    // do browser não sujar as arestas; a pré-multiplicação faz-se aqui, que é
    // o que a mistura ONE / ONE_MINUS_SRC_ALPHA espera.
    vec4 c = texture2D(uTex, vUv);
    gl_FragColor = vec4(c.rgb * c.a, c.a);
  }
`;
