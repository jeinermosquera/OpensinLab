"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from "react";
import { Graph, Edge, Node, Cell } from "@antv/x6";
import { Selection } from "@antv/x6";
import { Snapline } from "@antv/x6";
import { registerWokwiNodes } from "./registerNodes";
import { getX6Ports } from "./ports";
import { DEFAULT_EDGE_CONFIG } from "./edges";
import { uid, snap, nextWireColor } from "@/core/state/circuit";
import type { Wire, WireEndpoint } from "@/core/state/circuit";
import { getDefinition } from "@/components/definitions";

export type GraphCanvasHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  getGraph: () => Graph | null;
  addTestNode: (x: number, y: number, label?: string) => void;
  getZoomPercent: () => number;
};

type Props = {
  onGraphReady?: (graph: Graph) => void;
  /** Called when an external drag payload is dropped onto the canvas. Fourth param nodeId is X6 id generated (Fase3). */
  onExternalDrop?: (definitionId: string, x: number, y: number, nodeId?: string) => void;
  selectedId?: string | null;
  onSelectionChange?: (id: string | null) => void;
  onNodeMove?: (id: string, x: number, y: number) => void;
  onNodeRemove?: (id: string) => void;
  wires?: Wire[];
  onWireConnect?: (payload: { from: WireEndpoint; to: WireEndpoint; color: string }) => void;
  onWireRemove?: (id: string) => void;
  className?: string;
};

/**
 * GraphCanvas — wrapper client-only alrededor de AntV X6.
 * Fase 3: registra 'wokwi-node' (html), crea nodos con shape wokwi-node + ports via getX6Ports,
 * sync bidireccional via graph events para selección y posición, mantiene useWorkbenchState como fuente.
 */
