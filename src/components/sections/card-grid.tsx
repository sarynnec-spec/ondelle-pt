import { RevealText, RevealBlock, RevealStagger } from "@/components/motion/reveal";
import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

type Item = {
  readonly n: string;
  readonly title: string;
  readonly body: string;
  readonly imagem: string | null;
  readonly alt: string;
};

/**
 * Título + introdução + cartões. Serve os blocos 05, 06, 08, 09 e 10 da
 * copy, que partilham a mesma forma — daí um componente em vez de cinco.
 */
export function CardGrid({
  id,
  label,
  title,
  intro,
  items,
  cta,
  dark = false,
  cols = 3,
  decoracao,
  cabecalhoCentrado = false,
}: {
  id: string;
  label: string;
  title: string;
  intro?: readonly string[];
  items: readonly Item[];
  cta?: string;
  dark?: boolean;
  cols?: 3 | 4;
  /**
   * Decoração ancorada à raiz da secção — a buganvília, quando a há.
   *
   * Prop própria e não `children` porque tem de ficar FORA do fluxo do texto
   * e antes dele: é `absolute inset-0` e o conteúdo passa por cima. A secção
   * ganha `relative` só quando ela existe, para não alterar nada onde não há.
   */
  decoracao?: React.ReactNode;
  /**
   * Junta o cabeçalho numa coluna só e põe-na ao meio, em vez de título à
   * esquerda e introdução à direita.
   *
   * Serve quando a decoração ocupa um dos lados: a duas colunas, a introdução
   * ia sempre parar debaixo da folhagem. Ao meio, a coluna é estreita e sobra
   * a faixa da direita inteira para o ramo. O texto continua alinhado à
   * esquerda — o que se centra é o bloco, não as linhas; centrar as linhas
   * destoava do resto do site, que é todo alinhado à esquerda.
   *
   * Abaixo de `md` não muda nada: já era coluna única e o limite de largura
   * é maior do que o ecrã.
   */
  cabecalhoCentrado?: boolean;
}) {
  const tone = dark ? "escuro" : "fundo";

  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className={cn(
        "gutter py-section",
        // `isolate` cria o contexto de empilhamento. Sem ele, a decoração a
        // `-z-10` cai para trás do fundo da secção e não se vê.
        decoracao && "relative isolate overflow-hidden",
        dark ? "bg-verde text-fundo" : "bg-fundo text-texto",
      )}
    >
      {decoracao}

      <div
        className={cn(
          "relative mb-16 grid gap-10",
          cabecalhoCentrado ? "mx-auto max-w-[54rem]" : "md:grid-cols-2 md:items-end",
        )}
      >
        <div>
          <p className={cn("label mb-6", dark ? "text-fundo/70" : "text-texto-fraca")}>{label}</p>
          <RevealText
            as="h2"
            id={`${id}-titulo`}
            className="max-w-[16ch] text-[length:var(--text-title)]"
          >
            {/* Regra do site: título grande em metal, texto pequeno chapado.
                A rampa vive num <span> e não no <h2>: `-linhas` obriga a
                `display: inline`, e num bloco isso apagava o `max-w` e as
                margens — os títulos passavam a atravessar o ecrã. Aqui o
                `max-w` está no <h2>, por isso o span pode ficar `inline`.

                NÃO voltar a pôr `inline-block` aqui. O SplitText parte este
                título em fragmentos (medido: "Tecnologia que " / "trabalha
                para " / "a sua " / "pele.") e coloca-os lado a lado dentro
                da mesma linha. Em `inline-block`, o espaço final de cada
                fragmento fica DENTRO da caixa e não é desenhado — lia-se
                "trabalha paraa suapele." em produção. Em `inline` o espaço
                pertence ao fluxo e aparece. */}
            <span className={cn(dark ? "ouro-metal-linhas" : "verde-metal-linhas")}>
              {title}
            </span>
          </RevealText>
        </div>

        {intro?.length ? (
          <RevealBlock>
            <div className="space-y-4">
              {intro.map((p) => (
                <p
                  key={p}
                  className={cn(
                    "max-w-[46ch] text-[length:var(--text-lead)] leading-[1.6]",
                    dark ? "text-fundo/70" : "text-texto-suave",
                  )}
                >
                  {p}
                </p>
              ))}
            </div>
          </RevealBlock>
        ) : null}
      </div>

      <RevealStagger
        className={cn(
          "grid gap-x-8 gap-y-14",
          cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {items.map((item) => (
          <article key={item.n} data-stagger-item className="cartao-moldura flex flex-col">
            {/* Cada moldura desliza a um ritmo ligeiramente diferente do
                texto — é o que dá profundidade sem parecer efeito. */}
            <div data-parallax="0.07">
            <Surface
              tone={tone}
              aspect="4 / 5"
              // O fio segue o fundo da secção, não o tom da moldura: ouro
              // sobre o verde, verde sobre o claro.
              contorno={dark ? "ouro" : "verde"}
              className="mb-7 w-full"
              src={item.imagem}
              alt={item.alt}
              sizes={
                cols === 4
                  ? "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              }
            />
            </div>
            <p className={cn("label mb-4", dark ? "text-fundo/70" : "text-texto-fraca")}>{item.n}</p>
            <h3 className="mb-4 text-[length:var(--text-sub)]">
              <span className={cn(dark ? "ouro-metal-linhas" : "verde-metal-linhas")}>{item.title}</span>
            </h3>
            <p
              className={cn(
                "max-w-[38ch] leading-[1.62]",
                dark ? "text-fundo/65" : "text-texto-suave",
              )}
            >
              {item.body}
            </p>
          </article>
        ))}
      </RevealStagger>

      {cta ? (
        <RevealBlock>
          <a
            href="#marcacao"
            className={cn(
              "label mt-16 inline-flex items-center gap-3 rounded-full border px-8 py-4 transition-colors duration-300",
              dark
                ? "border-ouro/50 ouro-metal hover:opacity-75"
                : "border-texto/25 text-texto hover:bg-verde hover:text-fundo",
            )}
          >
            {cta}
            <span aria-hidden>→</span>
          </a>
        </RevealBlock>
      ) : null}
    </section>
  );
}
