// Modelo de circuito serializable — Sesión 05 (separación datos vs visual)
// Fase 5: Circuit/CircuitState es la fuente de verdad eléctrica (sin dependencia de X6).
// PlacedComponent sigue siendo la instancia serializable; ElectronicComponent es la vista rica para X6/ports.
// Coordenadas x/y/rotation/props pertenecen al modelo del circuito (no a X6); X6 solo renderiza.

export type PlacedComponent = {
  instanceId: string;
  definitionId: string;
  x: number;
  y: number;
  rotation: number; // 0,90,180,270
  props: Record<string, string | number>;
};

// Modelo genérico Fase 3 — no duplica definitions.ts, adapta sus datos
export type PinDirection = "left" | "right" | "top" | "bottom";
export type PinType = "digital" | "analog" | "power" | "ground" | "passive";

export type ElectronicPin = {
  id: string;
  name: string;
  type: PinType;
  position: { x: number; y: number }; // normalizado 0-1 dentro del nodo (desde WOKWI_NORMS)
  direction: PinDirection;
};

export type ElectronicComponent = {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  pins: ElectronicPin[];
  properties: Record<string, string | number>;
  rotation: number;
};

export type WireEndpoint = { instanceId: string; pinId: string };

export type Wire = {
  id: string;
  from: WireEndpoint;
  to: WireEndpoint;
  color: string;
};

export type CircuitState = {
  components: PlacedComponent[];
  wires: Wire[];
  selectedId: string | null; // instanceId o wireId
};

// FASE 5 — alias serializable limpio: sin dependencia de X6 (solo datos eléctricos+posición lógica)
// connections ≡ wires para compatibilidad con spec FASE 5
export type Circuit = CircuitState;
export type CircuitData = {
  components: PlacedComponent[];
  connections: Wire[];
};
export const CIRCUIT_STORAGE_KEY = "opensimlab-circuit";
export const CIRCUIT_VERSION = 1;

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function snap(value: number, grid = 24): number {
  return Math.round(value / grid) * grid;
}

const WIRE_COLORS = ["#e53935", "#43a047", "#fdd835", "#1e88e5", "#ff6f00", "#212121", "#8e24aa"];

export function nextWireColor(index: number): string {
  return WIRE_COLORS[index % WIRE_COLORS.length];
}

/** Helper Fase 3: adapta PlacedComponent + ComponentDefinition a ElectronicComponent genérico.
 *  Usa WOKWI_NORMS si disponible para position precisa; si no, distribuye por lado. */
export function toElectronicComponent(
  placed: PlacedComponent,
  def: { id: string; name: string; width: number; height: number; pins: { id: string; label: string; side: PinDirection }[] },
  getNorm?: (definitionId: string, pinId: string) => { nx: number; ny: number } | null,
): ElectronicComponent {
  const pins: ElectronicPin[] = def.pins.map((p) => {
    const norm = getNorm?.(def.id, p.id) ?? null;
    const pos = norm ? { x: norm.nx, y: norm.ny } : { x: 0.5, y: 0.5 };
    // type heurístico: power/gnd → power/ground
    const lid = p.label.toLowerCase();
    let type: PinType = "digital";
    if (lid.includes("gnd") || lid.includes("ground")) type = "ground";
    else if (lid.includes("vcc") || lid.includes("vin") || lid.includes("3v3") || lid.includes("5v") || lid.includes("3.3v")) type = "power";
    else if (lid.startsWith("a") && /^a\d/.test(lid)) type = "analog";
    return { id: p.id, name: p.label, type, position: pos, direction: p.side };
  });
  return {
    id: placed.instanceId,
    type: placed.definitionId,
    name: def.name,
    position: { x: placed.x, y: placed.y },
    size: { w: def.width, h: def.height },
    pins,
    properties: placed.props,
    rotation: placed.rotation,
  };
}

