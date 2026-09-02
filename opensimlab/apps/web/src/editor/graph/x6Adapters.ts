"use client";

import type { Graph, Node } from "@antv/x6";
import type { CircuitState, PlacedComponent, Wire } from "@/core/state/circuit";
import { getDefinition } from "@/components/definitions";
import { getX6Ports } from "./ports";
import { DEFAULT_EDGE_CONFIG } from "./edges";
import { serialize, deserialize, CIRCUIT_VERSION } from "@/core/state/circuit";

/**
 * Serializa CircuitState -> X6 JSON (para graph.fromJSON / toJSON).
 * Fase 3: solo nodos; edges reservados pero ya serializables.
 */
export function toX6JSON(state: CircuitState): { cells: unknown[] } {
  const cells: unknown[] = [];

  for (const c of state.components) {
    const def = getDefinition(c.definitionId);
    if (!def) continue;
    const ports = getX6Ports(def);
    cells.push({
      id: c.instanceId,
      shape: "wokwi-node",
      x: c.x,
      y: c.y,
      width: def.width,
      height: def.height,
      angle: c.rotation,
      data: { definitionId: c.definitionId, props: c.props },
      ports,
      zIndex: 1,
    });
  }

  for (const w of state.wires) {
    cells.push({
      id: w.id,
      shape: "edge",
      source: { cell: w.from.instanceId, port: w.from.pinId },
      target: { cell: w.to.instanceId, port: w.to.pinId },
      data: { wireId: w.id, color: w.color },
      attrs: { line: { stroke: w.color ?? DEFAULT_EDGE_CONFIG.attrs.line.stroke, strokeWidth: 2.8, targetMarker: null } },
      router: DEFAULT_EDGE_CONFIG.router,
      connector: DEFAULT_EDGE_CONFIG.connector,
      zIndex: 0,
    });
  }

  return { cells };
}

/**
 * Deserializa Graph -> CircuitState.
 * Lee graph.getCells() o graph.toJSON().
 */
export function fromX6JSON(graph: Graph): CircuitState {
  const json = graph.toJSON() as unknown as { cells?: unknown[] };
  const cells = json.cells ?? [];
  const components: PlacedComponent[] = [];
  const wires: Wire[] = [];
  let selectedId: string | null = null;

  for (const cell of cells as unknown as Array<{ shape?: string; id?: string; data?: { definitionId?: string; props?: Record<string, string | number> }; x?: number; y?: number; angle?: number; source?: { cell: string; port: string }; target?: { cell: string; port: string } }>) {
    if (cell.shape === "wokwi-node" && cell.id && cell.data?.definitionId) {
      components.push({
        instanceId: cell.id,
        definitionId: cell.data.definitionId,
        x: typeof cell.x === "number" ? cell.x : 0,
        y: typeof cell.y === "number" ? cell.y : 0,
        rotation: typeof cell.angle === "number" ? cell.angle : 0,
        props: cell.data.props ? { ...cell.data.props } : {},
      });
    } else if ((cell.shape === "edge" || cell.source) && cell.id && cell.source && cell.target) {
      const color =
        (cell as unknown as { attrs?: { line?: { stroke?: string } }; data?: { color?: string } }).data?.color ??
        (cell as unknown as { attrs?: { line?: { stroke?: string } } }).attrs?.line?.stroke ??
        "#0d9488";
      wires.push({
        id: cell.id,
        from: { instanceId: cell.source.cell, pinId: cell.source.port },
        to: { instanceId: cell.target.cell, pinId: cell.target.port },
        color,
      });
    }
  }

  try {
    const selected = (graph.getSelectedCells?.() ?? []) as unknown as Array<{ id: string }>;
    if (selected.length === 1) {
      selectedId = selected[0].id ?? null;
    }
  } catch {
    selectedId = null;
  }

  return { components, wires, selectedId };
}

