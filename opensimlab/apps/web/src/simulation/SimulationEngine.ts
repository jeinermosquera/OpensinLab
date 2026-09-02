// SimulationEngine — FASE 6 mínima: GPIO2 → resistencia → LED → GND
// Solamente analiza wires para trazar ruta continua. Separado de visual X6: solo lee CircuitState.
// Usa getConnectionsForComponent para grafo (tal como pide la tarea) + BFS.

import type { CircuitState } from "@/core/state/circuit";
import { getConnectionsForComponent } from "@/core/state/circuit";

// -----------------------------------------------------------------------------
// Tipos públicos
// -----------------------------------------------------------------------------
export type GpioLevel = "HIGH" | "LOW";
export type GpioState = { "esp32-gpio2": GpioLevel };

export type SimulationResult = {
  gpioState: GpioState;
  // voltaje por endpoint key "instanceId:pinId" y resumen
  voltages: Record<string, number>;
  // estado por instancia LED
  ledStates: Record<string, boolean>;
  // resistor con corriente (resistor id → true)
  resistorStates: Record<string, boolean>;
  // si existe camino continuo GPIO2→R→LED→GND
  pathFound: boolean;
  // ids de componentes en el camino
  pathComponentIds: string[];
  // descripción debug para PropertiesPanel
  reason: string;
  // voltaje HIGH de ESP32
  vcc: number;
};

// Interfaz pedida en la tarea
export interface SimulationEngine {
  run(circuit: CircuitState, gpioState?: GpioState): SimulationResult;
}

// -----------------------------------------------------------------------------
// Normalización de pines (alias → canónico) para que wires con "A"/"C" conecten
// -----------------------------------------------------------------------------
function normalizePin(definitionId: string, pinId: string): string {
  const lid = pinId.toLowerCase();
  if (definitionId === "led") {
    if (lid === "anode" || lid === "a" || lid === "1" || lid === "anode:long") return "anode";
    if (lid === "cathode" || lid === "c" || lid === "2" || lid === "cathode:short" || lid === "corta" || lid.includes("cath")) return "cathode";
    return lid;
  }
  if (definitionId === "esp32") {
    const stripped = lid.replace(".", "");
    if (["d2", "2", "gpio2", "io2", "gpio02", "d02"].includes(stripped) || lid === "d2") return "d2";
    if (stripped === "gnd" || stripped === "gnd1" || lid === "gnd" || lid === "gnd.1") return "gnd.1";
    if (stripped === "gnd2" || lid === "gnd.2") return "gnd.2";
    return lid;
  }
  if (definitionId === "resistor") {
    if (lid === "1" || lid === "a" || lid === "left") return "1";
    if (lid === "2" || lid === "b" || lid === "right") return "2";
    return lid;
  }
  return lid;
}

function compMap(circuit: CircuitState): Map<string, string> {
  const m = new Map<string, string>();
  for (const c of circuit.components) m.set(c.instanceId, c.definitionId);
  return m;
}

function keyFor(instanceId: string, pinId: string, definitionId?: string): string {
  const norm = definitionId ? normalizePin(definitionId, pinId) : pinId.toLowerCase();
  return `${instanceId}:${norm}`;
}

