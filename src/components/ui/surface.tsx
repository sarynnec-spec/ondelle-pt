import Image from "next/image";
import { MolduraFio } from "@/components/ui/moldura-fio";
import { cn } from "@/lib/utils";

/**
 * Moldura de imagem ou vídeo.
 *
 * Sem `src`, desenha um gradiente derivado das cores da marca — a ausência
 * de fotografia é um estado legítimo, não um esquecimento. Com `src`,
 * entrega o ficheiro real no mesmo enquadramento e proporção.
 */
const tones = {
  verde:
    "radial-gradient(70% 56% at 30% 26%, #123c39, transparent 66%), radial-gradient(62% 60% at 80% 78%, #092623, transparent 64%), linear-gradient(166deg, #0d322f, #092623)",
  escuro:
    "radial-gradient(58% 48% at 32% 24%, #123c39, transparent 62%), linear-gradient(168deg, #0d322f, #092623)",
  ouro: "radial-gradient(68% 54% at 28% 24%, #e4c489, transparent 64%), radial-gradient(58% 56% at 80% 78%, #b98e46, transparent 62%), linear-gradient(170deg, #d6ac60, #a87f3e)",
  // Acompanhou a inversão da base: era branco/bege, é agora a rampa do
  // verde. Os valores são fixos e não tokens porque um gradiente precisa de
  // paragens concretas — mas seguem os degraus de `--color-fundo`, `-2` e
  // `-3`, que aqui SOBEM em luminosidade, senão a moldura sem fotografia
  // desaparecia dentro da página.
  fundo:
    "radial-gradient(66% 54% at 26% 22%, #ffffff, transparent 62%), radial-gradient(58% 58% at 82% 78%, #e6e2da, transparent 64%), linear-gradient(162deg, #f4f2ee, #dedad2)",
} as const;

type Tone = keyof typeof tones;

export function Surface({
  tone = "verde",
  aspect = "4 / 5",
  className,
  src = null,
  alt,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
  contorno,
  fioContinuo = false,
  children,
}: {
  tone?: Tone;
  aspect?: string;
  className?: string;
  src?: string | null;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  /**
   * Fio a contornar a moldura, com os cantos arredondados a acompanhar.
   *
   * A cor é dada por quem usa, e não deduzida aqui, porque o que manda é o
   * fundo da SECÇÃO e não o tom da moldura: ouro sobre o verde, verde sobre o
   * claro. Sem valor, a moldura fica como estava — de canto vivo e sem fio.
   */
  contorno?: "ouro" | "verde";
  /**
   * Acrescenta ao contorno um segmento curto a percorrê-lo, sem parar.
   *
   * O `MolduraFio` já o sabia fazer (`continuo`) mas só o vídeo panorâmico lhe
   * chegava — a `Surface` não tinha por onde o pedir. Fica desligado por
   * omissão: nos cartões de tratamento o fio desenha-se à entrada e pára, e é
   * assim que deve continuar. Só faz efeito com `contorno`.
   */
  fioContinuo?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grain relative overflow-hidden bg-fundo-2",
        // O arredondamento vai no contentor, que é quem recorta a fotografia.
        // 14px: o suficiente para tirar a dureza do canto reto sem virar
        // cartão de aplicação.
        contorno && "rounded-[14px]",
        className,
      )}
      // O gradiente fica SEMPRE, mesmo havendo fotografia.
      //
      // Antes desaparecia assim que `src` existisse, e isso abria um buraco:
      // as imagens são `lazy`, por isso entre a moldura entrar no ecrã e o
      // ficheiro acabar de descarregar a caixa não tinha fundo nenhum — nem
      // gradiente, nem cor — e via-se a página por baixo. Numa moldura
      // pequena passa despercebido; na do Rosto, que ocupa o ecrã todo, era
      // um ECRÃ BRANCO no meio do scroll. Medido em rede lenta: imagem por
      // carregar e `background-image: none`.
      //
      // Com o gradiente por baixo, o pior caso passa a ser a fotografia a
      // aparecer sobre a cor da marca, que é o comportamento pretendido.
      style={{ aspectRatio: aspect, backgroundImage: tones[tone] }}
      aria-hidden={src ? undefined : true}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes={sizes}
          priority={priority}
          // Aparece com um esbatimento curto em vez de saltar de repente
          // sobre o gradiente. `opacity-0` mais `onLoad` seria pior: falharia
          // com imagens vindas da cache, que disparam o evento antes da
          // hidratação. A animação CSS corre uma vez e não depende de JS.
          className="animate-[surgir_0.45s_ease-out_both] object-cover"
        />
      ) : null}
      {contorno ? <MolduraFio cor={contorno} continuo={fioContinuo} /> : null}
      {children}
    </div>
  );
}

/** Variante que preenche o contentor — para secções fixadas e full-bleed. */
export function SurfaceFill({
  tone = "escuro",
  className,
  src = null,
  alt,
  priority = false,
  semFundo = false,
  inteiraNoMovel = false,
  children,
}: {
  tone?: Tone;
  className?: string;
  src?: string | null;
  alt?: string;
  priority?: boolean;
  /**
   * Em telemóvel, deslocar o corte para onde está a figura.
   *
   * O ecrã é alto e estreito e a fotografia é deitada: `object-cover` enche a
   * caixa e corta as laterais. Centrado, o corte apanhava fundo dos dois lados
   * e cortava a mulher, que está à direita do enquadramento. Puxar a âncora
   * para 68% põe-na dentro do que sobra.
   *
   * A alternativa era `contain`, que mostra tudo — mas deixa o fundo a
   * descoberto à volta, e foi isso que ela pediu para tirar.
   */
  inteiraNoMovel?: boolean;
  /**
   * Não pintar o gradiente por baixo da fotografia.
   *
   * Serve um caso só: quando esta moldura é ESCALADA e a fotografia é um
   * recorte com fundo transparente. O gradiente escalaria com ela e desenhava
   * um retângulo a encolher e a crescer à volta da figura — via-se a aresta.
   * Nesses casos o fundo passa para o elemento que não escala, e aqui fica só
   * o recorte.
   *
   * Fora disso NÃO usar: é o gradiente que evita o buraco branco enquanto a
   * fotografia descarrega.
   */
  semFundo?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        // O grão é uma textura de ruído em `soft-light` por cima da caixa
        // toda. Com fundo, é o que dá corpo ao gradiente. SEM fundo é um
        // problema: a caixa é transparente e escala, por isso o ruído pinta
        // um RETÂNGULO com um verde ligeiramente diferente sobre o fundo
        // fixo, com aresta à vista e a mudar de tamanho com o zoom. Não há
        // superfície nenhuma para texturar aqui — só um recorte.
        semFundo ? "absolute inset-0" : "grain absolute inset-0",
        className,
      )}
      // Mesma razão do `Surface`: nunca ficar sem fundo enquanto a fotografia
      // não chega. Aqui é ainda mais importante — esta variante preenche o
      // ecrã inteiro, por isso a falta de fundo lê-se como página partida.
      // A exceção é `semFundo`, e nesse caso quem garante o fundo é o
      // elemento de cima — ver a nota na prop.
      style={{ backgroundImage: semFundo ? undefined : tones[tone] }}
      aria-hidden={src ? undefined : true}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes="100vw"
          priority={priority}
          className={cn(
            "animate-[surgir_0.45s_ease-out_both] object-cover",
            inteiraNoMovel && "[object-position:68%_42%] md:[object-position:50%_50%]",
          )}
        />
      ) : null}
      {children}
    </div>
  );
}
