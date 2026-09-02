# Architecture Overview

## Sistema

OpenSimLab es un monorepo con separación clara entre frontend, backend y paquetes compartidos. Sesión 01: mesa visual. Sesión 02: escena interactiva sin simulación.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│    API      │────▶│  Database   │
│  (Next.js)   │     │  (FastAPI)  │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
                            │
                     ┌──────┴──────┐
                     │   Shared    │
                     │   Packages  │
                     └─────────────┘
```

## Frontend — apps/web

### Stack
- Next.js 15 (App Router) + TypeScript strict + Tailwind CSS 4 + Monaco Editor (reservado)
- Sin librerías externas de estado (React useReducer + history custom)

### Estructura Sesión 02-05

```
apps/web/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── editor/
│   ├── Workbench.tsx         # Orquestador + atajos + estado zoom/drawers + Guardar/Cargar (FASE5)
│   ├── TopBar.tsx            # Undo/redo, Guardar/Cargar, limpiar, contador
│   ├── ComponentsPanel.tsx   # Drag&drop + click-to-add, filtro categorías
│   ├── WorkspaceCanvas.tsx   # X6 GraphCanvas + sync state↔graph, drop, zoom
│   ├── PropertiesPanel.tsx   # Edición selección (x/y/rot/props, rotar/duplicar/eliminar)
│   ├── StatusBar.tsx         # Zoom, contador, selección
│   └── graph/
│       ├── GraphCanvas.tsx   # Wrapper X6 (panning, grid, snap, edges manhattan)
│       ├── x6Adapters.ts     # FASE5: toX6JSON/fromX6JSON + toDiagramJSON/fromDiagramJSON + serialize helpers
│       ├── ports.ts          # Puertos X6 desde definitions
│       ├── edges.ts          # DEFAULT_EDGE_CONFIG (manhattan/rounded)
│       └── registerNodes.ts  # Shape wokwi-node
├── components/
│   ├── definitions.ts        # Registry 10 definiciones (id, icon, size, pins, defaultProps)
│   └── ComponentView.tsx     # Vista legacy (fallback)
└── core/state/
    ├── circuit.ts            # FASE5: Circuit/CircuitState + helpers puros (createCircuit, add/remove, serialize/deserialize, validate)
    ├── history.ts            # HistoryState + reducer (MAX 50, UNDO/REDO/SET)
    └── useWorkbenchState.ts  # Hook + FASE5: getCircuitJSON/loadCircuitJSON, exportWokwiDiagram/importWokwiDiagram, localStorage
```

### Principios aplicados
- **SRP**: definitions solo datos; history solo undo/redo; ComponentView solo render; circuit solo modelo.
- **OCP**: añadir componente = nueva entrada en `COMPONENT_DEFINITIONS` sin tocar lógica.
- **Composición**: `Workbench` compone paneles + canvas + estado.
- **Separación Datos vs Visual (FASE5)**: `core/state/circuit.ts` es fuente de verdad serializable (CircuitState: {components,wires,selectedId}) sin dependencia de X6; `editor/graph/x6Adapters.ts` adapta Circuit↔X6 JSON y Circuit↔Diagram (Wokwi-like). X6 solo renderiza; coordenadas x/y/rotation viven en el modelo. Persistencia opcional via localStorage key `opensimlab-circuit` + descarga JSON; load hace SET (compatible undo/redo).
- **YAGNI**: sin librería DnD externa (HTML5 drag), sin canvas 2D, sin simulación.

### Flujo Sesión 02
1. Usuario arrastra item (dataTransfer `definitionId`) o click → `Workbench.addComponent` crea `PlacedComponent` con `snap` 24px, selecciona.
2. `WorkspaceCanvas` drop calcula coords relativas al board (compensando zoom) → `addComponent`.
3. `ComponentView` pointerdown → drag mueve vía `onMove` (snap), click selecciona.
4. `PropertiesPanel` edita `props`, rota/duplica/elimina; `TopBar`/`StatusBar` reflejan estado; undo/redo via `historyReducer`.

### Layout
- Desktop `280px 1fr 300px` + header 52px + status 28px; tablet rail+drawer; móvil drawer+backdrop; `min-width:0` evita overflow.

### Design Tokens
En `globals.css` como CSS variables (bg/surface/border/brand/accent...).

## Backend — apps/api

Sin cambios S02. Reservado para persistencia futura.

## Shared Packages

Reservados; definiciones viven ahora en `apps/web/src/components/definitions.ts` y migrarán a `packages/component-definitions` en sesión futura.

## Convenciones

- `/api/` prefix, TS strict, PEP8, workspace protocol.

## Evolución

Arquitectura objetivo progresiva (ver AGENTS.md). S02 añade capa `core/state` + `components/` sin reescribir S01.

## Decisiones Sesión 02-05

- HTML5 drag + pointer events nativos, no `react-dnd` (peso innecesario).
- History lineal con 50 pasos; cada mutación clona estado (JSON compare evita duplicados).
- `snap` 24px alineado al grid; zoom compensa coords dividiendo por `zoom/100`.
- Drag move genera entradas de historial por movimiento (mejora futura: batch al pointerup).
- **FASE5 — Modelo serializable separado de visual**: helpers puros `createCircuit/addComponentToCircuit/removeComponent/addConnection/removeConnection/getConnectionsForComponent/validateCircuit/serialize/deserialize` en `circuit.ts` (sin X6, sin React, inmutables). Adapters `toX6JSON/fromX6JSON` mantienen X6 como vista; `toDiagramJSON/fromDiagramJSON` expone formato Wokwi-like `{components:[{id,type,x,y,props}], connections:[{from,to}]}` donde from/to es `"instanceId:pinId"`. `useWorkbenchState` expone `getCircuitJSON/loadCircuitJSON/exportWokwiDiagram/importWokwiDiagram` + auto-guardado en `localStorage` (`opensimlab-circuit`) y restauración al montar; `load` usa dispatch SET para mantener undo/redo. TopBar añade Guardar/Cargar (descarga JSON + file input).
- Test manual ESP32→R→LED→GND: crear circuito, serializar, clear, restaurar y verificar 3 cables preservados; `getConnectionsForComponent` retorna 2 para resistencia central.
