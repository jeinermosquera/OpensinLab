# Sesión 02 — Componentes Interactivos + Estado de Escena

**Estado:** ✅ Completada — 2026-08-31
**Objetivo:** Permitir colocar, mover, seleccionar, rotar, duplicar y eliminar componentes en el lienzo con estado persistente en memoria, panel de propiedades conectado y undo/redo. Sin simulación eléctrica.

## Qué se hizo

- Modelo: `core/state/circuit.ts` (`PlacedComponent`, `CircuitState`, `uid`, `snap` 24px) + `core/state/history.ts` (past/present/future, MAX 50) + `core/state/useWorkbenchState.ts` (add/select/move/remove/rotate/duplicate/updateProp/clear/undo/redo).
- Registry visual: `components/definitions.ts` con 10 definiciones (LED, resistencia, capacitor, pulsador, UNO, ESP32, DHT22, HC-SR04, servo, protoboard) — extensible sin modificar lógica.
- Vista: `components/ComponentView.tsx` (absolute, pins visuales, selección ring, rotación CSS).
- `editor/ComponentsPanel.tsx`: items `draggable` (dataTransfer id) + click para añadir al centro, filtro categorías/búsqueda.
- `editor/WorkspaceCanvas.tsx`: drop al board (coords compensadas por zoom), render lista `ComponentView`, pointer drag para mover, toolbar duplicar/rotar/eliminar, coords hover, empty state.
- `editor/PropertiesPanel.tsx`: si hay selección muestra icon/nombre, x/y/rot read-only, botones rotar/duplicar/eliminar, inputs editables para `props`; si no, empty state; footer contador.
- `editor/TopBar.tsx`: `canUndo/canRedo` conectados, limpiar, contador, atajos visibles.
- `editor/StatusBar.tsx`: zoom + contador + selección + hint atajos.
- `editor/Workbench.tsx`: integra `useWorkbenchState`, maneja zoom/drawers, atajos Ctrl+Z/Y, Delete, Escape, `handleAddAtCenter`.
- Docs: `architecture.md` actualizado a S02.

## Qué funciona

- Arrastrar desde panel al lienzo o hacer clic para colocar en centro (480,280) con snap.
- Selección (click), mover (arrastre pointer con snap), rotar 90°, duplicar, eliminar (botón/Del), limpiar escena.
- Propiedades editables en tiempo real (ej: resistencia “1kΩ” → “10kΩ”).
- Undo/redo (Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y) con historial 50.
- Zoom ±10% (50-200%), coords hover, responsive drawers, sin simulación.

## Qué NO se implementó (prohibiciones S02)

- Simulación eléctrica, voltajes/corrientes, física.
- Cableado/nodos funcionales entre pines.
- Ejecución Arduino/ESP32, compilador, debugger, instrumentos.
- Persistencia backend/localStorage avanzada (estado solo en memoria, “Limpiar” resetea).
- Paneles redimensionables drag, minimapa.
- Batch de history en drag (cada pixel genera entrada — mejora futura).

## Arquitectura

- `core/state` separado de UI; `historyReducer` puro; `definitions.ts` OCP.
- Workbench como composición; sin librería DnD externa (HTML5 drag + pointer events).

## Archivos modificados

- `apps/web/src/editor/Workbench.tsx`, `ComponentsPanel.tsx`, `WorkspaceCanvas.tsx`, `PropertiesPanel.tsx`, `TopBar.tsx`, `StatusBar.tsx`
- `docs/architecture.md`

## Archivos creados

- `apps/web/src/components/definitions.ts`
- `apps/web/src/components/ComponentView.tsx`
- `apps/web/src/core/state/circuit.ts`
- `apps/web/src/core/state/history.ts`
- `apps/web/src/core/state/useWorkbenchState.ts`
- `docs/sessions/session-02.md`

## Pruebas

- `tsc --noEmit` — sin errores
- `npm run build:web` — ✓ Compiled 3.7s, / 7.5kB
- `npm --workspace=apps/web run lint` — No warnings
- Manual: drag&drop, click-to-add, mover, rotar, duplicar, eliminar, undo/redo, edición props, responsive, Del/Escape, zoom.

## Cómo probar

```bash
cd opensimlab
npm install
npm run dev:web
# http://localhost:3000
```

1. Arrastra “LED” al lienzo o clic en “+” → aparece centrado.
2. Selecciona → panel derecho muestra props → edita valor.
3. Arrastra para mover (snap 24px), botones rotar/duplicar/eliminar.
4. Ctrl+Z / Ctrl+Y para undo/redo, Del para eliminar, Esc para deseleccionar.
5. Zoom +/− y coords hover.

## Pendiente

- Cableado, simulación, persistencia, paneles redimensionables, optimizar history batch.

## Checklist

- [x] Modelo escena + registry
- [x] Drag&drop + click-to-add
- [x] Selección/mover/rotar/duplicar/eliminar
- [x] Props conectadas
- [x] Undo/redo + atajos
- [x] Docs actualizadas
- [x] Sin errores, sin simulación
