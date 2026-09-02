// svgString — generador de SVG fotorreal 1:1 Wokwi Elements (referencia técnica)
// Copia/adapta paths, colores, viewBox y detalles visuales de @wokwi/elements 1.9.2
// Mantiene width/height = def.width/def.height para que WOKWI_NORMS siga alineado.
// Solo visual — no cambia lógica, wires, simulación ni arquitectura.

const bandColors: Record<number, string> = {
  [-2]: "#C3C7C0",
  [-1]: "#F1D863",
  0: "#000000",
  1: "#8F4814",
  2: "#FB0000",
  3: "#FC9700",
  4: "#FCF800",
  5: "#00B800",
  6: "#0000FF",
  7: "#A803D6",
  8: "#808080",
  9: "#FCFCFC",
};

function breakValue(value: number): [number, number] {
  const exponent =
    value >= 1e10 ? 9 : value >= 1e9 ? 8 : value >= 1e8 ? 7 : value >= 1e7 ? 6 : value >= 1e6 ? 5 : value >= 1e5 ? 4 : value >= 1e4 ? 3 : value >= 1e3 ? 2 : value >= 1e2 ? 1 : value >= 1e1 ? 0 : value >= 1 ? -1 : -2;
  const base = Math.round(value / 10 ** exponent);
  if (value === 0) return [0, 0];
  return [Math.round(base % 100), exponent];
}

export function resistorBands(value: string): string[] {
  const raw = String(value).toLowerCase().replace("Ω", "").replace(/\s/g, "");
  // parse con soporte k/M
  let num = parseFloat(raw);
  if (raw.includes("k")) num = parseFloat(raw) * 1000;
  else if (raw.includes("m") && !raw.includes("mm")) num = parseFloat(raw) * 1e6;
  if (Number.isNaN(num)) num = 220;
  const [base, exp] = breakValue(num);
  const b1 = bandColors[Math.floor(base / 10)] ?? "#000000";
  const b2 = bandColors[base % 10] ?? "#000000";
  const b3 = bandColors[exp] ?? "#000000";
  // 4th band gold tolerance
  return [b1, b2, b3, bandColors[-1]];
}

const lightColors: Record<string, string> = {
  red: "#ff8080",
  green: "#80ff80",
  blue: "#8080ff",
  yellow: "#ffff80",
  orange: "#ffcf80",
  white: "#ffffff",
  purple: "#ff80ff",
};

function mapLedColor(c: string): string {
  const s = c.toLowerCase();
  if (s.includes("verde") || s.includes("green")) return "green";
  if (s.includes("azul") || s.includes("blue")) return "blue";
  if (s.includes("amarillo") || s.includes("yellow")) return "yellow";
  if (s.includes("naranja") || s.includes("orange")) return "orange";
  if (s.includes("blanco") || s.includes("white")) return "white";
  if (s.includes("morado") || s.includes("purple")) return "purple";
  return "red";
}

