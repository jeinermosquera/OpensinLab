# OpenSimLab

Plataforma web de simulación electrónica inspirada conceptualmente en herramientas como Wokwi — **no es un clon**. Diseño, arquitectura y código propios, evolución progresiva por sesiones.

## Objetivo General

Construir un simulador electrónico modular, escalable y profesional donde usuarios puedan diseñar circuitos, simular comportamiento y compartir proyectos — desde una mesa de trabajo visual hasta simulación real.

## Tecnologías

| Capa | Stack |
|------|-------|
| Frontend | Next.js 15 (App Router), TypeScript strict, Tailwind CSS 4, Monaco Editor |
| Backend | FastAPI, SQLAlchemy 2.x (async), Alembic |
| DB | PostgreSQL 16 |
| Infra | Docker, Docker Compose |
| Monorepo | npm workspaces (`apps/*`, `packages/*`) |

## Arquitectura General

Ver `docs/architecture.md` para detalle técnico.

```
apps/web/src/
├── app/        # Shell, layout, globals
├── editor/     # Workbench: TopBar, ComponentsPanel, Workspace, Properties, StatusBar
├── core/       # estado, eventos, utils (futuro)
├── components/ # Component registry (futuro)
├── rendering/  # Renderer (futuro)
└── simulation/ # SimulationEngine (futuro)
```

Principios: modular, SRP, composición, DRY/KISS/YAGNI, separación UI / Estado / Lógica / Renderizado / Servicios.

## Cómo Ejecutar

### Prerrequisitos
- Node.js 18+
- Python 3.11+ (solo para API)
- Docker & Docker Compose (solo para DB)

### Desarrollo

```bash
# Instalar dependencias
npm install

# DB (opcional Sesión 1)
docker compose up -d postgres

# Solo frontend (Sesión 1)
npm run dev:web
# o
npm --workspace=apps/web run dev

# Frontend en http://localhost:3000
# API en http://localhost:8000 (cuando se use)
```

### Scripts

```bash
npm run dev          # web + api concurrente
npm run build        # build todos los workspaces
npm run lint         # lint workspaces
npm --workspace=apps/web run type-check  # tsc --noEmit
```

## Estructura de Carpetas

```
opensimlab/
├── AGENTS.md
├── README.md
├── apps/
│   ├── web/           Next.js frontend — editor visual
│   └── api/           FastAPI backend
├── packages/
│   ├── shared-types/
│   ├── simulation-core/
│   ├── circuit-model/
│   └── component-definitions/
├── docs/
│   ├── architecture.md
│   ├── development-rules.md
│   └── sessions/
│       ├── session-01.md
│       └── backlog.md
├── database/
├── docker/
└── examples/
```

## Estado Actual

| Sesión | Objetivo | Estado |
|--------|----------|--------|
| 01 | Mesa de trabajo (workbench visual sin simulación) | ✅ Completada |
| 02 | Componentes interactivos + estado de escena (sin simulación) | ✅ Completada |
| 03+ | Cableado, simulación | Pendiente — ver `docs/sessions/backlog.md` |

### Sesión 01 — Qué incluye
- TopBar, panel componentes mock, canvas grid placeholder, props vacío, status bar, responsive

### Sesión 02 — Qué incluye
- Registry 10 componentes (LED, resistencia, UNO, ESP32, etc.)
- Drag&drop y click-to-add al lienzo con snap 24px
- Selección, mover (pointer drag), rotar 90°, duplicar, eliminar, limpiar
- Propiedades editables (props por componente)
- Undo/redo (Ctrl+Z/Y) con historial 50, atajos Del/Esc
- TopBar y StatusBar conectados, zoom y coords

Ver `docs/sessions/session-01.md` y `docs/sessions/session-02.md` para entrega detallada.

## Funcionalidades Futuras

- Cableado y nodos entre pines
- Simulación eléctrica (voltajes, corrientes)
- Arduino/ESP32 ejecución, sensores reales
- Instrumentos (osciloscopio, multímetro)
- Persistencia y backend de proyectos
- Colaboración

Ideas registradas en `docs/sessions/backlog.md`.

## Cómo Contribuir

1. Leer `AGENTS.md` (obligatorio).
2. Verificar sesión actual y alcance permitido.
3. Seguir procedimiento de 9 fases (inspeccionar → analizar → planificar → validar → implementar → revisar → probar → documentar → detenerse).
4. `npm run lint` y `npm run type-check` deben pasar.
5. Verificar responsive sin overflow y accesibilidad básica (teclado).
6. Actualizar docs si cambia arquitectura/estructura.

## Licencia

MIT
