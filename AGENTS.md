# AGENTS.md — Reglas Permanentes del Proyecto OpenSimLab

> Documento de lectura obligatoria para cualquier agente (OpenCode / humano) que modifique el proyecto.
> Prevalece sobre instrucciones ambiguas del usuario. Si hay contradicción, pedir aclaración.

---

## 1. Propósito

OpenSimLab es una plataforma web de simulación electrónica inspirada conceptualmente en Wokwi **sin ser un clon**. Diseño, arquitectura y código propios, evolución progresiva por sesiones.

---

## 2. Desarrollo por Sesiones — Regla Absoluta

- Cada sesión tiene un objetivo concreto y alcance cerrado.
- **NO** implementar funcionalidades de sesiones futuras.
- **NO** construir todo el simulador de una vez.
- Al terminar una sesión: detenerse, documentar y esperar autorización explícita.
- Si durante el trabajo se detecta una mejora futura, **no implementarla**: registrarla en `docs/sessions/backlog.md`.

Formato backlog:

```md
## Funcionalidad
- Descripción:
- Razón por la que se pospone:
- Sesión sugerida:
```

---

## 3. Procedimiento de Trabajo Obligatorio (9 Fases)

1. **FASE 0 — Leer reglas**: `AGENTS.md`, `README.md`, `docs/architecture.md`, `docs/development-rules.md`, doc de sesión.
2. **FASE 1 — Inspeccionar**: estructura, tecnologías, dependencias, archivos principales, riesgos. No modificar código.
3. **FASE 2 — Analizar**: qué existe / qué está mal / qué es reutilizable / qué debe cambiar / qué NO debe cambiar.
4. **FASE 3 — Planificar**: archivos a modificar/crear, responsabilidades, UI, arquitectura, riesgos, estrategia de pruebas.
5. **FASE 4 — Validar plan**: SOLID, arquitectura, alcance, DRY, YAGNI, sin dependencias innecesarias. Si hay decisión ambigua, preguntar.
6. **FASE 5 — Implementar**: solo entonces modificar.
7. **FASE 6 — Revisar**: errores, imports, duplicación, nombres, CSS, responsive, a11y, rendimiento, arquitectura, docs.
8. **FASE 7 — Probar**: la app inicia, sin errores de consola, imports OK, layout y responsive sin overflow.
9. **FASE 8 — Documentar**: sincronizar `README.md`, `docs/architecture.md`, `docs/development-rules.md`, `docs/sessions/session-XX.md`.
10. **FASE 9 — Detenerse**: mostrar `SESIÓN COMPLETADA`, no continuar.

---

## 4. Arquitectura — Principios No Negociables

- Modular y escalable. Evitar monolitos, archivos/clases/funciones gigantes, variables globales, lógica duplicada, acoplamiento excesivo.
- Separar responsabilidades: `UI | Estado | Lógica de negocio | Renderizado | Servicios | Simulación | Componentes | Persistencia`.
- **Arquitectura objetivo** (evolución progresiva, no obligatoria en sesión 1):

```
src/
├── app/               # App shell, AppState, AppConfig
├── core/              # events, state, utils
├── editor/            # workspace, toolbar, components-panel, properties-panel, status-bar
├── components/        # Component, ComponentRegistry, definitions/
├── rendering/         # Renderer
├── simulation/        # SimulationEngine
└── services/          # persistencia, API
```

En el monorepo actual esto se mapea a `apps/web/src/` con la misma separación.

- Cada archivo una responsabilidad clara. Antes de crear un archivo preguntar: ¿esta responsabilidad realmente necesita estar separada?
- Si un archivo acumula múltiples responsabilidades: detenerse → analizar → refactorizar. No seguir agregando código indiscriminadamente.
- No sobreingeniería: no crear factories/managers/servicios/abstracciones/patrones innecesarios. La arquitectura crece según necesidad real.

---

## 5. SOLID (aplicar cuando aporte valor, sin dogmatismo)

- **S** — Single Responsibility: un módulo, una razón para cambiar.
- **O** — Open/Closed: extensible sin modificar constantemente código existente.
- **L** — Liskov: los contratos de abstracciones se respetan.
- **I** — Interface Segregation: evitar interfaces gigantes.
- **D** — Dependency Inversion: capas altas no dependen de detalles concretos cuando aporta desacoplo real.
- No usar SOLID como excusa para fragmentar en decenas de archivos innecesarios. No aplicar patrones artificialmente.

