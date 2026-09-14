import { Hero } from "@/components/sections/hero";
import { Statement } from "@/components/sections/statement";
import { CardGrid } from "@/components/sections/card-grid";
import { Clinical } from "@/components/sections/clinical";
import { Face } from "@/components/sections/face";
import { Journey } from "@/components/sections/journey";
import { Results } from "@/components/sections/results";
import { Cta } from "@/components/sections/cta";
import { Marcacao } from "@/components/sections/marcacao";
import { Contacts } from "@/components/sections/contacts";
import { Flores } from "@/components/motion/flores";
import { FloresVideo } from "@/components/motion/flores-video";
import { Laminas } from "@/components/motion/laminas";
import { VideoPanorama } from "@/components/motion/video-panorama";
import { KineticLine } from "@/components/motion/kinetic-line";
import { Dome } from "@/components/sections/dome";
import { HorizontalScroll } from "@/components/motion/horizontal-scroll";
import { HorizontalExperience, PainelHorizontal } from "@/components/motion/horizontal-experience";
import { Surface } from "@/components/ui/surface";

import { RevealText, RevealBlock } from "@/components/motion/reveal";

import {
  espaco,
  intro,
  filosofia,
  medicinaEstetica,
  tecnologia,
  corpo,
  pele,
  rituais,
  experiencia,
} from "@/lib/content";

/**
 * Server Component. Os wrappers de animação são client mas recebem o
 * conteúdo por `children` — o texto continua renderizado no servidor.
 *
 * A ordem segue a narrativa: Descobrir → Avaliar → Personalizar → Tratar
 * → Acompanhar. As linhas cinéticas separam os andamentos, alternando
 * fundo claro e verde para que nenhuma secção pese sobre a seguinte.
 */
