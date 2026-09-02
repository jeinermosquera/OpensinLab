import type { Circuit, Component, Position, Wire, ConnectionPoint } from "@opensimlab/shared-types";

export function createCircuit(name: string, description: string = ""): Circuit {
  return {
    id: crypto.randomUUID(),
    name,
    description,
    components: [],
    wires: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function addComponent(circuit: Circuit, type: Component["type"], position: Position): Circuit {
  const component: Component = {
    id: crypto.randomUUID(),
    type,
    label: type,
    properties: {},
    position,
  };
  return {
    ...circuit,
    components: [...circuit.components, component],
    updatedAt: new Date().toISOString(),
  };
}

export function addWire(circuit: Circuit, from: ConnectionPoint, to: ConnectionPoint): Circuit {
  const wire: Wire = {
    id: crypto.randomUUID(),
    from,
    to,
  };
  return {
    ...circuit,
    wires: [...circuit.wires, wire],
    updatedAt: new Date().toISOString(),
  };
}
