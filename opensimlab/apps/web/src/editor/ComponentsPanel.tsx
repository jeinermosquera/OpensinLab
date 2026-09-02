"use client";

import { useMemo, useState } from "react";
import { COMPONENT_DEFINITIONS, ICON_MAP } from "@/components/definitions";
import { Search, X, ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react";

type Props = {
  collapsed: boolean;
  onCollapse: () => void;
  onAdd: (id: string) => void;
};

// Wokwi-like icon tint per component id — matches screenshot palette
function tintFor(id: string): string {
  switch (id) {
    case "led": return "#e53935"; // LED red
    case "resistor": return "#d2a24c"; // resistor beige/brown stripes
    case "capacitor": return "#facc15";
    case "button": return "#22c55e"; // pushbutton green default, variations via item
    case "uno": return "#1a7bb8"; // Arduino blue
    case "esp32": return "#1a1a1a";
    case "dht22": return "#4ade80";
    case "ultrasonic": return "#60a5fa";
    case "servo": return "#2563eb";
    case "breadboard": return "#f5f5dc";
    default: return "#9ca3af";
  }
}

// Category grouping to replicate screenshot: Básico vs Mostrar
const GROUP_BASICO = new Set(["led", "resistor", "capacitor", "button", "uno", "esp32", "breadboard"]);
const GROUP_MOSTRAR = new Set(["dht22", "ultrasonic", "servo"]);

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      className="h-[30px] flex items-center px-3 shrink-0 select-none"
      style={{ background: "var(--panel-header)", borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #333" }}
    >
      <span className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: "#b0b0b0" }}>
        {label}
      </span>
    </div>
  );
}

export function ComponentsPanel({ collapsed, onCollapse, onAdd }: Props) {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!q) return COMPONENT_DEFINITIONS;
    const lq = q.toLowerCase();
    return COMPONENT_DEFINITIONS.filter((c) => c.name.toLowerCase().includes(lq) || c.desc.toLowerCase().includes(lq) || c.category.toLowerCase().includes(lq));
  }, [q]);

  const basicos = filtered.filter((c) => GROUP_BASICO.has(c.id));
  const mostrar = filtered.filter((c) => GROUP_MOSTRAR.has(c.id));
  const others = filtered.filter((c) => !GROUP_BASICO.has(c.id) && !GROUP_MOSTRAR.has(c.id));

  if (collapsed) {
    return (
      <aside className="hidden lg:flex flex-col items-center gap-3 py-3 border-r shrink-0" style={{ width: "var(--panel-rail-w)", background: "#1e1e1e", borderColor: "#333" }}>
        <button type="button" onClick={onCollapse} className="size-8 grid place-items-center rounded-sm border text-zinc-400 hover:text-white hover:bg-[#2b2b2b]" style={{ borderColor: "#333", background: "#252525" }} aria-label="Expandir panel">
          <ChevronRight size={14} />
        </button>
        <div className="w-6 h-px my-1" style={{ background: "#333" }} />
        <span className="text-[10px] font-semibold tracking-[0.16em] text-zinc-500" style={{ writingMode: "vertical-rl" }}>COMPONENTES</span>
      </aside>
    );
  }

  const Item = ({ id, name, Icon, active }: { id: string; name: string; Icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; active: boolean }) => (
    <button
      key={id}
      type="button"
      draggable
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", id); e.dataTransfer.effectAllowed = "copy"; }}
      onClick={() => { setSelectedId(id); onAdd(id); }}
      className="w-full flex items-center gap-3 px-3 text-left transition-colors"
      style={{
        height: 44,
        background: active ? "var(--panel-item-selected)" : "transparent",
        borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--panel-item-hover)"; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      title={name}
    >
      <span className="size-7 grid place-items-center rounded-sm shrink-0 overflow-hidden" style={{ width: 28, height: 28, background: id === "uno" ? "#0e4a6b" : id === "resistor" ? "#3a2a12" : id === "led" ? "#2a0a0a" : "#1f1f1f", border: "1px solid #333" }}>
        <Icon size={16} style={{ color: tintFor(id) }} />
      </span>
      <span className="flex-1 min-w-0 text-[13px] font-normal truncate" style={{ color: active ? "#ffffff" : "#d4d4d4" }}>{name}</span>
    </button>
  );

  return (
    <aside className="flex flex-col min-w-0 border-r shrink-0 overflow-hidden" style={{ width: "var(--panel-left-w)", background: "var(--panel-bg)", borderColor: "#333" }}>
      {/* Search — Wokwi: dark input, underline teal 2px, magnifier at right */}
      <div className="px-3 pt-3 pb-2 shrink-0" style={{ background: "#1e1e1e" }}>
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar componentes"
            className="w-full h-[36px] pl-3 pr-9 text-[13px] placeholder:text-zinc-500 focus:outline-none"
            style={{ background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #333", borderBottom: `2px solid ${q ? "var(--accent)" : "#00979d"}`, borderRadius: 2 }}
          />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#777" }} />
          {q && (
            <button type="button" onClick={() => setQ("")} className="absolute right-8 top-1/2 -translate-y-1/2 size-6 grid place-items-center text-zinc-500 hover:text-zinc-200" aria-label="Limpiar">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Content — two black category bars like screenshot */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {filtered.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <p className="text-[13px] text-zinc-400">Sin resultados para “{q}”</p>
            <button type="button" onClick={() => setQ("")} className="mt-3 px-3 py-1.5 rounded-sm text-xs border" style={{ background: "#2a2a2a", borderColor: "#333", color: "#ccc" }}>Limpiar</button>
          </div>
        ) : (
          <>
            <SectionHeader label="Básico" />
            {basicos.length === 0 ? <p className="px-3 py-2 text-xs text-zinc-500">—</p> : basicos.map((c) => {
              const Icon = ICON_MAP[c.icon] ?? Grid3x3;
              return <Item key={c.id} id={c.id} name={c.name} Icon={Icon} active={selectedId === c.id} />;
            })}
            <SectionHeader label="Mostrar" />
            {mostrar.length === 0 && others.length === 0 ? <p className="px-3 py-2 text-xs text-zinc-500">—</p> : null}
            {mostrar.map((c) => {
              const Icon = ICON_MAP[c.icon] ?? Grid3x3;
              return <Item key={c.id} id={c.id} name={c.name} Icon={Icon} active={selectedId === c.id} />;
            })}
            {others.map((c) => {
              const Icon = ICON_MAP[c.icon] ?? Grid3x3;
              return <Item key={c.id} id={c.id} name={c.name} Icon={Icon} active={selectedId === c.id} />;
            })}
          </>
        )}
      </div>

      {/* Collapse handle bottom */}
      <div className="h-8 flex items-center justify-end px-2 border-t shrink-0" style={{ background: "#1e1e1e", borderColor: "#333" }}>
        <button type="button" onClick={onCollapse} className="size-6 grid place-items-center text-zinc-500 hover:text-zinc-200" aria-label="Contraer">
          <ChevronLeft size={14} />
        </button>
      </div>
    </aside>
  );
}
