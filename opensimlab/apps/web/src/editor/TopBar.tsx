"use client";

import { useRef } from "react";
import { Undo2, Redo2, Trash2, Play, Square, Menu, PanelRight, MoreHorizontal, ChevronDown, Hash, Zap, Save, Upload, Power } from "lucide-react";
import { Button } from "@/components/ui/button";

type TopBarProps = {
  onToggleLeft: () => void;
  onToggleRight: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  count: number;
  wireCount: number;
  onSave?: () => void;
  onLoadFile?: (file: File) => void;
  // FASE 6 — simulación GPIO2 toggle
  gpioLevel?: "HIGH" | "LOW";
  onToggleGpio?: () => void;
  onSetHigh?: () => void;
  onSetLow?: () => void;
  pathFound?: boolean;
  ledOn?: boolean;
};

export function TopBar({
  onToggleLeft,
  onToggleRight,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  count,
  wireCount,
  onSave,
  onLoadFile,
  gpioLevel = "LOW",
  onToggleGpio,
  onSetHigh,
  onSetLow,
  pathFound = false,
  ledOn = false,
}: TopBarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleLoadClick = () => fileRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onLoadFile?.(f);
    e.target.value = "";
  };
  const isHigh = gpioLevel === "HIGH";
  void onSetHigh;
  return (
    <header
      className="flex items-center gap-3 px-3 shrink-0 sticky top-0 border-b"
      style={{ height: "var(--topbar-h)", background: "#1a1a1a", borderColor: "#333" }}
    >
      <button type="button" onClick={onToggleLeft} aria-label="Alternar panel de componentes" className="inline-flex lg:hidden size-8 items-center justify-center rounded-sm border hover:bg-[#252525]" style={{ borderColor: "#333", color: "#999" }}>
        <Menu size={16} />
      </button>

      <div className="flex items-center gap-3 min-w-0">
        <div className="size-[28px] rounded-sm flex items-center justify-center shrink-0" style={{ background: "#00979d", border: "1px solid #007a7f" }}>
          <Zap size={14} className="text-white" />
        </div>
        <div className="hidden sm:flex flex-col leading-none gap-0.5 min-w-0">
          <span className="font-semibold text-[13.5px] tracking-tight leading-none" style={{ color: "#e0e0e0" }}>OpenSimLab</span>
          <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "#777" }}>LAB · {count} COMP · {wireCount} WIRES</span>
        </div>
        <span className="hidden md:inline-flex items-center gap-1.5 ml-1 pl-2.5 pr-2.5 py-1 rounded-full border text-[11px] font-mono" style={{ background: "#252525", borderColor: "#333", color: "#999" }}>
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {count === 0 ? "EMPTY" : `${count} · ${wireCount}`}
        </span>
      </div>

      <div className="flex-1 min-w-0 flex justify-center px-2">
        <div className="hidden md:flex items-center gap-2 max-w-[360px] w-full px-3 py-1.5 rounded-full border" style={{ background: "#252525", borderColor: "#333" }}>
          <Hash size={12} className="shrink-0" style={{ color: "#666" }} />
          <span className="flex-1 truncate text-[12.5px] font-medium" style={{ color: "#ccc" }}>Proyecto sin título</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border" style={{ background: "#1a1a1a", borderColor: "#333", color: "#777" }}>circuito-01</span>
          <ChevronDown size={12} className="shrink-0" style={{ color: "#666" }} />
        </div>
      </div>

      <nav className="flex items-center gap-1 shrink-0" aria-label="Acciones">
        <div className="hidden sm:flex items-center gap-0.5 p-1 rounded-full border" style={{ background: "#1e1e1e", borderColor: "#333" }}>
          <Button variant="ghost" size="icon-sm" onClick={onUndo} disabled={!canUndo} aria-label="Deshacer" className="size-7 rounded-full disabled:opacity-30" style={{ color: "#999" }}>
            <Undo2 size={14} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onRedo} disabled={!canRedo} aria-label="Rehacer" className="size-7 rounded-full disabled:opacity-30" style={{ color: "#999" }}>
            <Redo2 size={14} />
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={onSave} className="hidden md:inline-flex h-7 px-2.5 rounded-full border text-xs hover:bg-[#252525]" style={{ background: "#252525", borderColor: "#333", color: "#999" }} aria-label="Guardar circuito">
          <Save size={12} /> Guardar
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLoadClick} className="hidden md:inline-flex h-7 px-2.5 rounded-full border text-xs hover:bg-[#252525]" style={{ background: "#252525", borderColor: "#333", color: "#999" }} aria-label="Cargar circuito">
          <Upload size={12} /> Cargar
        </Button>
        <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileChange} aria-hidden />
        <Button variant="ghost" size="sm" onClick={onClear} className="hidden md:inline-flex h-7 px-2.5 rounded-full border text-xs hover:bg-[#252525]" style={{ background: "#252525", borderColor: "#333", color: "#999" }}>
          <Trash2 size={12} /> Limpiar
        </Button>

        <div className="flex items-center gap-1 ml-1 pl-2 border-l" style={{ borderColor: "#333" }}>
          <span className="hidden lg:inline text-[10px] font-mono tracking-widest font-semibold mr-1" style={{ color: "#666" }}>SIMULACIÓN</span>
          {/* FASE 6: Ejecutar alterna GPIO2 HIGH/LOW; color y label reflejan estado */}
          <button
            type="button"
            onClick={onToggleGpio}
            aria-label={isHigh ? "Poner GPIO2 LOW" : "Poner GPIO2 HIGH"}
            className="inline-flex items-center gap-1.5 pl-2.5 pr-3 h-7 rounded-full text-xs font-semibold border transition-colors"
            style={{
              background: isHigh ? "#b45309" : "#0a5a3a",
              color: "#fff",
              borderColor: isHigh ? "#f59e0b" : "#0d7a4a",
              boxShadow: isHigh ? "0 0 10px rgba(245,158,11,0.35)" : "none",
            }}
            title={pathFound ? (isHigh ? "LED debería estar ENCENDIDO si camino OK" : "LED APAGADO (GPIO LOW)") : "Sin camino GPIO2→R→LED→GND — revisa cableado"}
          >
            {isHigh ? <Power size={12} className="fill-white" /> : <Play size={12} className="fill-white" />}
            {isHigh ? "GPIO HIGH" : "Ejecutar"}
          </button>
          <button
            type="button"
            onClick={onSetLow}
            aria-label="Detener — GPIO LOW"
            className="size-7 grid place-items-center rounded-full border transition-opacity"
            style={{
              background: !isHigh ? "#252525" : "#3a1a1a",
              borderColor: !isHigh ? "#333" : "#5a2222",
              color: !isHigh ? "#777" : "#f87171",
              opacity: 1,
            }}
          >
            <Square size={9} className="fill-current" />
          </button>
          {/* Indicador LED */}
          <span
            className="hidden sm:inline-flex items-center gap-1.5 ml-1 px-2 py-1 rounded-full border text-[10px] font-mono font-semibold"
            style={{
              background: ledOn ? "rgba(251,146,60,0.16)" : "#1e1e1e",
              borderColor: ledOn ? "#f59e0b" : "#333",
              color: ledOn ? "#fbbf24" : "#666",
              boxShadow: ledOn ? "0 0 8px rgba(251,146,60,0.45)" : "none",
            }}
            title={ledOn ? "LED ENCENDIDO" : pathFound ? "LED APAGADO — pon HIGH" : "LED APAGADO — sin camino"}
          >
            <span className="size-2 rounded-full" style={{ background: ledOn ? "#f59e0b" : "#444", boxShadow: ledOn ? "0 0 6px #f59e0b" : "none" }} />
            LED {ledOn ? "ON" : "OFF"}
          </span>
        </div>

        <button type="button" className="size-7 grid place-items-center rounded-sm border hover:bg-[#252525] hidden sm:grid ml-0.5" style={{ background: "#252525", borderColor: "#333", color: "#777" }} aria-label="Más">
          <MoreHorizontal size={14} />
        </button>
        <button type="button" onClick={onToggleRight} aria-label="Alternar panel de propiedades" className="inline-flex lg:hidden size-8 items-center justify-center rounded-sm border" style={{ background: "#252525", borderColor: "#333", color: "#999" }}>
          <PanelRight size={14} />
        </button>
      </nav>
    </header>
  );
}
