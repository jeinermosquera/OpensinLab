"use client";

import type { ComponentDefinition } from "@/components/definitions";
import { getWokwiNorm } from "@/components/wokwiPins";

// Config de ports X6 para un ComponentDefinition.
// Usa WOKWI_NORMS para posición normalizada precisa (no distribuir centro).
// Cada port: {id,label,group:left/right/top/bottom, args:{x,y}, attrs:{circle:{magnet:true}}}
// Groups left/right/top/bottom usan position 'absolute' para respetar nx/ny exactos.

const PORT_CIRCLE_ATTRS = {
  circle: { magnet: true, r: 5.5, stroke: "#0d9488", fill: "#1e1e1e", strokeWidth: 1.5 },
};

// X6 portMarkup con magnet para que cada pin sea arrastrale y detectable por validateConnection
export const PORT_MARKUP = [
  {
    tagName: "circle",
    selector: "circle",
    attrs: { magnet: "true" },
  },
];

export type X6PortsConfig = {
  groups: Record<string, { position: unknown; attrs: typeof PORT_CIRCLE_ATTRS; markup: typeof PORT_MARKUP }>;
  items: Array<{
    id: string;
    group: string;
    label?: string;
    args?: { x: string | number; y: string | number };
    attrs?: typeof PORT_CIRCLE_ATTRS;
    markup?: typeof PORT_MARKUP;
  }>;
};

export function getX6Ports(def: ComponentDefinition): X6PortsConfig {
  // Groups con posición absoluta para permitir coords precisas por pin + portMarkup magnet
  const groups: X6PortsConfig["groups"] = {
    left: { position: { name: "absolute" }, attrs: PORT_CIRCLE_ATTRS, markup: PORT_MARKUP },
    right: { position: { name: "absolute" }, attrs: PORT_CIRCLE_ATTRS, markup: PORT_MARKUP },
    top: { position: { name: "absolute" }, attrs: PORT_CIRCLE_ATTRS, markup: PORT_MARKUP },
    bottom: { position: { name: "absolute" }, attrs: PORT_CIRCLE_ATTRS, markup: PORT_MARKUP },
  };

  // Para fallback distribuido cuando no hay WOKWI_NORMS, calculamos posición manual
  const countsBySide: Record<string, number> = { left: 0, right: 0, top: 0, bottom: 0 };
  def.pins.forEach((p) => {
    countsBySide[p.side] = (countsBySide[p.side] ?? 0) + 1;
  });
  const indexBySide: Record<string, number> = { left: 0, right: 0, top: 0, bottom: 0 };

  const items = def.pins.map((p) => {
    const norm = getWokwiNorm(def.id, p.id);
    if (norm) {
      // Precisa: nx/ny 0-1 → porcentaje
      // X6 absolute espera args {x: '47%', y: '78%'} o número absoluto
      return {
        id: p.id,
        group: p.side,
        label: p.label,
        args: { x: `${norm.nx * 100}%`, y: `${norm.ny * 100}%` },
        attrs: PORT_CIRCLE_ATTRS,
      };
    }
    // Fallback distribuido (capacitor, breadboard sin pinInfo)
    const side = p.side;
    const n = countsBySide[side] ?? 1;
    const idx = indexBySide[side] ?? 0;
    indexBySide[side] = idx + 1;
    // distribuir equitativamente 10%..90%
    const ratio = n === 1 ? 50 : ((idx + 1) * 100) / (n + 1);
    let x: string | number = "50%";
    let y: string | number = "50%";
    if (side === "left") {
      x = 0;
      y = `${ratio}%`;
    } else if (side === "right") {
      x = "100%";
      y = `${ratio}%`;
    } else if (side === "top") {
      x = `${ratio}%`;
      y = 0;
    } else if (side === "bottom") {
      x = `${ratio}%`;
      y = "100%";
    }
    return {
      id: p.id,
      group: side,
      label: p.label,
      args: { x, y },
      attrs: PORT_CIRCLE_ATTRS,
    };
  });

  return { groups, items };
}