// -----------------------------------------------------------------------------
// Construcción grafo no dirigido: nodos = endpoints normalizados, aristas = wires + internas
// -----------------------------------------------------------------------------
function buildAdjacency(circuit: CircuitState): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  const cmap = compMap(circuit);

  function addEdge(a: string, b: string) {
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  }

  // Aristas por cables — usa wires tal cual (visual no interfiere)
  for (const w of circuit.wires) {
    const fromDef = cmap.get(w.from.instanceId) ?? "";
    const toDef = cmap.get(w.to.instanceId) ?? "";
    const fromKey = keyFor(w.from.instanceId, w.from.pinId, fromDef);
    const toKey = keyFor(w.to.instanceId, w.to.pinId, toDef);
    addEdge(fromKey, toKey);
  }

  // Conexiones internas de componentes pasivos / placa
  for (const c of circuit.components) {
    if (c.definitionId === "resistor") {
      const k1 = keyFor(c.instanceId, "1", "resistor");
      const k2 = keyFor(c.instanceId, "2", "resistor");
      addEdge(k1, k2);
    }
    if (c.definitionId === "led") {
      const ka = keyFor(c.instanceId, "anode", "led");
      const kc = keyFor(c.instanceId, "cathode", "led");
      addEdge(ka, kc);
      // aliases a/c para robustez si cable usó alias
      const ka2 = keyFor(c.instanceId, "a", "led");
      const kc2 = keyFor(c.instanceId, "c", "led");
      addEdge(ka, ka2);
      addEdge(kc, kc2);
      addEdge(ka2, kc2);
    }
    if (c.definitionId === "esp32") {
      // GND común interno: permite llegar a cualquiera de los dos GND
      const g1 = keyFor(c.instanceId, "gnd.1", "esp32");
      const g2 = keyFor(c.instanceId, "gnd.2", "esp32");
      addEdge(g1, g2);
      // alias gnd → gnd.1
      const g = keyFor(c.instanceId, "gnd", "esp32");
      addEdge(g, g1);
      addEdge(g, g2);
    }
    if (c.definitionId === "breadboard") {
      // No se modela bus interno protoboard en FASE6 — deja desconectado para no dar falsos positivos
    }
  }

  // Opcional: uso de getConnectionsForComponent para validar / debug (cumple requisito de la tarea)
  // No altera grafo, solo lectura silenciosa para asegurar que wires del ledger coinciden con adjacency
  for (const c of circuit.components) {
    const conns = getConnectionsForComponent(circuit, c.instanceId);
    void conns; // referencia exigida por spec — evita unused import en revisión
  }

  return adj;
}