export default function Page() {
  return (
    <>
      <Hero />

      {/* Corrida horizontal: a cúpula com as flores e a introdução ficam lado
          a lado e atravessam o ecrã enquanto se rola. Termina antes da secção
          verde, que volta ao vertical. As flores continuam intactas — o vento
          é do shader e não depende do scroll. */}
      <HorizontalExperience label="Introdução" className="bg-fundo">
        <PainelHorizontal>
          {/* A cúpula sobe sobre a hero e entrega a secção seguinte. */}
          <Dome
            titulo="Compreender antes de tratar"
            legendaEsq="Lisboa"
            legendaDir="Avenida da Liberdade"
            selo="ONDELLE · ESTÉTICA AVANÇADA · "
            // O recuo de topo subiu de 18vh para 26vh: é o que deixa a faixa de
            // buganvília pender do topo da secção sem chegar ao título em arco.
            className="h-full bg-fundo pt-[26vh]"
            semParallax
            decoracao={<FloresVideo clipe="01" ancora="superior-esquerdo" />}
          />
        </PainelHorizontal>

        {/* `painel-largo`: SÓ este painel cresce em telemóvel (ver globals.css).
            A cúpula fica à largura do ecrã, como sempre esteve — alargá-la
            também espalhava as flores e o título em arco por 1491px, dos quais
            só se vêem 430 de cada vez, e no meio ficava um ecrã de branco. */}
        <PainelHorizontal className="painel-largo flex items-center">
          <Statement
            id="introducao"
            label={intro.label}
            title={intro.title}
            body={intro.body}
            // O fecho ("Porque o verdadeiro luxo...") NÃO vai pela prop: ela
            // desenha-o depois do `children`, e aqui ele tem de vir ANTES da
            // fotografia, logo a seguir ao parágrafo. Vai escrito em baixo,
            // com as mesmas classes que o `Statement` lhe daria em secção
            // clara, para não haver dois fechos com aspetos diferentes.
            decoracao={
              <>
                {/* A medida de telemóvel vai em `svh` e não em `vw` porque
                    aqui o painel é mais largo do que o ecrã (ver o bloco da
                    corrida horizontal em globals.css): `vw` mediria a janela
                    e não o painel. 67svh é a mesma fração do painel que os
                    42vw de computador — 605px em 1440. */}
                {/* `z-10`: nem as flores nem a figura tinham z-index, por
                    isso quem pintava por cima era quem vinha depois no DOM —
                    e era a figura. Pedido dela: a buganvília à FRENTE. Vai
                    aqui e não a baixar a figura para o `z-index` continuar a
                    ler-se junto do elemento que ele levanta. */}
                <FloresVideo clipe="03" ancora="superior-direito" larguraMovel="67svh" className="z-10" />
                {/* A figura vive na DECORAÇÃO e não no conteúdo: só assim o
                    `bottom-0` se mede pela secção. Dentro do conteúdo media
                    pelo bloco de texto e parava a 196px do fim do painel — em
                    telemóvel via-se pior ainda: ficava a pairar no meio do
                    branco, com um vazio grande por baixo.

                    UM só arranjo para os dois formatos, sem variante de
                    telemóvel. Isto só é possível porque o painel deixou de
                    ser do tamanho do ecrã: em telemóvel passa a 160svh de
                    largura e percorre-se de lado, com as mesmas proporções
                    do computador (ver globals.css). Antes não era — com o
                    painel à medida do ecrã, uma figura de 114vh dava 95% da
                    largura num telemóvel e engolia a coluna de texto.

                    A altura manda na largura porque o ficheiro é 1024×1536,
                    de rácio fixo. Vai em `svh` e não em `vh` para acompanhar
                    o painel, que é `h-svh`: em computador dá o mesmo, em
                    telemóvel `vh` mudaria com as barras do browser.

                    Os números são dela, afinados a olho em passagens
                    sucessivas: 42% da própria largura para dentro (65 → 55 → 42,
                    a pedido dela, para a afastar do texto),
                    e 114vh de altura (52 → 68 → 88 → 114), mais 8% a
                    DESCER — sem crescer, a pedido dela, para não sobrar
                    branco por baixo dos pés.

                    A subida de 30% foi feita por TAMANHO e não por
                    deslocação: deslocada, a figura pairava com 224px de
                    branco por baixo. Ancorada pelo fundo e mais alta, o topo
                    fica no mesmo sítio e os pés assentam no fim do branco. */}
                {/* Os `max-md:` são o afinamento pedido por ela SÓ para
                    telemóvel, medido a olho sobre o arranjo já igual ao de
                    computador: menos um quarto de altura (114 → 85,5svh) e
                    mais 7% a descer (8 → 15), para fechar o branco que a
                    redução abria por baixo. O valor sem prefixo é o de
                    computador e não muda.

                    O `translate-x` de telemóvel (42 → 22 → 4 → 12,2%, agora
                    POSITIVO) alinha-a com a buganvília. Este último passo já
                    não foi a olho: medido no site publicado, a folhagem
                    ocupa 743→1182 dentro do painel e a figura 695→1104, os
                    dois valores em píxeis de tinta e não de caixa (ambas as
                    imagens têm margem vazia à volta, e comparar caixas dava
                    outro número). Faltavam-lhe 78px à direita, que são 16,2%
                    da caixa dela — daí -4 + 16,2. Bate certo nos 360, 390 e
                    430px de largura: nos três a distância dá os mesmos 16,2%.

                    Alinha pela DIREITA e não pelo centro. Pelo centro eram
                    97px e a figura passava 19px para lá do fim do painel, com
                    o braço direito cortado pelo `overflow-hidden` da secção.
                    Pela direita fica rente e sobra uma diferença de centros
                    de 19px — 4,6% da largura dela, que não se lê.

                    A unidade é `lvh` e não `svh` pela mesma razão do painel:
                    ambos têm de medir a mesma altura para a figura manter a
                    fração certa da moldura.

                    ATENÇÃO AO FICHEIRO. Tudo isto foi calibrado para o
                    recorte antigo, que tinha 14,6% de vazio à ESQUERDA e
                    tinta até ao pixel da direita. O ficheiro atual é do mesmo
                    tamanho (1024×1536) e também é recorte (47,8% transparente
                    contra 41,1%), mas a margem vazia está do lado CONTRÁRIO:
                    tinta de 0% a 97,9% em x.

                    OS `translate-x` SAÍRAM TODOS. Houve um passo intermédio
                    em que foram corrigidos em 14,6% — a diferença de tinta
                    entre este ficheiro e o antigo — porque com os valores
                    originais a figura atravessava o texto. Deixaram de fazer
                    falta: ela pediu a figura ENCOSTADA ao canto direito, e
                    `right-0` sem deslocação nenhuma faz isso diretamente, nos
                    dois formatos. Menos números para desafinar.

                    O que continua a valer de cima é o `bottom-0` com os 8% a
                    descer (15% em telemóvel) — é o que a mantém assente em
                    vez de a pairar. */}
                <div className="pointer-events-none absolute right-0 bottom-0 translate-y-[8%] max-md:translate-y-[15%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/imagens/destaque/figura-intro.png"
                    alt=""
                    aria-hidden
                    // Duas passagens dela: primeiro −20% (114 → 91,2svh),
                    // depois "aumente mantendo a posição" — daí +20% sobre
                    // esse valor, 91,2 → 109,4svh. Telemóvel acompanha na
                    // mesma fração: 85,5 → 68,4 → 82,1lvh.
                    //
                    // O tamanho é a ÚNICA coisa que mudou nas duas vezes. O
                    // `right-0` e o `bottom-0` com os 8% a descer ficaram
                    // sempre iguais, que é o que ela quis dizer com "mantendo
                    // a posição": a figura cresce ancorada ao canto, não a
                    // partir do centro.
                    // Em tablet a figura passou a medir-se pela LARGURA e não pela
                    // altura. MEDIDO a 2026-09-08 a 1024 px: `h-[109.4svh]` dava
                    // 1494 px de altura e, num ficheiro 1024×1536, 996 px de
                    // largura — praticamente o painel inteiro. O texto ficava POR
                    // CIMA da fotografia e não se lia. A 48vw sobram 532 px para a
                    // coluna de texto, que está limitada a 34ch (~480 px).
                    //
                    // A banda é fechada nos dois lados (768–1199) para não pisar o
                    // `max-md`, que serve o telemóvel e já estava afinado.
                    className="figura-intro h-[109.4svh] w-auto max-md:h-[82.1lvh]"
                  />
                </div>
              </>
            }
          >
            <p className="mb-12 max-w-[34ch] border-t border-texto/15 pt-8 font-display text-[length:var(--text-sub)] leading-[1.2] text-texto">
              {intro.close}
            </p>

          </Statement>
        </PainelHorizontal>
      </HorizontalExperience>

      <Statement
        id="filosofia"
        label={filosofia.label}
        title={filosofia.title}
        // Um parágrafo só. Era "Cada detalhe importa." + este; a primeira
        // frase saiu a pedido dela e o campo `intro` foi removido do
        // conteúdo, para não ficar texto órfão no ficheiro.
        //
        // Com um único item, o `md:grid-cols-2` do corpo deixa-o na coluna da
        // ESQUERDA e a da direita fica vazia — que é onde ela o quer. Em
        // telemóvel não há duas colunas e ele ocupa a largura toda, alinhado
        // à esquerda na mesma.
        body={[filosofia.body]}
        close={filosofia.close}
        // Metade do recuo de topo, só nesta secção: 187px em computador e
        // 96px em telemóvel eram uma faixa verde vazia antes da etiqueta.
        // Vai em `calc` sobre o token e não num valor fixo para continuar a
        // acompanhar o `clamp` nos dois formatos. A base fica intacta — o
        // `twMerge` só substitui o lado que a classe nomeia.
        // A base também encolhe: estava em 187px contra 94 no topo, o dobro,
        // e era ela a deixar a faixa vazia por baixo do fecho. A 0,62 fica em
        // 116px — ainda mais folgada que o topo, que é o que separa esta
        // secção da seguinte, mas já não é um vazio.
        classeSeccao="pt-[calc(var(--spacing-section)*0.5)] pb-[calc(var(--spacing-section)*0.62)]"
        // Em TELEMÓVEL a fotografia vai para aqui, depois do fecho: lá não há
        // o vão à direita onde ela assenta em computador — a coluna é uma só.
        // As duas cópias nunca aparecem ao mesmo tempo (`md:hidden` aqui,
        // `hidden md:block` na outra) e o ficheiro é o mesmo, por isso o
        // browser descarrega-o uma vez.
        rodape={
          <div className="mt-14 md:hidden">
            <Laminas src="/imagens/equipa/equipa.png" />
          </div>
        }
        dark
      >
        {/* A fotografia da chaise ASSENTA no fio da lista, e é por isso que
            está aqui dentro e não na `decoracao`.

            `bottom-full` põe a base dela exatamente no topo deste invólucro,
            que é onde começa o `border-t` do primeiro item. Os pés de madeira
            da chaise ficam pousados nessa linha — era o que faltava para não
            parecer a pairar. Ancorada a um número fixo, qualquer quebra de
            linha no parágrafo acima desalinhava-a; ancorada ao fio, não.

            Só a partir de `md`: o vão livre à direita mede 706x380px em
            computador e em telemóvel não existe — lá a coluna é uma só. */}
        <div className="relative">
          <div className="pointer-events-none absolute right-0 bottom-full hidden w-[50%] md:block">
            <Laminas src="/imagens/equipa/equipa.png" />
          </div>

          <ol className="mb-14 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
            {filosofia.items.map((item) => (
              <li key={item.n} className="border-t border-verde-linha pt-5">
                <span className="label mb-3 block text-texto-fraca">{item.n}</span>
                <span className="font-display text-[length:var(--text-sub)] leading-none">
                  {item.title}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Statement>

      <Clinical />

      {/* Verde com o texto em ouro, igual à faixa da Tecnologia mais abaixo.
          Em fundo com texto escura era só mais uma linha de texto entre duas
          secções claras; em verde corta o branco e marca a passagem. */}
      <div className="border-y border-verde-linha bg-verde py-7">
        <KineticLine
          text="Onde a ciência encontra a beleza"
          className="font-display text-[clamp(2rem,6vw,5rem)] leading-none ouro-metal"
        />
      </div>

      <CardGrid
        id={medicinaEstetica.id}
        label={medicinaEstetica.label}
        title={medicinaEstetica.title}
        intro={medicinaEstetica.intro}
        items={medicinaEstetica.items}
        cta={medicinaEstetica.cta}
        // UM ramo só, do lado direito. Eram dois sobrepostos para dar volume
        // ao canto, mas o de trás era maior (46vw, recuado 2vw) e o vídeo
        // começava aos 806px num ecrã de 1440 — o título acaba aos 818, ou
        // seja, entrava-lhe por cima. Saiu a pedido dela. Fica o da frente,
        // que arranca aos 1051px e deixa o cabeçalho respirar.
        //
        // O clipe 02 é o único dos cinco com o quadro vazio à esquerda e a
        // folhagem à direita, que é o que lhe permite nascer deste canto sem
        // ser espelhado.
        //
        // A medida de telemóvel é maior em `vw` porque lá o texto está por
        // baixo e não ao lado: a de desktop, que existe para libertar a
        // coluna, dava um tufo perdido no canto.
        //
        // Sem empurrão horizontal. Levava `translate-x-[9vw]`, que a mandava
        // 130px para fora do ecrã num monitor de 1440 — um quarto do ramo
        // cortado. Enquanto era a camada da frente de duas isso não se via,
        // porque a de trás enchia o que faltava; sozinha, ficava escondida.
        // Encostada à direita mostra-se inteira e continua longe do título.
        //
        // TELEMÓVEL: 50 → 60vw, os +20% que ela pediu. A medida de telemóvel
        // vale até 767px (ver a media query em `flores-video.tsx`); acima
        // disso manda a de 36vw, que não muda.
        decoracao={
          <FloresVideo
            clipe="02"
            ancora="superior-direito"
            largura="36vw"
            larguraMovel="60vw"
          />
        }
        cabecalhoCentrado
      />

      <CardGrid
        id={tecnologia.id}
        label={tecnologia.label}
        title={tecnologia.title}
        intro={tecnologia.intro}
        items={tecnologia.items}
        cols={3}
        dark
      />

      <div className="border-y border-verde-linha bg-verde py-7">
        <KineticLine
          text={tecnologia.kinetic}
          direction={-1}
          className="font-display text-[clamp(2rem,6vw,5rem)] leading-none ouro-metal"
        />
      </div>

      {/* Os dois trocaram de lugar: o Rosto sobe, o par de fotografias desce.
          Cada um mantém o efeito que já tinha — o Rosto continua a fixar-se e
          a aproximar-se, o par continua a juntar-se e a assentar. */}

      {/* Sem flores. O ramo da esquerda (clipe 05, inferior-esquerdo) saiu
          primeiro — ficava por baixo de "A sua identidade." como um bloco, com
          a aresta do quadro à vista. O da direita desceu para a secção Corpo:
          aqui tapava "Resultados naturais começam com decisões
          personalizadas."; lá em baixo tem o espaço vago dos cartões. */}
      <Face />

      {/* O texto do espaço vem antes da fotografia: quem rola lê o que a
          clínica é e só depois a vê, em vez de olhar para uma sala sem
          saber o que está a ver. */}
      <div className="gutter bg-fundo pt-24 pb-24">
        {/* O título saiu da grelha e passou a ocupar a largura toda. Era a
            única forma de o vídeo ficar RENTE ao texto: dentro da grelha, a
            coluna da esquerda começava pelo título e o vídeo só entrava por
            baixo dele, muito abaixo do topo do texto ao lado. */}
        {/* Em COMPUTADOR este título deixa de ser um título de secção e passa
            a ocupar a página, numa linha só: `9.9vw` põe a frase inteira a
            ~89% da largura útil. Vem de 14.2vw — os -30% que ela pediu para
            a frase deixar de partir em duas.

            Sobe o `tracking` negativo porque a -0,03em o mesmo texto a 140px
            lê-se solto; a -0,045em fecha como um título de revista.

            Um único <span> e não um por linha: com `box-decoration-break:
            clone` a rampa (e a lâmina de luz) repete-se por fragmento, por
            isso em telemóvel as duas linhas continuam certas. Dois <span>
            davam DUAS lâminas lado a lado assim que isto passasse a uma
            linha só.

            Em telemóvel e tablet fica tudo como estava — o pedido foi
            aumentar SÓ em computador. O `text-wrap:wrap` é o que garante
            isso: os `h2` do site levam `text-wrap: balance`, que com a frase
            corrida (já sem quebra escrita à mão) equilibrava as duas linhas e
            partia em "Um espaço / pensado para si.". A quebra volta a ser a
            de sempre, "Um espaço pensado / para si." */}
        <RevealText
          as="h2"
          className="mb-14 max-w-[14ch] text-[length:var(--text-title)] [text-wrap:wrap] lg:mb-20 lg:max-w-none lg:tracking-[-0.045em] lg:text-[clamp(3.5rem,9.9vw,14rem)]"
        >
          <span className="verde-metal-vivo">{espaco.title}</span>
        </RevealText>

        {/* Duas colunas só a partir de `lg` e não de `md`. Medido: num tablet
            de 820px cada coluna ficava com 335px, o que dá uma moldura de
            188px de altura e o vídeo lá dentro com 106px de largura — pequeno
            de mais. Empilhado à largura toda, o mesmo tablet dá-lhe 423px de
            altura. A partir de 1024px já há largura para os dois lado a lado. */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-20">
          {/* O TEXTO vem primeiro no HTML e o vídeo a seguir: é essa a ordem
              em telemóvel e tablet, onde ela o quer POR BAIXO do texto. Em
              computador as colunas explícitas trocam-lhes o lugar sem mexer
              na ordem do HTML. */}
          <div className="lg:col-start-2 lg:row-start-1">
            <RevealBlock>
              <p className="label mb-3 text-texto-fraca">{espaco.label}</p>
              {/* A frase com que ela própria anuncia a clínica. Fica antes do
                  corpo, porque é o que diz o que a casa é. */}
              <p className="mb-8 font-display text-[length:var(--text-sub)] leading-[1.2]">
                {espaco.intro}
              </p>
              <div className="mb-10 space-y-6">
                {espaco.body.map((par) => (
                  <p
                    key={par}
                    className="max-w-[48ch] text-[length:var(--text-lead)] leading-[1.62] text-fundo-suave"
                  >
                    {par}
                  </p>
                ))}
              </div>
              <p className="max-w-[38ch] border-t border-texto/15 pt-8 font-display text-[length:var(--text-sub)] leading-[1.2]">
                {espaco.close}
              </p>
            </RevealBlock>
          </div>

          {/* Aqui estavam as três fotografias do espaço, a ampliar com o
              scroll. Saíram a pedido dela e entrou o vídeo da clínica.

              Mantém o 16:9 de sempre. O vídeo é 9:16 e NÃO é ampliado para
              caber: fica à altura toda com a proporção dele e os lados levam
              um fotograma desfocado. Ver a nota no componente. */}
          <VideoPanorama
            // A ALTURA da área é o que manda no tamanho do vídeo, que ocupa
            // sempre a altura toda. Três medidas, uma por formato:
            //
            //   telemóvel — a proporção do PRÓPRIO ficheiro (9:16). Assim o
            //     vídeo enche a coluna de lado a lado e não sobra largura por
            //     usar: passa de 165px para 390. A 4:3 ficava uma tira baixa
            //     com vazio dos dois lados.
            //   tablet — 4:3. A do telemóvel daria 1335px de altura num ecrã
            //     de 820 de largura, o que é um vídeo a ocupar a página toda.
            //   computador — quadrada. A coluna de texto ao lado mede 566px e
            //     o vídeo fica com 620: emparelham, em vez de ele flutuar no
            //     meio de uma faixa baixa.
            area="aspect-[9/16] sm:aspect-[4/3] lg:aspect-square"
            className="lg:col-start-1 lg:row-start-1"
            src="/imagens/video/ambient-hero-vertical.mp4"
            fundo="/imagens/video/ambient-poster.jpg"
          />
        </div>
      </div>

      <CardGrid
        id={corpo.id}
        label={corpo.label}
        title={corpo.title}
        intro={corpo.intro}
        items={corpo.items}
        cta={corpo.cta}
        cols={3}
        // Encosta ao fundo do lado direito, por baixo de "Depilação a Laser"
        // — o último dos quatro cartões. É o único sítio desta zona onde a
        // folhagem cresce sem passar por cima de texto.
        decoracao={<FloresVideo clipe="03" ancora="inferior-direito" />}
      />

      <CardGrid
        id={pele.id}
        label={pele.label}
        title={pele.title}
        intro={pele.intro}
        items={pele.items}
        dark
      />

      {/* Scroll lateral: a secção fixa-se e os painéis correm na horizontal. */}
      <HorizontalScroll label={rituais.label} className="bg-verde text-fundo">
        {/* O texto centra-se pela FOTOGRAFIA e não pelo cartão inteiro.
            Antes o `justify-center` media-se pela faixa toda, e a faixa é
            alta porque os cartões levam legenda por baixo da imagem: medido a
            390px, o meio do texto caía 184px abaixo do meio da fotografia ao
            lado (140px em computador, 263px em tablet). Lia-se como texto
            afundado.

            A caixa de dentro tem exatamente a altura da moldura: a moldura é
            `min(72vw,24rem)` de largura em 3:4, logo `min(96vw,32rem)` de
            altura. Sai da mesma conta e não de um número afinado à mão, por
            isso acompanha qualquer largura de ecrã.

            É `min-h` e não `h` para o caso de o texto crescer mais do que a
            fotografia — aí a caixa cede em vez de o cortar. */}
        <div className="flex w-[min(80vw,32rem)] shrink-0 flex-col justify-start">
          {/* O `100%` na conta é o painel: a caixa acompanha a moldura ao
              lado, mas nunca fica mais alta do que o espaço que a secção tem
              para dar — senão sairia pela aresta de baixo, que aqui corta. */}
          <div className="flex min-h-[min(96vw,32rem,100%)] flex-col justify-center">
            <p className="label mb-6 text-fundo/70">{rituais.label}</p>
            <h2 className="max-w-[14ch] text-[length:var(--text-title)]"><span className="ouro-metal-linhas">{rituais.title}</span></h2>
            <p className="mt-8 max-w-[40ch] text-[length:var(--text-lead)] leading-[1.6] text-fundo/70">
              {rituais.intro[0]}
            </p>
          </div>
        </div>

        {rituais.items.map((item) => (
          <article
            key={item.n}
            // `justify-start` e não `justify-center`.
            //
            // Com os cartões centrados um a um e textos de comprimentos
            // diferentes, cada um tinha altura própria e ficava centrado à
            // sua maneira — as fotografias arrancavam a alturas diferentes.
            // Alinhados pelo topo, e com a faixa a esticá-los todos à mesma
            // altura, as molduras ficam à mesma linha.
            className="flex w-[min(72vw,24rem)] shrink-0 flex-col justify-start"
          >
            {/* Sem `data-parallax` aqui, ao contrário dos outros cartões do
                site.
                O parallax global desloca o elemento em função da posição da
                secção no ecrã. Numa secção FIXADA, a secção não se move mas o
                scroll continua a correr — durante toda a travessia lateral o
                gatilho continuava a avançar e as fotografias iam subindo,
                até ficarem cortadas em cima. Aqui o movimento já é a própria
                travessia; não precisa de um segundo por cima. */}
            {/* A moldura CEDE altura quando o ecrã é baixo, e o texto nunca é
                cortado.

                A secção fixa-se e tem `overflow-hidden`, por isso tudo o que
                passe do fundo do painel desaparece — não empurra a página,
                é cortado. O cartão em tamanho natural pede 665px (moldura
                512 + legenda); o painel dá 88vh. Num ecrã de 640px de altura
                sobram 563px e as últimas linhas do corpo ficavam 64px abaixo
                da aresta, medido. Em telemóvel isto nunca acontecia porque a
                moldura é `72vw` e o ecrã é alto — daí só se ver no
                computador.

                `flex-1` com `min-h-0` deixa a moldura encolher; o `max-h` tem
                as três contas que a travam. A primeira é a proporção
                (largura `min(72vw,24rem)` em 3:4 → `min(96vw,32rem)`), que em
                ecrã alto devolve exatamente a altura de antes — por isso em
                telemóvel e em ecrã grande nada muda. A terceira é o espaço
                do painel menos a legenda: 10rem cobre os 153px medidos de
                número, título e corpo com o recuo. É essa que faz as três
                molduras encolherem TODAS À MESMA ALTURA — se cada uma
                ficasse com a sobra do seu próprio texto, os números por
                baixo arrancavam a alturas diferentes, que é o desalinhamento
                que o `justify-start` foi posto a evitar.

                O recorte é `object-cover`: a fotografia aperta o
                enquadramento em vez de deformar. */}
            <div className="mb-7 max-h-[min(96vw,32rem,calc(100%-10rem))] min-h-0 flex-1">
              {/* Contorno de canto arredondado e fio dourado a correr — o
                  `contorno` traz os cantos e o traço de entrada, o
                  `fioContinuo` põe um segmento a dar a volta sem parar (7s
                  por volta). Ouro porque a secção é verde: a regra do site é
                  o fio seguir o FUNDO e não o tom da moldura. */}
              <Surface
                tone="escuro"
                aspect="3 / 4"
                contorno="ouro"
                fioContinuo
                className="h-full w-full"
                src={item.imagem}
                alt={item.alt}
                sizes="(min-width: 768px) 24rem, 72vw"
              />
            </div>
            <p className="label mb-3 text-fundo/70">{item.n}</p>
            <h3 className="mb-3 text-[length:var(--text-sub)]"><span className="ouro-metal-linhas">{item.title}</span></h3>
            <p className="max-w-[34ch] leading-[1.6] text-fundo/65">{item.body}</p>
          </article>
        ))}
      </HorizontalScroll>

      <div className="border-y border-texto/10 bg-fundo-2 py-7">
        <KineticLine
          text={rituais.kinetic}
          className="verde-metal font-display text-[clamp(1.8rem,5vw,4rem)] leading-none"
        />
      </div>

      <Statement
        id="experiencia"
        label={experiencia.label}
        title={experiencia.title}
        body={experiencia.body}
        beats={experiencia.beats}
        close={experiencia.close}
        dark
        // O lado direito estava vazio; leva a fotografia da pasta `destaque`.
        imagem={{
          src: "/imagens/destaque/faixa-dourada.png",
          alt: "",
          nua: true,
          // O ficheiro é 2203×714, ou seja muito deitado. 90deg põe-no de pé;
          // os 5 a mais são a inclinação pedida.
          rodar: "95deg",
          // Largura antes de rodar. Depois da rotação é esta medida que passa
          // a ser a ALTURA, por isso vem em `vh` — 128 para as duas pontas
          // caírem fora do ecrã em vez de aparecerem cortadas.
          // A medida sai da ALTURA, mas com tecto na largura: num tablet, que
          // é estreito e alto, 128vh dava 1510px e o desenho atravessava o
          // título. O `min` deixa a altura mandar em ecrã largo e a largura
          // travar em ecrã estreito.
          medida: "min(175vh, 106vw)",
          // Encosta ao canto direito: a rotação estreita a caixa desenhada e
          // sem isto o desenho parava a 355px da margem. Mesmo tecto, pela
          // mesma razão.
          empurrar: "min(46vh, 28vw)",
          // Em telemóvel atravessa a secção na diagonal, por trás do texto:
          // não há faixa direita livre onde a pôr de pé. 40deg é o ângulo do
          // traço que ela desenhou; 150vw garante que entra e sai fora do
          // ecrã, sem pontas à vista.
          // Em telemóvel entra só a ponta pelo canto superior direito, como
          // o traço que ela marcou — não a hélice inteira a atravessar, que
          // passava por cima de "É um momento para parar." e tirava-lhe a
          // leitura. O deslocamento empurra o resto para fora do ecrã.
          // Em telemóvel nasce da margem direita e sobe em diagonal para a
          // esquerda — não atravessa a página toda. Ângulo negativo é o que a
          // faz subir; ancorada ao canto direito, a ponta de baixo sai fora do
          // ecrã e a de cima morre a meio, sem tocar no texto.
          // Ângulo e posição tirados do traço vermelho que ela marcou por
          // cima da captura: desce da tira branca, a meio da largura, até sair
          // pela margem direita. 51deg é a inclinação medida no traço.
          movel: { rodar: "51deg", medida: "120vw", deslocar: "31% 21%" },
        }}
      />

      {/* O ramo mudou de canto: era `inferior-esquerdo`, passa ao canto
          superior direito, que é o lado que está vago nesta secção. O clipe 01
          tem a folhagem do lado esquerdo do quadro, por isso a âncora direita
          espelha-o — é o que o faz nascer da borda e crescer para dentro. */}
      {/* Ramo grande, a descer do canto superior direito até ao fundo da
          secção. O clipe é quadrado, por isso a largura é também a altura: a
          62vw cobre a secção quase de cima a baixo em ecrã grande. Em
          telemóvel leva mais, porque lá a secção é muito mais alta do que
          larga e a mesma medida daria um tufo no canto. */}
      <Journey
        decoracao={
          <FloresVideo
            clipe="01"
            ancora="superior-direito"
            largura="62.4vw"
            larguraMovel="104vw"
          />
        }
      />
      <Results />
      <Cta />
      {/* A marcação vem depois do CTA: quem chega aqui já decidiu, só falta
          escolher a hora. Antes dos contactos, para não obrigar a voltar. */}
      <Marcacao />
      <Contacts decoracao={<FloresVideo clipe="03" ancora="superior-direito" />} />
    </>
  );
}
