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
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.width = `${size.width}px`;
  wrap.style.height = `${size.height}px`;
  wrap.style.display = "block";
  wrap.style.pointerEvents = "none";
  wrap.style.overflow = "visible";
  wrap.innerHTML = photorealSvgString(def.id, size.width, size.height, props);
  return wrap;
}

/**
 * Registra node 'wokwi-node' con shape html fotorrealista.
 * Visual puro sin simulación — sin glow de corriente.
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
      inherit: "rect",
      width: 100,
      height: 40,
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "foreignObject", selector: "fo" },
      ],
      html: {
        render(node: { getData: () => unknown; getSize: () => { width: number; height: number } }) {
          const data = node.getData() as {
            definitionId?: string;
            props?: Record<string, string | number>;
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

          const inner = createPhotorealElement(def, props, { width: size.width, height: size.height });
          container.appendChild(inner);

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
        fo: {
          x: 0,
          y: 0,
          width: "100%",
          height: "100%",
          style: "overflow: visible;",
        },
      },
    },
    true,
  );

  registered = true;
}
