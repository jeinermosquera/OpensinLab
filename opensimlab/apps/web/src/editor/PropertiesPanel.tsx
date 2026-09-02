"use client";

import { getDefinition, ICON_MAP } from "@/components/definitions";
import type { PlacedComponent, Wire } from "@/core/state/circuit";
import type { SimulationResult } from "@/simulation/SimulationEngine";
import { SlidersHorizontal, ChevronRight, ChevronLeft, Settings2, Trash2, Copy, RotateCw, Grid3x3, Power, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  collapsed: boolean;
  onCollapse: () => void;
  selected: PlacedComponent | null;
  selectedWire: Wire | null;
  total: number;
  wireTotal: number;
  onUpdateProp: (id: string, key: string, value: string | number) => void;
  onRotate: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  // FASE 6 — simulación
  gpioLevel?: "HIGH" | "LOW";
  onToggleGpio?: () => void;
  simulation?: SimulationResult;
};

export function PropertiesPanel({ collapsed, onCollapse, selected, selectedWire, total, wireTotal, onUpdateProp, onRotate, onDuplicate, onRemove, gpioLevel = "LOW", onToggleGpio, simulation }: Props) {
  if (collapsed) {
    return (
      <aside className="hidden lg:flex flex-col items-center gap-3 py-3 border-l shrink-0" style={{ width: "var(--panel-rail-w)", background: "#1e1e1e", borderColor: "#333" }}>
        <button type="button" onClick={onCollapse} className="size-8 grid place-items-center rounded-sm border hover:bg-[#2b2b2b]" style={{ borderColor: "#333", background: "#252525", color: "#999" }} aria-label="Expandir propiedades">
          <ChevronLeft size={14} />
        </button>
        <div className="w-6 h-px my-1" style={{ background: "#333" }} />
        <span className="text-[10px] font-mono font-semibold tracking-[0.16em] text-zinc-500" style={{ writingMode: "vertical-rl" }}>PROPIEDADES</span>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col min-w-0 border-l shrink-0 overflow-hidden" style={{ width: "var(--panel-right-w)", background: "#202020", borderColor: "#333" }}>
      <div className="flex items-center justify-between px-3 shrink-0" style={{ height: 30, background: "#111", borderBottom: "1px solid #333" }}>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={12} style={{ color: "#777" }} />
          <h2 className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: "#b0b0b0" }}>PROPIEDADES</h2>
        </div>
        <button type="button" onClick={onCollapse} className="size-6 grid place-items-center text-zinc-500 hover:text-zinc-200" aria-label="Contraer">
          <ChevronRight size={14} />
        </button>
      </div>

      {selectedWire ? (
        <div className="flex-1 p-3 space-y-3 overflow-y-auto">
          <div className="flex items-center gap-3 p-3 rounded-sm border" style={{ background: "#252525", borderColor: "#333" }}>
            <span className="size-9 rounded-sm grid place-items-center border shrink-0" style={{ background: selectedWire.color, borderColor: "rgb(255 255 255 / 0.12)" }}>
              <span className="size-2.5 rounded-full bg-white shadow" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium" style={{ color: "#e0e0e0" }}>Cable</p>
              <p className="text-[11px] font-mono truncate" style={{ color: "#888" }}>{selectedWire.id.slice(0, 8)} · {selectedWire.from.pinId} → {selectedWire.to.pinId}</p>
            </div>
            <span className="ml-auto size-2 rounded-full" style={{ background: selectedWire.color }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-sm border" style={{ background: "#252525", borderColor: "#333" }}>
              <p className="text-[10px] font-mono tracking-widest font-semibold" style={{ color: "#777" }}>ORIGEN</p>
              <p className="font-mono text-xs mt-1 truncate" style={{ color: "#ccc" }}>{selectedWire.from.instanceId.slice(0, 6)}:{selectedWire.from.pinId}</p>
            </div>
            <div className="p-2.5 rounded-sm border" style={{ background: "#252525", borderColor: "#333" }}>
              <p className="text-[10px] font-mono tracking-widest font-semibold" style={{ color: "#777" }}>DESTINO</p>
              <p className="font-mono text-xs mt-1 truncate" style={{ color: "#ccc" }}>{selectedWire.to.instanceId.slice(0, 6)}:{selectedWire.to.pinId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-8 rounded-sm border flex items-center px-2.5 gap-2" style={{ background: selectedWire.color, borderColor: "#333" }}>
              <span className="size-2 rounded-full bg-white/90" />
              <span className="text-xs font-mono font-medium text-white drop-shadow-sm">{selectedWire.color}</span>
            </div>
            <Button variant="danger" size="sm" onClick={() => onRemove(selectedWire.id)} className="rounded-sm"><Trash2 size={12} /> Eliminar</Button>
          </div>
        </div>
      ) : !selected ? (
        <div className="flex-1 grid place-items-center p-6 text-center">
          <div className="max-w-[240px] space-y-3">
            <div className="relative mx-auto size-[72px]">
              <div className="absolute inset-0 rounded-sm border" style={{ background: "#252525", borderColor: "#333" }} />
              <div className="absolute inset-[8px] rounded-sm border border-dashed grid place-items-center" style={{ background: "#1e1e1e", borderColor: "#444" }}>
                <Grid3x3 size={20} style={{ color: "#666" }} />
              </div>
              <span className="absolute -top-1 -right-1 size-5 rounded-full grid place-items-center border-2" style={{ background: "#00979d", borderColor: "#202020", color: "#fff" }}>
                <Settings2 size={10} />
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[13px] font-medium" style={{ color: "#ccc" }}>Nada seleccionado</p>
              <p className="text-xs leading-relaxed" style={{ color: "#777" }}>Clic en un componente para editar sus propiedades, o en un pin para cablear.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {(() => {
            const def = getDefinition(selected.definitionId);
            if (!def) return null;
            const Icon = ICON_MAP[def.icon] ?? Grid3x3;
            return (
              <>
                <div className="flex items-center gap-3 p-2.5 rounded-sm border" style={{ background: "#252525", borderColor: "#333" }}>
                  <span className="size-9 grid place-items-center rounded-sm border shrink-0" style={{ background: "#1e1e1e", borderColor: "#333", color: "#ccc" }}><Icon size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium truncate" style={{ color: "#e0e0e0" }}>{def.name}</p>
                    <p className="text-[11px] truncate" style={{ color: "#888" }}>{def.desc} <span style={{ color: "#666" }}>· {def.category}</span></p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-medium border" style={{ background: "#1e1e1e", borderColor: "#333", color: "#777" }}>{selected.instanceId.slice(0, 4)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ label: "X", value: selected.x }, { label: "Y", value: selected.y }, { label: "ROT", value: `${selected.rotation}°` }].map((f) => (
                    <label key={f.label} className="space-y-1">
                      <span className="text-[10px] font-mono font-semibold tracking-widest" style={{ color: "#777" }}>{f.label}</span>
                      <input value={f.value as string | number} readOnly className="w-full px-2 py-1.5 rounded-sm border text-xs font-mono" style={{ background: "#252525", borderColor: "#333", color: "#aaa" }} />
                    </label>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <Button variant="secondary" size="sm" onClick={() => onRotate(selected.instanceId)} className="flex-1 gap-1.5 rounded-sm" style={{ background: "#2a2a2a", borderColor: "#333", color: "#ccc" }}><RotateCw size={12} /> Rotar 90°</Button>
                  <Button variant="secondary" size="sm" onClick={() => onDuplicate(selected.instanceId)} className="flex-1 rounded-sm" style={{ background: "#2a2a2a", borderColor: "#333", color: "#ccc" }}><Copy size={12} /> Duplicar</Button>
                  <Button variant="danger" size="sm" onClick={() => onRemove(selected.instanceId)} className="px-3 rounded-sm"><Trash2 size={12} /></Button>
                </div>
                <div className="space-y-3 pt-3 border-t" style={{ borderColor: "#333" }}>
                  <h3 className="text-[11px] font-mono font-semibold tracking-[0.1em]" style={{ color: "#888" }}>PARÁMETROS</h3>
                  {Object.entries(selected.props).map(([k, v]) => (
                    <label key={k} className="block space-y-1.5">
                      <span className="text-[11px] font-medium capitalize" style={{ color: "#aaa" }}>{k}</span>
                      <input value={String(v)} onChange={(e) => onUpdateProp(selected.instanceId, k, e.target.value)} className="w-full px-2.5 py-2 rounded-sm border text-[13px] focus:outline-none focus:border-[#00979d]" style={{ background: "#2a2a2a", borderColor: "#333", color: "#e0e0e0" }} />
                    </label>
                  ))}
                </div>

                {/* FASE 6 — controles de simulación por componente */}
                {selected.definitionId === "esp32" && onToggleGpio && simulation && (
                  <div className="space-y-2 pt-3 border-t" style={{ borderColor: "#333" }}>
                    <h3 className="text-[11px] font-mono font-semibold tracking-[0.1em] flex items-center gap-1.5" style={{ color: "#888" }}>
                      <Power size={12} /> SIMULACIÓN GPIO2
                    </h3>
                    <div className="flex items-center gap-2 p-2.5 rounded-sm border" style={{ background: gpioLevel === "HIGH" ? "rgba(251,146,60,0.12)" : "#252525", borderColor: gpioLevel === "HIGH" ? "#f59e0b" : "#333" }}>
                      <span className="size-2.5 rounded-full shrink-0" style={{ background: gpioLevel === "HIGH" ? "#f59e0b" : "#555", boxShadow: gpioLevel === "HIGH" ? "0 0 8px #f59e0b" : "none" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono font-semibold" style={{ color: gpioLevel === "HIGH" ? "#fbbf24" : "#aaa" }}>GPIO2 {gpioLevel}</p>
                        <p className="text-[11px] leading-tight" style={{ color: "#777" }}>{gpioLevel === "HIGH" ? "3.3V" : "0V"} · {simulation.pathFound ? "camino OK" : "sin camino"}</p>
                      </div>
                      <Button size="sm" onClick={onToggleGpio} className="rounded-sm shrink-0" style={{ background: gpioLevel === "HIGH" ? "#92400e" : "#0a5a3a", borderColor: gpioLevel === "HIGH" ? "#f59e0b" : "#0d7a4a", color: "#fff" }}>
                        {gpioLevel === "HIGH" ? "→ LOW" : "→ HIGH"}
                      </Button>
                    </div>
                    <p className="text-[11px] leading-relaxed px-1" style={{ color: simulation.pathFound ? (gpioLevel === "HIGH" ? "#fbbf24" : "#9ca3af") : "#f87171" }}>{simulation.reason}</p>
                    <div className="flex gap-1.5 text-[11px] font-mono">
                      <span className="px-2 py-1 rounded-sm border" style={{ background: "#1e1e1e", borderColor: "#333", color: simulation.pathFound ? "#6ee7b7" : "#777" }}>path {simulation.pathFound ? "✓" : "✗"}</span>
                      <span className="px-2 py-1 rounded-sm border" style={{ background: "#1e1e1e", borderColor: "#333", color: simulation.ledStates[selected.instanceId] !== undefined ? "#777" : "#666" }}>{simulation.pathComponentIds.length} en ruta</span>
                    </div>
                  </div>
                )}

                {selected.definitionId === "led" && simulation && (
                  <div className="space-y-2 pt-3 border-t" style={{ borderColor: "#333" }}>
                    <h3 className="text-[11px] font-mono font-semibold tracking-[0.1em] flex items-center gap-1.5" style={{ color: "#888" }}>
                      <Lightbulb size={12} /> ESTADO LED
                    </h3>
                    {(() => {
                      const on = !!simulation.ledStates[selected.instanceId];
                      return (
                        <div className="flex items-center gap-2 p-2.5 rounded-sm border" style={{ background: on ? "rgba(251,146,60,0.12)" : "#252525", borderColor: on ? "#f59e0b" : "#333" }}>
                          <span className="size-3 rounded-full shrink-0" style={{ background: on ? "#f59e0b" : "#444", boxShadow: on ? "0 0 10px #f59e0b" : "none" }} />
                          <div className="flex-1">
                            <p className="text-xs font-semibold" style={{ color: on ? "#fbbf24" : "#888" }}>{on ? "ENCENDIDO" : "APAGADO"}</p>
                            <p className="text-[11px] font-mono" style={{ color: "#777" }}>{simulation.gpioState["esp32-gpio2"]} · {simulation.pathFound ? "camino OK" : "sin camino"}</p>
                          </div>
                          <span className="text-[11px] font-mono px-2 py-1 rounded-sm border" style={{ background: "#1e1e1e", borderColor: "#333", color: on ? "#fbbf24" : "#666" }}>{on ? "3.3V" : "0V"}</span>
                        </div>
                      );
                    })()}
                    <p className="text-[11px] leading-relaxed" style={{ color: "#666" }}>{simulation.reason}</p>
                  </div>
                )}

                {selected.definitionId === "resistor" && simulation && (
                  <div className="space-y-2 pt-3 border-t" style={{ borderColor: "#333" }}>
                    <h3 className="text-[11px] font-mono font-semibold tracking-[0.1em]" style={{ color: "#888" }}>CORRIENTE</h3>
                    {(() => {
                      const hasCurrent = !!simulation.resistorStates[selected.instanceId];
                      return (
                        <div className="flex items-center gap-2 p-2.5 rounded-sm border" style={{ background: hasCurrent ? "rgba(251,146,60,0.08)" : "#252525", borderColor: hasCurrent ? "rgba(251,146,60,0.45)" : "#333" }}>
                          <span className="size-2.5 rounded-full" style={{ background: hasCurrent ? "#f59e0b" : "#555", boxShadow: hasCurrent ? "0 0 6px #f59e0b" : "none" }} />
                          <span className="text-xs font-mono" style={{ color: hasCurrent ? "#fbbf24" : "#888" }}>{hasCurrent ? "Con corriente (~15mA)" : "Sin corriente"}</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      <div className="px-3 py-2.5 border-t space-y-2" style={{ background: "#1e1e1e", borderColor: "#333" }}>
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-mono font-semibold tracking-widest" style={{ color: "#777" }}>ELEMENTOS</span>
          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-sm border" style={{ background: "#252525", borderColor: "#333", color: "#777" }}>{total} comp · {wireTotal} cables</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden p-0.5 flex" style={{ background: "#2a2a2a" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${total === 0 ? 0 : Math.min(100, 8 + total * 9)}%`, background: "#00979d" }} />
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: "#666" }}>Los cables siguen al componente al moverlo. Esc cancela cableado.</p>
      </div>
    </aside>
  );
}
