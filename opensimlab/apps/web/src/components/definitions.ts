// Definiciones visuales — SOLO 3 componentes fotorealistas fieles a imagen de referencia
// ESP32 vertical negro 156x210, LED 22x36 vertical, Resistencia 64x14 horizontal.
// Fondo canvas #3a3a3a. Sin canvas/conexiones/simulación tocados — solo visual + registry.

export type ComponentCategory = "Básicos";

export type ComponentDefinition = {
  id: string;
  name: string;
  category: ComponentCategory;
  icon: string;
  desc: string;
  width: number;
  height: number;
  color: string;
  pins: { id: string; label: string; side: "left" | "right" | "top" | "bottom" }[];
  defaultProps: Record<string, string | number>;
};

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    id: "led",
    name: "LED",
    category: "Básicos",
    icon: "Lightbulb",
    desc: "5mm · ánodo largo · azul/verde",
    width: 22,
    height: 36,
    color: "#3b82f6",
    pins: [
      // 2 pines arriba coherentes con SVG (patas plateadas en L en borde superior)
      { id: "anode", label: "A (larga)", side: "top" },
      { id: "cathode", label: "C (corta/GND)", side: "top" },
    ],
    defaultProps: { color: "azul" },
  },
  {
    id: "resistor",
    name: "Resistencia",
    category: "Básicos",
    icon: "Minus",
    desc: "1 kΩ · ¼ W · 4 bandas",
    width: 64,
    height: 14,
    color: "#d5b597",
    pins: [
      { id: "1", label: "1", side: "left" },
      { id: "2", label: "2", side: "right" },
    ],
    defaultProps: { resistencia: "1kΩ" },
  },
  {
    id: "esp32",
    name: "ESP32 DevKit",
    category: "Básicos",
    icon: "HardDrive",
    desc: "ESP32-WROOM · WiFi/BLE — 30 pines",
    width: 156,
    height: 210,
    color: "#0a0a0a",
    pins: [
      // Izquierda — 15 pines (amarillos circulares)
      { id: "3v3", label: "3V3", side: "left" },
      { id: "en", label: "EN", side: "left" },
      { id: "vp", label: "VP", side: "left" },
      { id: "vn", label: "VN", side: "left" },
      { id: "d34", label: "34", side: "left" },
      { id: "d35", label: "35", side: "left" },
      { id: "d32", label: "32", side: "left" },
      { id: "d33", label: "33", side: "left" },
      { id: "d25", label: "25", side: "left" },
      { id: "d26", label: "26", side: "left" },
      { id: "d27", label: "27", side: "left" },
      { id: "d14", label: "14", side: "left" },
      { id: "d12", label: "12", side: "left" },
      { id: "d13", label: "13", side: "left" },
      { id: "gnd.2", label: "GND.2", side: "left" },
      // Derecha — 15 pines
      { id: "vin", label: "VIN", side: "right" },
      { id: "gnd.1", label: "GND.1", side: "right" },
      { id: "d23", label: "23", side: "right" },
      { id: "d22", label: "22", side: "right" },
      { id: "tx0", label: "TX0", side: "right" },
      { id: "rx0", label: "RX0", side: "right" },
      { id: "d21", label: "21", side: "right" },
      { id: "d19", label: "19", side: "right" },
      { id: "d18", label: "18", side: "right" },
      { id: "d5", label: "5", side: "right" },
      { id: "tx2", label: "TX2", side: "right" },
      { id: "rx2", label: "RX2", side: "right" },
      { id: "d4", label: "4", side: "right" },
      { id: "d2", label: "2", side: "right" },
      { id: "d15", label: "15", side: "right" },
    ],
    defaultProps: { modelo: "ESP32 DevKit v1" },
  },
];

export const DEFINITION_MAP = new Map(COMPONENT_DEFINITIONS.map((d) => [d.id, d]));

export function getDefinition(id: string): ComponentDefinition | undefined {
  return DEFINITION_MAP.get(id);
}

import * as React from "react";
import { Lightbulb, Minus, HardDrive } from "lucide-react";

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>> = {
  Lightbulb,
  Minus,
  HardDrive,
};
