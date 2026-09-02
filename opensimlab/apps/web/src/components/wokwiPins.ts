// Coordenadas normalizadas 0-1 para overlay de pines — SOLO 3 componentes.
// Alineadas a las patas plateadas visibles del SVG photoreal (viewBox fiel a imagen).
// Fondo canvas #3a3a3a no afecta — solo geometría.

export type WokwiNorm = { nx: number; ny: number };
export type WokwiSignal = { type: "power"; signal: "GND" | "VCC" } | { type: string; signal?: string };
export type WokwiPinRaw = { name: string; x: number; y: number; signals: WokwiSignal[] };

// viewBox: LED 0 0 22 36  (patas en borde superior y=1.5, dobladas en L)
//         Resistencia 0 0 64 14 (patas laterales y=7, x=1 y x=63)
//         ESP32 0 0 156 210 (pines amarillos laterales x=8 y x=148, 15 cada lado)

export const WOKWI_NORMS: Record<string, Record<string, WokwiNorm>> = {
  led: (() => {
    const m: Record<string, WokwiNorm> = {};
    // patas plateadas dobladas en L en borde superior — coincide con SVG LED
    // ánodo ligeramente a la izquierda, cátodo a la derecha, misma y superior
    const anode: WokwiNorm = { nx: 6.5 / 22, ny: 1.8 / 36 };
    const cathode: WokwiNorm = { nx: 15.5 / 22, ny: 1.8 / 36 };
    m["anode"] = anode;
    m["a"] = anode;
    m["anode:long"] = anode;
    m["cathode"] = cathode;
    m["c"] = cathode;
    m["cathode:short"] = cathode;
    // alias numéricos por si wiring usa 1/2
    m["1"] = anode;
    m["2"] = cathode;
    return m;
  })(),
  resistor: (() => {
    const m: Record<string, WokwiNorm> = {};
    // patas plateadas horizontales centradas verticalmente
    m["1"] = { nx: 1 / 64, ny: 7 / 14 };
    m["2"] = { nx: 63 / 64, ny: 7 / 14 };
    m["a"] = m["1"];
    m["b"] = m["2"];
    m["left"] = m["1"];
    m["right"] = m["2"];
    return m;
  })(),
  esp32: (() => {
    const m: Record<string, WokwiNorm> = {};
    // ESP32 vertical 156x210 — 15 pines izquierdos (x=7.5) y 15 derechos (x=148.5)
    // Distribuidos verticalmente de y=22 a y=188 paso ~11.8
    const leftX = 7.5;
    const rightX = 148.5;
    const yStart = 22;
    const yStep = 11.9;
    const leftLabels = ["3v3", "en", "vp", "vn", "d34", "d35", "d32", "d33", "d25", "d26", "d27", "d14", "d12", "d13", "gnd.2"];
    const rightLabels = ["vin", "gnd.1", "d23", "d22", "tx0", "rx0", "d21", "d19", "d18", "d5", "tx2", "rx2", "d4", "d2", "d15"];
    leftLabels.forEach((name, i) => {
      const y = yStart + i * yStep;
      const norm = { nx: leftX / 156, ny: y / 210 };
      m[name.toLowerCase()] = norm;
      m[name.toLowerCase().replace(".", "")] = norm;
    });
    rightLabels.forEach((name, i) => {
      const y = yStart + i * yStep;
      const norm = { nx: rightX / 156, ny: y / 210 };
      m[name.toLowerCase()] = norm;
      m[name.toLowerCase().replace(".", "")] = norm;
    });
    // alias GND/VCC
    m["gnd"] = m["gnd.1"];
    m["gnd1"] = m["gnd.1"];
    m["gnd2"] = m["gnd.2"];
    m["3v3"] = m["3v3"];
    // alias legacy orden original Wokwi (por si wires antiguos usan otros nombres)
    m["vin"] = m["vin"];
    return m;
  })(),
};

export const WOKWI_SIGNALS: Record<string, Record<string, WokwiSignal[]>> = {
  esp32: {
    vin: [{ type: "power", signal: "VCC" }],
    "gnd.2": [{ type: "power", signal: "GND" }],
    "gnd.1": [{ type: "power", signal: "GND" }],
    gnd: [{ type: "power", signal: "GND" }],
    "3v3": [{ type: "power", signal: "VCC" }],
  },
};

export function getWokwiNorm(definitionId: string, pinId: string): WokwiNorm | null {
  const map = WOKWI_NORMS[definitionId];
  if (!map) return null;
  const key = pinId.toLowerCase();
  if (map[key]) return map[key];
  const noDot = key.replace(".", "");
  if (map[noDot]) return map[noDot];
  if (/^\d+$/.test(key) && map["d" + key]) return map["d" + key]!;
  return null;
}

export function getWokwiSignals(definitionId: string, pinId: string): WokwiSignal[] | null {
  const map = WOKWI_SIGNALS[definitionId];
  if (!map) return null;
  const key = pinId.toLowerCase();
  return map[key] ?? map[key.replace(".", "")] ?? null;
}

export function isPowerShort(definitionIdA: string, pinIdA: string, definitionIdB: string, pinIdB: string): boolean {
  const a = getWokwiSignals(definitionIdA, pinIdA);
  const b = getWokwiSignals(definitionIdB, pinIdB);
  if (!a || !b) return false;
  const aIsGND = a.some((s) => s.type === "power" && s.signal === "GND");
  const aIsVCC = a.some((s) => s.type === "power" && s.signal === "VCC");
  const bIsGND = b.some((s) => s.type === "power" && s.signal === "GND");
  const bIsVCC = b.some((s) => s.type === "power" && s.signal === "VCC");
  return (aIsGND && bIsVCC) || (aIsVCC && bIsGND);
}