// ---------------------------------------------------------------------------
// FASE 5 — Helpers puros del modelo serializable (sin X6, sin React)
// ---------------------------------------------------------------------------

/** Crea un circuito vacío. */
export function createCircuit(): CircuitState {
  return { components: [], wires: [], selectedId: null };
}

/** Añade un componente de forma inmutable. */
export function addComponentToCircuit(circuit: CircuitState, component: PlacedComponent): CircuitState {
  return { ...circuit, components: [...circuit.components, { ...component, props: { ...component.props } }] };
}

/** Elimina un componente y todos sus cables asociados (inmutable). */
export function removeComponent(circuit: CircuitState, instanceId: string): CircuitState {
  return {
    components: circuit.components.filter((c) => c.instanceId !== instanceId),
    wires: circuit.wires.filter((w) => w.from.instanceId !== instanceId && w.to.instanceId !== instanceId),
    selectedId: circuit.selectedId === instanceId ? null : circuit.selectedId,
  };
}

/** Añade una conexión (wire) validando duplicados y self-loop (inmutable). */
export function addConnection(circuit: CircuitState, wire: Wire): CircuitState {
  if (wire.from.instanceId === wire.to.instanceId && wire.from.pinId === wire.to.pinId) return circuit;
  if (wire.from.instanceId === wire.to.instanceId) return circuit;
  const dup = circuit.wires.some(
    (w) =>
      (w.from.instanceId === wire.from.instanceId && w.from.pinId === wire.from.pinId && w.to.instanceId === wire.to.instanceId && w.to.pinId === wire.to.pinId) ||
      (w.from.instanceId === wire.to.instanceId && w.from.pinId === wire.to.pinId && w.to.instanceId === wire.from.instanceId && w.to.pinId === wire.from.pinId),
  );
  if (dup) return circuit;
  return { ...circuit, wires: [...circuit.wires, { ...wire, from: { ...wire.from }, to: { ...wire.to } }] };
}

/** Elimina una conexión por id (inmutable). */
export function removeConnection(circuit: CircuitState, wireId: string): CircuitState {
  return {
    ...circuit,
    wires: circuit.wires.filter((w) => w.id !== wireId),
    selectedId: circuit.selectedId === wireId ? null : circuit.selectedId,
  };
}

/** Devuelve todas las conexiones de un componente. */
export function getConnectionsForComponent(circuit: CircuitState, instanceId: string): Wire[] {
  return circuit.wires.filter((w) => w.from.instanceId === instanceId || w.to.instanceId === instanceId);
}

