"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Flores } from "./flores";

/**
 * Buganvília em vídeo — EXPERIMENTAL, a comparar com o shader.
 *
 * ## Porque é H.264 opaco e não VP9 com alfa
 *
 * Houve uma versão em VP9 `yuva420p` com alfa verdadeiro, e no papel era
 * melhor: recorte a sério, assenta em qualquer cor, sem truques de mistura.
 * **Foi revertida porque no browser dela não aparecia nada.** VP9 com alfa
 * não toca em toda a parte, e quando o `<video>` falha o componente cai para
 * o shader — que nestas secções não tem onde se desenhar. Resultado: secções
 * vazias.
 *
 * O MP4 opaco toca em todo o lado. O quadrado branco desaparece por
 * `mix-blend-mode: multiply` — branco × fundo = fundo — e é por isso que o
 * painel tem de ser branco. É uma amarra de desenho, mas é a que funciona.
 *
 * Os ficheiros com alfa continuam em `public/imagens/flores-video/*.webm`
 * caso se queira voltar a eles com um fallback melhor do que o shader.
 *
 * ## O WebGL continua a ser a rede de segurança
 *
 * Se o `<video>` falhar, entra o `<Flores />` de sempre, com o shader
 * intacto. Nada aqui toca nesse ficheiro.
 *
 * ## Não carrega antes de ser preciso
 *
 * `preload="none"` e o `src` só é atribuído quando a secção se aproxima do
 * ecrã (300px de margem). São ~3,5 MB: descarregá-los no arranque atrasava a
 * primeira dobra por uma decoração que ainda está a três ecrãs de distância.
 * Fora de vista o vídeo também pausa.
 */

/**
 * As âncoras, medidas no era-residence a 1440×900.
 *
 * O padrão repete-se ao longo do scroll e em duas delas a folhagem passa por
 * cima do texto — é assim lá, e foi assim que ela pediu.
 *
 * ONDE A FOLHAGEM COMEÇA DENTRO DO QUADRO (medido no frame 3 de cada):
 *
 *   01  0,0%     03  0,0%     04  0,0%     05  0,0%   -> encostam à esquerda
 *   02  41,9%                                          -> só serve à DIREITA
 *
 * O 02 é o caso ao contrário de todos os outros: tem o quadro vazio à
 * esquerda e a folhagem à direita. Numa âncora esquerda tem de ser espelhado;
 * numa âncora direita NÃO pode ser, porque já nasce encostado à direita —
 * espelhá-lo punha-o a pender para o meio da secção. É isso que `espelhoH`
 * mais abaixo resolve, invertendo a decisão só para este clipe.
 *
 * Os outros quatro foram filmados com a folhagem a pender do canto superior
 * esquerdo. Para as âncoras inferiores invertem-se na vertical e para as da
 * direita na horizontal — espelhar não distorce, não corta e não amplia.
 *
 * O ficheiro é 720×720, o nativo da matiz branca. Não foi ampliado para 1080
 * de propósito: medido, o `.mov` nativo tem nitidez 36,2 e ampliado cai para
 * 18,3. Ampliar não acrescenta detalhe, só bits.
 */
const ANCORAS = {
  "superior-esquerdo": { largura: "44vw", movel: "94vw", classes: "left-0 top-0", espelhoH: false },
  "inferior-esquerdo": { largura: "50vw", movel: "100vw", classes: "bottom-0 left-0 -scale-y-100", espelhoH: false },
  "superior-direito": { largura: "42vw", movel: "92vw", classes: "right-0 top-0", espelhoH: true },
  "inferior-direito": { largura: "46vw", movel: "96vw", classes: "bottom-0 right-0 -scale-y-100", espelhoH: true },
} as const;

/** O clipe cuja folhagem já nasce do lado direito do quadro. Ver acima. */
const NASCE_A_DIREITA = "02";

type Ancora = keyof typeof ANCORAS;

