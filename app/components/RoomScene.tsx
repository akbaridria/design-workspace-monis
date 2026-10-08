"use client";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { SCENE, SLOTS, byId, place, type Item, type SlotId, type Setup } from "@/lib/room";
import { cn } from "@/lib/utils";

type Layer = { key: string; item: Item; slot: SlotId; leaving?: boolean };

/** Fit the fixed 1200x750 scene inside the frame, centred. */
function useFitScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, x: 0, y: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = Math.max(el.clientHeight, 1);
      const scale = Math.min(w / SCENE.w, h / SCENE.h);
      setFit({ scale, x: (w - SCENE.w * scale) / 2, y: (h - SCENE.h * scale) / 2 });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, ...fit };
}

/** Wanted layers + layers that were just removed (kept ~320ms so they can animate out). */
function useLayers(setup: Setup): Layer[] {
  const wanted = useMemo<Layer[]>(
    () =>
      (Object.keys(SLOTS) as SlotId[]).flatMap((slot) => {
        const item = byId(setup[slot]);
        return item ? [{ key: `${slot}:${item.id}`, item, slot }] : [];
      }),
    [setup]
  );
  const prev = useRef<Layer[]>([]);
  const [leaving, setLeaving] = useState<Layer[]>([]);

  useEffect(() => {
    const keys = new Set(wanted.map((l) => l.key));
    const gone = prev.current.filter((l) => !keys.has(l.key));
    prev.current = wanted;
    if (!gone.length) return;
    setLeaving((l) => [...l, ...gone.map((g) => ({ ...g, leaving: true }))]);
    setTimeout(() => setLeaving((l) => l.filter((x) => !gone.some((g) => g.key === x.key))), 320);
  }, [wanted]);

  const keys = new Set(wanted.map((l) => l.key));
  return [...wanted, ...leaving.filter((l) => !keys.has(l.key))];
}

export default function RoomScene({ setup }: { setup: Setup }) {
  const { ref, scale, x, y } = useFitScale();
  const layers = useLayers(setup);
  const floor = y + SCENE.floorY * scale;
  const frameStyle = { "--floor": `${floor}px`, "--base": `${floor - 14 * scale}px` } as CSSProperties;

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden bg-[linear-gradient(var(--muted)_var(--base),var(--chart-1)_var(--base)_var(--floor),var(--border)_var(--floor))]"
      style={frameStyle}
    >
      <div
        className="absolute top-0 left-0 h-[750px] w-[1200px] origin-top-left"
        style={{ transform: `translate(${x}px, ${y}px) scale(${scale})` }}
      >
        {/* backdrop: wall, skirting and floor are painted full-bleed by the frame */}
        <div className="absolute top-[70px] left-[70px] h-[300px] w-[230px] border-8 border-card bg-chart-1/60 before:absolute before:inset-y-0 before:left-1/2 before:-ml-[3px] before:w-1.5 before:bg-card after:absolute after:inset-x-0 after:top-1/2 after:-mt-[3px] after:h-1.5 after:bg-card" />
        <div className="absolute top-[110px] left-[930px] h-[170px] w-[130px] border-6 border-foreground bg-card">
          <span className="absolute top-10 left-[35px] size-[60px] rounded-full bg-chart-2" />
          <span className="absolute inset-x-5 bottom-6 h-[30px] rounded-t-[30px] bg-primary" />
        </div>

        {/* items: each one is pinned by its bottom-centre to a slot point */}
        {layers.map(({ key, item, slot, leaving }) => {
          const p = place(item, slot, setup);
          return (
            <div
              key={key}
              className="absolute size-0 transition-[left,top] duration-450 ease-[ease] motion-reduce:transition-none"
              style={{ left: p.x, top: p.y, zIndex: p.z }}
            >
              {!item.flat && (
                <div
                  className={cn(
                    "absolute h-4 -translate-y-1/2 rounded-[50%] bg-foreground/30 blur-[6px] motion-reduce:transition-none",
                    leaving ? "opacity-0 transition-opacity duration-300" : "transition-[width,left] duration-450"
                  )}
                  style={{ width: p.w * 0.8, left: -p.w * 0.4 }}
                />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={cn(
                  "absolute top-0 left-0 block h-auto max-w-none -translate-x-1/2 -translate-y-full transition-[width] duration-450 motion-reduce:animate-none motion-reduce:transition-none",
                  leaving
                    ? "animate-out fade-out slide-out-to-bottom-5 fill-mode-forwards duration-300"
                    : "animate-in fade-in slide-in-from-top-[70px] ease-[cubic-bezier(.2,.9,.3,1.15)]"
                )}
                src={item.src}
                alt={item.name}
                width={p.w}
                draggable={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
