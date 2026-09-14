"use client";

import { useEffect, useState } from "react";

/**
 * Escolhe a versão do vídeo pelo formato do ecrã.
 *
 * Dois `<video>` com `hidden`/`md:block` seriam mais simples, mas o browser
 * descarrega ambos — 7 MB para mostrar 3,5. Aqui só se monta o elemento
 * depois de sabermos qual serve, e a decisão acompanha a rotação do
 * dispositivo.
 */
export function HeroVideo({
  desktop,
  mobile,
}: {
  desktop: string;
  mobile: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const escolher = () => setSrc(mq.matches ? desktop : mobile);
    escolher();
    mq.addEventListener("change", escolher);
    return () => mq.removeEventListener("change", escolher);
  }, [desktop, mobile]);

  if (!src) return null;

  return (
    <>
    <video
      // `cover` nos dois formatos: cada ficheiro já tem a orientação do seu
      // ecrã. O corte em computador é minimizado por a faixa ser fina —
      // quanto mais baixa a faixa, mais a área se aproxima de 16:9.
      className="absolute inset-0 h-full w-full object-cover"
      // `key` força a troca de elemento ao rodar o dispositivo; sem ela o
      // browser mantém o ficheiro anterior em buffer.
      key={src}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      // O vídeo é cenário, não conteúdo: sem controlos, sem menu de
      // contexto, sem "imagem na imagem" e sem envio para a TV. O browser
      // oferecia o PiP por cima do fundo do site — bastava um clique
      // distraído para a hero ficar preta com o vídeo a flutuar num canto.
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      onContextMenu={(e) => e.preventDefault()}
      tabIndex={-1}
      controlsList="nodownload noplaybackrate nofullscreen noremoteplayback"
      style={{ pointerEvents: "none" }}
    />
    {/* Vidro por cima do vídeo.
        `disablePictureInPicture` desliga a API, mas o Chrome desenha na
        mesma o seu botão flutuante quando o rato passa POR CIMA de um vídeo
        grande. Com esta camada transparente a receber o rato, o vídeo nunca
        fica em hover e o botão não chega a aparecer. É o máximo que uma
        página pode fazer — o resto é do browser. */}
    <div aria-hidden className="absolute inset-0 z-[1]" />
    </>
  );
}