Complementos: DRY, KISS, YAGNI, composición sobre herencia, bajo acoplamiento, alta cohesión, código legible.

---

## 6. Estructura del Proyecto (monorepo)

```
opensimlab/
├── AGENTS.md
├── README.md
├── apps/
│   ├── web/           # Next.js + TypeScript + Tailwind — editor visual
│   └── api/           # FastAPI + SQLAlchemy + Alembic
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

Toda nueva funcionalidad de editor va en `apps/web/src/editor/` o `apps/web/src/core/` según su capa.

---

## 7. Convenciones de Código

### 7.1 JavaScript / TypeScript
- ES Modules, `const`/`let` (nunca `var`), `async/await`, `import/export`, funciones pequeñas, módulos independientes.
- Evitar: variables globales, funciones gigantes, duplicación, callbacks anidados, manipulación DOM descontrolada, lógica mezclada con presentación.
- Tipado estricto en TypeScript.

### 7.2 HTML
- Semántico: `header`, `nav`, `main`, `aside`, `section`, `footer`, `button`. Evitar `div` innecesarios. Elementos interactivos con etiquetas apropiadas.

### 7.3 CSS
- Modular, con variables CSS para colores, espacios, tipografía, radios, sombras, z-index.
- Evitar: `style` inline, `!important` innecesario, valores mágicos repetidos, CSS duplicado, selectores excesivamente complejos.
- Design tokens centralizados en `apps/web/src/app/globals.css`.

### 7.4 Comentarios
- Explicar **por qué** y decisiones, no lo obvio. Ejemplo malo: `// selecciona el botón`. Ejemplo bueno: `// Centraliza acciones del toolbar para evitar mutación directa del estado global`.
- Documentar contratos, comportamientos complejos y limitaciones.

---

## 8. Gestión de Dependencias

Antes de añadir una librería:
1. ¿Ya existe una que cubra el caso?
2. ¿Se puede resolver con código nativo?
3. ¿Impacto en bundle/tamaño/mantenimiento?
4. Justificar. No instalar por una tarea trivial.

---

## 9. Calidad y Testing

- Cada sesión debe verificar: la app inicia, sin errores de consola, imports OK, layout y responsive sin overflow horizontal, sin elementos rotos, accesible con teclado.
- Tests: unitarios para lógica pura, integración para flujos críticos. No testear trivialidades visuales estáticas en sesión 1, pero dejar la base preparada.
- Lint: `npm run lint`, `npm run type-check` deben pasar sin errores.

---

## 10. Documentación — Sincronización Obligatoria

Cuando cambie arquitectura, estructura, convenciones, tecnologías o decisiones importantes, actualizar inmediatamente:
- `README.md`
- `docs/architecture.md`
- `docs/development-rules.md` (si aplica)
- `docs/sessions/session-XX.md`
- `AGENTS.md` (solo si cambian reglas permanentes)

No permitir que código y docs diverjan.

---

## 11. Control de Alcance y Prohibiciones

- Sesión 1 **prohíbe** implementar: motor de simulación, análisis de circuitos, componentes funcionales (resistencias, LEDs, Arduino, ESP32, sensores), cables funcionales, voltajes/corrientes, física, ejecución de código/compilador/debugger, instrumentos funcionales, lógica digital, auth, colaboración, backend/nube/persistencia avanzada.
- En sesiones futuras, las prohibiciones se levantan solo cuando la sesión lo indique explícitamente.

---

## 12. Revisión de Código

Antes de dar por terminada una tarea:
- Revisar errores, imports, dependencias, duplicación, responsabilidades, nombres, CSS, responsive, a11y, rendimiento, arquitectura y docs.
- Commits pequeños y con mensaje claro. No commitear secretos.

---

## 13. Regla de Sincronización con AGENTS.md

Antes de cualquier modificación posterior:
1. Leer `AGENTS.md`
2. Identificar reglas relevantes y sesión actual
3. Verificar alcance permitido
4. Revisar arquitectura y estado del proyecto

No ignorar este archivo aunque la tarea parezca sencilla.

---

## 14. Sesiones

| Sesión | Objetivo | Estado |
|--------|----------|--------|
| 01 | Mesa de trabajo (workbench visual sin simulación) | ✅ Completada |
| 02 | Componentes interactivos + estado de escena (sin simulación) | ✅ Completada |
| 03+ | Por definir (cableado, simulación, etc.) | Pendiente — ver `docs/sessions/backlog.md` |

Actualizar esta tabla al cerrar cada sesión.
