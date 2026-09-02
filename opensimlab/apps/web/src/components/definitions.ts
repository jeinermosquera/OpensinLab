// Definiciones visuales — pins completos estilo Wokwi para cableado realista 1:1

export type ComponentCategory = "Básicos" | "Microcontroladores" | "Sensores" | "Actuadores" | "Conectores";

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
    desc: "5mm · cátodo pata corta",
    width: 72,
    height: 56,
    color: "#f59e0b",
    pins: [
      { id: "anode", label: "A (larga)", side: "left" },
      { id: "cathode", label: "C (corta/GND)", side: "right" },
    ],
    defaultProps: { color: "rojo", voltaje: "2V" },
  },
  {
    id: "resistor",
    name: "Resistencia",
    category: "Básicos",
    icon: "Minus",
    desc: "220 Ω · ¼ W",
    width: 96,
    height: 40,
    color: "#8b5a2b",
    pins: [
      { id: "1", label: "1", side: "left" },
      { id: "2", label: "2", side: "right" },
    ],
    defaultProps: { resistencia: "220Ω" },
  },
  {
    id: "capacitor",
    name: "Capacitor",
    category: "Básicos",
    icon: "Battery",
    desc: "100 nF",
    width: 64,
    height: 56,
    color: "#06b6d4",
    pins: [
      { id: "1", label: "1", side: "left" },
      { id: "2", label: "2", side: "right" },
    ],
    defaultProps: { capacidad: "100nF" },
  },
  {
    id: "button",
    name: "Pulsador",
    category: "Básicos",
    icon: "CircleDot",
    desc: "Táctil 6mm · 4 pines",
    width: 72,
    height: 72,
    color: "#64748b",
    pins: [
      { id: "1", label: "1", side: "left" },
      { id: "2", label: "2", side: "left" },
      { id: "3", label: "3", side: "right" },
      { id: "4", label: "4", side: "right" },
    ],
    defaultProps: { estado: "NA" },
  },
  {
    id: "uno",
    name: "Arduino UNO",
    category: "Microcontroladores",
    icon: "Cpu",
    desc: "ATmega328P · UNO R3 — pines 1:1 Wokwi",
    width: 172,
    height: 120,
    color: "#0e7490",
    pins: [
      // Superior (digital) — y=9 en wokwi pinInfo, mapeo top
      { id: "a5.2", label: "A5.2", side: "top" },
      { id: "a4.2", label: "A4.2", side: "top" },
      { id: "aref", label: "AREF", side: "top" },
      { id: "gnd.1", label: "GND.1", side: "top" },
      { id: "13", label: "13", side: "top" },
      { id: "12", label: "12", side: "top" },
      { id: "11", label: "11~", side: "top" },
      { id: "10", label: "10~", side: "top" },
      { id: "9", label: "9~", side: "top" },
      { id: "8", label: "8", side: "top" },
      { id: "7", label: "7", side: "top" },
      { id: "6", label: "6~", side: "top" },
      { id: "5", label: "5~", side: "top" },
      { id: "4", label: "4", side: "top" },
      { id: "3", label: "3~", side: "top" },
      { id: "2", label: "2", side: "top" },
      { id: "1", label: "1/TX", side: "top" },
      { id: "0", label: "0/RX", side: "top" },
      // Inferior (power + analógico) — y=191.5
      { id: "ioref", label: "IOREF", side: "bottom" },
      { id: "reset", label: "RESET", side: "bottom" },
      { id: "3.3v", label: "3.3V", side: "bottom" },
      { id: "5v", label: "5V", side: "bottom" },
      { id: "gnd.2", label: "GND.2", side: "bottom" },
      { id: "gnd.3", label: "GND.3", side: "bottom" },
      { id: "vin", label: "VIN", side: "bottom" },
      { id: "a0", label: "A0", side: "bottom" },
      { id: "a1", label: "A1", side: "bottom" },
      { id: "a2", label: "A2", side: "bottom" },
      { id: "a3", label: "A3", side: "bottom" },
      { id: "a4", label: "A4", side: "bottom" },
      { id: "a5", label: "A5", side: "bottom" },
    ],
    defaultProps: { modelo: "UNO R3" },
  },
  {
    id: "esp32",
    name: "ESP32 DevKit",
    category: "Microcontroladores",
    icon: "HardDrive",
    desc: "ESP32-WROOM · WiFi/BLE — 30 pines 1:1 Wokwi",
    width: 156,
    height: 104,
    color: "#1e293b",
    pins: [
      // Izquierda — x=5 (15 pines)
      { id: "vin", label: "VIN", side: "left" },
      { id: "gnd.2", label: "GND.2", side: "left" },
      { id: "d13", label: "13", side: "left" },
      { id: "d12", label: "12", side: "left" },
      { id: "d14", label: "14", side: "left" },
      { id: "d27", label: "27", side: "left" },
      { id: "d26", label: "26", side: "left" },
      { id: "d25", label: "25", side: "left" },
      { id: "d33", label: "33", side: "left" },
      { id: "d32", label: "32", side: "left" },
      { id: "d35", label: "35", side: "left" },
      { id: "d34", label: "34", side: "left" },
      { id: "vn", label: "VN", side: "left" },
      { id: "vp", label: "VP", side: "left" },
      { id: "en", label: "EN", side: "left" },
      // Derecha — x=101.3 (15 pines)
      { id: "3v3", label: "3V3", side: "right" },
      { id: "gnd.1", label: "GND.1", side: "right" },
      { id: "d15", label: "15", side: "right" },
      { id: "d2", label: "2", side: "right" },
      { id: "d4", label: "4", side: "right" },
      { id: "rx2", label: "RX2", side: "right" },
      { id: "tx2", label: "TX2", side: "right" },
      { id: "d5", label: "5", side: "right" },
      { id: "d18", label: "18", side: "right" },
      { id: "d19", label: "19", side: "right" },
      { id: "d21", label: "21", side: "right" },
      { id: "rx0", label: "RX0", side: "right" },
      { id: "tx0", label: "TX0", side: "right" },
      { id: "d22", label: "22", side: "right" },
      { id: "d23", label: "23", side: "right" },
    ],
    defaultProps: { modelo: "DevKit v1" },
  },
  {
    id: "dht22",
    name: "DHT22",
    category: "Sensores",
    icon: "Thermometer",
    desc: "Temp. y humedad — 4 pines Wokwi",
    width: 88,
    height: 72,
    color: "#16a34a",
    pins: [
      { id: "vcc", label: "VCC", side: "bottom" },
      { id: "data", label: "DATA", side: "bottom" },
      { id: "nc", label: "NC", side: "bottom" },
      { id: "gnd", label: "GND", side: "bottom" },
    ],
    defaultProps: { precision: "±0.5°C" },
  },
  {
    id: "ultrasonic",
    name: "HC-SR04",
    category: "Sensores",
    icon: "ScanSearch",
    desc: "Ultrasónico 2-400cm — 4 pines Wokwi",
    width: 112,
    height: 48,
    color: "#475569",
    pins: [
      { id: "vcc", label: "VCC", side: "bottom" },
      { id: "trig", label: "TRIG", side: "bottom" },
      { id: "echo", label: "ECHO", side: "bottom" },
      { id: "gnd", label: "GND", side: "bottom" },
    ],
    defaultProps: { rango: "2-400cm" },
  },
  {
    id: "servo",
    name: "Servo SG90",
    category: "Actuadores",
    icon: "Cog",
    desc: "9g · 0-180° — 3 pines Wokwi",
    width: 88,
    height: 72,
    color: "#2563eb",
    pins: [
      { id: "gnd", label: "GND (marrón)", side: "left" },
      { id: "vcc", label: "VCC (rojo)", side: "left" },
      { id: "pwm", label: "PWM (naranja)", side: "left" },
    ],
    defaultProps: { angulo: "0-180°" },
  },
  {
    id: "breadboard",
    name: "Protoboard",
    category: "Conectores",
    icon: "Grid3x3",
    desc: "830 puntos · buses",
    width: 160,
    height: 110,
    color: "#fffbeb",
    pins: [
      { id: "top_plus", label: "+ arriba", side: "top" },
      { id: "top_minus", label: "- arriba", side: "top" },
      { id: "bot_plus", label: "+ abajo", side: "bottom" },
      { id: "bot_minus", label: "- abajo", side: "bottom" },
      { id: "a1", label: "a1", side: "left" },
      { id: "a30", label: "a30", side: "right" },
    ],
    defaultProps: { puntos: "830" },
  },
];

export const DEFINITION_MAP = new Map(COMPONENT_DEFINITIONS.map((d) => [d.id, d]));

export function getDefinition(id: string): ComponentDefinition | undefined {
  return DEFINITION_MAP.get(id);
}

import * as React from "react";
import { Lightbulb, Minus, Battery, CircleDot, Cpu, HardDrive, Thermometer, ScanSearch, Cog, Grid3x3 } from "lucide-react";

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Lightbulb,
  Minus,
  Battery,
  CircleDot,
  Cpu,
  HardDrive,
  Thermometer,
  ScanSearch,
  Cog,
  Grid3x3,
};