const GraphCanvas = forwardRef<GraphCanvasHandle, Props>(function GraphCanvas(
  { onGraphReady, onExternalDrop, selectedId, onSelectionChange, onNodeMove, onNodeRemove, wires, onWireConnect, onWireRemove, className },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [zoom, setZoom] = useState(100);
  const wiresRef = useRef<Wire[]>(wires ?? []);
  useEffect(() => {
    wiresRef.current = wires ?? [];
  }, [wires]);

  const zoomIn = useCallback(() => {
    const g = graphRef.current;
    if (!g) return;
    const z = g.zoom(0.1);
    const s = g.zoom();
    if (typeof s === "number") setZoom(Math.round(s * 100));
    else setZoom((v) => Math.min(200, v + 10));
    void z;
  }, []);

  const zoomOut = useCallback(() => {
    const g = graphRef.current;
    if (!g) return;
    const z = g.zoom(-0.1);
    const s = g.zoom();
    if (typeof s === "number") setZoom(Math.round(s * 100));
    else setZoom((v) => Math.max(50, v - 10));
    void z;
  }, []);

  const zoomReset = useCallback(() => {
    const g = graphRef.current;
    if (!g) return;
    g.zoomTo(1);
    g.centerContent();
    setZoom(100);
  }, []);

  const addTestNode = useCallback((x: number, y: number, label = "TEST") => {
    const g = graphRef.current;
    if (!g) return;
    g.addNode({
      x: x - 50,
      y: y - 20,
      width: 100,
      height: 40,
      label,
      attrs: {
        body: { fill: "#252525", stroke: "#333", strokeWidth: 1, rx: 4, ry: 4 },
        label: { fill: "#e0e0e0", fontSize: 12, fontFamily: "JetBrains Mono, monospace" },
      },
      ports: {
        groups: {
          in: { position: "left", attrs: { circle: { r: 4, magnet: true, stroke: "#0d9488", fill: "#1e1e1e", strokeWidth: 1.5 } } },
          out: { position: "right", attrs: { circle: { r: 4, magnet: true, stroke: "#0d9488", fill: "#1e1e1e", strokeWidth: 1.5 } } },
        },
        items: [
          { id: "in-1", group: "in" },
          { id: "out-1", group: "out" },
        ],
      },
    });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      zoomIn,
      zoomOut,
      zoomReset,
      getGraph: () => graphRef.current,
      addTestNode,
      getZoomPercent: () => zoom,
    }),
    [zoom, zoomIn, zoomOut, zoomReset, addTestNode],
  );

  useEffect(() => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !wrapper) return;
    if (graphRef.current) return;

    // Fase 3: registrar shape html wokwi-node antes de crear graph
    try {
      registerWokwiNodes();
    } catch {
      // noop
    }

    const graph = new Graph({
      container,
      autoResize: container,
      width: wrapper.clientWidth || 960,
      height: wrapper.clientHeight || 560,
      background: { color: "#37373d" },
      grid: { size: 24, visible: true, type: "mesh", args: { color: "#2a2a2a", thickness: 1 } },
      panning: { enabled: true, eventTypes: ["leftMouseDown"], modifiers: "alt" },
      mousewheel: { enabled: true, modifiers: "ctrl", minScale: 0.5, maxScale: 2, factor: 1.1 },
      highlighting: {
        magnetAdsorbed: { name: "stroke", args: { attrs: { fill: "#fff", stroke: "#0d9488", strokeWidth: 2 } } },
      },
      connecting: {
        allowBlank: false,
        allowLoop: false,
        allowNode: false,
        allowEdge: false,
        snap: { radius: 12 },
        highlight: true,
        validateConnection(args) {
          const src = args.sourceCell as unknown as string | { id?: string } | null;
          const tgt = args.targetCell as unknown as string | { id?: string } | null;
          const srcId = typeof src === "string" ? src : (src as { id?: string } | null)?.id ?? null;
          const tgtId = typeof tgt === "string" ? tgt : (tgt as { id?: string } | null)?.id ?? null;
          const srcPort = (args.sourcePort as string | null) ?? null;
          const tgtPort = (args.targetPort as string | null) ?? null;
          if (!srcId || !tgtId || !srcPort || !tgtPort) return false;
          // evita self-loop misma celda (aunque sean puertos distintos, según tarea se prohíbe)
          if (srcId === tgtId) return false;
          // evita duplicados bidireccionales consultando wires actuales
          const wiresNow = wiresRef.current;
          const dup = wiresNow.some(
            (w) =>
              (w.from.instanceId === srcId && w.from.pinId === srcPort && w.to.instanceId === tgtId && w.to.pinId === tgtPort) ||
              (w.from.instanceId === tgtId && w.from.pinId === tgtPort && w.to.instanceId === srcId && w.to.pinId === srcPort),
          );
          if (dup) return false;
          return true;
        },
        createEdge() {
          const color = nextWireColor(wiresRef.current.length);
          return new Edge({
            attrs: { line: { ...DEFAULT_EDGE_CONFIG.attrs.line, stroke: color } } as unknown as Record<string, unknown>,
            router: DEFAULT_EDGE_CONFIG.router as unknown as Record<string, unknown>,
            connector: DEFAULT_EDGE_CONFIG.connector as unknown as Record<string, unknown>,
            zIndex: 0,
          });
        },
      },
      interacting: { nodeMovable: true, edgeMovable: false, edgeLabelMovable: false, arrowheadMovable: false },
    });

    try {
      graph.use(new Selection({ enabled: true, rubberband: true, showNodeSelectionBox: true, multiple: true }));
    } catch {}
    try {
      graph.use(new Snapline({ enabled: true, sharp: true, tolerance: 6 }));
    } catch {}

    graphRef.current = graph;

    const onScale = ({ sx }: { sx: number }) => setZoom(Math.round(sx * 100));
    (graph as unknown as { on: (ev: string, cb: (args: { sx: number }) => void) => void }).on("scale", onScale);

    // Bidireccional: graph -> useWorkbenchState (selección / posición / borrado / cableado)
    const handleNodeSelected = ({ node }: { node: Node }) => {
      onSelectionChange?.(node.id);
    };
    const handleSelectionChanged = ({ selected }: { selected: Cell[] }) => {
      if (selected.length === 1) {
        const c = selected[0] as unknown as { id: string; isNode?: () => boolean; isEdge?: () => boolean };
        onSelectionChange?.(c.id);
      } else if (selected.length === 0) {
        onSelectionChange?.(null);
      }
    };
    const handleBlankClick = () => onSelectionChange?.(null);
    const handlePosition = ({ node }: { node: Node }) => {
      const pos = node.getPosition();
      // snap alineado a grid 24 para coherencia con circuit.snap; X6 mueve edges automáticamente
      onNodeMove?.(node.id, snap(pos.x), snap(pos.y));
    };
    const handleRemoved = ({ node }: { node: Node }) => {
      onNodeRemove?.(node.id);
    };
    const handleEdgeConnected = ({ edge }: { edge: Edge }) => {
      try {
        const src = edge.getSource() as unknown as { cell?: string; port?: string };
        const tgt = edge.getTarget() as unknown as { cell?: string; port?: string };
        const srcCell = src?.cell;
        const srcPort = src?.port;
        const tgtCell = tgt?.cell;
        const tgtPort = tgt?.port;
        if (!srcCell || !srcPort || !tgtCell || !tgtPort) {
          // conexión incompleta → eliminar edge fantasma
          try { edge.remove(); } catch {}
          return;
        }
        const color = (edge.attr("line/stroke") as unknown as string) || nextWireColor(wiresRef.current.length);
        // asegurar attrs coloreados consistentes con DEFAULT_EDGE_CONFIG
        try {
          edge.setAttrByPath("line/stroke", color);
          edge.setAttrByPath("line/strokeWidth", 2.8);
        } catch {}
        // evita duplicado post-validate (carrera X6)
        const dup = wiresRef.current.some(
          (w) =>
            (w.from.instanceId === srcCell && w.from.pinId === srcPort && w.to.instanceId === tgtCell && w.to.pinId === tgtPort) ||
            (w.from.instanceId === tgtCell && w.from.pinId === tgtPort && w.to.instanceId === srcCell && w.to.pinId === srcPort),
        );
        if (dup) {
          try { edge.remove(); } catch {}
          return;
        }
        // valida self-loop
        if (srcCell === tgtCell) {
          try { edge.remove(); } catch {}
          return;
        }
        // delega al estado: WorkspaceCanvas -> useWorkbenchState.addWire
        // edge ya añadido a graph con id temporal; Workspace sync reemplazará id si difiere
        onWireConnect?.({ from: { instanceId: srcCell, pinId: srcPort }, to: { instanceId: tgtCell, pinId: tgtPort }, color });
        // remueve edge temporal para que sync de wires lo recree con id del Wire oficial
        // Se mantiene si el caller desea conservarlo; por defecto lo dejamos para que sync dedupe
        // Si wires sync crea edge con id Wire, este temporal quedará huérfano → lo eliminamos
        setTimeout(() => {
          try {
            const wiresNow = wiresRef.current;
            const stillDupTemp = !wiresNow.some((w) => w.id === edge.id);
            // si edge.id no corresponde a ningún wire oficial, lo removemos para que sync lo regenere
            if (stillDupTemp) {
              const src2 = edge.getSource() as unknown as { cell?: string; port?: string };
              const tgt2 = edge.getTarget() as unknown as { cell?: string; port?: string };
              const dup2 = wiresNow.some(
                (w) =>
                  (w.from.instanceId === src2?.cell && w.from.pinId === src2?.port && w.to.instanceId === tgt2?.cell && w.to.pinId === tgt2?.port) ||
                  (w.from.instanceId === tgt2?.cell && w.from.pinId === tgt2?.port && w.to.instanceId === src2?.cell && w.to.pinId === src2?.port),
              );
              if (dup2) {
                try { edge.remove(); } catch {}
              }
            }
          } catch {}
        }, 0);
      } catch (err) {
        console.warn("[GraphCanvas] edge:connected handler error", err);
      }
    };
    const handleEdgeClick = ({ edge }: { edge: Edge }) => {
      onSelectionChange?.(edge.id as string);
    };
    const handleEdgeMouseEnter = ({ edge }: { edge: Edge }) => {
      try {
        edge.attr("line/strokeWidth", 4);
        // highlight sutil via shadow
        (edge as unknown as { addTools?: (o: unknown) => void }).addTools?.({ name: "boundary", args: { padding: 6, attrs: { fill: "rgba(13,148,136,0.08)", stroke: "#0d9488", strokeWidth: 1 } } });
      } catch {}
    };
    const handleEdgeMouseLeave = ({ edge }: { edge: Edge }) => {
      try {
        edge.attr("line/strokeWidth", 2.8);
        (edge as unknown as { removeTools?: () => void }).removeTools?.();
      } catch {}
    };
    const handleEdgeRemoved = ({ edge }: { edge: Edge }) => {
      const eid = (edge as unknown as { id: string }).id;
      if (eid) onWireRemove?.(eid);
    };

    // X6 eventos casteados para evitar tipado estricto
    const gAny = graph as unknown as { on: (ev: string, cb: (...args: unknown[]) => void) => void; off: (ev: string, cb: (...args: unknown[]) => void) => void };
    gAny.on("node:selected", handleNodeSelected as (...args: unknown[]) => void);
    gAny.on("selection:changed", handleSelectionChanged as (...args: unknown[]) => void);
    gAny.on("blank:click", handleBlankClick as (...args: unknown[]) => void);
    gAny.on("node:change:position", handlePosition as (...args: unknown[]) => void);
    gAny.on("node:removed", handleRemoved as (...args: unknown[]) => void);
    gAny.on("edge:connected", handleEdgeConnected as (...args: unknown[]) => void);
    gAny.on("edge:click", handleEdgeClick as (...args: unknown[]) => void);
    gAny.on("edge:mouseenter", handleEdgeMouseEnter as (...args: unknown[]) => void);
    gAny.on("edge:mouseleave", handleEdgeMouseLeave as (...args: unknown[]) => void);
    gAny.on("edge:removed", handleEdgeRemoved as (...args: unknown[]) => void);

    const ro = new ResizeObserver(() => {
      if (!wrapper || !graph) return;
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      if (w && h) graph.resize(w, h);
    });
    ro.observe(wrapper);

    onGraphReady?.(graph);

    return () => {
      ro.disconnect();
      (graph as unknown as { off: (ev: string, cb: (args: { sx: number }) => void) => void }).off("scale", onScale);
      gAny.off("node:selected", handleNodeSelected as (...args: unknown[]) => void);
      gAny.off("selection:changed", handleSelectionChanged as (...args: unknown[]) => void);
      gAny.off("blank:click", handleBlankClick as (...args: unknown[]) => void);
      gAny.off("node:change:position", handlePosition as (...args: unknown[]) => void);
      gAny.off("node:removed", handleRemoved as (...args: unknown[]) => void);
      gAny.off("edge:connected", handleEdgeConnected as (...args: unknown[]) => void);
      gAny.off("edge:click", handleEdgeClick as (...args: unknown[]) => void);
      gAny.off("edge:mouseenter", handleEdgeMouseEnter as (...args: unknown[]) => void);
      gAny.off("edge:mouseleave", handleEdgeMouseLeave as (...args: unknown[]) => void);
      gAny.off("edge:removed", handleEdgeRemoved as (...args: unknown[]) => void);
      graph.dispose();
      graphRef.current = null;
    };
  }, [onGraphReady, onSelectionChange, onNodeMove, onNodeRemove, onWireConnect, onWireRemove]);

  // Sincroniza selección externa (circuit.selectedId) -> graph selection
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    // evitar loop: solo si difiere
    try {
      const selected = graph.getSelectedCells() as unknown as { id: string }[];
      const currentId = selected.length === 1 ? selected[0].id : null;
      if (currentId === (selectedId ?? null)) return;
      graph.cleanSelection();
      if (selectedId) {
        const cell = graph.getCellById(selectedId);
        if (cell) graph.select(cell);
      }
    } catch {}
  }, [selectedId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const definitionId = e.dataTransfer.getData("text/plain");
      if (!definitionId) return;
      const graph = graphRef.current;
      if (!graph) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      let local: { x: number; y: number };
      try {
        const maybe = graph as unknown as { clientToLocal?: (x: number, y: number) => { x: number; y: number } };
        local = typeof maybe.clientToLocal === "function" ? maybe.clientToLocal(clientX, clientY) : { x: clientX, y: clientY };
      } catch {
        local = { x: clientX, y: clientY };
      }

      const def = getDefinition(definitionId);
      if (!def) {
        // fallback test node para ids desconocidos
        addTestNode(local.x, local.y, definitionId.slice(0, 10).toUpperCase());
        return;
      }

      // Fase 3: crea X6 Node con shape wokwi-node + ports precisos
      const id = uid();
      const ports = getX6Ports(def);
      const x = snap(local.x - def.width / 2);
      const y = snap(local.y - def.height / 2);
      try {
        graph.addNode({
          id,
          shape: "wokwi-node",
          x,
          y,
          width: def.width,
          height: def.height,
          data: { definitionId, props: { ...def.defaultProps } },
          ports: ports as unknown as Record<string, unknown>,
          zIndex: 1,
        });
      } catch (err) {
        console.error("[GraphCanvas] addNode wokwi-node fallo", err);
        // fallback rect
        addTestNode(local.x, local.y, definitionId.slice(0, 8).toUpperCase());
        return;
      }

      // Notifica al padre para sync a useWorkbenchState con mismo id (evita duplicado)
      if (onExternalDrop) {
        // intenta pasar nodeId como 4º param; si el handler ignora, igual crea segundo comp pero sync effect dedup
        try {
          (onExternalDrop as unknown as (id: string, x: number, y: number, nid: string) => void)(definitionId, x, y, id);
        } catch {
          onExternalDrop(definitionId, x, y);
        }
      }
    },
    [onExternalDrop, addTestNode],
  );

  return (
    <div ref={wrapperRef} className={className ?? "flex-1 min-w-0 min-h-0 relative overflow-hidden"} style={{ background: "var(--canvas-bg, #37373d)" }} aria-label="Lienzo X6">
      <div ref={containerRef} className="absolute inset-0" style={{ touchAction: "none" }} onDragOver={handleDragOver} onDrop={handleDrop} />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="hidden text-[11px] font-mono px-2 py-1 rounded-sm border" style={{ color: "#777", borderColor: "#333", background: "#2b2b2b" }}>
          X6 activo · Ctrl+rueda zoom · Alt+arrastrar pan
        </span>
      </div>
    </div>
  );
});

export default GraphCanvas;
export { GraphCanvas };
