# Sesión 01 — Mesa de Trabajo + Arquitectura Base

**Estado:** ✅ Completada — 2026-08-31
**Objetivo:** Construir exclusivamente la mesa de trabajo visual sin simulación.

## Qué se hizo

- Creado `AGENTS.md` (reglas permanentes) en `opensimlab/` y `wokwi/` raíz.
- Creados/actualizados docs: `architecture.md`, `development-rules.md`, `sessions/backlog.md`, `README.md`.
- Diseñado sistema visual propio: variables CSS centralizadas en `globals.css` (colores, espacios, radios, sombras, z-index, tipografía), Tailwind 4 con `@import "tailwindcss"`, modo oscuro automático.
- Implementada arquitectura modular Sesión 1:
  - `apps/web/src/app/layout.tsx` + `globals.css` + `page.tsx`
  - `apps/web/src/editor/Workbench.tsx` (orquestador, estado zoom/drawers/collapsed)
  - `apps/web/src/editor/TopBar.tsx`
  - `apps/web/src/editor/ComponentsPanel.tsx`
  - `apps/web/src/editor/WorkspaceCanvas.tsx`
  - `apps/web/src/editor/PropertiesPanel.tsx`
  - `apps/web/src/editor/StatusBar.tsx`
  - `tailwind.config.ts` actualizado con tokens
- TopBar: logo, título, badge guardado, nombre proyecto visual, deshacer/rehacer, guardar, controles simulación deshabilitados (visual), menú, toggles responsive.
- ComponentsPanel: buscador filtrable, categorías (Todos/Básicos/Micro/Sensores...), lista mock 10 componentes con icono/nombre/desc, estado vacío, collapsed a rail 56px en desktop, drawer en móvil/tablet.
- WorkspaceCanvas: grid CSS 24px, barra herramientas flotante (Seleccionar/Mano/Cable), controles zoom (−/+/reset), canvas centrado 960×560 con placeholder, escala por transform, markers.
- PropertiesPanel: empty state "No hay ningún elemento seleccionado.", chips preparatorios, collapsed rail.
- StatusBar: zoom, coords, estado, mensajes, sin overflow.
- Responsive: desktop grid `280px 1fr 300px` → tablet rail+drawer → móvil drawers con backdrop blur, sin overflow horizontal (`min-width:0`, `overflow-hidden`).

## Qué funciona

- Layout profesional completo visible en `/`.
- Paneles colapsables (desktop) y drawers con backdrop (tablet/móvil).
- Búsqueda y filtro por categoría funcionando (estado local).
- Zoom visual (+10/-10, 50-200%, reset) con transform scale.
- Cambios de tema claro/oscuro por `prefers-color-scheme`.
- `npm run build:web` compila sin errores, `tsc --noEmit` limpio, `next lint` sin warnings.

## Qué NO se implementó (prohibiciones S1 respetadas)

- Motor de simulación, análisis de circuitos, voltajes/corrientes, física.
- Componentes funcionales (LED, resistencia, Arduino, ESP32 operativos).
- Cables funcionales, nodos, drag&drop al canvas.
- Voltajes, corrientes, ejecución de código, compilador, debugger.
- Osciloscopio/multímetro funcionales, lógica digital, auth, colaboración, backend/nube, persistencia avanzada.
- Zoom/pan reales con coordenadas transformadas, minimapa.

Ver `backlog.md` para pospuestos.

## Arquitectura

- **SRP**: cada panel un archivo, una responsabilidad. `Workbench` compone, no hereda.
- **Estado mínimo**: `useState` local en Workbench (collapsed, drawers, zoom); sin Redux/Zustand (YAGNI).
- **Composición**: TopBar + Panels + Canvas + StatusBar.
- **Separación UI/Estado**: lógica visual en componentes, sin lógica de negocio/simulación.
- **YAGNI**: sin librería resize/drag, sin canvas 2D todavía (div con background grid CSS).

Ver `docs/architecture.md` para diagrama y decisiones.

## Archivos modificados

- `apps/web/src/app/globals.css` — design tokens
- `apps/web/src/app/layout.tsx` — metadata, lang es
- `apps/web/src/app/page.tsx` — monta Workbench (antes landing)
- `apps/web/tailwind.config.ts` — tokens CSS vars
- `README.md` — estado Sesión 01, cómo ejecutar
- `docs/architecture.md` — arquitectura S1 detallada

## Archivos creados

- `AGENTS.md` (también copiado a raíz `wokwi/AGENTS.md`)
- `docs/development-rules.md`
- `docs/sessions/session-01.md` (este archivo)
- `docs/sessions/backlog.md`
- `apps/web/src/editor/Workbench.tsx`
- `apps/web/src/editor/TopBar.tsx`
- `apps/web/src/editor/ComponentsPanel.tsx`
- `apps/web/src/editor/WorkspaceCanvas.tsx`
- `apps/web/src/editor/PropertiesPanel.tsx`
- `apps/web/src/editor/StatusBar.tsx`

## Pruebas

- `npm install` — 361 paquetes, 0 errores.
- `npx tsc --noEmit --project apps/web/tsconfig.json` — sin errores.
- `npm run build:web` — ✓ Compiled successfully (6.1s), static pages generadas.
- `npm --workspace=apps/web run lint` — No ESLint warnings or errors.
- Verificación manual: layout sin overflow horizontal, responsive <1024 y <768, drawers con backdrop, foco visible, HTML semántico (`header`, `aside`, `section`, `footer`, `button`).

## Cómo probar

```bash
cd opensimlab
npm install
npm run dev:web
# abrir http://localhost:3000
```

- Redimensionar a 1280px, 900px, 375px: verificar que no hay scroll horizontal y que los paneles colapsan/drawers funcionan.
- Probar buscador ("led", "arduino") y categorías.
- Probar botones zoom +/− y reset.
- Verificar que controles "Ejecutar/■/↻" están deshabilitados (visual).

## Pendiente (futuras sesiones)

Registrado en `docs/sessions/backlog.md`: paneles redimensionables, drag&drop, zoom/pan reales, fuzzy search, persistencia, motor de simulación.

## Criterio de finalización — Checklist

- [x] Workspace organizado
- [x] Layout profesional
- [x] Responsive funciona
- [x] Paneles visuales operativos
- [x] Canvas preparado
- [x] Arquitectura modular
- [x] Docs actualizadas
- [x] Sin errores
- [x] Sin funcionalidad de simulación