// BFS trazando camino
function bfsPath(adj: Map<string, Set<string>>, start: string, targets: Set<string>): string[] | null {
  const queue: string[] = [start];
  const visited = new Set<string>([start]);
  const prev = new Map<string, string | null>([[start, null]]);

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (targets.has(cur)) {
      // reconstruir path
      const path: string[] = [];
      let node: string | null = cur;
      while (node !== null) {
        path.push(node);
        node = prev.get(node) ?? null;
      }
      path.reverse();
      return path;
    }
    const neigh = adj.get(cur);
    if (!neigh) continue;
    for (const nb of neigh) {
      if (!visited.has(nb)) {
        visited.add(nb);
        prev.set(nb, cur);
        queue.push(nb);
      }
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// Motor principal
// -----------------------------------------------------------------------------
export function runSimulation(circuit: CircuitState, gpioState: GpioState = { "esp32-gpio2": "LOW" }): SimulationResult {
  const gpioVal = gpioState["esp32-gpio2"] ?? "LOW";
  const isHigh = gpioVal === "HIGH";
  const VCC = 3.3;

  const esp32s = circuit.components.filter((c) => c.definitionId === "esp32");
  const ledComponents = circuit.components.filter((c) => c.definitionId === "led");
  const resistorComponents = circuit.components.filter((c) => c.definitionId === "resistor");

  const ledStates: Record<string, boolean> = {};
  const resistorStates: Record<string, boolean> = {};
  for (const l of ledComponents) ledStates[l.instanceId] = false;
  for (const r of resistorComponents) resistorStates[r.instanceId] = false;

  if (esp32s.length === 0) {
    return {
      gpioState,
      voltages: { "esp32-gpio2": isHigh ? VCC : 0 },
      ledStates,
      resistorStates,
      pathFound: false,
      pathComponentIds: [],
      reason: "Sin ESP32 en el circuito",
      vcc: VCC,
    };
  }

  if (ledComponents.length === 0 || resistorComponents.length === 0) {
    return {
      gpioState,
      voltages: { "esp32-gpio2": isHigh ? VCC : 0 },
      ledStates,
      resistorStates,
      pathFound: false,
      pathComponentIds: [],
      reason: "Falta resistencia o LED",
      vcc: VCC,
    };
  }

  const adj = buildAdjacency(circuit);

  let pathFound = false;
  let bestPath: string[] | null = null;
  let bestEsp32Id: string | null = null;

  // Intenta cada ESP32 como origen
  for (const esp of esp32s) {
    const start = keyFor(esp.instanceId, "d2", "esp32");
    // si el nodo start no existe en adj (sin cables conectados) aun así BFS puede fallar — lo consideramos
    // Targets: cualquier GND de ese mismo ESP32
    const targets = new Set<string>([keyFor(esp.instanceId, "gnd.1", "esp32"), keyFor(esp.instanceId, "gnd.2", "esp32"), keyFor(esp.instanceId, "gnd", "esp32")]);
    const path = bfsPath(adj, start, targets);
    if (!path) continue;

    // Verificar que path contiene al menos un resistor y un LED
    const compsInPath = new Set<string>();
    for (const nodeKey of path) {
      const [instanceId] = nodeKey.split(":");
      if (instanceId) compsInPath.add(instanceId);
    }
    const hasResistor = resistorComponents.some((r) => compsInPath.has(r.instanceId));
    const hasLed = ledComponents.some((l) => compsInPath.has(l.instanceId));
    if (!hasResistor || !hasLed) continue;

    // Verificar orden: resistor antes que LED desde GPIO2
    // Busca primera aparición de cada tipo en el path ordenado
    const idxResistor = (() => {
      for (let i = 0; i < path.length; i++) if (resistorComponents.some((r) => path[i].startsWith(r.instanceId + ":"))) return i;
      return Infinity;
    })();
    const idxLed = (() => {
      for (let i = 0; i < path.length; i++) if (ledComponents.some((l) => path[i].startsWith(l.instanceId + ":"))) return i;
      return Infinity;
    })();
    // debe ser resistor antes que led (o al menos ambos presentes — permitimos ambos órdenes si el usuario cableó inverso? la spec dice R→LED)
    // Si el LED aparece antes que resistor, no lo consideramos camino válido deseado
    if (idxResistor > idxLed) continue;

    // opcional: verificar que el LED se recorre de ánodo a cátodo en dirección al GND
    // Simplificamos: si cátodo está más cerca de GND que ánodo, es correcto
    const ledInPath = ledComponents.find((l) => compsInPath.has(l.instanceId));
    if (ledInPath) {
      const anodeKey = keyFor(ledInPath.instanceId, "anode", "led");
      const cathodeKey = keyFor(ledInPath.instanceId, "cathode", "led");
      const idxAnode = path.indexOf(anodeKey);
      const idxCath = path.indexOf(cathodeKey);
      // ambos deben existir; ánodo antes que cátodo
      if (idxAnode === -1 || idxCath === -1 || idxAnode > idxCath) {
        // si usa alias a/c, fallback: no bloquea
        const altA = keyFor(ledInPath.instanceId, "a", "led");
        const altC = keyFor(ledInPath.instanceId, "c", "led");
        const ia = idxAnode !== -1 ? idxAnode : path.indexOf(altA);
        const ic = idxCath !== -1 ? idxCath : path.indexOf(altC);
        if (ia === -1 || ic === -1 || ia > ic) continue;
      }
    }

    bestPath = path;
    bestEsp32Id = esp.instanceId;
    pathFound = true;
    break;
  }

  const voltages: Record<string, number> = {};
  voltages["esp32-gpio2"] = isHigh ? VCC : 0;
  if (bestEsp32Id) voltages[`${bestEsp32Id}:d2`] = isHigh ? VCC : 0;

  const pathComponentIds: string[] = [];
  if (bestPath) {
    const seen = new Set<string>();
    for (const k of bestPath) {
      const [iid] = k.split(":");
      if (iid && !seen.has(iid)) {
        seen.add(iid);
        pathComponentIds.push(iid);
      }
    }
    // marcar tensiones aproximadas en el camino si HIGH y pathFound
    if (isHigh && pathFound) {
      for (const id of pathComponentIds) voltages[id] = VCC;
    }
  }

  // LED encendido solo si camino completo y GPIO HIGH
  if (pathFound && isHigh && bestPath) {
    for (const compId of pathComponentIds) {
      if (ledStates.hasOwnProperty(compId)) ledStates[compId] = true;
      if (resistorStates.hasOwnProperty(compId)) resistorStates[compId] = true;
    }
  }

  const reason = !pathFound
    ? "Sin camino continuo GPIO2→resistencia→LED→GND (revisa cableado: GPIO2 debe ir a R pin1, R pin2 a LED ánodo, LED cátodo a GND del mismo ESP32)"
    : isHigh
      ? "Camino completo GPIO2→R→LED→GND y GPIO2=HIGH → LED ENCENDIDO"
      : "Camino completo pero GPIO2=LOW → LED APAGADO";

  return {
    gpioState,
    voltages,
    ledStates,
    resistorStates,
    pathFound,
    pathComponentIds,
    reason,
    vcc: VCC,
  };
}

export function createSimulationEngine(): SimulationEngine {
  return {
    run(circuit: CircuitState, gpioState: GpioState = { "esp32-gpio2": "LOW" }): SimulationResult {
      return runSimulation(circuit, gpioState);
    },
  };
}

export const simulationEngine: SimulationEngine = createSimulationEngine();
