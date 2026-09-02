// svgString — SOLO 3 componentes fotorealistas fieles a imagen de referencia.
// Fondo canvas #3a3a3a oscuro. Solo visual, sin simulación.
// LED 22x36 vertical, Resistencia 64x14 horizontal, ESP32 156x210 vertical.

const lightColors: Record<string, string> = {
  blue: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#eab308",
};

function mapLedColor(c: string): string {
  const s = c.toLowerCase();
  if (s.includes("verde") || s.includes("green")) return "green";
  if (s.includes("azul") || s.includes("blue")) return "blue";
  if (s.includes("amarillo") || s.includes("yellow")) return "yellow";
  if (s.includes("rojo") || s.includes("red")) return "red";
  return "blue";
}

export function resistorBands(value: string): string[] {
  const raw = String(value).toLowerCase();
  if (raw.includes("1k")) return ["#8B4513", "#000000", "#FF0000", "#D4AF37"];
  if (raw.includes("220")) return ["#FF0000", "#FF0000", "#8B4513", "#D4AF37"];
  return ["#8B4513", "#000000", "#FF0000", "#D4AF37"];
}

export function photorealSvgString(
  id: string,
  width: number,
  height: number,
  props: Record<string, string | number>,
): string {
  const ledColorRaw = String(props.color ?? "azul");
  const ledColorKey = mapLedColor(ledColorRaw);
  const ledFill = lightColors[ledColorKey] ?? "#3b82f6";
  const resistencia = String(props.resistencia ?? props.resistance ?? "1kΩ");

  switch (id) {
    case "led": {
      const bodyColor = ledFill;
      const bodyDark = ledColorKey === "green" ? "#14532d" : ledColorKey === "blue" ? "#1e3a8a" : "#7f1d1d";
      const glow = `<ellipse cx="8.2" cy="8.5" rx="1.4" ry="1.9" fill="white" opacity="0.42" style="filter:blur(0.3px)"/>`;
      // LED vertical como en foto: cápsula arriba, patas cortas abajo
      return `<svg width="${width}" height="${height}" viewBox="0 0 22 36" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="LED">
        <defs>
          <linearGradient id="led-glass-${width}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="white" stop-opacity="0.58"/>
            <stop offset="42%" stop-color="white" stop-opacity="0.08"/>
            <stop offset="100%" stop-color="black" stop-opacity="0.20"/>
          </linearGradient>
        </defs>
        <!-- patas cortas abajo como en foto -->
        <g stroke="#9ca3af" stroke-width="1.6" fill="none" stroke-linecap="round">
          <path d="M 8.2 27.5 L 8.2 34.5 L 7.2 34.5"/>
          <path d="M 13.8 27.5 L 13.8 34.5 L 14.8 34.5"/>
        </g>
        <g fill="#6b7280" opacity="0.9">
          <rect x="6.6" y="33.6" width="2.2" height="1.4" rx="0.3"/>
          <rect x="13.2" y="33.6" width="2.2" height="1.4" rx="0.3"/>
        </g>
        <!-- cápsula arriba -->
        <ellipse cx="11" cy="12.2" rx="6.4" ry="7.2" fill="${bodyColor}" stroke="${bodyDark}" stroke-width="0.42"/>
        <rect x="4.6" y="12.2" width="12.8" height="8.2" rx="1.4" fill="${bodyColor}" stroke="${bodyDark}" stroke-width="0.38"/>
        <ellipse cx="11" cy="12.2" rx="6.4" ry="7.2" fill="url(#led-glass-${width})" opacity="0.88"/>
        <rect x="4.6" y="12.6" width="12.8" height="7.8" rx="1.2" fill="url(#led-glass-${width})" opacity="0.82"/>
        <ellipse cx="8.8" cy="8.2" rx="2.2" ry="2.8" fill="white" opacity="0.22" style="filter:blur(0.4px)"/>
        ${glow}
        <rect x="4.6" y="19.8" width="12.8" height="1" rx="0.4" fill="#4b5563" opacity="0.55"/>
      </svg>`;
    }
    case "resistor": {
      const bands = resistorBands(resistencia);
      const [b1, b2, b3, b4] = bands;
      return `<svg width="${width}" height="${height}" viewBox="0 0 64 14" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Resistencia 1k">
        <defs>
          <linearGradient id="r-beige-${width}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fef3c7"/>
            <stop offset="50%" stop-color="#d5b597"/>
            <stop offset="100%" stop-color="#a07a4a"/>
          </linearGradient>
          <linearGradient id="r-silver-${width}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="50%" stop-color="#cbd5e1"/>
            <stop offset="100%" stop-color="#94a3b8"/>
          </linearGradient>
        </defs>
        <g stroke="url(#r-silver-${width})" stroke-width="1.35" stroke-linecap="round">
          <line x1="0.8" y1="7" x2="14.8" y2="7"/>
          <line x1="49.2" y1="7" x2="63.2" y2="7"/>
        </g>
        <rect x="14.2" y="3.6" width="35.6" height="6.8" rx="3.2" fill="url(#r-beige-${width})" stroke="#8b7355" stroke-width="0.32"/>
        <rect x="15.5" y="4.1" width="33" height="2.2" rx="1.1" fill="white" opacity="0.26"/>
        <rect x="20.2" y="3.6" width="2.6" height="6.8" fill="${b1}"/>
        <rect x="25.6" y="3.6" width="2.6" height="6.8" fill="${b2}"/>
        <rect x="31.0" y="3.6" width="2.6" height="6.8" fill="${b3}"/>
        <rect x="40.2" y="3.6" width="3.0" height="6.8" fill="${b4}"/>
        <rect x="40.5" y="4.4" width="0.7" height="5.2" fill="white" opacity="0.32"/>
      </svg>`;
    }
    case "esp32": {
      const leftPins = Array.from({ length: 15 }).map((_, i) => {
        const y = 22 + i * 11.9;
        return `<circle cx="7.5" cy="${y}" r="3.35" fill="#facc15" stroke="#a16207" stroke-width="0.55"/>
                <circle cx="7.5" cy="${y}" r="1.05" fill="#fef08a" opacity="0.95"/>`;
      }).join("");
      const rightPins = Array.from({ length: 15 }).map((_, i) => {
        const y = 22 + i * 11.9;
        return `<circle cx="148.5" cy="${y}" r="3.35" fill="#facc15" stroke="#a16207" stroke-width="0.55"/>
                <circle cx="148.5" cy="${y}" r="1.05" fill="#fef08a" opacity="0.95"/>`;
      }).join("");
      return `<svg width="${width}" height="${height}" viewBox="0 0 156 210" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ESP32 DevKit">
        <defs>
          <linearGradient id="pcb-${width}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#111827"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
          <linearGradient id="shield-${width}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e5e7eb"/>
            <stop offset="100%" stop-color="#94a3b8"/>
          </linearGradient>
        </defs>
        <rect x="0.6" y="0.6" width="154.8" height="208.8" rx="6.5" fill="url(#pcb-${width})" stroke="#1e293b" stroke-width="0.85"/>
        <g stroke="#334155" stroke-width="0.22" opacity="0.18" fill="none">
          <path d="M14 18 H142 M14 44 H142 M14 70 H142 M14 96 H142 M14 122 H142 M14 148 H142 M14 174 H142"/>
        </g>
        <rect x="2.2" y="12" width="12.2" height="186" rx="1.2" fill="#020617" stroke="#1e293b" stroke-width="0.4"/>
        <rect x="141.6" y="12" width="12.2" height="186" rx="1.2" fill="#020617" stroke="#1e293b" stroke-width="0.4"/>
        ${leftPins}
        ${rightPins}
        <rect x="62" y="200.5" width="32" height="7.8" rx="1.1" fill="#6b7280" stroke="#4b5563" stroke-width="0.4"/>
        <rect x="66.5" y="202.2" width="23" height="4.2" rx="0.6" fill="#020617"/>
        <rect x="69" y="203.1" width="18" height="0.7" rx="0.2" fill="#334155"/>
        <rect x="38" y="6.5" width="80" height="18.5" rx="1.2" fill="#0f172a" stroke="#334155" stroke-width="0.4"/>
        <g stroke="#cbd5e1" stroke-width="0.38" opacity="0.9" fill="none">
          <path d="M48 11.5 H108 M48 15.2 H108 M48 18.9 H108 M60 11.5 V18.9 M76 11.5 V18.9 M92 11.5 V18.9"/>
        </g>
        <text x="78" y="22.2" text-anchor="middle" font-size="2.6" font-family="monospace" font-weight="700" fill="#64748b" letter-spacing="0.8">ANTENNA</text>
        <rect x="30" y="33.5" width="96" height="102" rx="2.2" fill="url(#shield-${width})" stroke="#64748b" stroke-width="0.65"/>
        <rect x="31.2" y="34.7" width="93.6" height="2.6" rx="0.6" fill="white" opacity="0.28"/>
        <g stroke="#1e293b" stroke-width="0.7" fill="none" stroke-linecap="round">
          <path d="M78 58 q 7 5 14 0" opacity="0.95"/>
          <path d="M78 62 q 4.5 3.2 9 0" opacity="0.95"/>
          <circle cx="78" cy="67.2" r="1.25" fill="#1e293b" stroke="none"/>
        </g>
        <text x="78" y="86.5" text-anchor="middle" font-size="14.5" font-family="Inter, sans-serif" font-weight="900" fill="#0f172a" letter-spacing="1.2">ESP32</text>
        <text x="78" y="96.5" text-anchor="middle" font-size="5.2" font-family="monospace" font-weight="600" fill="#334155">WROOM-32</text>
        <text x="78" y="104.2" text-anchor="middle" font-size="3.8" font-family="monospace" fill="#475569">Wi-Fi + BLE</text>
        <rect x="38" y="118.5" width="36" height="12.5" rx="1" fill="#0f172a" stroke="#334155" stroke-width="0.35"/>
        <g stroke="#e2e8f0" stroke-width="0.32" opacity="0.7" fill="none">
          <path d="M42 122 H70 M42 125 H70 M44 128 H68"/>
        </g>
        <g>
          <rect x="18" y="34.5" width="9.5" height="5.2" rx="0.9" fill="#1e293b" stroke="#334155" stroke-width="0.35"/>
          <text x="22.8" y="38.2" text-anchor="middle" font-size="2.4" font-family="monospace" fill="#94a3b8">BOOT</text>
          <rect x="128.5" y="34.5" width="9.5" height="5.2" rx="0.9" fill="#1e293b" stroke="#334155" stroke-width="0.35"/>
          <text x="133.3" y="38.2" text-anchor="middle" font-size="2.4" font-family="monospace" fill="#94a3b8">EN</text>
        </g>
        <circle cx="74" cy="117.5" r="1.9" fill="#22c55e" stroke="#14532d" stroke-width="0.35"/>
        <circle cx="74" cy="117.5" r="0.65" fill="white" opacity="0.9"/>
        <circle cx="82" cy="117.5" r="1.9" fill="#ef4444" stroke="#7f1d1d" stroke-width="0.35"/>
      </svg>`;
    }
    default: return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="${width-2}" height="${height-2}" rx="4" fill="#1e1e1e" stroke="#333"/><text x="${width/2}" y="${height/2}" text-anchor="middle" font-size="8" fill="#777">${id}</text></svg>`;
  }
}
