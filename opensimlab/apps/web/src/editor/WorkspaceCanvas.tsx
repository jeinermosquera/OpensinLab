"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { ComponentView } from "@/components/ComponentView";
import { WiresLayer, getPinPosition } from "@/components/WiresLayer";
import type { PlacedComponent, Wire, WireEndpoint } from "@/core/state/circuit";
import { Copy, RotateCw, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { GraphCanvas, type GraphCanvasHandle } from "./graph/GraphCanvas";
import { getDefinition } from "@/components/definitions";
import { getX6Ports } from "./graph/ports";
import { DEFAULT_EDGE_CONFIG } from "./graph/edges";

// Flag Fase 2: cuando true, renderiza X6 en vez del div board legacy.
const USE_X6 = true;

type Props = {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  components: PlacedComponent[];
  wires: Wire[];
  selectedId: string | null;
  pending: { from: WireEndpoint; color: string } | null;
  onAdd: (definitionId: string, x: number, y: number, instanceId?: string) => void;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  onRotate: (id: string) => void;
  onDuplicate: (id: string) => void;
  onPinClick: (instanceId: string, pinId: string) => void;
  onCancelWire: () => void;
  onWireConnect?: (payload: { from: WireEndpoint; to: WireEndpoint; color: string }) => void;
  onWireRemove?: (id: string) => void;
};

export function WorkspaceCanvas({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  components,
  wires,
  selectedId,
  pending,
  onAdd,
  onSelect,
  onMove,
  onRemove,
  onRotate,
  onDuplicate,
  onPinClick,
  onCancelWire,
  onWireConnect,
  onWireRemove,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const graphHandleRef = useRef<GraphCanvasHandle>(null);
  const [x6Zoom, setX6Zoom] = useState(100);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    const board = e.currentTarget.querySelector("[data-board]") as HTMLElement | null;
    if (!board) return;
    const br = board.getBoundingClientRect();
    const x = (e.clientX - br.left) / (zoom / 100);
    const y = (e.clientY - br.top) / (zoom / 100);
    onAdd(id, x, y);
  };

  const pendingPos = pending ? getPinPosition(components, pending.from.instanceId, pending.from.pinId) : null;
  const hasSelection = !!selectedId && !wires.find((w) => w.id === selectedId);

  const handleX6Ready = useCallback(() => {
    const g = graphHandleRef.current?.getGraph();
    if (g) {
      const s = g.zoom();
      if (typeof s === "number") setX6Zoom(Math.round(s * 100));
    }
  }, []);

  const handleX6Drop = useCallback(
    (definitionId: string, x: number, y: number, nodeId?: string) => {
      onAdd(definitionId, x, y, nodeId);
    },
    [onAdd],
  );
  const handleX6Select = useCallback((id: string | null) => onSelect(id), [onSelect]);
  const handleX6Move = useCallback(
    (id: string, x: number, y: number) => {
      const c = components.find((cc) => cc.instanceId === id);
      if (!c || (c.x === x && c.y === y)) return;
      onMove(id, x, y);
    },
    [components, onMove],
  );
  const handleX6Remove = useCallback(
    (id: string) => {
      if (components.find((c) => c.instanceId === id)) onRemove(id);
    },
    [components, onRemove],
  );
  const handleWireConnect = useCallback(
    (payload: { from: WireEndpoint; to: WireEndpoint; color: string }) => {
      onWireConnect?.(payload);
    },
    [onWireConnect],
  );
  const handleWireRemove = useCallback(
    (id: string) => {
      if (wires.find((w) => w.id === id)) onWireRemove?.(id);
    },
    [wires, onWireRemove],
  );

  // Sync state -> graph (undo/redo/clear/duplicate o carga inicial) — solo visual, sin simulación
  useEffect(() => {
    if (!USE_X6) return;
    const graph = graphHandleRef.current?.getGraph();
    if (!graph) return;
    try {
      const existingIds = new Set(graph.getNodes().map((n) => n.id));
      for (const c of components) {
        const def = getDefinition(c.definitionId);
        if (!def) continue;
        if (!existingIds.has(c.instanceId)) {
          try {
            graph.addNode({
              id: c.instanceId,
              shape: "wokwi-node",
              x: c.x,
              y: c.y,
              width: def.width,
              height: def.height,
              data: { definitionId: c.definitionId, props: c.props },
              ports: getX6Ports(def) as unknown as Record<string, unknown>,
              zIndex: 1,
            });
          } catch {
            // ignore duplicate
          }
        } else {
          const node = graph.getCellById(c.instanceId) as unknown as {
            getPosition: () => { x: number; y: number };
            setPosition: (x: number, y: number) => void;
            getSize: () => { width: number; height: number };
            setSize: (w: number, h: number) => void;
            getData: () => { definitionId?: string; props?: Record<string, unknown> };
            setData: (d: unknown) => void;
          } | null;
          if (!node) continue;
          const pos = node.getPosition();
          if (pos.x !== c.x || pos.y !== c.y) {
            try {
              node.setPosition(c.x, c.y);
            } catch {}
          }
          const size = node.getSize();
          if (size.width !== def.width || size.height !== def.height) {
            try {
              node.setSize(def.width, def.height);
            } catch {}
          }
          const data = node.getData();
          const propsChanged = JSON.stringify(data?.props) !== JSON.stringify(c.props) || data?.definitionId !== c.definitionId;
          if (propsChanged) {
            try {
              node.setData({ definitionId: c.definitionId, props: c.props });
            } catch {}
          }
          try {
            const getAngle = (node as unknown as { getAngle?: () => number }).getAngle?.() ?? 0;
            if (getAngle !== c.rotation) {
              const setAngle = (node as unknown as { angle?: (v: number) => void; rotate?: (d: number) => void }).rotate;
              const maybeSet = (node as unknown as { setAngle?: (a: number) => void }).setAngle;
              if (typeof maybeSet === "function") maybeSet(c.rotation);
              else if (typeof setAngle === "function") (node as unknown as { rotate: (d: number) => void }).rotate(c.rotation - getAngle);
              else {
                (node as unknown as { prop: (k: string, v: unknown) => void }).prop?.("angle", c.rotation);
              }
            }
          } catch {}
        }
      }
      for (const node of graph.getNodes()) {
        if (!components.find((c) => c.instanceId === node.id)) {
          try {
            const stillInState = components.some((c) => c.instanceId === node.id);
            if (!stillInState) node.remove();
          } catch {}
        }
      }
    } catch {
      // ignore during init
    }
  }, [components]);

  // FASE 4: sync wires → graph edges (manhattan + rounded, usa DEFAULT_EDGE_CONFIG)
  useEffect(() => {
    if (!USE_X6) return;
    const graph = graphHandleRef.current?.getGraph();
    if (!graph) return;
    try {
      const edgeIds = new Set(graph.getEdges().map((e) => e.id));
      const wireIds = new Set(wires.map((w) => w.id));
      for (const w of wires) {
        if (!edgeIds.has(w.id)) {
          try {
            const dupTemp = graph.getEdges().find((e) => {
              const s = (e as unknown as { getSource: () => { cell?: string; port?: string } }).getSource?.();
              const t = (e as unknown as { getTarget: () => { cell?: string; port?: string } }).getTarget?.();
              return (
                (s?.cell === w.from.instanceId && s?.port === w.from.pinId && t?.cell === w.to.instanceId && t?.port === w.to.pinId) ||
                (s?.cell === w.to.instanceId && s?.port === w.to.pinId && t?.cell === w.from.instanceId && t?.port === w.from.pinId)
              );
            });
            if (dupTemp && dupTemp.id !== w.id) {
              try { dupTemp.remove(); } catch {}
            }
          } catch {}
          try {
            graph.addEdge({
              id: w.id,
              shape: "edge",
              source: { cell: w.from.instanceId, port: w.from.pinId },
              target: { cell: w.to.instanceId, port: w.to.pinId },
              attrs: { line: { stroke: w.color, strokeWidth: 2.8, targetMarker: null, strokeLinecap: "round", strokeLinejoin: "round" } },
              data: { color: w.color, wireId: w.id },
              router: DEFAULT_EDGE_CONFIG.router as unknown as Record<string, unknown>,
              connector: DEFAULT_EDGE_CONFIG.connector as unknown as Record<string, unknown>,
              zIndex: 0,
            } as unknown as Record<string, unknown>);
          } catch {}
        } else {
          try {
            const edge = graph.getCellById(w.id) as unknown as { attr: (path: string, v?: unknown) => unknown; setData?: (d: unknown) => void } | null;
            if (edge) {
              const cur = edge.attr("line/stroke") as unknown as string;
              if (cur !== w.color) {
                try { (edge as unknown as { attr: (p: string, v: string) => void }).attr("line/stroke", w.color); } catch {}
              }
              const isSelected = selectedId === w.id;
              try {
                (edge as unknown as { attr: (p: string, v: unknown) => void }).attr("line/strokeWidth", isSelected ? 4 : 2.8);
              } catch {}
            }
          } catch {}
        }
      }
      for (const e of graph.getEdges()) {
        if (!wireIds.has(e.id as string)) {
          const s = (e as unknown as { getSource: () => { cell?: string } }).getSource?.();
          const t = (e as unknown as { getTarget: () => { cell?: string } }).getTarget?.();
          if (s?.cell && t?.cell) {
            try { e.remove(); } catch {}
          }
        }
      }
    } catch {
      // ignore
    }
  }, [wires, selectedId]);

  const handleX6ZoomIn = useCallback(() => {
    if (graphHandleRef.current) {
      graphHandleRef.current.zoomIn();
      setX6Zoom(graphHandleRef.current.getZoomPercent());
    } else {
      onZoomIn();
    }
  }, [onZoomIn]);

  const handleX6ZoomOut = useCallback(() => {
    if (graphHandleRef.current) {
      graphHandleRef.current.zoomOut();
      setX6Zoom(graphHandleRef.current.getZoomPercent());
    } else {
      onZoomOut();
    }
  }, [onZoomOut]);

  const handleX6ZoomReset = useCallback(() => {
    if (graphHandleRef.current) {
      graphHandleRef.current.zoomReset();
      setX6Zoom(100);
    } else {
      onZoomReset();
    }
  }, [onZoomReset]);

  const zoomOutAction = USE_X6 ? handleX6ZoomOut : onZoomOut;
  const zoomInAction = USE_X6 ? handleX6ZoomIn : onZoomIn;
  const zoomResetAction = USE_X6 ? handleX6ZoomReset : onZoomReset;
  const displayZoom = USE_X6 ? x6Zoom : zoom;

  if (USE_X6) {
    return (
      <section className="flex-1 min-w-0 flex flex-col overflow-hidden relative" style={{ background: "var(--canvas-bg)" }} aria-label="Área de trabajo">
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2" style={{ zIndex: 5 }}>
          <div className="flex items-center gap-1 p-1 rounded-md border" style={{ background: "#252525", borderColor: "#333", boxShadow: "none" }}>
            <span className="px-2.5 py-1 text-xs font-mono rounded-sm border inline-flex items-center gap-1.5" style={{ background: "#1e1e1e", borderColor: "#333", color: "#aaa" }}>
              <span className="size-1.5 rounded-full" style={{ background: "#00979d" }} />
              {components.length} · {wires.length} cables
            </span>
            {pending && (
              <span className="px-2.5 py-1 text-xs font-mono rounded-sm border inline-flex items-center gap-1.5" style={{ background: "#2a2210", borderColor: "#f59e0b", color: "#f59e0b" }}>
                <span className="size-1.5 rounded-full bg-amber-500 animate-[pulse-subtle_1s_ease_infinite]" />
                CABLEANDO
              </span>
            )}
            <span className="w-px h-4 mx-1 hidden sm:block" style={{ background: "#333" }} />
            <button type="button" onClick={() => selectedId && onDuplicate(selectedId)} disabled={!hasSelection} className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs border border-transparent hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: "#bbb" }}>
              <Copy size={12} /> Duplicar
            </button>
            <button type="button" onClick={() => selectedId && onRotate(selectedId)} disabled={!hasSelection} className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs border border-transparent hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: "#bbb" }}>
              <RotateCw size={12} /> Rotar
            </button>
            <button type="button" onClick={() => selectedId && onRemove(selectedId)} disabled={!selectedId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs border disabled:opacity-30 disabled:cursor-not-allowed" style={{ background: selectedId ? "#3a1a1a" : "transparent", borderColor: selectedId ? "#5a2222" : "transparent", color: selectedId ? "#f87171" : "#777" }}>
              <Trash2 size={12} /> Eliminar
            </button>
            {pending && (
              <button type="button" onClick={onCancelWire} className="ml-1 px-2.5 py-1 rounded-sm text-xs font-medium border" style={{ background: "#1e1e1e", borderColor: "#333", color: "#ccc" }}>
                Esc · Cancelar
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-0.5 p-1 rounded-md border" style={{ background: "#252525", borderColor: "#333" }}>
            <button type="button" onClick={zoomOutAction} aria-label="Alejar" className="size-7 grid place-items-center rounded-sm hover:bg-[#333] border border-transparent" style={{ color: "#aaa" }}>
              <ZoomOut size={14} />
            </button>
            <button type="button" onClick={zoomResetAction} className="px-2.5 py-1 text-xs font-mono font-semibold rounded-sm border min-w-[52px] text-center" style={{ background: "#1e1e1e", borderColor: "#333", color: "#ccc" }}>
              {displayZoom}%
            </button>
            <button type="button" onClick={zoomInAction} aria-label="Acercar" className="size-7 grid place-items-center rounded-sm hover:bg-[#333] border border-transparent" style={{ color: "#aaa" }}>
              <ZoomIn size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col pt-[44px]">
          <GraphCanvas
            ref={graphHandleRef}
            onGraphReady={(g) => {
              handleX6Ready();
              const onScale = ({ sx }: { sx: number }) => setX6Zoom(Math.round(sx * 100));
              (g as unknown as { on: (ev: string, cb: (a: { sx: number }) => void) => void }).on("scale", onScale);
            }}
            onExternalDrop={handleX6Drop}
            selectedId={selectedId}
            onSelectionChange={handleX6Select}
            onNodeMove={handleX6Move}
            onNodeRemove={handleX6Remove}
            wires={wires}
            onWireConnect={handleWireConnect}
            onWireRemove={handleWireRemove}
            className="flex-1 min-h-0 relative overflow-hidden"
          />
          <p className="text-center text-[11px] py-2 font-mono shrink-0" style={{ color: "#777", background: "var(--canvas-bg)" }}>
            X6 · manhattan/rounded · Ctrl+rueda zoom · Alt+arrastrar pan
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 min-w-0 flex flex-col overflow-hidden relative" style={{ background: "var(--canvas-bg)" }} aria-label="Área de trabajo">
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2" style={{ zIndex: 5 }}>
        <div className="flex items-center gap-1 p-1 rounded-md border" style={{ background: "#252525", borderColor: "#333", boxShadow: "none" }}>
          <span className="px-2.5 py-1 text-xs font-mono rounded-sm border inline-flex items-center gap-1.5" style={{ background: "#1e1e1e", borderColor: "#333", color: "#aaa" }}>
            <span className="size-1.5 rounded-full" style={{ background: "#00979d" }} />
            {components.length} · {wires.length} cables
          </span>
          {pending && (
            <span className="px-2.5 py-1 text-xs font-mono rounded-sm border inline-flex items-center gap-1.5" style={{ background: "#2a2210", borderColor: "#f59e0b", color: "#f59e0b" }}>
              <span className="size-1.5 rounded-full bg-amber-500 animate-[pulse-subtle_1s_ease_infinite]" />
              CABLEANDO
            </span>
          )}
          <span className="w-px h-4 mx-1 hidden sm:block" style={{ background: "#333" }} />
          <button type="button" onClick={() => selectedId && onDuplicate(selectedId)} disabled={!hasSelection} className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs border border-transparent hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: "#bbb" }}>
            <Copy size={12} /> Duplicar
          </button>
          <button type="button" onClick={() => selectedId && onRotate(selectedId)} disabled={!hasSelection} className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs border border-transparent hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed" style={{ color: "#bbb" }}>
            <RotateCw size={12} /> Rotar
          </button>
          <button type="button" onClick={() => selectedId && onRemove(selectedId)} disabled={!selectedId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs border disabled:opacity-30 disabled:cursor-not-allowed" style={{ background: selectedId ? "#3a1a1a" : "transparent", borderColor: selectedId ? "#5a2222" : "transparent", color: selectedId ? "#f87171" : "#777" }}>
            <Trash2 size={12} /> Eliminar
          </button>
          {pending && (
            <button type="button" onClick={onCancelWire} className="ml-1 px-2.5 py-1 rounded-sm text-xs font-medium border" style={{ background: "#1e1e1e", borderColor: "#333", color: "#ccc" }}>
              Esc · Cancelar
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-0.5 p-1 rounded-md border" style={{ background: "#252525", borderColor: "#333" }}>
          <button type="button" onClick={zoomOutAction} aria-label="Alejar" className="size-7 grid place-items-center rounded-sm hover:bg-[#333] border border-transparent" style={{ color: "#aaa" }}>
            <ZoomOut size={14} />
          </button>
          <button type="button" onClick={zoomResetAction} className="px-2.5 py-1 text-xs font-mono font-semibold rounded-sm border min-w-[52px] text-center" style={{ background: "#1e1e1e", borderColor: "#333", color: "#ccc" }}>
            {displayZoom}%
          </button>
          <button type="button" onClick={zoomInAction} aria-label="Acercar" className="size-7 grid place-items-center rounded-sm hover:bg-[#333] border border-transparent" style={{ color: "#aaa" }}>
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onMouseMove={(e) => {
          if (pending) {
            const board = document.querySelector("[data-board]") as HTMLElement | null;
            if (board) {
              const br = board.getBoundingClientRect();
              setGhost({ x: (e.clientX - br.left) / (zoom / 100), y: (e.clientY - br.top) / (zoom / 100) });
            }
          }
        }}
        onClick={() => {
          if (pending) onCancelWire();
          else onSelect(null);
        }}
        className="flex-1 overflow-auto p-6 sm:p-8 pt-14 sm:pt-14"
      >
        <div
          data-board
          className="relative mx-auto rounded-sm overflow-hidden"
          style={{ width: 960, height: 560, background: "var(--canvas-board-bg)", border: "1px solid #333", transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          onClick={(e) => e.stopPropagation()}
        >
          <WiresLayer wires={wires} components={components} selectedId={selectedId} onSelect={onSelect} pendingFrom={pendingPos} ghostTo={ghost} pendingColor={pending?.color} />

          {components.length === 0 ? (
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center max-w-[420px] mx-4 px-6 py-6 rounded-sm border" style={{ background: "#2b2b2b", borderColor: "#333" }}>
                <p className="text-[13px] font-medium" style={{ color: "#e0e0e0" }}>Lienzo vacío — arrastra tu primer componente</p>
                <p className="text-xs leading-relaxed mt-1.5" style={{ color: "#888" }}>Coloca componentes y haz clic en sus pines para cablear.</p>
                <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-mono" style={{ background: "#1e1e1e", borderColor: "#333", color: "#888" }}>
                  <span className="size-1.5 rounded-full" style={{ background: "#00979d" }} /> Tip: clic en pin → clic en otro pin
                </div>
              </div>
            </div>
          ) : (
            components.map((c) => (
              <ComponentView
                key={c.instanceId}
                comp={c}
                selected={c.instanceId === selectedId}
                onSelect={() => onSelect(c.instanceId)}
                wiringActive={!!pending}
                onPinClick={(pinId) => onPinClick(c.instanceId, pinId)}
                onPointerDown={(e) => {
                  if (pending) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(c.instanceId);
                  const target = e.currentTarget as HTMLElement;
                  const rect = target.getBoundingClientRect();
                  dragRef.current = { id: c.instanceId, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
                  const onMoveP = (ev: PointerEvent) => {
                    if (!dragRef.current) return;
                    const board = document.querySelector("[data-board]") as HTMLElement | null;
                    if (!board) return;
                    const br = board.getBoundingClientRect();
                    const x = (ev.clientX - br.left - dragRef.current.offsetX) / (zoom / 100);
                    const y = (ev.clientY - br.top - dragRef.current.offsetY) / (zoom / 100);
                    onMove(dragRef.current.id, x, y);
                  };
                  const onUp = () => {
                    dragRef.current = null;
                    window.removeEventListener("pointermove", onMoveP);
                    window.removeEventListener("pointerup", onUp);
                  };
                  window.addEventListener("pointermove", onMoveP);
                  window.addEventListener("pointerup", onUp);
                }}
              />
            ))
          )}
        </div>

        <p className="text-center text-[11px] mt-3 font-mono" style={{ color: "#777" }}>Clic en pin → clic en otro pin para crear cable · Clic en cable para seleccionar · Esc cancela</p>
      </div>
    </section>
  );
}
