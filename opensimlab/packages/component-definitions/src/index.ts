import type { ComponentType } from "@opensimlab/shared-types";

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  description: string;
  symbol: string;
  defaultProperties: Record<string, number>;
  unitProperties: Record<string, string>;
  pinCount: number;
}

export const COMPONENT_DEFINITIONS: Record<ComponentType, ComponentDefinition> = {
  resistor: {
    type: "resistor",
    label: "Resistor",
    description: "Limits current flow",
    symbol: "R",
    defaultProperties: { resistance: 1000 },
    unitProperties: { resistance: "Ω" },
    pinCount: 2,
  },
  capacitor: {
    type: "capacitor",
    label: "Capacitor",
    description: "Stores electrical energy in an electric field",
    symbol: "C",
    defaultProperties: { capacitance: 0.000001 },
    unitProperties: { capacitance: "F" },
    pinCount: 2,
  },
  inductor: {
    type: "inductor",
    label: "Inductor",
    description: "Stores energy in a magnetic field",
    symbol: "L",
    defaultProperties: { inductance: 0.001 },
    unitProperties: { inductance: "H" },
    pinCount: 2,
  },
  voltage_source: {
    type: "voltage_source",
    label: "Voltage Source",
    description: "Provides constant voltage",
    symbol: "V",
    defaultProperties: { voltage: 5 },
    unitProperties: { voltage: "V" },
    pinCount: 2,
  },
  current_source: {
    type: "current_source",
    label: "Current Source",
    description: "Provides constant current",
    symbol: "I",
    defaultProperties: { current: 0.001 },
    unitProperties: { current: "A" },
    pinCount: 2,
  },
  ground: {
    type: "ground",
    label: "Ground",
    description: "Reference point for voltage",
    symbol: "GND",
    defaultProperties: {},
    unitProperties: {},
    pinCount: 1,
  },
  wire: {
    type: "wire",
    label: "Wire",
    description: "Connects two points",
    symbol: "W",
    defaultProperties: {},
    unitProperties: {},
    pinCount: 2,
  },
};

export function getComponentDefinition(type: ComponentType): ComponentDefinition {
  return COMPONENT_DEFINITIONS[type];
}

export function getAllComponentTypes(): ComponentType[] {
  return Object.keys(COMPONENT_DEFINITIONS) as ComponentType[];
}
