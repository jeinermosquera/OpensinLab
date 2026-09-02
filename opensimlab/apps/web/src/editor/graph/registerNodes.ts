"use client";

import { Graph } from "@antv/x6";
import { getDefinition } from "@/components/definitions";
import type { ComponentDefinition } from "@/components/definitions";
import { photorealSvgString } from "@/components/photoreal/svgString";

let registered = false;

function ensureWokwi() {
  if (typeof window === "undefined") return;
  void import("@wokwi/elements");
}

function createPhotorealElement(
  def: ComponentDefinition,
  props: Record<string, string | number>,
  size: { width: number; height: number },
  extraData?: { ledOn?: boolean; hasCurrent?: boolean },
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.width = `${size.width}px`;
  wrap.style.height = `${size.height}px`;
  wrap.style.display = "block";
  wrap.style.pointerEvents = "none";
  wrap.style.overflow = "visible";
  wrap.innerHTML = photorealSvgString(def.id, size.width, size.height, props, extraData);
  // glow para LED encendido ya está en SVG, pero reforzamos container
  if (def.id === "led" && extraData?.ledOn) {
    wrap.style.filter = "brightness(1.08) drop-shadow(0 0 8px rgba(251,146,60,0.45))";
  }
  if (def.id === "resistor" && extraData?.hasCurrent) {
    wrap.style.filter = "brightness(1.06) drop-shadow(0 0 6px rgba(251,146,60,0.35))";
  }
  return wrap;
}

/**
 * Registra node 'wokwi-node' con shape html fotorrealista.
 * Reemplaza SVGs planos / placeholders de Fase 3 por renders con textura real
 * (PCB con pistas cobre, metales especulares, gradientes, sombras 3D)
 * Mantiene ports visibles y normas WOKWI_NORMS 1:1.
 */
export function registerWokwiNodes(): void {
  if (registered) return;
  if (typeof window === "undefined") return;
  ensureWokwi();

  try {
    // @ts-expect-error registry check interno
    if (Graph.registry?.node?.has?.("wokwi-node")) {
      registered = true;
      return;
    }
  } catch {
    // ignore
  }

  Graph.registerNode(
    "wokwi-node",
    {
      inherit: "html",
      width: 100,
      height: 40,
      html: {
        render(node: { getData: () => unknown; getSize: () => { width: number; height: number } }) {
          const data = node.getData() as {
            definitionId?: string;
            props?: Record<string, string | number>;
            ledOn?: boolean;
            hasCurrent?: boolean;
          } | undefined;
          const definitionId = data?.definitionId ?? "unknown";
          const props = data?.props ?? {};
          const def = getDefinition(definitionId);
          const size = node.getSize();
          const container = document.createElement("div");
          container.style.width = `${size.width}px`;
          container.style.height = `${size.height}px`;
          container.style.display = "flex";
          container.style.alignItems = "center";
          container.style.justifyContent = "center";
          container.style.overflow = "visible";
          container.style.pointerEvents = "none";
          container.style.background = "transparent";

          if (!def) {
            container.textContent = definitionId;
            container.style.color = "#777";
            container.style.fontFamily = "JetBrains Mono, monospace";
            container.style.fontSize = "10px";
            container.style.background = "#1e1e1e";
            container.style.border = "1px solid #333";
            container.style.borderRadius = "4px";
            return container;
          }

          const isLedOn = !!data?.ledOn;
          const hasCurrent = !!data?.hasCurrent || isLedOn;
          if (def.id === "led" && isLedOn) {
            container.style.filter = "drop-shadow(0 0 10px rgba(251,146,60,0.85))";
            container.style.borderRadius = "6px";
          }
          if (def.id === "resistor" && hasCurrent) {
            container.style.boxShadow = "0 0 0 2px rgba(251,146,60,0.22), 0 0 12px rgba(251,146,60,0.18)";
            container.style.borderRadius = "4px";
          }

          const inner = createPhotorealElement(def, props, { width: size.width, height: size.height }, { ledOn: isLedOn, hasCurrent });
          container.appendChild(inner);

          if (def.id === "led" && isLedOn) {
            const glow = document.createElement("div");
            glow.style.position = "absolute";
            glow.style.inset = "18% 22%";
            glow.style.background = "radial-gradient(ellipse at center, rgba(251,191,36,0.95) 0%, rgba(239,68,68,0.55) 45%, transparent 75%)";
            glow.style.filter = "blur(6px)";
            glow.style.pointerEvents = "none";
            glow.style.zIndex = "0";
            glow.style.borderRadius = "50%";
            container.style.position = "relative";
            container.insertBefore(glow, container.firstChild);
          }
          return container;
        },
        shouldComponentUpdate(node: { hasChanged: (k: string) => boolean }) {
          return node.hasChanged("data") || node.hasChanged("size");
        },
      },
      ports: {
        groups: {
          left: {
            position: { name: "absolute" },
            attrs: { circle: { r: 5.5, magnet: true, stroke: "#0d9488", fill: "#1e1e1e", strokeWidth: 1.5 } },
            markup: [{ tagName: "circle", selector: "circle", attrs: { magnet: "true" } }],
          },
          right: {
            position: { name: "absolute" },
            attrs: { circle: { r: 5.5, magnet: true, stroke: "#0d9488", fill: "#1e1e1e", strokeWidth: 1.5 } },
            markup: [{ tagName: "circle", selector: "circle", attrs: { magnet: "true" } }],
          },
          top: {
            position: { name: "absolute" },
            attrs: { circle: { r: 5.5, magnet: true, stroke: "#0d9488", fill: "#1e1e1e", strokeWidth: 1.5 } },
            markup: [{ tagName: "circle", selector: "circle", attrs: { magnet: "true" } }],
          },
          bottom: {
            position: { name: "absolute" },
            attrs: { circle: { r: 5.5, magnet: true, stroke: "#0d9488", fill: "#1e1e1e", strokeWidth: 1.5 } },
            markup: [{ tagName: "circle", selector: "circle", attrs: { magnet: "true" } }],
          },
        },
        items: [],
      },
      attrs: {
        body: {
          fill: "transparent",
          stroke: "transparent",
          strokeWidth: 0,
        },
      },
    },
    true,
  );

  registered = true;
}
