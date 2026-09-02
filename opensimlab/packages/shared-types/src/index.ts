export interface Component {
  id: string;
  type: ComponentType;
  label: string;
  properties: Record<string, number>;
  position: Position;
}

export type ComponentType = "resistor" | "capacitor" | "inductor" | "voltage_source" | "current_source" | "ground" | "wire";

export interface Position {
  x: number;
  y: number;
}

export interface Circuit {
  id: string;
  name: string;
  description: string;
  components: Component[];
  wires: Wire[];
  createdAt: string;
  updatedAt: string;
}

export interface Wire {
  id: string;
  from: ConnectionPoint;
  to: ConnectionPoint;
}

export interface ConnectionPoint {
  componentId: string;
  pinIndex: number;
}

export interface SimulationResult {
  circuitId: string;
  timestamp: string;
  data: SimulationDataPoint[];
}

export interface SimulationDataPoint {
  time: number;
  values: Record<string, number>;
}

export interface HealthStatus {
  status: "ok" | "error";
  timestamp?: string;
}
