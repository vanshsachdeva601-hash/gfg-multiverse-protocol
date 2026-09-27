import { useEffect, useRef } from "react";

const hoverTargets = "a, button, [role='button'], .objective, .benefit, .gallery-frame";

export function EmeraldCursor() {
  const dotRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let enabled = false;
    let visible = false;
    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let ringX = 0;
    let ringY = 0;
    let surface: HTMLElement | null = null;

    const clearSurface = () => {
      surface?.style.removeProperty("--cursor-parallax-x");
      surface?.style.removeProperty("--cursor-parallax-y");
      surface = null;
    };
    const hide = () => {
      visible = false;
      document.documentElement.classList.remove("emerald-cursor-visible", "emerald-cursor-hover");
      clearSurface();
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget && !document.documentElement.contains(event.target as Node)) hide();
    };
    const syncAvailability = () => {
      enabled = finePointer.matches && !reducedMotion.matches;
      document.documentElement.classList.toggle("emerald-cursor-active", enabled);
      if (!enabled) hide();
    };
    const animate = () => {
      ringX += (targetX - ringX) * .22;
      ringY += (targetY - ringY) * .22;
      ring.style.transform = `translate3d(${ringX - 13}px, ${ringY - 13}px, 0)`;
      if (Math.abs(targetX - ringX) + Math.abs(targetY - ringY) > .15) {
        frame = requestAnimationFrame(animate);
      } else {
        frame = 0;
      }
    };
    const onMove = (event: PointerEvent) => {
      if (!enabled || event.pointerType !== "mouse") return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) {
        visible = true;
        ringX = targetX;
        ringY = targetY;
        document.documentElement.classList.add("emerald-cursor-visible");
      }
      dot.style.transform = `translate3d(${targetX - 3}px, ${targetY - 3}px, 0)`;
      document.documentElement.classList.toggle("emerald-cursor-hover", event.target instanceof Element && Boolean(event.target.closest(hoverTargets)));

      const nextSurface = event.target instanceof Element ? event.target.closest<HTMLElement>(".hero, .character-panel") : null;
      if (nextSurface !== surface) clearSurface();
      surface = nextSurface;
      if (surface) {
        const bounds = surface.getBoundingClientRect();
        surface.style.setProperty("--cursor-parallax-x", `${((targetX - bounds.left) / bounds.width - .5) * 6}px`);
        surface.style.setProperty("--cursor-parallax-y", `${((targetY - bounds.top) / bounds.height - .5) * 6}px`);
      }
      if (!frame) frame = requestAnimationFrame(animate);
    };

    syncAvailability();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut);
    window.addEventListener("blur", hide);
    finePointer.addEventListener("change", syncAvailability);
    reducedMotion.addEventListener("change", syncAvailability);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", hide);
      finePointer.removeEventListener("change", syncAvailability);
      reducedMotion.removeEventListener("change", syncAvailability);
      hide();
      document.documentElement.classList.remove("emerald-cursor-active");
    };
  }, []);

  return <div className="emerald-cursor" aria-hidden="true"><span ref={ringRef} className="emerald-cursor-ring" /><span ref={dotRef} className="emerald-cursor-dot" /></div>;
}