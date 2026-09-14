"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Fallback estático com o mesmo enquadramento da cena. É o que fica em
 * dispositivos sem WebGL utilizável — e é também o placeholder de carga,
 * por isso ocupa exatamente o mesmo espaço (zero CLS).
 */
function IrisFallback() {
  return (
    <div
      aria-hidden
      className="grain absolute inset-0"
      style={{
        background:
          "radial-gradient(58% 44% at 50% 62%, oklch(0.78 0.09 52 / 0.55), transparent 70%), radial-gradient(30% 26% at 22% 58%, oklch(0.72 0.08 48 / 0.4), transparent 72%), radial-gradient(30% 26% at 78% 56%, oklch(0.72 0.08 48 / 0.4), transparent 72%)",
      }}
    />
  );
}

const IrisScene = dynamic(() => import("./iris-scene"), {
  ssr: false,
  loading: () => <IrisFallback />,
});

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

export function IrisCanvas({ className }: { className?: string }) {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setSupported(hasWebGL());
  }, []);

  return (
    <div className={className} aria-hidden>
      {supported === false ? <IrisFallback /> : null}
      {supported ? <IrisScene /> : null}
      {supported === null ? <IrisFallback /> : null}
    </div>
  );
}
