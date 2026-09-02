// Coordenadas reales extraídas de @wokwi/elements pinInfo (node_modules/@wokwi/elements/dist/esm/*-element.js)
// Fuente: GitHub wokwi/wokwi-elements — pinInfo x/y en coords SVG/viewBox. Conversión a normalizado 0-1 para escalar al canvas.
// No reinventamos motor: usamos datos oficiales + validación por signals (power GND/VCC) sin librería extra.
// Referencia wokwi wiring: diagram.json usa parts[].pins, nosotros mapeamos pinId → pinInfo real.

export type WokwiNorm = { nx: number; ny: number };
export type WokwiSignal = { type: "power"; signal: "GND" | "VCC" } | { type: string; signal?: string };

export type WokwiPinRaw = { name: string; x: number; y: number; signals: WokwiSignal[] };

// Normalizados 0-1 (nx: 0=izq, 1=der; ny: 0=arriba,1=abajo) calculados a partir de pinInfo/viewBox
// ESP32: viewBox 0 0 107 201  → nx=x/107 ny=y/201
// UNO: viewBox -4 0 72.58 53.34 mm → pixel = mm*3.77953, nx=(xMm+4)/72.58  (xMm=xPx/3.77953)
// Resistor 15.645x3 mm → nx=x/59.1, Button -3 0 18x12 mm →, DHT22 15.1x30.885 mm etc.
// Valores precalculados para evitar runtime DPI; alinean puntos overlay con SVG de wokwi-elements.

function normESP32(x: number, y: number): WokwiNorm {
  return { nx: x / 107, ny: y / 201 };
}
function normUNO(xPx: number, yPx: number): WokwiNorm {
  const DPI = 3.779527559;
  const xMm = xPx / DPI;
  const yMm = yPx / DPI;
  return { nx: (xMm + 4) / 72.58, ny: yMm / 53.34 };
}
function normResistor(xPx: number, yPx: number): WokwiNorm {
  const DPI = 3.779527559;
  return { nx: xPx / (15.645 * DPI), ny: yPx / (3 * DPI) };
}
function normButton(xPx: number, yPx: number): WokwiNorm {
  const DPI = 3.779527559;
  const w = 18 * DPI;
  const h = 12 * DPI;
  // viewBox -3 0 18 12 → pixel -11.34..56.69
  return { nx: (xPx + 3 * DPI) / w, ny: yPx / h };
}
function normDHT22(xPx: number, yPx: number): WokwiNorm {
  const DPI = 3.779527559;
  return { nx: xPx / (15.1 * DPI), ny: yPx / (30.885 * DPI) };
}
function normHCSR04(xPx: number, yPx: number): WokwiNorm {
  const DPI = 3.779527559;
  return { nx: xPx / (45 * DPI), ny: yPx / (25 * DPI) };
}
function normServo(xPx: number, yPx: number): WokwiNorm {
  // viewBox 0 0 170.08 119.55 ya es px
  return { nx: xPx / 170.08, ny: yPx / 119.55 };
}
function normLED(anodeX: number, cathodeX: number, y: number): { anode: WokwiNorm; cathode: WokwiNorm } {
  // host 40x50
  return { anode: { nx: anodeX / 40, ny: y / 50 }, cathode: { nx: cathodeX / 40, ny: y / 50 } };
}