export function photorealSvgString(
  id: string,
  width: number,
  height: number,
  props: Record<string, string | number>,
  extra?: { ledOn?: boolean; hasCurrent?: boolean }
): string {
  const ledColorRaw = String(props.color ?? "rojo");
  const ledColorKey = mapLedColor(ledColorRaw);
  const lightColor = lightColors[ledColorKey] ?? ledColorRaw;
  const isLedOn = !!extra?.ledOn;
  const hasCurrent = !!extra?.hasCurrent || isLedOn;
  const resistencia = String(props.resistencia ?? props.resistance ?? "220Ω");

  switch (id) {
    case "led": {
      // Wokwi LED — viewBox "-10 -5 35.456 39.618", width 40 height 50
      // Copiado de led-element.js: incluye epoxy, reflectores, patas, filtros blur y glow
      const brightness = isLedOn ? 1 : 0;
      const o = brightness ? 0.3 + brightness * 0.7 : 0;
      const color = lightColor;
      // lightColorActual usa el mismo tono que Wokwi
      const lightOn = isLedOn;
      return `<svg width="${width}" height="${height}" viewBox="-10 -5 35.456 39.618" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="LED">
        <filter id="w-led1-${width}" x="-0.8" y="-0.8" height="2.2" width="2.8"><feGaussianBlur stdDeviation="2"/></filter>
        <filter id="w-led2-${width}" x="-0.8" y="-0.8" height="2.2" width="2.8"><feGaussianBlur stdDeviation="4"/></filter>
        <rect x="2.5099" y="20.382" width="2.1514" height="9.8273" fill="#8c8c8c"/>
        <path d="m12.977 30.269c0-1.1736-0.86844-2.5132-1.8916-3.4024-0.41616-0.3672-1.1995-1.0015-1.1995-1.4249v-5.4706h-2.1614v5.7802c0 1.0584 0.94752 1.8785 1.9462 2.7482 0.44424 0.37584 1.3486 1.2496 1.3486 1.7694" fill="#8c8c8c"/>
        <path d="m14.173 13.001v-5.9126c0-3.9132-3.168-7.0884-7.0855-7.0884-3.9125 0-7.0877 3.1694-7.0877 7.0884v13.649c1.4738 1.651 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8594v-1.5235c-7.4e-4 -1.1426-0.47444-2.2039-1.283-3.1061z" opacity=".3"/>
        <path d="m14.173 13.001v-5.9126c0-3.9132-3.168-7.0884-7.0855-7.0884-3.9125 0-7.0877 3.1694-7.0877 7.0884v13.649c1.4738 1.651 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8594v-1.5235c-7.4e-4 -1.1426-0.47444-2.2039-1.283-3.1061z" fill="#e6e6e6" opacity=".5"/>
        <path d="m14.173 13.001v3.1054c0 2.7389-3.1658 4.9651-7.0855 4.9651-3.9125 2e-5 -7.0877-2.219-7.0877-4.9651v4.6296c1.4738 1.6517 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8586l-4e-5 -1.5235c-7e-4 -1.1419-0.4744-2.2032-1.283-3.1054z" fill="#d1d1d1" opacity=".9"/>
        <polygon points="2.2032 16.107 3.1961 16.107 3.1961 13.095 6.0156 13.095 10.012 8.8049 3.407 8.8049 2.2032 9.648" fill="#666666"/>
        <polygon points="11.215 9.0338 7.4117 13.095 11.06 13.095 11.06 16.107 11.974 16.107 11.974 8.5241 10.778 8.5241" fill="#666666"/>
        <path d="m14.173 13.001v-5.9126c0-3.9132-3.168-7.0884-7.0855-7.0884-3.9125 0-7.0877 3.1694-7.0877 7.0884v13.649c1.4738 1.651 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8594v-1.5235c-7.4e-4 -1.1426-0.47444-2.2039-1.283-3.1061z" fill="${color}" opacity=".65"/>
        <g fill="#ffffff">
          <path d="m10.388 3.7541 1.4364-0.2736c-0.84168-1.1318-2.0822-1.9577-3.5417-2.2385l0.25416 1.0807c0.76388 0.27072 1.4068 0.78048 1.8511 1.4314z" opacity=".5"/>
          <path d="m0.76824 19.926v1.5199c0.64872 0.5292 1.4335 0.97632 2.3076 1.3169v-1.525c-0.8784-0.33624-1.6567-0.78194-2.3076-1.3118z" opacity=".5"/>
        </g>
        ${lightOn ? `<g><ellipse cx="8" cy="10" rx="10" ry="10" fill="${color}" filter="url(#w-led2-${width})" opacity="${o}"/><ellipse cx="8" cy="10" rx="2" ry="2" fill="white" filter="url(#w-led1-${width})"/><ellipse cx="8" cy="10" rx="3" ry="3" fill="white" filter="url(#w-led1-${width})" opacity="${o}"/></g>` : ``}
      </svg>`;
    }
    case "resistor": {
      // Wokwi resistor — viewBox "0 0 15.645 3" width 15.645mm
      const bands = resistorBands(resistencia);
      const [b1, b2, b3, b4] = bands;
      // glow sutil cuando hay corriente (simulación)
      const currentGlow = hasCurrent ? `<rect x="3.2" y="0" width="9.2" height="3" rx="1.5" fill="none" stroke="#f59e0b" stroke-width="0.12" opacity="0.45" style="filter:blur(0.12px)"/>` : "";
      return `<svg width="${width}" height="${height}" viewBox="0 0 15.645 3" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Resistencia">
        <defs>
          <linearGradient id="r-a-${width}" x2="0" y1="22.332" y2="38.348" gradientTransform="matrix(.14479 0 0 .14479 -23.155 -4.0573)" gradientUnits="userSpaceOnUse" spreadMethod="reflect"><stop stop-color="#323232" offset="0"/><stop stop-color="#fff" stop-opacity=".42" offset="1"/></linearGradient>
          <clipPath id="r-g-${width}"><path d="m4.6918 0c-1.0586 0-1.9185 0.67468-1.9185 1.5022 0 0.82756 0.85995 1.4978 1.9185 1.4978 0.4241 0 0.81356-0.11167 1.1312-0.29411h4.0949c0.31802 0.18313 0.71075 0.29411 1.1357 0.29411 1.0586 0 1.9185-0.67015 1.9185-1.4978 0-0.8276-0.85995-1.5022-1.9185-1.5022-0.42499 0-0.81773 0.11098-1.1357 0.29411h-4.0949c-0.31765-0.18244-0.7071-0.29411-1.1312-0.29411z"/></clipPath>
        </defs>
        <rect y="1.1759" width="15.558" height=".63826" fill="#aaa"/>
        <g stroke-width=".14479" fill="#d5b597">
          <path d="m4.6918 0c-1.0586 0-1.9185 0.67468-1.9185 1.5022 0 0.82756 0.85995 1.4978 1.9185 1.4978 0.4241 0 0.81356-0.11167 1.1312-0.29411h4.0949c0.31802 0.18313 0.71075 0.29411 1.1357 0.29411 1.0586 0 1.9185-0.67015 1.9185-1.4978 0-0.8276-0.85995-1.5022-1.9185-1.5022-0.42499 0-0.81773 0.11098-1.1357 0.29411h-4.0949c-0.31765-0.18244-0.7071-0.29411-1.1312-0.29411z" id="r-body-${width}"/>
          <use href="#r-body-${width}" fill="url(#r-a-${width})" opacity=".45"/>
          <rect x="4" y="0" width="1" height="3" fill="${b1}" clip-path="url(#r-g-${width})"/>
          <path d="m6 0.29411v2.4117h0.96v-2.4117z" fill="${b2}"/>
          <path d="m7.8 0.29411v2.4117h0.96v-2.4117z" fill="${b3}"/>
          <rect x="10.69" y="0" width="1" height="3" fill="${b4}" clip-path="url(#r-g-${width})"/>
        </g>
        ${currentGlow}
      </svg>`;
    }
    case "button": {
      // Wokwi pushbutton — viewBox "-3 0 18 12" 17.802mm x 12mm
      const color = "#ff0000";
      return `<svg width="${width}" height="${height}" viewBox="-3 0 18 12" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pulsador">
        <defs>
          <linearGradient id="b-up-${width}" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#ffffff" offset="0"/><stop stop-color="${color}" offset="0.3"/><stop stop-color="${color}" offset="0.5"/><stop offset="1"/></linearGradient>
          <linearGradient id="b-down-${width}" x1="1" x2="0" y1="1" y2="0"><stop stop-color="#ffffff" offset="0"/><stop stop-color="${color}" offset="0.3"/><stop stop-color="${color}" offset="0.5"/><stop offset="1"/></linearGradient>
        </defs>
        <rect x="0" y="0" width="12" height="12" rx=".44" ry=".44" fill="#464646"/>
        <rect x=".75" y=".75" width="10.5" height="10.5" rx=".211" ry=".211" fill="#eaeaea"/>
        <g fill="#1b1b1b"><circle cx="1.767" cy="1.7916" r=".37"/><circle cx="10.161" cy="1.7916" r=".37"/><circle cx="10.161" cy="10.197" r=".37"/><circle cx="1.767" cy="10.197" r=".37"/></g>
        <g fill="#999" stroke-width="1.0154">
          <path d="m12.365 2.426c0.06012 0 0.10849 0.0469 0.1085 0.10522v0.38698h2.2173c0.12023 0 0.217 0.0938 0.217 0.21045v0.50721c0 0.1166-0.09677 0.21045-0.217 0.21045h-2.2173v0.40101c0 0.0583-0.0484 0.10528-0.1085 0.10528h-0.36835v-1.9266z"/>
          <path d="m12.365 7.5c0.06012 0 0.10849 0.0469 0.1085 0.10522v0.38698h2.2173c0.12023 0 0.217 0.0938 0.217 0.21045v0.50721c0 0.1166-0.09677 0.21045-0.217 0.21045h-2.2173v0.40101c0 0.0583-0.0484 0.10528-0.1085 0.10528h-0.36835v-1.9266z"/>
          <path d="m-0.35085 4.3526c-0.06012 0-0.10849-0.0469-0.1085-0.10522v-0.38698h-2.2173c-0.12023 0-0.217-0.0938-0.217-0.21045v-0.50721c0-0.1166 0.09677-0.21045 0.217-0.21045h2.2173v-0.40101c0-0.0583 0.0484-0.10528 0.1085-0.10528h0.36835v1.9266z"/>
          <path d="m-0.35085 9.4266c-0.06012 0-0.10849-0.0469-0.1085-0.10522v-0.38698h-2.2173c-0.12023 0-0.217-0.0938-0.217-0.21045v-0.50721c0-0.1166 0.09677-0.21045 0.217-0.21045h2.2173v-0.40101c0-0.0583 0.0484-0.10528 0.1085-0.10528h0.36835v1.9266z"/>
        </g>
        <g><circle cx="6" cy="6" r="3.822" fill="url(#b-up-${width})"/><circle cx="6" cy="6" r="2.9" fill="${color}" stroke="#2f2f2f" stroke-opacity=".47" stroke-width=".08"/></g>
      </svg>`;
    }
    case "esp32": {
      // Wokwi ESP32 DevKit V1 — viewBox "0 0 107 201" width 28.2mm height 54mm
      // Simplificación fiel: mantiene PCB oscuro, headers, ESP-WROOM shielding y antena
      return `<svg width="${width}" height="${height}" viewBox="0 0 107 54" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ESP32">
        <rect x="0" y="0" width="107" height="54" rx="2.2" fill="#0f1115" stroke="#1f2937" stroke-width="0.6"/>
        <g fill="#d1c479" opacity="0.55">
          <!-- trazas sutiles -->
          <path d="M 5 8 H 102 M 5 18 H 102 M 5 28 H 102 M 5 38 H 102 M 5 46 H 102" stroke="#334155" stroke-width="0.18" opacity="0.22" fill="none"/>
        </g>
        <!-- headers -->
        <rect x="1.2" y="4" width="7.5" height="46" rx="0.7" fill="#0b0f14" stroke="#1f2937" stroke-width="0.35"/>
        <rect x="98.3" y="4" width="7.5" height="46" rx="0.7" fill="#0b0f14" stroke="#1f2937" stroke-width="0.35"/>
        ${Array.from({ length: 15 }).map((_, i) => `<rect x="3.0" y="${5.2 + i * 2.92}" width="4.2" height="1.5" rx="0.25" fill="#e5e7eb" stroke="#4b5563" stroke-width="0.18"/>`).join("")}
        ${Array.from({ length: 15 }).map((_, i) => `<rect x="99.8" y="${5.2 + i * 2.92}" width="4.2" height="1.5" rx="0.25" fill="#e5e7eb" stroke="#4b5563" stroke-width="0.18"/>`).join("")}
        <!-- USB micro -->
        <rect x="44" y="0.3" width="19" height="5.2" rx="0.7" fill="#6b7280" stroke="#4b5563" stroke-width="0.35"/>
        <rect x="46.5" y="1.2" width="14" height="2.1" rx="0.35" fill="#020617"/>
        <!-- ESP-WROOM shielding metálico -->
        <rect x="23" y="9.5" width="61" height="31.5" rx="1.1" fill="#8a95ad" stroke="#475569" stroke-width="0.45"/>
        <rect x="24.2" y="10.6" width="58.6" height="2.2" rx="0.4" fill="#0f172a" opacity="0.15"/>
        <text x="53.5" y="22" text-anchor="middle" font-size="4.2" font-family="Inter, sans-serif" font-weight="800" fill="#1e293b">ESP-WROOM-32</text>
        <text x="53.5" y="26" text-anchor="middle" font-size="2.1" font-family="monospace" fill="#475569">Wi-Fi + BLE</text>
        <!-- antena -->
        <rect x="28" y="31.5" width="16" height="7.5" rx="0.5" fill="#1e293b" stroke="#334155" stroke-width="0.25"/>
        <path d="M 30 34.5 H 41 M 30 36.5 H 41 M 32 38.2 H 39" stroke="#cbd5e1" stroke-width="0.28" opacity="0.75" fill="none"/>
        <!-- BOOT/EN -->
        <rect x="12.5" y="7.2" width="7" height="3.5" rx="0.5" fill="#1e293b" stroke="#334155" stroke-width="0.28"/>
        <rect x="87.5" y="7.2" width="7" height="3.5" rx="0.5" fill="#1e293b" stroke="#334155" stroke-width="0.28"/>
        <text x="16" y="9.6" text-anchor="middle" font-size="1.7" fill="#64748b">BOOT</text>
        <text x="91" y="9.6" text-anchor="middle" font-size="1.7" fill="#64748b">EN</text>
        <circle cx="50" cy="36.5" r="0.9" fill="#22c55e" stroke="#14532d" stroke-width="0.2"/>
        <circle cx="53.5" cy="36.5" r="0.9" fill="#ef4444" stroke="#7f1d1d" stroke-width="0.2"/>
      </svg>`;
    }
    case "uno": {
      // Wokwi Arduino UNO — viewBox "-4 0 72.58 53.34" width 72.58mm height 53.34mm
      // PCB azul característico, USB, jack, MCU, headers — colores fieles a wokwi-elements
      return `<svg width="${width}" height="${height}" viewBox="-4 0 72.58 53.34" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arduino UNO">
        <path d="m0.999 0a1 1 0 0 0-0.999 0.999v51.34a1 1 0 0 0 0.999 0.999h64.04a1 1 0 0 0 0.999-0.999v-1.54l2.539-2.539v-32.766l-2.539-2.539v-11.43l-1.524-1.523z" fill="#2b6b99"/>
        <!-- reset -->
        <rect x="3.816" y="1.4125" width="6.2151" height="6.0268" fill="#9b9b9b"/>
        <circle cx="6.9619" cy="4.5279" r="1.5405" fill="#960000" stroke="#777" stroke-width="0.15"/>
        <!-- USB -->
        <g fill="#9d9d9c" stroke="#706f6f" stroke-width="0.1"><rect x="-4" y="9.37" width="14.46" height="11.85"/><rect x="-4" y="9.71" width="13.95" height="11.17" fill="#b3b2b2"/></g>
        <!-- Power jack -->
        <rect x="15.2" y="42" width="7.5" height="5.5" rx="0.6" fill="#0f172a" stroke="#1e293b" stroke-width="0.25"/>
        <circle cx="18.95" cy="44.75" r="1.4" fill="#f59e0b"/>
        <!-- Headers superior (digital) -->
        <rect x="19" y="0" width="48.5" height="3.2" rx="0.4" fill="#1a1a1a"/>
        ${Array.from({ length: 18 }).map((_, i) => `<rect x="${19.6 + i * 2.54}" y="0.35" width="1.9" height="2.5" rx="0.2" fill="#d1c479" stroke="#565656" stroke-width="0.08"/>`).join("")}
        <!-- Headers inferior -->
        <rect x="28" y="49.2" width="38.5" height="3.2" rx="0.4" fill="#1a1a1a"/>
        ${Array.from({ length: 14 }).map((_, i) => `<rect x="${28.6 + i * 2.54}" y="49.55" width="1.9" height="2.5" rx="0.2" fill="#d1c479" stroke="#565656" stroke-width="0.08"/>`).join("")}
        <!-- MCU ATMega -->
        <rect x="26" y="16" width="18" height="18" rx="0.6" fill="#11151c" stroke="#334155" stroke-width="0.25"/>
        <g fill="#ddd">${Array.from({ length: 14 }).map((_, i) => `<rect x="${26.6 + i * 1.12}" y="15.2" width="0.65" height="1.1" rx="0.08"/>`).join("")}${Array.from({ length: 14 }).map((_, i) => `<rect x="${26.6 + i * 1.12}" y="33.1" width="0.65" height="1.1" rx="0.08"/>`).join("")}</g>
        <text x="35" y="24" text-anchor="middle" font-size="2.2" font-family="monospace" font-weight="800" fill="#9ca3af">ATMEGA328P</text>
        <text x="44" y="8.5" text-anchor="middle" font-size="2.8" font-family="sans-serif" font-weight="800" fill="white">ARDUINO</text>
        <text x="44" y="11.2" text-anchor="middle" font-size="1.9" font-family="sans-serif" font-weight="700" fill="#93c5fd">UNO R3</text>
        <!-- cristal -->
        <rect x="45.5" y="34.5" width="6" height="3.2" rx="0.3" fill="#cbd5e1" stroke="#64748b" stroke-width="0.15"/>
        <text x="48.5" y="36.6" text-anchor="middle" font-size="1.1" font-family="monospace" fill="#334155">16.000</text>
        <!-- LEDs -->
        <circle cx="42" cy="27.5" r="0.65" fill="#22c55e" stroke="#14532d" stroke-width="0.12"/>
        <circle cx="44" cy="27.5" r="0.65" fill="#ef4444" stroke="#7f1d1d" stroke-width="0.12"/>
      </svg>`;
    }
    case "ultrasonic":
    case "hc-sr04":
    case "hcsr04": {
      // Wokwi HC-SR04 — viewBox "0 0 45 25" width 45mm height 25mm
      return `<svg width="${width}" height="${height}" viewBox="0 0 45 25" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="HC-SR04">
        <defs>
          <radialGradient id="us-grad-${width}" cx="8.96" cy="10.04" r="3.58" gradientUnits="userSpaceOnUse"><stop stop-color="#777" offset="0"/><stop stop-color="#b9b9b9" offset="1"/></radialGradient>
          <g id="us-unit-${width}"><circle cx="8.98" cy="10" r="8.61" fill="#dcdcdc"/><circle cx="8.98" cy="10" r="7.17" fill="#222"/><circle cx="8.98" cy="10" r="5.53" fill="#777" fill-opacity=".99"/><circle cx="8.98" cy="10" r="3.59" fill="url(#us-grad-${width})"/><circle cx="8.99" cy="10" r=".277" fill="#777" fill-opacity=".82"/></g>
        </defs>
        <path d="M0 0v20.948h45V0zm1.422.464a1 1 0 01.004 0 1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 01.996-1zm41.956 0a1 1 0 01.004 0 1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 01.996-1z" fill="#456f93"/>
        <use href="#us-unit-${width}"/>
        <use href="#us-unit-${width}" x="27.12"/>
        <rect ry="2.07" y=".626" x="17.111" height="4.139" width="10.272" fill="#878787" stroke="#424242" stroke-width=".368"/>
        <g fill="black"><rect x="17.87" y="18" ry=".568" width="2.25" height="2.271"/><rect x="20.41" y="18" ry=".568" width="2.25" height="2.271"/><rect x="22.95" y="18" ry=".568" width="2.25" height="2.271"/><rect x="25.49" y="18" ry=".568" width="2.25" height="2.271"/></g>
        <g fill="#ccc" stroke-linecap="round" stroke-width=".21"><rect x="18.61" y="19" width=".75" height="7" rx=".2"/><rect x="21.15" y="19" width=".75" height="7" rx=".2"/><rect x="23.69" y="19" width=".75" height="7" rx=".2"/><rect x="26.23" y="19" width=".75" height="7" rx=".2"/></g>
        <text font-size="2.2" fill="#e6e6e6" x="17.6" y="8">HC-SR04</text>
      </svg>`;
    }
    case "servo": {
      // Wokwi Servo — viewBox "0 0 170.08 119.55" width 45mm height 31.63mm
      return `<svg width="${width}" height="${height}" viewBox="0 0 170.08 60" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Servo">
        <g stroke-width="2.7" fill="none"><path stroke="#b44200" d="m 83.32,56.6 c0,0 -32.99,0.96 -43.32,0 -6.20,-0.58 -10.60,-6.20 -14.87,-6.31"/><path stroke="#ff2300" d="m83.326 59.6h-62.971"/><path stroke="#f47b00" d="m 83.32,62.6 c0,0 -32.60,-0.61 -43.33,-0.15 -6.87,0.29 -12.01,6.82 -14.77,6.73"/></g>
        <rect fill="#666" y="45.5" width="25.71" height="28" rx="1.14"/>
        <g id="pin-${width}"><rect x="0" y="-1.91" width="3.72" height="3.71"/><rect fill="#ccc" x="0.33" y="-1.23" width="3.04" height="2.46" rx=".15"/></g>
        <use href="#pin-${width}" x="4.7" y="50.06"/><use href="#pin-${width}" x="4.7" y="59.66"/><use href="#pin-${width}" x="4.7" y="69.26"/>
        <rect fill="#666" x="64.255" y="37.911" width="90.241" height="43.725" rx="5.3331"/>
        <circle fill="#999" cx="91.467" cy="59.773" r="18.606"/>
        <path fill="#ccc" d="m119.54 50.354h-18.653v-18.653a8.4427 8.4427 0 0 0-8.4427-8.4427h-1.9537a8.4427 8.4427 0 0 0-8.4427 8.4427v18.653h-18.653a8.4427 8.4427 0 0 0-8.4427 8.4427v1.9537a8.4427 8.4427 0 0 0 8.4427 8.4427h18.653v18.653a8.4427 8.4427 0 0 0 8.4427 8.4427h1.9537a8.4427 8.4427 0 0 0 8.4427-8.4427v-18.653h18.653a8.4427 8.4427 0 0 0 8.4426-8.4427v-1.9537a8.4427 8.4427 0 0 0-8.4426-8.4427z" transform="translate(91.467 59.773) translate(-91.467 -59.773)"/>
        <circle fill="gray" cx="91.467" cy="59.773" r="8.3729"/><circle fill="#ccc" cx="91.467" cy="59.773" r="6.2494"/>
      </svg>`;
    }
    case "oled":
    case "ssd1306":
    case "display": {
      // Wokwi SSD1306 — width 150 height 116 (usa 150x116 como wokwi)
      return `<svg width="${width}" height="${height}" viewBox="0 0 150 116" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="OLED SSD1306">
        <rect x=".5" y=".5" width="149" height="115" rx="9" fill="#025CAF" stroke="#BE9B72" stroke-width="1"/>
        <g fill="#59340A" stroke="#BE9B72" stroke-width="0.6"><circle cx="136" cy="12" r="5.5"/><circle cx="14" cy="12" r="5.5"/><circle cx="136" cy="102" r="5.5"/><circle cx="14" cy="102" r="5.5"/></g>
        <rect x="11.4" y="26" width="128" height="64" fill="#0a0a0a" stroke="#1a1a1a" stroke-width="0.6"/>
        <!-- pantalla encendida con píxeles sutiles -->
        <g fill="#00ff88" opacity="0.85">
          <rect x="14" y="30" width="38" height="3.5" rx="0.6" opacity="0.95"/>
          <rect x="14" y="36" width="28" height="2.2" rx="0.5" opacity="0.7"/>
          <rect x="14" y="41" width="44" height="2.2" rx="0.5" opacity="0.65"/>
          <rect x="14" y="46" width="22" height="2.2" rx="0.5" opacity="0.6"/>
          <!-- líneas fosforescentes -->
          <rect x="14" y="55" width="52" height="1.2" rx="0.4" opacity="0.35"/>
          <rect x="14" y="59" width="52" height="1.2" rx="0.4" opacity="0.32"/>
        </g>
        <text fill="#FFF" text-anchor="middle" font-size="4.5" font-family="monospace" opacity="0.98">
          <tspan x="37" y="10">VCC</tspan><tspan x="56" y="10">GND</tspan><tspan x="74" y="10">SCL</tspan><tspan x="92" y="10">SDA</tspan>
        </text>
        <g transform="translate(33 9)" fill="#9D9D9A" stroke-width="0.35">
          <circle stroke="#262626" cx="70.5" cy="3.5" r="3.2"/><circle stroke="#007ADB" cx="60.5" cy="3.5" r="3.2"/><circle stroke="#9D5B96" cx="50.5" cy="3.5" r="3.2"/><circle stroke="#009E9B" cx="41.5" cy="3.5" r="3.2"/>
        </g>
        <text x="75" y="105" text-anchor="middle" font-size="4.2" font-family="monospace" fill="#fff" opacity="0.9">SSD1306 · 128×64 OLED</text>
      </svg>`;
    }
    case "buzzer": {
      // Wokwi Buzzer — viewBox "0 0 17 20" 17mm x 20mm — membrana con anillos concéntricos
      const active = !!props.hasSignal || isLedOn;
      return `<svg width="${width}" height="${height}" viewBox="0 0 17 20" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Buzzer">
        <path d="m7.23 16.5v3.5" fill="none" stroke="#000" stroke-width=".5"/><path d="m9.77 16.5v3.5" fill="none" stroke="#e11d48" stroke-width=".5"/>
        <g stroke="#000">
          <ellipse cx="8.5" cy="8.5" rx="8.15" ry="8.15" fill="#0f172a" stroke-width=".7"/>
          <ellipse cx="8.5" cy="8.5" rx="7.2" ry="7.2" fill="#1e293b" stroke="#334155" stroke-width="0.25"/>
          <circle cx="8.5" cy="8.5" r="6.35" fill="none" stroke="#475569" stroke-width=".28"/>
          <circle cx="8.5" cy="8.5" r="4.35" fill="none" stroke="#64748b" stroke-width=".28"/>
          <circle cx="8.5" cy="8.5" r="1.37" fill="#e2e8f0" stroke="#94a3b8" stroke-width=".25"/>
          <circle cx="8.2" cy="8.1" r="0.35" fill="white" opacity="0.85"/>
        </g>
        ${active ? `<g fill="#3b82f6" opacity="0.9"><path d="M 13.2 2.2 q 1.2 1.5 1.2 3.3 q 0 1.8 -1.2 3.3" fill="none" stroke="#3b82f6" stroke-width="0.45" opacity="0.85"/><path d="M 14.6 1.0 q 1.8 2.2 1.8 4.5 q 0 2.3 -1.8 4.5" fill="none" stroke="#3b82f6" stroke-width="0.38" opacity="0.6"/></g>` : ``}
        <text x="8.5" y="19.2" text-anchor="middle" font-size="1.7" font-family="monospace" fill="#64748b">BUZZER</text>
      </svg>`;
    }
    case "potentiometer":
    case "pot": {
      // Wokwi Potentiometer — viewBox "0 0 20 20" 20mm x 20mm — PCB azul, knob plateado, marcas GND/SIG/VCC
      const val = typeof props.value === "number" ? props.value : typeof props.valor === "number" ? props.valor : 50;
      const pct = Math.max(0, Math.min(1, Number(val) / 100));
      const deg = -135 + pct * 270;
      return `<svg width="${width}" height="${height}" viewBox="0 0 20 20" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Potenciómetro">
        <rect x=".15" y=".15" width="19.7" height="19.7" rx="1.2" fill="#045881" stroke="#034a6b" stroke-width="0.28"/>
        <rect x="5.4" y=".70" width="9.1" height="1.9" rx="0.2" fill="#ccdae3"/>
        <ellipse cx="10" cy="8.06" rx="7.27" ry="7.43" fill="#e4e8eb"/>
        <ellipse cx="10" cy="8.06" rx="6.6" ry="6.58" fill="#c3c2c3"/>
        <g fill="#fff"><ellipse cx="1.68" cy="1.81" rx=".99" ry=".96"/><ellipse cx="1.48" cy="18.37" rx=".99" ry=".96"/><ellipse cx="17.97" cy="18.47" rx=".99" ry=".96"/><ellipse cx="18.07" cy="1.91" rx=".99" ry=".96"/></g>
        <g fill="#b3b1b0"><ellipse cx="7.68" cy="18" rx=".61" ry=".63"/><ellipse cx="10.22" cy="18" rx=".61" ry=".63"/><ellipse cx="12.76" cy="18" rx=".61" ry=".63"/></g>
        <g font-size="0.95" font-family="monospace" fill="#fff"><text x="6.21" y="16.6">GND</text><text x="9.2" y="16.63">SIG</text><text x="11.5" y="16.59">VCC</text></g>
        <!-- knob rotation -->
        <g transform="rotate(${deg} 10 8.06)"><rect x="9.78" y="1.9" width="0.44" height="3.2" fill="#1e293b" rx="0.15"/><circle cx="10" cy="8.06" r="1.1" fill="#0f172a"/></g>
        <circle cx="10" cy="8.06" r="0.5" fill="white" opacity="0.9"/>
      </svg>`;
    }
    // Fallbacks existentes (no tocados para no romper)
    case "capacitor": {
      return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="${width-2}" height="${height-2}" rx="5" fill="#fde68a" stroke="#92400e"/><text x="${width/2}" y="${height/2}" text-anchor="middle" font-size="6" fill="#92400e">100nF</text></svg>`;
    }
    case "dht22": {
      return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="${width-4}" height="${height*0.7}" rx="4" fill="#f8fafc" stroke="#cbd5e1"/><text x="${width/2}" y="14" text-anchor="middle" font-size="5" font-weight="800" fill="#334155">DHT22</text></svg>`;
    }
    case "breadboard": {
      return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="${width-2}" height="${height-2}" rx="6" fill="#fffbeb" stroke="#c9b896"/><text x="${width/2}" y="${height/2}" text-anchor="middle" font-size="6" fill="#a08e6a">Breadboard</text></svg>`;
    }
    default: return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="${width-2}" height="${height-2}" rx="4" fill="#1e1e1e" stroke="#333"/><text x="${width/2}" y="${height/2}" text-anchor="middle" font-size="8" fill="#777">${id}</text></svg>`;
  }
}
