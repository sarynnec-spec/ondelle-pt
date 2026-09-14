import Image from "next/image";

import { RevealText, RevealBlock } from "@/components/motion/reveal";
import { SurfaceFill } from "@/components/ui/surface";
import { Wordmark } from "@/components/ui/wordmark";
import { contactos, brand, fecho, footer } from "@/lib/content";

/** Blocos 15 e 16 — contactos e fecho cinematográfico. */
export function Contacts({ decoracao }: { decoracao?: React.ReactNode }) {
  return (
    <>
      <section
        id="contactos"
        aria-labelledby="contactos-titulo"
        className={`gutter bg-fundo py-section${decoracao ? " relative isolate overflow-hidden" : ""}`}
      >
        {decoracao}

        {/* O sobretítulo "Contactos" e a legenda "Clínica de Estética
            Avançada" saíram: o logótipo já traz as duas coisas desenhadas
            (o nome · ESTETICA AVANCADA) e repeti-las por baixo dava a
            mesma frase duas vezes, uma em ouro e outra em cinzento. O nome
            da secção continua a existir para quem navega — está no `alt` do
            logótipo e no contador lateral. */}

        {/* O nome desenhado em vez de composto. `RevealBlock` e não
            `RevealText` porque este último parte o conteúdo em linhas e
            caracteres para o animar — com uma imagem lá dentro não tem o que
            partir. O `h2` fica, com o nome no `alt`: para quem lê o ecrã, o
            cabeçalho continua a existir.

            O ficheiro é um quadrado com o desenho ao meio: 830×598 dentro de
            1024×1024, ou seja 17,5% de vazio em cima, 24,1% em baixo e 8,6% à
            esquerda. Deixado assim abria um buraco entre o sobretítulo e a
            linha de baixo, e o logótipo ficava desalinhado da goteira. As
            margens negativas descontam exatamente essas fracções da largura
            pedida — é aritmética sobre o ficheiro, não olhómetro, e evita ter
            de recortar o original.

            A largura vive numa variável (`--logo`) e não repetida em cada
            margem: as três compensações são fracções dela, e com o valor num
            sítio só mudar o tamanho não as desalinha.

            Em telemóvel são 62vw — era 80vw, e ao lado do ramo de buganvília
            ficavam dois volumes a disputar a mesma faixa.

            Em ecrã grande o logótipo anda 25% da própria largura para a
            direita (15% + 10%) e sobe 7%. O deslocamento à direita entra na
            margem esquerda, que com o desconto dos 8,6% do ficheiro fica em
            +16,4%. A subida é a soma no topo E a subtração em baixo: sem a
            segunda, encurtar só o topo arrastava a grelha de contactos atrás
            do logótipo. Assim sobe o logótipo e mais nada. */}
        <RevealBlock>
          <h2
            id="contactos-titulo"
            // Recalculado para o ficheiro NOVO. O anterior trazia 17,5% de
            // vazio no topo, 24,1% em baixo e 8,6% à esquerda, e as margens
            // negativas existiam para os descontar. Este quase não tem vazio
            // (1,5% / 2,3% / 4,2%), por isso o que resta aqui é o gesto de
            // direção de arte — subir 7% e correr 25% para a direita em ecrã
            // grande — e não a compensação do ficheiro.
            className="-mt-[calc(var(--logo)*0.010)] -mb-[calc(var(--logo)*0.015)] -ml-[calc(var(--logo)*0.042)] [--logo:min(54.5vw,30rem)] lg:-mt-[calc(var(--logo)*0.060)] lg:mb-[calc(var(--logo)*0.055)] lg:ml-[calc(var(--logo)*0.208)] lg:[--logo:28.5rem]"
          >
            <Wordmark
              id="contactos"
              label={contactos.title}
              className="h-auto w-[var(--logo)]"
            />
          </h2>
        </RevealBlock>

        {/* O afastamento até à grelha passou a viver aqui. Estava no `mb-16`
            da legenda que saiu, e sem ele o logótipo colava à linha. */}
        <div className="mt-16 grid gap-12 border-t border-texto/15 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="label mb-5 text-texto-fraca">Morada</p>
            <address className="not-italic leading-[1.7] text-texto">
              {brand.address.street}
              <br />
              {brand.address.postal} {brand.address.city}
            </address>
          </div>

          <div>
            <p className="label mb-5 text-texto-fraca">Contactos</p>
            <a href={brand.booking} className="block text-texto hover:text-ouro">
              {brand.phone}
            </a>
            <p className="label mt-2 mb-4 text-texto-fraca">{brand.phoneNote}</p>
            <a href={brand.booking} className="block text-texto hover:text-ouro">
              Ligar para a clínica
            </a>
            {/* O email fica DEPOIS do WhatsApp de propósito: é o canal mais
                lento dos dois e neste negócio quem escreve quer marcação. */}
            <a
              href={`mailto:${brand.email}`}
              className="mt-3 block break-all text-texto hover:text-ouro"
            >
              {brand.email}
            </a>
          </div>

          <div>
            <p className="label mb-5 text-texto-fraca">Instagram</p>
            <a
              href={brand.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-texto hover:text-ouro"
            >
              {brand.instagram.handle}
            </a>
          </div>

          <div>
            <p className="label mb-5 text-texto-fraca">Horário</p>
            <dl className="space-y-3">
              {brand.hours.map((h) => (
                <div key={h.dias}>
                  <dt className="text-texto-suave">{h.dias}</dt>
                  <dd className="text-texto">{h.horas}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Bloco 16 — fecho cinematográfico. */}
      <section aria-labelledby="fecho-titulo" className="relative overflow-hidden bg-verde text-fundo">
        <SurfaceFill tone="verde" src={fecho.imagem} alt={fecho.alt} className="opacity-90" />

        {/* O `min-h-svh` é do desenho — o fecho ocupa o ecrã todo. Em tablet ao
              alto isso dava 1366 px para 455 px de texto: MEDIDO a 2026-09-08,
              452 px de vazio em cima e 459 em baixo. O tecto de 44rem devolve
              a proporção sem tocar no computador, onde o `svh` já é menor. */}
        <div className="gutter relative flex min-h-svh flex-col justify-center py-section max-[1199px]:min-h-[min(100svh,44rem)] max-[1199px]:py-[clamp(4rem,9vw,7rem)]">
          {/* O rosto em ouro, no espaço que sobrava à direita.
              É um recorte — 70% do ficheiro é transparente — por isso assenta
              sobre o verde sem moldura nem fundo próprio. `object-contain`
              para não o cortar, ancorado ao canto para encostar em vez de
              flutuar. Fica antes do texto no documento, logo por baixo dele no
              empilhamento; mas nunca lá chega, porque ocupa 44% da largura e o
              texto está limitado a 42ch.

              Vive DENTRO deste bloco e não solto na secção. A secção inclui o
              rodapé, por isso um `bottom-0` lá fora ancorava a imagem ao fim
              do rodapé — em telemóvel ficava abaixo da dobra e via-se dela uma
              réstia. Aqui, o `bottom-0` é o fim do écrã do fecho, que é o que
              se quer.

              O recuo negativo à direita anula a goteira deste bloco: sem ele a
              imagem parava à distância da margem do texto em vez de encostar
              à borda.

              Em telemóvel encolhe e sobe para o lado do título: o ecrã é
              estreito e "A sua beleza. O nosso cuidado." ocupa três linhas
              curtas à esquerda, com a metade direita livre à altura delas. Em
              baixo, onde estava, ficava longe da frase e disputava espaço com
              o botão.

              O `max-md:-translate-x-[10%]` tira-o do CANTO, a pedido dela.

              A primeira tentativa foram 3% lidos como 3% da caixa — e a caixa
              é `42vw`, logo 5px num ecrã de 390. Não se via, e com razão: ela
              voltou a dizer que estava encostado à direita. O 3% passou a ser
              lido como 3% do ECRÃ, que é o que se vê, e são 12px. Com os 5
              anteriores dá 17px, ou seja 10% da caixa.

              O número não é redondo por acaso. A caixa está puxada para fora
              pelo `right` negativo, exatamente uma goteira (16,4px a 390), e
              a imagem encosta ao lado direito dela (`object-position: 100%`).
              Deslocá-la 17px devolve-lhe essa goteira: o rosto deixa de
              sangrar pela borda e fica rente ao ecrã em vez de cortado.

              Computador e tablet ficam nos -10% de sempre — o valor é o
              mesmo, mas por caminhos diferentes: as duas media queries não se
              cruzam. */}
          {/* Pedido dela: descer o rosto e encolhê-lo 15%. A largura desce
              de 41,4% para 35,2% (= 41,4 × 0,85) em computador e de 42vw para
              35,7vw em telemóvel — a mesma fração nos dois, para não ficarem
              tamanhos diferentes conforme o ecrã.

              A descida vai por `object-position` e não por deslocação: a
              caixa ocupa a altura toda e a imagem é `contain`, por isso quem
              manda na posição vertical é a repartição da folga. A 50% ficava
              centrada; a 100% assenta no fundo da caixa. */}
          <div className="pointer-events-none absolute top-[30%] right-[calc(var(--spacing-gutter)*-1)] h-[30%] w-[35.7vw] max-md:-translate-x-[10%] md:inset-y-0 md:top-0 md:h-auto md:w-[35.2%] md:-translate-x-[10%]">
            <Image
              src="/imagens/destaque/rosto-ouro.png"
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 768px) 46vw, 62vw"
              className="object-contain [object-position:100%_100%] md:[object-position:100%_50%]"
            />
          </div>

          <RevealText
            as="h2"
            id="fecho-titulo"
            className="mb-10 max-w-[11ch] text-[length:var(--text-display)]"
          >
            {fecho.title.split("\n").map((line) => (
              <span key={line} className="ouro-metal-linhas block w-fit">
                {line}
              </span>
            ))}
          </RevealText>

          <RevealBlock>
            <p className="mb-14 max-w-[42ch] text-[length:var(--text-lead)] leading-[1.62] text-fundo/70">
              {fecho.body}
            </p>
            <a
              href={brand.booking}
              className="label ouro-vivo inline-block rounded-full px-10 py-5 transition-shadow duration-500 hover:shadow-[0_0_40px_-12px_var(--color-ouro)]"
            >
              {fecho.cta}
            </a>
          </RevealBlock>
        </div>

        <footer className="gutter relative border-t border-verde-linha py-12">
          <div className="flex flex-wrap items-end justify-between gap-8">
            {/* Mesmo ficheiro, em ponto pequeno. As fracções de vazio deste
                logótipo são pequenas (1,5% / 2,3% / 4,2%), o que a 180px de
                largura dá 2px em cima, 3px em baixo e 8px à esquerda. */}
            <Wordmark
              id="rodape"
              label={brand.name}
              className="-mt-[2px] -mb-[3px] -ml-[8px] h-auto w-[180px]"
            />
            <nav aria-label="Legal e políticas">
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {footer.legal.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.href.startsWith("http") ? "_blank" : undefined}
                      rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="label text-fundo/55 transition-colors hover:text-ouro"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          {/* Registo na ERS e licença de funcionamento. Numa clínica isto
              não é rodapé decorativo. Aqui deixou de ser um número de registo
              e passou a ser a declaração de que a marca é fictícia — por isso
              saiu da classe `label`: 11px em maiúsculas a 35% de opacidade dava
              1,1:1 de contraste, ou seja, invisível. Uma declaração que ninguém
              consegue ler não declara nada. Caixa normal, 12px e opacidade a
              75% põem-na acima de 4,5:1 sem gritar. */}
          <p className="mt-10 max-w-[62ch] text-[12px] leading-[1.6] text-fundo/75 md:pl-32">
            {footer.registos}
          </p>
          <p className="label mt-2 text-fundo/35 md:pl-32">
            © {new Date().getFullYear()} {brand.full} · {brand.city}
          </p>
        </footer>
      </section>
    </>
  );
}