// Mapa normalizado por definitionId + pinId (lowercase, con alias sin punto)
export const WOKWI_NORMS: Record<string, Record<string, WokwiNorm>> = {
  esp32: (() => {
    const m: Record<string, WokwiNorm> = {};
    const pins: Array<[string, number, number]> = [
      ["VIN", 5, 158.5],
      ["GND.2", 5, 149],
      ["D13", 5, 139.5],
      ["D12", 5, 130.4],
      ["D14", 5, 120],
      ["D27", 5, 110.8],
      ["D26", 5, 101],
      ["D25", 5, 91.3],
      ["D33", 5, 81.7],
      ["D32", 5, 72.2],
      ["D35", 5, 62.9],
      ["D34", 5, 53.1],
      ["VN", 5, 44],
      ["VP", 5, 34],
      ["EN", 5, 24],
      ["3V3", 101.3, 158.5],
      ["GND.1", 101.3, 149],
      ["D15", 101.3, 139.5],
      ["D2", 101.3, 130.4],
      ["D4", 101.3, 120],
      ["RX2", 101.3, 110.8],
      ["TX2", 101.3, 101],
      ["D5", 101.3, 91.3],
      ["D18", 101.3, 81.7],
      ["D19", 101.3, 72.2],
      ["D21", 101.3, 62.9],
      ["RX0", 101.3, 53.1],
      ["TX0", 101.3, 44],
      ["D22", 101.3, 34],
      ["D23", 101.3, 24],
    ];
    pins.forEach(([name, x, y]) => {
      m[name.toLowerCase()] = normESP32(x, y);
      // alias sin punto
      m[name.toLowerCase().replace(".", "")] = normESP32(x, y);
    });
    // alias legacy
    m["gnd"] = m["gnd.1"];
    m["3v3"] = m["3v3"];
    m["vin"] = m["vin"];
    return m;
  })(),
  uno: (() => {
    const m: Record<string, WokwiNorm> = {};
    const pins: Array<[string, number, number]> = [
      ["A5.2", 87, 9],
      ["A4.2", 97, 9],
      ["AREF", 106, 9],
      ["GND.1", 115.5, 9],
      ["13", 125, 9],
      ["12", 134.5, 9],
      ["11", 144, 9],
      ["10", 153.5, 9],
      ["9", 163, 9],
      ["8", 173, 9],
      ["7", 189, 9],
      ["6", 198.5, 9],
      ["5", 208, 9],
      ["4", 217.5, 9],
      ["3", 227, 9],
      ["2", 236.5, 9],
      ["1", 246, 9],
      ["0", 255.5, 9],
      ["IOREF", 131, 191.5],
      ["RESET", 140.5, 191.5],
      ["3.3V", 150, 191.5],
      ["5V", 160, 191.5],
      ["GND.2", 169.5, 191.5],
      ["GND.3", 179, 191.5],
      ["VIN", 188.5, 191.5],
      ["A0", 208, 191.5],
      ["A1", 217.5, 191.5],
      ["A2", 227, 191.5],
      ["A3", 236.5, 191.5],
      ["A4", 246, 191.5],
      ["A5", 255.5, 191.5],
    ];
    pins.forEach(([name, x, y]) => {
      m[name.toLowerCase()] = normUNO(x, y);
      m[name.toLowerCase().replace(".", "")] = normUNO(x, y);
      // numeric alias sin prefijo
      if (/^\d+$/.test(name)) m["d" + name] = normUNO(x, y);
    });
    // alias legacy - antiguos left/right
    m["gnd1"] = m["gnd.1"];
    m["gnd2"] = m["gnd.2"];
    m["gnd3"] = m["gnd.3"];
    m["3v3"] = m["3.3v"];
    // a0.. alias ya
    return m;
  })(),
  resistor: (() => {
    const m: Record<string, WokwiNorm> = {};
    m["1"] = normResistor(0, 5.65);
    m["2"] = normResistor(58.8, 5.65);
    return m;
  })(),
  led: (() => {
    const m: Record<string, WokwiNorm> = {};
    const { anode, cathode } = normLED(25, 15, 42);
    m["anode"] = anode;
    m["a"] = anode;
    // cathode también como C
    m["cathode"] = cathode;
    m["c"] = cathode;
    // alias flip-aware (si flip, se intercambian, pero overlay usa fijo)
    return m;
  })(),
  button: (() => {
    const m: Record<string, WokwiNorm> = {};
    m["1.l"] = normButton(0, 13);
    m["2.l"] = normButton(0, 32);
    m["1.r"] = normButton(67, 13);
    m["2.r"] = normButton(67, 32);
    // legacy 1..4
    m["1"] = m["1.l"];
    m["2"] = m["2.l"];
    m["3"] = m["1.r"];
    m["4"] = m["2.r"];
    return m;
  })(),
  dht22: (() => {
    const m: Record<string, WokwiNorm> = {};
    m["vcc"] = normDHT22(15, 114.9);
    m["sda"] = normDHT22(24.5, 114.9);
    m["data"] = normDHT22(24.5, 114.9);
    m["nc"] = normDHT22(34.1, 114.9);
    m["gnd"] = normDHT22(43.8, 114.9);
    return m;
  })(),
  ultrasonic: (() => {
    const m: Record<string, WokwiNorm> = {};
    m["vcc"] = normHCSR04(71.3, 94.5);
    m["trig"] = normHCSR04(81.3, 94.5);
    m["echo"] = normHCSR04(91.3, 94.5);
    m["gnd"] = normHCSR04(101.3, 94.5);
    return m;
  })(),
  servo: (() => {
    const m: Record<string, WokwiNorm> = {};
    m["gnd"] = normServo(0, 50);
    m["v+"] = normServo(0, 59.5);
    m["vcc"] = normServo(0, 59.5);
    m["pwm"] = normServo(0, 69);
    return m;
  })(),
};

// Señales para validación de corto (GND-VCC) — extraídas de pinInfo signals
export const WOKWI_SIGNALS: Record<string, Record<string, WokwiSignal[]>> = {
  esp32: {
    "vin": [{ type: "power", signal: "VCC" }],
    "gnd.2": [{ type: "power", signal: "GND" }],
    "gnd.1": [{ type: "power", signal: "GND" }],
    "gnd": [{ type: "power", signal: "GND" }],
    "3v3": [{ type: "power", signal: "VCC" }],
  },
  uno: {
    "gnd.1": [{ type: "power", signal: "GND" }],
    "gnd.2": [{ type: "power", signal: "GND" }],
    "gnd.3": [{ type: "power", signal: "GND" }],
    "5v": [{ type: "power", signal: "VCC" }],
    "vin": [{ type: "power", signal: "VCC" }],
    "3.3v": [{ type: "power", signal: "VCC" }],
    "3v3": [{ type: "power", signal: "VCC" }],
  },
  dht22: {
    vcc: [{ type: "power", signal: "VCC" }],
    gnd: [{ type: "power", signal: "GND" }],
  },
  ultrasonic: {
    vcc: [{ type: "power", signal: "VCC" }],
    gnd: [{ type: "power", signal: "GND" }],
  },
  servo: {
    gnd: [{ type: "power", signal: "GND" }],
    "v+": [{ type: "power", signal: "VCC" }],
    vcc: [{ type: "power", signal: "VCC" }],
  },
};

export function getWokwiNorm(definitionId: string, pinId: string): WokwiNorm | null {
  const map = WOKWI_NORMS[definitionId];
  if (!map) return null;
  const key = pinId.toLowerCase();
  if (map[key]) return map[key];
  // try alias sin punto
  const noDot = key.replace(".", "");
  if (map[noDot]) return map[noDot];
  // try d prefix for uno numeric
  if (/^\d+$/.test(key) && map["d" + key]) return map["d" + key]!;
  return null;
}

export function getWokwiSignals(definitionId: string, pinId: string): WokwiSignal[] | null {
  const map = WOKWI_SIGNALS[definitionId];
  if (!map) return null;
  const key = pinId.toLowerCase();
  return map[key] ?? map[key.replace(".", "")] ?? null;
}

// Valida corto GND-VCC directo (librería, no código manual disperso)
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