export function FloresVideo({
  clipe = "01",
  ancora = "superior-esquerdo",
  largura,
  larguraMovel,
  className,
}: {
  clipe?: "01" | "02" | "03" | "04" | "05";
  ancora?: Ancora;
  /** Sobrepõe a largura da âncora. As secções secundárias levam ramo menor. */
  largura?: string;
  /**
   * Só faz sentido acompanhada de `largura`, e existe porque as duas medidas
   * não escalam juntas. Em desktop encolhe-se um ramo para libertar a coluna
   * de texto ao lado; em telemóvel não há coluna ao lado — o texto está por
   * baixo — e a mesma medida em `vw` dá um tufo perdido no canto.
   */
  larguraMovel?: string;
  className?: string;
}) {
  const a = ANCORAS[ancora];
  const raiz = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  /** Se a secção está à vista. Em `ref` e não em estado: é lido dentro de
      ouvintes de eventos, que veriam sempre o valor da renderização em que
      foram criados. */
  const aVista = useRef(false);
  const [fonte, setFonte] = useState<string | null>(null);
  const [falhou, setFalhou] = useState(false);
  // Acima do `return` antecipado de propósito: um hook a seguir a um retorno
  // condicional deixa de correr quando o vídeo falha, e a ordem dos hooks
  // muda entre renderizações.
  const instancia = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    const el = raiz.current;
    const v = video.current;
    if (!el || !v) return;

    if (!v.canPlayType('video/mp4; codecs="avc1.640028"') && !v.canPlayType("video/mp4")) {
      setFalhou(true);
      return;
    }

    const src = `/imagens/flores-video/flores-${clipe}.mp4`;
    const io = new IntersectionObserver(
      (e) => {
        const perto = e[0].isIntersecting;
        aVista.current = perto;
        if (perto) {
          setFonte(src);
          // Só arranca aqui se já houver ficheiro. Na PRIMEIRA passagem não
          // há: `setFonte` agenda uma renderização e o `<video>` ainda está
          // sem `src` neste instante — um `play()` agora rejeita em silêncio.
          // Quem trata desse caso é o efeito seguinte.
          if (v.currentSrc && v.paused) void v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [clipe]);

  /**
   * Arranca quando o ficheiro está pronto, e não quando a secção aparece.
   *
   * Eram duas coisas no mesmo sítio e a ordem estava trocada: pedia-se a
   * reprodução no mesmo instante em que se atribuía a fonte, ou seja antes de
   * o vídeo ter fonte nenhuma. A promessa rejeitava, o erro era engolido, e
   * daí em diante ninguém voltava a pedir — ficava à espera de que o atributo
   * `autoPlay` do navegador salvasse a situação. Salva quase sempre, e é por
   * isso que só falhava de vez em quando; mas «quase sempre» não é uma
   * garantia, e em ligações lentas ou em navegadores mais restritivos era o
   * bastante para a flor ficar parada.
   *
   * Agora o pedido vai atrás do ficheiro: à atribuição da fonte e a cada
   * evento que diz que já há imagem para mostrar. `paused` evita empilhar
   * chamadas — duas em cima uma da outra dão o `AbortError` do Chrome.
   */
  useEffect(() => {
    const v = video.current;
    if (!v || !fonte) return;

    const tentar = () => {
      if (aVista.current && v.paused) void v.play().catch(() => {});
    };

    tentar();
    v.addEventListener("loadeddata", tentar);
    v.addEventListener("canplay", tentar);
    return () => {
      v.removeEventListener("loadeddata", tentar);
      v.removeEventListener("canplay", tentar);
    };
  }, [fonte]);

  if (falhou) return <Flores className={className} />;

  // A marca tem de ser única POR INSTÂNCIA, não por clipe+âncora. Cada
  // `FloresVideo` injeta uma regra que fixa a largura, e duas instâncias do
  // mesmo clipe na mesma âncora — que é como se dá volume a um canto —
  // partilhavam o seletor: a segunda regra reescrevia a primeira e os dois
  // ramos saíam com a mesma medida, sobrepostos ao pixel. `useId` é estável
  // entre servidor e cliente, por isso não há divergência na hidratação.
  const marca = `floral-${clipe}-${ancora}-${instancia}`;

  return (
    <div
      ref={raiz}
      aria-hidden
      // `multiply` é o que faz o quadrado branco desaparecer sem alfa: branco
      // × fundo = fundo. Vai no CONTENTOR e não no <video> porque o vídeo é
      // espelhado por `transform`, e um elemento transformado cria contexto de
      // empilhamento e isola a mistura.
      className={`floral-video ${marca} pointer-events-none absolute inset-0 overflow-hidden mix-blend-multiply ${className ?? ""}`}
    >
      <video
        ref={video}
        src={fonte ?? undefined}
        poster={`/imagens/flores-video/flores-${clipe}-mp4.webp`}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate"
        onError={() => setFalhou(true)}
        className={`video-flores absolute block h-auto ${a.classes}${
          (clipe === NASCE_A_DIREITA) !== a.espelhoH ? " -scale-x-100" : ""
        }`}
      />

      <style>{`
        .${marca} .video-flores { width: ${largura ?? a.largura}; }
        @media (max-width: 767px) {
          .${marca} .video-flores { width: ${larguraMovel ?? largura ?? a.movel}; }
        }
      `}</style>
    </div>
  );
}
