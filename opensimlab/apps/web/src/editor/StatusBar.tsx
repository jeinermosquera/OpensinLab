"use client";

export function StatusBar({ zoom, count, wireCount, selected, pending }: { zoom: number; count: number; wireCount: number; selected: string | null; pending: boolean }) {
  return (
    <footer className="flex items-center gap-2 px-3 text-xs border-t shrink-0 font-mono" style={{ height: "var(--statusbar-h)", background: "#1a1a1a", borderColor: "#333", color: "#777" }}>
      <span className="hidden sm:inline-flex items-center gap-2">
        <span className="size-1.5 rounded-full shrink-0" style={{ background: pending ? "#f59e0b" : count ? "#00979d" : "#22c55e" }} />
        <span className="text-[11px] tracking-wide" style={{ color: "#aaa" }}>
          {pending ? "CABLEANDO…" : count ? `${count} COMP · ${wireCount} WIRES` : "LAB READY — WOKWI"}
        </span>
      </span>
      <span className="w-px h-3 hidden sm:block" style={{ background: "#333" }} />
      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-sm border" style={{ background: "#252525", borderColor: "#333", color: "#999" }}>{zoom}%</span>
      <span className="w-px h-3 hidden sm:block" style={{ background: "#333" }} />
      <span className="truncate text-[11px]" style={{ color: "#777" }}>{selected ? `SEL: ${selected.slice(0, 6)}` : "SIN SELECCIÓN"}</span>
      <span className="hidden md:inline-flex items-center gap-2 ml-1">
        <span className="w-px h-3" style={{ background: "#333" }} />
        <span className="text-[11px] tracking-wide" style={{ color: "#666" }}>S03 · CABLEADO VISUAL · SIN SIMULACIÓN</span>
      </span>
      <span className="ml-auto hidden lg:inline-flex items-center gap-1.5 text-[11px]" style={{ color: "#666" }}>
        <span className="px-1.5 py-0.5 rounded-sm border font-mono text-[10px]" style={{ background: "#252525", borderColor: "#333" }}>Esc</span> cancela · pin→pin
      </span>
    </footer>
  );
}
