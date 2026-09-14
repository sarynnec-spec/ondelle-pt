import { RevealText, RevealBlock, RevealStagger } from "@/components/motion/reveal";
import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

/**
 * Bloco de declaração — título grande, corpo curto, fecho destacado.
 * Serve os blocos 02, 03, 11 e 13 da copy, que têm a mesma forma.
 */
export function Statement({
  id,
  label,
  title,
  body,
  beats,
  close,
  dark = false,
  decoracao,
  imagem,
  classeSeccao,
  rodape,
  children,
}: {
  id: string;
  label: string;
  title: string;
  body?: readonly string[];
  beats?: readonly string[];
  close?: string;
  dark?: boolean;
  /**
   * Decoração ancorada à raiz da secção — a buganvília, quando a há.
   *
   * Prop própria e não `children` porque tem de ficar FORA do fluxo do texto
   * e antes dele: é `absolute inset-0` e o conteúdo passa por cima. A secção
   * ganha `relative` só quando ela existe, para não alterar nada onde não há.
   */
  decoracao?: React.ReactNode;
  /**
   * Fotografia numa coluna à direita, a partir de `lg`.
   *
   * Sem ela nada muda: o texto ocupa a largura toda, como nas outras três
   * secções que usam este componente. Com ela, o texto recolhe a uma coluna e
   * a fotografia enche o lado que estava vazio — e o corpo passa a uma coluna
   * só, porque duas dentro de metade da largura ficavam com linhas curtas
   * de mais para se lerem bem.
   */
  imagem?: {
    src: string;
    alt: string;
    /**
     * Sem moldura: nem canto arredondado, nem fio, nem fundo.
     *
     * A fotografia deixa de viver numa coluna da grelha e passa a ocupar a
     * faixa direita da secção inteira, rodada e a sangrar pelas pontas. Só
     * faz sentido com recortes — numa fotografia retangular ver-se-iam as
     * arestas a cortar em diagonal.
     */
    nua?: boolean;
    /** Rotação, com unidade. 90deg põe de pé uma imagem deitada. */
    rodar?: string;
    /** Largura antes de rodar. Em `vh` porque o que ela tem de cobrir é a
        ALTURA da secção, não a largura. */
    medida?: string;
    /** Empurrão horizontal, para compensar o estreitamento da rotação. */
    empurrar?: string;
    /**
     * Valores próprios para telemóvel.
     *
     * Não é o mesmo desenho mais pequeno: em ecrã largo a hélice fica de pé na
     * faixa direita, e em telemóvel não há faixa direita nenhuma — o texto
     * ocupa a largura toda. Aí atravessa a secção na diagonal, por trás do
     * texto, que é onde há espaço.
     */
    movel?: { rodar?: string; medida?: string; deslocar?: string };
  };
  /**
   * Classes extra na própria secção, aplicadas em ÚLTIMO lugar.
   *
   * A ordem importa: o `cn` é `twMerge`, por isso um `pt-*` passado aqui
   * substitui o topo do `py-section` sem lhe tocar na base — que é como a
   * filosofia sobe o título sem que as outras três secções mudem.
   */
  classeSeccao?: string;
  /**
   * Conteúdo DEPOIS do fecho.
   *
   * O `children` entra antes dele, por isso não servia: a filosofia precisa
   * de pôr a fotografia da chaise a seguir a "O nosso compromisso é
   * simples...", e só em telemóvel. Quem não passa nada não vê diferença.
   */
  rodape?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className={cn(
        "gutter py-section",
        // `isolate` cria o contexto de empilhamento. Sem ele, a decoração a
        // `-z-10` cai para trás do fundo da secção e não se vê.
        (decoracao || imagem?.nua) && "relative isolate overflow-hidden",
        dark ? "bg-verde text-fundo" : "bg-fundo text-texto",
        classeSeccao,
      )}
    >
      {decoracao}

      {/* A versão nua sai do fluxo: ancorada à direita da secção, rodada e
          maior do que a caixa, para as pontas caírem fora do ecrã em vez de
          aparecerem cortadas. A coluna de texto fica com metade da largura
          para não lhe correr por baixo. */}
      {imagem?.nua && imagem.movel ? (
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 md:hidden"
          style={{
            width: imagem.movel.medida ?? "65vw",
            rotate: imagem.movel.rodar ?? "-25deg",
            translate: imagem.movel.deslocar ?? "10% 35%",
            transformOrigin: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagem.src} alt="" className="h-auto w-full" />
        </div>
      ) : null}

      {imagem?.nua ? (
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-0 hidden md:block"
          style={{
            width: imagem.medida ?? "128vh",
            rotate: imagem.rodar ?? "95deg",
            // A rotação é em torno do centro, por isso a caixa desenhada fica
            // muito mais estreita do que o elemento e o conteúdo acaba longe
            // da margem: com `right-0` sozinho sobravam 355px. O empurrão
            // horizontal recupera essa distância. Vai no `translate` junto com
            // o -50% vertical porque as duas partes da mesma propriedade não
            // podem vir de sítios diferentes.
            translate: `${imagem.empurrar ?? "0px"} -50%`,
            transformOrigin: "center",
          }}
        >
          {/* `<img>` e não `next/image`: o elemento é rodado e a largura vem
              em `vh`, por isso o `sizes` do otimizador não teria como acertar
              — pediria sempre a medida errada. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagem.src} alt="" className="h-auto w-full" />
        </div>
      ) : null}

      <div
        className={cn(
          "relative",
          imagem?.nua && "md:max-w-[58%]",
          imagem &&
            !imagem.nua &&
            "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.58fr)] lg:items-center lg:gap-20",
        )}
      >
        <div>
      <p className={cn("label mb-8", dark ? "text-fundo/70" : "text-texto-fraca")}>{label}</p>

      <RevealText
        as="h2"
        id={`${id}-titulo`}
        className="mb-14 max-w-[18ch] text-[length:var(--text-title)]"
      >
        {title.split("\n").map((line) => (
          <span key={line} className={cn("block w-fit", dark ? "ouro-metal-linhas" : "verde-metal-linhas")}>
            {line}
          </span>
        ))}
      </RevealText>

      {body?.length ? (
        <div
          data-corpo
          className={cn("mb-12 grid gap-8", !imagem && "md:grid-cols-2 md:gap-16")}
        >
          {body.map((p, i) => (
            <RevealBlock key={i} delay={i * 0.07}>
              <p
                className={cn(
                  "max-w-[52ch] text-[length:var(--text-lead)] leading-[1.62]",
                  dark ? "text-fundo/70" : "text-texto-suave",
                )}
              >
                {p}
              </p>
            </RevealBlock>
          ))}
        </div>
      ) : null}

      {beats?.length ? (
        <RevealStagger className="mb-12 flex flex-col gap-3" stagger={0.11}>
          {beats.map((b) => (
            <p
              key={b}
              data-stagger-item
              className="font-display text-[length:var(--text-sub)] leading-[1.15]"
            >
              {b}
            </p>
          ))}
        </RevealStagger>
      ) : null}

      {children}

      {close ? (
        <RevealBlock>
          <p
            className={cn(
              "max-w-[34ch] border-t pt-8 font-display text-[length:var(--text-sub)] leading-[1.2]",
              dark ? "border-verde-linha" : "border-texto/15 text-texto",
            )}
          >
            {/* Ver nota em clinical.tsx: o metal não pode partilhar elemento
                com a borda, senão o fio é clonado linha a linha. */}
            {dark ? <span className="ouro-metal-linhas">{close}</span> : close}
          </p>
        </RevealBlock>
      ) : null}

      {rodape}
        </div>

        {imagem && !imagem.nua ? (
          <RevealBlock delay={0.1}>
            {/* `Surface` e não um `<img>` solto: traz o canto arredondado e o
                fio a contornar, os mesmos dos cartões de tratamento, e trata
                do recorte com `object-cover`. O fio vai a ouro por a secção
                ser verde. */}
            <Surface
              tone={dark ? "escuro" : "fundo"}
              aspect="2 / 3"
              src={imagem.src}
              alt={imagem.alt}
              contorno={dark ? "ouro" : "verde"}
              sizes="(min-width: 1024px) 34vw, 100vw"
              className="mt-14 w-full lg:mt-0"
            />
          </RevealBlock>
        ) : null}
      </div>
    </section>
  );
}
