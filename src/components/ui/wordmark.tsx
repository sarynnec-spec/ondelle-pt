/**
 * Wordmark ONDELLE — desenhado, não fotografado.
 *
 * ## Porque deixou de ser um PNG
 *
 * O `marca/ondelle-wordmark.png` (1330×356) foi composto com tipo de sistema
 * e ouro CHAPADO. Duas coisas ficavam mal:
 *
 *   · as letras não eram as do site — o resto da página é Instrument Serif e
 *     a marca era outro serifado, com outra modulação e outras proporções;
 *   · o ouro era uma cor só, enquanto todos os títulos correm a rampa
 *     metálica de `ouro-metal`. Lado a lado com "Your beauty. Our care." a
 *     marca lia-se baça.
 *
 * Em vetor resolve-se tudo de uma vez: a fonte é a do site porque é a mesma
 * `--font-display`, o ouro é a mesma rampa, e não há resolução que chegue —
 * a marca fica limpa a 100px no cabeçalho e a 456px no fecho.
 *
 * ## O viewBox é o do ficheiro antigo, de propósito
 *
 * `0 0 1330 356` são as medidas exatas do PNG, e as coordenadas aqui dentro
 * foram MEDIDAS nele, alfa a alfa, não estimadas:
 *
 *   | bloco        | y            | x            |
 *   |--------------|--------------|--------------|
 *   | ONDELLE      | 2,0%–52,2%   | 2,0%–97,9%   |
 *   | filete       | 74,2%–74,7%  | 26,8%–73,0%  |
 *   | ESTÉTICA     | 85,7%–97,8%  | 28,6%–70,9%  |
 *
 * Manter a mesma caixa e a mesma tinta lá dentro é o que deixa intactas as
 * margens negativas dos três lugares que o usam — elas descontam as frações
 * de vazio do ficheiro (1,5% em cima, 2,3% em baixo, 4,2% à esquerda) e
 * estão calibradas a esses números. Mudar o enquadramento aqui obrigava a
 * reabrir o cabeçalho, o fecho e o rodapé.
 *
 * ## `textLength` e não um tamanho de letra à sorte
 *
 * A largura de cada palavra é imposta (`textLength` + `lengthAdjust`), por
 * isso a marca ocupa exatamente a mesma mancha que ocupava antes, seja qual
 * for a métrica com que a fonte acabe por carregar. O que se afina pelo
 * `fontSize` é só a ALTURA das maiúsculas — e esses dois números saem do
 * cap-height medido da fonte, não de uma razão suposta (ver abaixo).
 *
 * `lengthAdjust="spacing"` e não `spacingAndGlyphs`: o segundo esticaria os
 * desenhos das letras. Aqui só se mexe no espaço entre elas, que é o que a
 * marca já fazia.
 *
 * ## De onde vêm os dois `fontSize`
 *
 * Do cap-height REAL do Instrument Serif, lido no browser com
 * `TextMetrics.actualBoundingBoxAscent` sobre um em de 1000: **0,7344**.
 * `getBBox()` não serve para isto — devolve a caixa de linha (ascendente
 * mais descendente) e dava 332px para um corpo de 257, o que levava a
 * encolher a marca até ela não bater com nada.
 *
 *   ONDELLE     topo 2,0% · base 52,2% de 356 → maiúscula 178,7 → 243,3
 *   ESTÉTICA    topo 85,7% · base 97,8% de 356 → maiúscula  43,1 →  58,7
 *
 * ## A segunda palavra na versão portuguesa
 *
 * Era "AESTHETICS" (10 letras) e passou a "ESTÉTICA" (8). O `textLength`
 * continua nos mesmos 562,6, por isso a mancha da marca não se mexeu — o que
 * mudou foi o espaço entre letras, que passou de 56 para 70 unidades por
 * caractere. Fica mais aberta, o que assenta ao registo da marca.
 *
 * "ESTÉTICA AVANÇADA" NÃO cabe aqui: 17 caracteres nos mesmos 562,6 dão 33
 * unidades cada, abaixo da altura de maiúscula (43,1), e o
 * `lengthAdjust="spacing"` responderia com espaçamento negativo — as letras
 * sobrepunham-se. A palavra inteira vive no `contactos.subtitle`, em texto
 * corrente, onde tem largura para existir.
 *
 * O acento do É sobe acima da altura de maiúscula: topo em ~294 de 356,
 * contra os 266 onde acaba o filete. Sobra folga; não corta.
 */

/** Paragens da rampa de `ouro-metal` em globals.css. Mantê-las em sincronia. */
const RAMPA = [
  { pos: "0%", cor: "#583701" },
  { pos: "16%", cor: "#836330" },
  { pos: "36%", cor: "#ce9a44" },
  { pos: "50%", cor: "#fff5c1" },
  { pos: "64%", cor: "#fbd87a" },
  { pos: "84%", cor: "#836330" },
  { pos: "100%", cor: "#583701" },
];

export function Wordmark({
  id,
  className,
  label,
}: {
  /**
   * Sufixo do `id` do gradiente. É obrigatório porque a marca aparece três
   * vezes na mesma página: com um id fixo havia três elementos com o mesmo
   * identificador, que é HTML inválido.
   */
  id: string;
  className?: string;
  /** Vai para `aria-label`. A marca é conteúdo, não decoração. */
  label: string;
}) {
  const grad = `ondelle-ouro-${id}`;

  return (
    <svg
      viewBox="0 0 1330 356"
      role="img"
      aria-label={label}
      className={className}
      /* `userSpaceOnUse` com as pontas em (0,0) e (1330,356): numa caixa
         destas proporções essa diagonal é exatamente os 105deg do CSS. Em
         `objectBoundingBox` o ângulo achatava-se com a caixa. */
    >
      <defs>
        {/* O eixo vai MUITO para lá da caixa: começa em (-434,7 / -116,6) e
            acaba em (1764,7 / 472,6), que é a mesma direção de 105° esticada
            450 unidades para cada lado.

            Não é capricho. A rampa de `ouro-metal` vale #583701 nas duas
            pontas — a dois passos do verde #0D322F. Com o eixo colado à
            caixa, o "O" inicial caía nessa ponta e a 200px no cabeçalho
            desaparecia contra o fundo: media-se, mas não se via. Nos títulos
            grandes do site o mesmo escuro lê-se como profundidade; num
            logótipo de 200px come uma letra.

            Esticando o eixo, a tinta passa a viver entre os 21% e os 78% da
            rampa — nunca toca nos extremos. Fica o mesmo metal, das mesmas
            cores, sem nenhuma letra a apagar-se. */}
        <linearGradient
          id={grad}
          gradientUnits="userSpaceOnUse"
          x1="-434.7"
          y1="-116.6"
          x2="1764.7"
          y2="472.6"
        >
          {RAMPA.map((p) => (
            <stop key={p.pos} offset={p.pos} stopColor={p.cor} />
          ))}
        </linearGradient>
      </defs>

      <text
        x="26.6"
        y="185.8"
        textLength="1275.7"
        lengthAdjust="spacing"
        fontFamily="var(--font-display)"
        fontSize="243.3"
        fill={`url(#${grad})`}
      >
        ONDELLE
      </text>

      <rect x="356.4" y="264.1" width="614.5" height="2.8" fill={`url(#${grad})`} />

      <text
        x="380.4"
        y="348.2"
        textLength="562.6"
        lengthAdjust="spacing"
        fontFamily="var(--font-display)"
        fontSize="58.7"
        fill={`url(#${grad})`}
      >
        ESTÉTICA
      </text>
    </svg>
  );
}