/** Valida el circuito y devuelve errores si los hay. */
export function validateCircuit(circuit: CircuitState): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const c of circuit.components) {
    if (!c.instanceId) errors.push(`Componente sin instanceId: ${JSON.stringify(c)}`);
    if (seen.has(c.instanceId)) errors.push(`instanceId duplicado: ${c.instanceId}`);
    seen.add(c.instanceId);
    if (!c.definitionId) errors.push(`Componente ${c.instanceId} sin definitionId`);
    if (typeof c.x !== "number" || typeof c.y !== "number") errors.push(`Coordenadas inválidas en ${c.instanceId}`);
  }
  const compIds = new Set(circuit.components.map((c) => c.instanceId));
  const wireSeen = new Set<string>();
  for (const w of circuit.wires) {
    if (!w.id) errors.push(`Wire sin id`);
    if (wireSeen.has(w.id)) errors.push(`Wire id duplicado: ${w.id}`);
    wireSeen.add(w.id);
    if (!compIds.has(w.from.instanceId)) errors.push(`Wire ${w.id} from.instanceId inexistente: ${w.from.instanceId}`);
    if (!compIds.has(w.to.instanceId)) errors.push(`Wire ${w.id} to.instanceId inexistente: ${w.to.instanceId}`);
    if (!w.from.pinId || !w.to.pinId) errors.push(`Wire ${w.id} pinId vacío`);
    if (w.from.instanceId === w.to.instanceId && w.from.pinId === w.to.pinId) errors.push(`Wire ${w.id} self-loop mismo pin`);
    // duplicado bidireccional
    // no validamos pinId contra definition para no acoplar aquí; sino que warning en capas superiores
  }
  // detectar duplicados bidireccionales
  for (let i = 0; i < circuit.wires.length; i++) {
    for (let j = i + 1; j < circuit.wires.length; j++) {
      const a = circuit.wires[i], b = circuit.wires[j];
      if (
        (a.from.instanceId === b.from.instanceId && a.from.pinId === b.from.pinId && a.to.instanceId === b.to.instanceId && a.to.pinId === b.to.pinId) ||
        (a.from.instanceId === b.to.instanceId && a.from.pinId === b.to.pinId && a.to.instanceId === b.from.instanceId && a.to.pinId === b.from.pinId)
      ) {
        errors.push(`Wires duplicados: ${a.id} y ${b.id}`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

/** Serializa el circuito a JSON string (formato limpio, sin datos X6). */
export function serialize(circuit: CircuitState): string {
  const payload = {
    version: CIRCUIT_VERSION,
    components: circuit.components.map((c) => ({ ...c, props: { ...c.props } })),
    wires: circuit.wires.map((w) => ({ ...w, from: { ...w.from }, to: { ...w.to } })),
    selectedId: circuit.selectedId,
  };
  return JSON.stringify(payload);
}

/** Deserializa JSON → CircuitState. Lanza si el formato es inválido. */
export function deserialize(json: string): CircuitState {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error("JSON inválido");
  }
  const obj = raw as { version?: number; components?: unknown; wires?: unknown; connections?: unknown; selectedId?: unknown };
  const comps = (obj.components ?? []) as PlacedComponent[];
  const wiresRaw = (obj.wires ?? obj.connections ?? []) as Wire[];
  if (!Array.isArray(comps)) throw new Error("components debe ser array");
  if (!Array.isArray(wiresRaw)) throw new Error("wires/connections debe ser array");
  const components: PlacedComponent[] = comps.map((c) => ({
    instanceId: String((c as { instanceId?: string; id?: string }).instanceId ?? (c as { id?: string }).id ?? uid()),
    definitionId: String((c as { definitionId?: string; type?: string }).definitionId ?? (c as { type?: string }).type ?? ""),
    x: Number((c as { x?: number }).x ?? 0),
    y: Number((c as { y?: number }).y ?? 0),
    rotation: Number((c as { rotation?: number }).rotation ?? 0),
    props: { ...(((c as { props?: Record<string, string | number> }).props) ?? {}) },
  }));
  const wires: Wire[] = wiresRaw.map((w) => {
    const fromRaw = (w as { from?: unknown }).from as WireEndpoint | string | undefined;
    const toRaw = (w as { to?: unknown }).to as WireEndpoint | string | undefined;
    const parseEp = (ep: WireEndpoint | string | undefined): WireEndpoint => {
      if (!ep) return { instanceId: "", pinId: "" };
      if (typeof ep === "string") {
        const [iid, ...rest] = ep.split(":");
        return { instanceId: iid, pinId: rest.join(":") };
      }
      return { instanceId: String((ep as WireEndpoint).instanceId ?? ""), pinId: String((ep as WireEndpoint).pinId ?? "") };
    };
    return {
      id: String((w as { id?: string }).id ?? uid()),
      from: parseEp(fromRaw),
      to: parseEp(toRaw),
      color: String((w as { color?: string }).color ?? nextWireColor(0)),
    };
  });
  const selectedId = obj.selectedId != null ? String(obj.selectedId) : null;
  const circuit: CircuitState = { components, wires, selectedId };
  const { valid, errors } = validateCircuit(circuit);
  if (!valid) throw new Error(`Circuito inválido: ${errors.join("; ")}`);
  return circuit;
}
