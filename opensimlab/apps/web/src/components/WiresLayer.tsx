"use client";

import { getDefinition } from "./definitions";
import { getWokwiNorm } from "./wokwiPins";
import type { Wire, PlacedComponent } from "@/core/state/circuit";

type Props = {
  wires: Wire[];
  components: PlacedComponent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  pendingFrom?: { x: number; y: number } | null;
  ghostTo?: { x: number; y: number } | null;
  pendingColor?: string;
};

function pinPos(comp: PlacedComponent, pinId: string): { x: number; y: number } {
  const def = getDefinition(comp.definitionId);
  if (!def) return { x: comp.x + 40, y: comp.y + 20 };
  // 1:1 con pinInfo real de @wokwi/elements — escalado al canvas
  const norm = getWokwiNorm(comp.definitionId, pinId);
  if (norm) {
    // El wokwi-element ocupa el contenedor completo (def.width/height). Si en el futuro
    // el host es más pequeño y centrado, ajustar con offset = (def - host)/2.
    return { x: comp.x + norm.nx * def.width, y: comp.y + norm.ny * def.height };
  }
  // Fallback genérico (capacitor, breadboard, etc. sin pinInfo Wokwi)
  const pin = def.pins.find((p) => p.id === pinId);
  if (!pin) return { x: comp.x + def.width / 2, y: comp.y + def.height / 2 };
  const sameSide = def.pins.filter((p) => p.side === pin.side);
  const idx = sameSide.findIndex((p) => p.id === pinId);
  const n = sameSide.length;
  if (pin.side === "left" || pin.side === "right") {
    const y = comp.y + ((idx + 1) * def.height) / (n + 1);
    return { x: pin.side === "left" ? comp.x : comp.x + def.width, y };
  } else {
    const x = comp.x + ((idx + 1) * def.width) / (n + 1);
    return { x, y: pin.side === "top" ? comp.y : comp.y + def.height };
  }
}

function wirePath(a: { x: number; y: number }, b: { x: number; y: number }): string {
  const dx = Math.abs(b.x - a.x) * 0.5;
  if (Math.abs(b.y - a.y) > Math.abs(b.x - a.x) * 1.2) {
    const dy = Math.abs(b.y - a.y) * 0.42;
    return `M ${a.x} ${a.y} C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
  }
  return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
}

export function WiresLayer({ wires, components, selectedId, onSelect, pendingFrom, ghostTo, pendingColor }: Props) {
  const compMap = new Map(components.map((c) => [c.instanceId, c]));
  return (
    <svg className="absolute inset-0 pointer-events-none" width={960} height={560} viewBox="0 0 960 560">
      {wires.map((w) => {
        const fromComp = compMap.get(w.from.instanceId);
        const toComp = compMap.get(w.to.instanceId);
        if (!fromComp || !toComp) return null;
        const a = pinPos(fromComp, w.from.pinId);
        const b = pinPos(toComp, w.to.pinId);
        const isSel = w.id === selectedId;
        const d = wirePath(a, b);
        return (
          <g key={w.id} className="pointer-events-auto cursor-pointer" onClick={() => onSelect(w.id)}>
            <path d={d} fill="none" stroke="transparent" strokeWidth={14} strokeLinecap="round" />
            {/* thin crisp wire - Wokwi: solid 2.5px, no glow */}
            <path
              d={d}
              fill="none"
              stroke={w.color}
              strokeWidth={isSel ? 3.5 : 2.8}
              strokeLinecap="round"
              opacity={1}
              style={{
                filter: isSel ? "drop-shadow(0 1px 2px rgb(15 23 42 / 0.18))" : "none",
              }}
            />
            <path d={d} fill="none" stroke="white" strokeWidth={0.9} strokeLinecap="round" opacity={isSel ? 0.45 : 0.28} />
            {isSel && <path d={d} fill="none" stroke="white" strokeWidth={1} strokeDasharray="6 4" opacity={0.9} style={{ animation: "wire-dash 0.8s linear infinite" }} />}
            <circle cx={a.x} cy={a.y} r={isSel ? 2.8 : 2.2} fill={w.color} stroke="white" strokeWidth={1.2} />
            <circle cx={b.x} cy={b.y} r={isSel ? 2.8 : 2.2} fill={w.color} stroke="white" strokeWidth={1.2} />
          </g>
        );
      })}
      {pendingFrom && ghostTo && (
        <g>
          <path
            d={wirePath(pendingFrom, ghostTo)}
            fill="none"
            stroke={pendingColor ?? "#0d9488"}
            strokeWidth={2.8}
            strokeDasharray="8 6"
            strokeLinecap="round"
            opacity={0.95}
            style={{ animation: "wire-dash 0.6s linear infinite" }}
          />
          <circle cx={pendingFrom.x} cy={pendingFrom.y} r={3.5} fill={pendingColor ?? "#0d9488"} stroke="white" strokeWidth={1.3} />
          <circle cx={ghostTo.x} cy={ghostTo.y} r={2.8} fill="white" stroke={pendingColor ?? "#0d9488"} strokeWidth={1.6} />
        </g>
      )}
    </svg>
  );
}

export function getPinPosition(components: PlacedComponent[], instanceId: string, pinId: string): { x: number; y: number } | null {
  const comp = components.find((c) => c.instanceId === instanceId);
  if (!comp) return null;
  return pinPos(comp, pinId);
}
