"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Faixa horizontal arrastável.
 *
 * A base é um contentor com scroll nativo — assim o teclado, o trackpad e o
 * toque funcionam sem código. O arrasto com ponteiro é uma camada por cima,
 * não uma substituição; reimplementar scroll à mão custa a acessibilidade.
 */
export function DragRail({
  children,
  className,
  hint,
}: {
  children: React.ReactNode;
  className?: string;
  hint?: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return; // o toque já tem scroll nativo
    const el = rail.current;
    if (!el) return;
    setDragging(true);
    startX.current = e.clientX;
    startScroll.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !rail.current) return;
    rail.current.scrollLeft = startScroll.current - (e.clientX - startX.current) * 1.15;
  };

  const stop = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    rail.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={rail}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerCancel={stop}
        tabIndex={0}
        role="region"
        aria-label={hint ?? "Lista horizontal"}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-6",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          dragging ? "cursor-grabbing select-none" : "cursor-grab",
        )}
      >
        {children}
      </div>

      {hint ? (
        <div className="label mt-1 flex items-center gap-2 text-ink-faint">
          <svg width="22" height="8" viewBox="0 0 22 8" fill="none" aria-hidden>
            <path d="M0 4h20M17 1l3 3-3 3" stroke="currentColor" strokeWidth="1" />
          </svg>
          {hint}
        </div>
      ) : null}
    </div>
  );
}
