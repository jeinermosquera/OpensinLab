"use client";

import { useCallback, useReducer, useMemo, useState, useEffect } from "react";
import { createHistory, historyReducer } from "./history";
import type { CircuitState, PlacedComponent, WireEndpoint } from "./circuit";
import { uid, snap, nextWireColor, serialize, deserialize, CIRCUIT_STORAGE_KEY } from "./circuit";
import { toDiagramJSON, fromDiagramJSON } from "@/editor/graph/x6Adapters";
import { getDefinition } from "@/components/definitions";
import { isPowerShort } from "@/components/wokwiPins";

const initialCircuit: CircuitState = { components: [], wires: [], selectedId: null };

export type PendingWire = { from: WireEndpoint; color: string } | null;

export function useWorkbenchState() {
  const [history, dispatch] = useReducer(historyReducer, createHistory(initialCircuit));
  const circuit = history.present;
  const [pending, setPending] = useState<PendingWire>(null);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const setCircuit = useCallback((next: CircuitState) => dispatch({ type: "SET", next }), []);

  // ------- FASE 5 — serialización / persistencia -------
  const getCircuitJSON = useCallback(() => serialize(circuit), [circuit]);

  const loadCircuitJSON = useCallback(
    (json: string) => {
      const next = deserialize(json);
      setPending(null);
      setCircuit(next);
    },
    [setCircuit],
  );

  const exportWokwiDiagram = useCallback(() => JSON.stringify(toDiagramJSON(circuit), null, 2), [circuit]);

  const importWokwiDiagram = useCallback(
    (json: string) => {
      const next = fromDiagramJSON(json);
      setPending(null);
      setCircuit(next);
    },
    [setCircuit],
  );

  const saveToLocalStorage = useCallback(() => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(CIRCUIT_STORAGE_KEY, serialize(circuit));
    } catch {}
  }, [circuit]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      if (typeof window === "undefined") return false;
      const raw = window.localStorage.getItem(CIRCUIT_STORAGE_KEY);
      if (!raw) return false;
      const next = deserialize(raw);
      setPending(null);
      setCircuit(next);
      return true;
    } catch {
      return false;
    }
  }, [setCircuit]);

  // auto-restaura al montar (opcional, no rompe si no hay datos)
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(CIRCUIT_STORAGE_KEY);
      if (raw) {
        const next = deserialize(raw);
        // solo restaura si tiene contenido y el estado actual está vacío
        if ((next.components.length > 0 || next.wires.length > 0) && history.present.components.length === 0 && history.present.wires.length === 0) {
          dispatch({ type: "SET", next });
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto-guardado en cada cambio de circuito (throttle implícito por React)
  useEffect(() => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(CIRCUIT_STORAGE_KEY, serialize(circuit));
    } catch {}
  }, [circuit]);

  const addComponent = useCallback(
    (definitionId: string, x: number, y: number, instanceId?: string) => {
      const def = getDefinition(definitionId);
      if (!def) return;
      const comp: PlacedComponent = {
        instanceId: instanceId ?? uid(),
        definitionId,
        x: snap(x - def.width / 2),
        y: snap(y - def.height / 2),
        rotation: 0,
        props: { ...def.defaultProps },
      };
      setCircuit({ ...circuit, components: [...circuit.components, comp], selectedId: comp.instanceId });
    },
    [circuit, setCircuit],
  );

  // Fase 3: sync desde Graph (id ya generado por X6) — evita desalineación ids
  const addComponentWithId = useCallback(
    (instanceId: string, definitionId: string, x: number, y: number) => {
      addComponent(definitionId, x, y, instanceId);
    },
    [addComponent],
  );

  const select = useCallback((id: string | null) => setCircuit({ ...circuit, selectedId: id }), [circuit, setCircuit]);

  const move = useCallback(
    (id: string, x: number, y: number) =>
      setCircuit({
        ...circuit,
        components: circuit.components.map((c) => (c.instanceId === id ? { ...c, x: snap(x), y: snap(y) } : c)),
      }),
    [circuit, setCircuit],
  );

  const remove = useCallback(
    (id: string) => {
      // si es wire
      if (circuit.wires.some((w) => w.id === id)) {
        setCircuit({ ...circuit, wires: circuit.wires.filter((w) => w.id !== id), selectedId: circuit.selectedId === id ? null : circuit.selectedId });
        return;
      }
      setCircuit({
        components: circuit.components.filter((c) => c.instanceId !== id),
        wires: circuit.wires.filter((w) => w.from.instanceId !== id && w.to.instanceId !== id),
        selectedId: circuit.selectedId === id ? null : circuit.selectedId,
      });
    },
    [circuit, setCircuit],
  );

  const rotate = useCallback(
    (id: string) =>
      setCircuit({
        ...circuit,
        components: circuit.components.map((c) => (c.instanceId === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c)),
      }),
    [circuit, setCircuit],
  );

  const duplicate = useCallback(
    (id: string) => {
      const src = circuit.components.find((c) => c.instanceId === id);
      if (!src) return;
      const dup: PlacedComponent = { ...src, instanceId: uid(), x: src.x + 24, y: src.y + 24, props: { ...src.props } };
      setCircuit({ ...circuit, components: [...circuit.components, dup], selectedId: dup.instanceId });
    },
    [circuit, setCircuit],
  );

  const updateProp = useCallback(
    (id: string, key: string, value: string | number) =>
      setCircuit({
        ...circuit,
        components: circuit.components.map((c) => (c.instanceId === id ? { ...c, props: { ...c.props, [key]: value } } : c)),
      }),
    [circuit, setCircuit],
  );

  const clear = useCallback(() => {
    setPending(null);
    setCircuit({ components: [], wires: [], selectedId: null });
  }, [setCircuit]);

  const startWire = useCallback(
    (from: WireEndpoint) => {
      const color = nextWireColor(circuit.wires.length);
      setPending({ from, color });
      setCircuit({ ...circuit, selectedId: null });
    },
    [circuit, setCircuit],
  );

  const cancelWire = useCallback(() => setPending(null), []);

  const completeWire = useCallback(
    (to: WireEndpoint) => {
      if (!pending) return;
      // no conectar misma patilla consigo misma
      if (pending.from.instanceId === to.instanceId && pending.from.pinId === to.pinId) {
        setPending(null);
        return;
      }
      // evitar duplicado
      const exists = circuit.wires.some(
        (w) =>
          (w.from.instanceId === pending.from.instanceId && w.from.pinId === pending.from.pinId && w.to.instanceId === to.instanceId && w.to.pinId === to.pinId) ||
          (w.from.instanceId === to.instanceId && w.from.pinId === to.pinId && w.to.instanceId === pending.from.instanceId && w.to.pinId === pending.from.pinId),
      );
      if (exists) {
        setPending(null);
        return;
      }
      // validación librería: corto GND-VCC directo (usa signals de @wokwi/elements)
      const fromComp = circuit.components.find((c) => c.instanceId === pending.from.instanceId);
      const toComp = circuit.components.find((c) => c.instanceId === to.instanceId);
      if (fromComp && toComp && isPowerShort(fromComp.definitionId, pending.from.pinId, toComp.definitionId, to.pinId)) {
        // No bloquea cableado pero avisa — en Wokwi real sería warning; aquí permitimos pero log
        console.warn(`[wokwiPins] Posible corto GND↔VCC: ${fromComp.definitionId}:${pending.from.pinId} → ${toComp.definitionId}:${to.pinId}`);
        // opcional: abortar
        // setPending(null); return;
      }
      const wire = { id: uid(), from: pending.from, to, color: pending.color };
      setPending(null);
      setCircuit({ ...circuit, wires: [...circuit.wires, wire], selectedId: wire.id });
    },
    [circuit, pending, setCircuit],
  );

  const addWire = useCallback(
    (from: WireEndpoint, to: WireEndpoint, color?: string) => {
      // evita self-loop misma celda/pin
      if (from.instanceId === to.instanceId && from.pinId === to.pinId) return;
      if (from.instanceId === to.instanceId) return; // misma celda según tarea FASE4
      const exists = circuit.wires.some(
        (w) =>
          (w.from.instanceId === from.instanceId && w.from.pinId === from.pinId && w.to.instanceId === to.instanceId && w.to.pinId === to.pinId) ||
          (w.from.instanceId === to.instanceId && w.from.pinId === to.pinId && w.to.instanceId === from.instanceId && w.to.pinId === from.pinId),
      );
      if (exists) return;
      const wireColor = color ?? nextWireColor(circuit.wires.length);
      const wire = { id: uid(), from, to, color: wireColor };
      setCircuit({ ...circuit, wires: [...circuit.wires, wire], selectedId: wire.id });
    },
    [circuit, setCircuit],
  );

  const removeWire = useCallback(
    (wireId: string) => setCircuit({ ...circuit, wires: circuit.wires.filter((w) => w.id !== wireId), selectedId: circuit.selectedId === wireId ? null : circuit.selectedId }),
    [circuit, setCircuit],
  );

  const undo = useCallback(() => {
    setPending(null);
    dispatch({ type: "UNDO" });
  }, []);
  const redo = useCallback(() => {
    setPending(null);
    dispatch({ type: "REDO" });
  }, []);

  const selected = useMemo(() => circuit.components.find((c) => c.instanceId === circuit.selectedId) ?? null, [circuit]);
  const selectedWire = useMemo(() => circuit.wires.find((w) => w.id === circuit.selectedId) ?? null, [circuit]);

  return {
    circuit,
    selected,
    selectedWire,
    pending,
    canUndo,
    canRedo,
    addComponent,
    addComponentWithId,
    select,
    move,
    remove,
    rotate,
    duplicate,
    updateProp,
    clear,
    startWire,
    cancelWire,
    completeWire,
    addWire,
    removeWire,
    undo,
    redo,
    getCircuitJSON,
    loadCircuitJSON,
    exportWokwiDiagram,
    importWokwiDiagram,
    saveToLocalStorage,
    loadFromLocalStorage,
  };
}

export type WorkbenchState = ReturnType<typeof useWorkbenchState>;
