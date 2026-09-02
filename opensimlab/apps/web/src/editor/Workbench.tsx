"use client";

import { useEffect, useState } from "react";
import { TopBar } from "./TopBar";
import { ComponentsPanel } from "./ComponentsPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { WorkspaceCanvas } from "./WorkspaceCanvas";
import { StatusBar } from "./StatusBar";
import { useWorkbenchState } from "@/core/state/useWorkbenchState";

export function Workbench() {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [drawerLeft, setDrawerLeft] = useState(false);
  const [drawerRight, setDrawerRight] = useState(false);
  const [zoom, setZoom] = useState(100);
  const wb = useWorkbenchState();

  const handleSave = () => {
    try {
      const json = wb.getCircuitJSON();
      wb.saveToLocalStorage();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "circuito-opensimlab.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("[Workbench] Guardar fallo", e);
    }
  };

  const handleLoadFile = async (file: File) => {
    try {
      const text = await file.text();
      // intenta CircuitState primero, si falla intenta Diagram Wokwi-like
      try {
        wb.loadCircuitJSON(text);
      } catch {
        wb.importWokwiDiagram(text);
      }
    } catch (e) {
      console.error("[Workbench] Cargar fallo", e);
      alert("No se pudo cargar el circuito: formato inválido");
    }
  };

  const zoomIn = () => setZoom((z) => Math.min(200, z + 10));
  const zoomOut = () => setZoom((z) => Math.max(50, z - 10));
  const zoomReset = () => setZoom(100);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) wb.redo();
        else wb.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        wb.redo();
      } else if (e.key === "Delete") {
        if (wb.circuit.selectedId) wb.remove(wb.circuit.selectedId);
      } else if (e.key === "Escape") {
        if (wb.pending) wb.cancelWire();
        else wb.select(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wb.circuit.selectedId, wb.pending]);

  const handleAddAtCenter = (id: string) => wb.addComponent(id, 480, 280);

  const handlePinClick = (instanceId: string, pinId: string) => {
    if (!wb.pending) wb.startWire({ instanceId, pinId });
    else wb.completeWire({ instanceId, pinId });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--color-bg)" }}>
      <TopBar
        onToggleLeft={() => {
          if (typeof window !== "undefined" && window.innerWidth < 1024) setDrawerLeft((v) => !v);
          else setLeftCollapsed((v) => !v);
        }}
        onToggleRight={() => {
          if (typeof window !== "undefined" && window.innerWidth < 1024) setDrawerRight((v) => !v);
          else setRightCollapsed((v) => !v);
        }}
        canUndo={wb.canUndo}
        canRedo={wb.canRedo}
        onUndo={wb.undo}
        onRedo={wb.redo}
        onClear={wb.clear}
        count={wb.circuit.components.length}
        wireCount={wb.circuit.wires.length}
        onSave={handleSave}
        onLoadFile={handleLoadFile}
      />

      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden relative">
        <div className="hidden lg:flex shrink-0">
          <ComponentsPanel collapsed={leftCollapsed} onCollapse={() => setLeftCollapsed((v) => !v)} onAdd={handleAddAtCenter} />
        </div>

        <WorkspaceCanvas
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomReset={zoomReset}
          components={wb.circuit.components}
          wires={wb.circuit.wires}
          selectedId={wb.circuit.selectedId}
          pending={wb.pending}
          onAdd={wb.addComponent}
          onSelect={wb.select}
          onMove={wb.move}
          onRemove={wb.remove}
          onRotate={wb.rotate}
          onDuplicate={wb.duplicate}
          onPinClick={handlePinClick}
          onCancelWire={wb.cancelWire}
          onWireConnect={({ from, to, color }) => wb.addWire(from, to, color)}
          onWireRemove={(id) => wb.removeWire(id)}
        />

        <div className="hidden lg:flex shrink-0">
          <PropertiesPanel
            collapsed={rightCollapsed}
            onCollapse={() => setRightCollapsed((v) => !v)}
            selected={wb.selected}
            selectedWire={wb.selectedWire}
            total={wb.circuit.components.length}
            wireTotal={wb.circuit.wires.length}
            onUpdateProp={wb.updateProp}
            onRotate={wb.rotate}
            onDuplicate={wb.duplicate}
            onRemove={wb.remove}
          />
        </div>

        {drawerLeft && (
          <>
            <button type="button" aria-label="Cerrar" onClick={() => setDrawerLeft(false)} className="absolute inset-0 z-10" style={{ background: "rgb(15 23 42 / 0.35)", backdropFilter: "blur(2px)" }} />
            <div className="absolute inset-y-0 left-0 flex z-20 shadow-lg" style={{ zIndex: "var(--z-drawer)" }}>
              <ComponentsPanel collapsed={false} onCollapse={() => setDrawerLeft(false)} onAdd={(id) => { handleAddAtCenter(id); setDrawerLeft(false); }} />
            </div>
          </>
        )}
        {drawerRight && (
          <>
            <button type="button" aria-label="Cerrar" onClick={() => setDrawerRight(false)} className="absolute inset-0 z-10" style={{ background: "rgb(15 23 42 / 0.35)", backdropFilter: "blur(2px)" }} />
            <div className="absolute inset-y-0 right-0 flex z-20 shadow-lg" style={{ zIndex: "var(--z-drawer)" }}>
              <PropertiesPanel
                collapsed={false}
                onCollapse={() => setDrawerRight(false)}
                selected={wb.selected}
                selectedWire={wb.selectedWire}
                total={wb.circuit.components.length}
                wireTotal={wb.circuit.wires.length}
                onUpdateProp={wb.updateProp}
                onRotate={wb.rotate}
                onDuplicate={wb.duplicate}
                onRemove={wb.remove}
              />
            </div>
          </>
        )}
      </div>

      <StatusBar zoom={zoom} count={wb.circuit.components.length} wireCount={wb.circuit.wires.length} selected={wb.circuit.selectedId} pending={!!wb.pending} />
    </div>
  );
}