/** Helper para sincronización directa sin graph.toJSON (más rápido) */
export function nodeToPlaced(node: Node): PlacedComponent | null {
  const data = node.getData() as { definitionId?: string; props?: Record<string, string | number> } | undefined;
  if (!data?.definitionId) return null;
  const pos = node.getPosition();
  const angle = (node as unknown as { getAngle?: () => number }).getAngle?.() ?? 0;
  return {
    instanceId: node.id,
    definitionId: data.definitionId,
    x: pos.x,
    y: pos.y,
    rotation: angle,
    props: data.props ? { ...data.props } : {},
  };
}

// ---------------------------------------------------------------------------
// FASE 5 — Serialización limpia: Circuit ↔ X6 ↔ Diagram(Wokwi-like)
// ---------------------------------------------------------------------------

export type DiagramJSON = {
  version: number;
  components: Array<{ id: string; type: string; x: number; y: number; rotation?: number; props: Record<string, string | number> }>;
  connections: Array<{ id?: string; from: string | { instanceId: string; pinId: string }; to: string | { instanceId: string; pinId: string }; color?: string }>;
};

/** Serializa CircuitState a JSON string limpio (usa circuit.serialize). */
export function serializeCircuit(state: CircuitState): string {
  return serialize(state);
}
/** Deserializa JSON string → CircuitState (usa circuit.deserialize). */
export function deserializeCircuit(json: string): CircuitState {
  return deserialize(json);
}

/** Circuit → DiagramJSON Wokwi-like {components:[{id,type,x,y,props}], connections:[{from,to}]} */
export function toDiagramJSON(state: CircuitState): DiagramJSON {
  return {
    version: CIRCUIT_VERSION,
    components: state.components.map((c) => ({
      id: c.instanceId,
      type: c.definitionId,
      x: c.x,
      y: c.y,
      rotation: c.rotation,
      props: { ...c.props },
    })),
    connections: state.wires.map((w) => ({
      id: w.id,
      from: `${w.from.instanceId}:${w.from.pinId}`,
      to: `${w.to.instanceId}:${w.to.pinId}`,
      color: w.color,
    })),
  };
}

/** DiagramJSON (o string) → CircuitState */
export function fromDiagramJSON(input: string | DiagramJSON): CircuitState {
  let obj: DiagramJSON;
  if (typeof input === "string") {
    try {
      obj = JSON.parse(input) as DiagramJSON;
    } catch {
      throw new Error("Diagram JSON inválido");
    }
  } else {
    obj = input;
  }
  // Si ya parece payload CircuitState (wires/components con instanceId) delega a deserialize
  if ((obj as unknown as { wires?: unknown }).wires && Array.isArray((obj as unknown as { wires: unknown[] }).wires)) {
    return deserialize(JSON.stringify(obj));
  }
  const components: PlacedComponent[] = (obj.components ?? []).map((c) => ({
    instanceId: c.id,
    definitionId: c.type,
    x: c.x,
    y: c.y,
    rotation: c.rotation ?? 0,
    props: { ...(c.props ?? {}) },
  }));
  const parseEp = (ep: string | { instanceId: string; pinId: string }): { instanceId: string; pinId: string } => {
    if (typeof ep === "string") {
      const [iid, ...rest] = ep.split(":");
      return { instanceId: iid, pinId: rest.join(":") };
    }
    return { instanceId: ep.instanceId, pinId: ep.pinId };
  };
  const wires: Wire[] = (obj.connections ?? []).map((conn, idx) => ({
    id: (conn as { id?: string }).id ?? `wire-${idx}`,
    from: parseEp(conn.from as string | { instanceId: string; pinId: string }),
    to: parseEp(conn.to as string | { instanceId: string; pinId: string }),
    color: (conn as { color?: string }).color ?? "#0d9488",
  }));
  const payload = JSON.stringify({ version: obj.version ?? CIRCUIT_VERSION, components, wires, selectedId: null });
  return deserialize(payload);
}

/** Helpers para export/import con string JSON */
export function serializeDiagram(state: CircuitState): string {
  return JSON.stringify(toDiagramJSON(state));
}
export function deserializeDiagram(json: string): CircuitState {
  return fromDiagramJSON(json);
}
