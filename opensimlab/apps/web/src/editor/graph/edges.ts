"use client";

// Config por defecto para cables (Fase 3: solo nodos, edges reservados para Fase 4+)
// X6 Edge default: linea teal sólida sin marker, router ortho/manhattan suavizado.

export const DEFAULT_EDGE_CONFIG = {
  attrs: {
    line: {
      stroke: "#0d9488",
      strokeWidth: 2.8,
      targetMarker: null,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
    },
  },
  // router Manhattan para cableado tipo breadboard (Fase futura: orth)
  router: { name: "manhattan" as const, args: { padding: 8, step: 16 } },
  connector: { name: "rounded" as const, args: { radius: 8 } },
  zIndex: 0,
} as const;

export type EdgeConfig = typeof DEFAULT_EDGE_CONFIG;
