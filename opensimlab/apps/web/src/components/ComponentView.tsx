"use client";

import { getDefinition } from "./definitions";
import { getWokwiNorm } from "./wokwiPins";
import { Photoreal } from "./photoreal/PhotorealComponents";
import type { PlacedComponent } from "@/core/state/circuit";

type Props = {
  comp: PlacedComponent;
  selected: boolean;
  onSelect: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
  onPinClick: (pinId: string) => void;
  wiringActive: boolean;
};

function PhotorealReal({ comp }: { comp: PlacedComponent }) {
  const def = getDefinition(comp.definitionId);
  if (!def) return null;
  return (
    <Photoreal
      definitionId={comp.definitionId}
      width={def.width}
      height={def.height}
      props={comp.props as Record<string, string | number>}
    />
  );
}

export function ComponentView({ comp, selected, onSelect, onPointerDown, onPinClick, wiringActive }: Props) {
  const def = getDefinition(comp.definitionId);
  if (!def) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={def.name}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect();
      }}
      onPointerDown={onPointerDown}
      className="absolute select-none cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
      style={{
        left: comp.x,
        top: comp.y,
        width: def.width,
        height: def.height,
        transform: `rotate(${comp.rotation}deg)`,
        transformOrigin: "center",
        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.32)) drop-shadow(0 1px 2px rgba(0,0,0,0.24))",
        borderRadius: 6,
      }}
    >
      <div
        className={`relative flex items-center justify-center rounded-[5px] overflow-visible ${selected ? "ring-2 ring-[#00979d] ring-offset-2" : "ring-1 ring-transparent hover:ring-[#444]"}`}
        style={{ width: def.width, height: def.height, ...(selected ? { ["--tw-ring-offset-color" as string]: "#3a3a3a" } : {}) }}
      >
        <PhotorealReal comp={comp} />
        {selected && <span className="absolute -top-1 -right-1 size-2 rounded-full border-2" style={{ background: "#00979d", borderColor: "#3a3a3a" }} />}
      </div>

      {def.pins.map((p) => {
        const norm = getWokwiNorm(def.id, p.id);
        if (norm) {
          const nx = Math.min(1, Math.max(0, norm.nx));
          const ny = Math.min(1, Math.max(0, norm.ny));
          return (
            <button
              key={p.id}
              type="button"
              title={`${p.label} — pin fotorrealista ${p.id} — clic para cablear pin→pin`}
              onClick={(e) => {
                e.stopPropagation();
                onPinClick(p.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute size-[12px] rounded-full border-[1.6px] bg-white hover:scale-125 transition-transform cursor-pointer"
              style={{
                borderColor: wiringActive ? "#16a34a" : "#0d9488",
                background: wiringActive ? "#dcfce7" : "white",
                left: `${nx * 100}%`,
                top: `${ny * 100}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: wiringActive ? "0 0 0 3px rgb(22 163 74 / 0.20), 0 1px 3px rgba(0,0,0,0.35)" : "0 0 0 2px white, 0 1px 4px rgba(0,0,0,0.35)",
                zIndex: 2,
              }}
            />
          );
        }
        const sameSide = def.pins.filter((x) => x.side === p.side);
        const idx = sameSide.findIndex((x) => x.id === p.id);
        const n = sameSide.length;
        const pos = ((idx + 1) * 100) / (n + 1);
        return (
          <button
            key={p.id}
            type="button"
            title={`${p.label} — clic para cablear pin a pin`}
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(p.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute size-[12px] rounded-full border-[1.6px] bg-white hover:scale-125 transition-transform cursor-pointer"
            style={{
              borderColor: wiringActive ? "#16a34a" : "#0d9488",
              background: wiringActive ? "#dcfce7" : "white",
              left: p.side === "left" ? -6 : p.side === "right" ? undefined : `${pos}%`,
              right: p.side === "right" ? -6 : undefined,
              top: p.side === "top" ? -6 : p.side === "bottom" ? undefined : `${pos}%`,
              bottom: p.side === "bottom" ? -6 : undefined,
              transform: p.side === "top" || p.side === "bottom" ? "translateX(-50%)" : "translateY(-50%)",
              boxShadow: wiringActive ? "0 0 0 3px rgb(22 163 74 / 0.20), 0 1px 3px rgba(0,0,0,0.35)" : "0 0 0 2px white, 0 1px 4px rgba(0,0,0,0.35)",
            }}
          />
        );
      })}

      {selected && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded-sm font-mono whitespace-nowrap pointer-events-none border" style={{ background: "#1a1a1a", color: "#ccc", borderColor: "#333" }}>
          {def.name} · {Math.round(comp.x)},{Math.round(comp.y)}
        </span>
      )}
    </div>
  );
}
