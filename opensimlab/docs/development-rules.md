# Development Rules

Reglas detalladas de programación para OpenSimLab. Complementa `AGENTS.md`.

## 1. TypeScript / JavaScript

- ES Modules, `const`/`let` nunca `var`.
- `async/await` sobre callbacks/promesas anidadas.
- Funciones pequeñas (<40 líneas ideal), un propósito.
- `import/export` explícitos, sin `require`.
- Tipado estricto (`strict: true`). Evitar `any`; usar `unknown` + narrowing si es necesario.
- No variables globales. Estado en componentes o módulos dedicados (`core/state`).
- No lógica de negocio dentro de JSX; extraer helpers.

## 2. React / Next.js

- Componentes funcionales + hooks. No clases.
- Props tipadas con `interface`.
- Un componente por archivo, nombre PascalCase coincide con archivo.
- Composición sobre prop drilling profundo: usar composición o context solo si aporta.
- `use client` solo donde se necesita interactividad (Workbench y paneles).
- Evitar `useEffect` innecesario; preferir estado derivado.

## 3. HTML Semántico

- `header`, `nav`, `main`, `aside`, `section`, `footer`, `button`, `input` según corresponda.
- Botones siempre `<button type="button">`, no `<div onClick>`.
- Inputs con `<label>` asociado o `aria-label`.
- `aria-*` para controles de panel (expanded, controls).

## 4. CSS

- Variables CSS en `:root` para colores, espacios, tipografía, radios, sombras, z-index.
- Evitar `style` inline y `!important` (solo para overrides de librería si es imprescindible).
- Clase utilitaria Tailwind preferida, pero tokens CSS para valores de diseño.
- Selectores simples, sin anidamiento profundo.
- Responsive mobile-first; breakpoints: 768px, 1024px.
- Nunca overflow horizontal: verificar `min-width: 0` en flex/grid.

## 5. Archivos y Módulos

- Cada archivo una responsabilidad. Preguntar: ¿necesita separación real?
- No crear `utils` gigante; separar por dominio.
- Evitar barrel exports circulares.
- Imports ordenados: externos → internos (`@/`) → relativos.

## 6. Comentarios

- Explicar por qué, no qué. Ej: `// Drawer overlay evita scroll del body` sí; `// loop array` no.
- Documentar contratos públicos y limitaciones (ej: "zoom es visual, no transforma coordenadas reales todavía").

## 7. Dependencias

Checklist antes de instalar:
1. ¿Existe alternativa nativa?
2. ¿Ya hay una dep que lo cubre?
3. ¿Peso/maintainability justificado?
- Sesión 1: cero dependencias nuevas (solo Next/React/Tailwind ya existentes).

## 8. Principios SOLID (pragmático)

- SRP: un módulo una razón para cambiar.
- OCP: extensible sin modificar existente (ej: añadir categoría no requiere editar lógica de filtro).
- LSP/ISP/DIP: aplicar cuando haya abstracciones reales, no especulativas.

## 9. Testing y Calidad

- `npm run lint` y `npm run type-check` deben pasar.
- Verificación manual mínima cada sesión: app inicia, sin errores consola, layout sin overflow, teclado navegable.
- Dejar base para tests (no obligatorio S1): colocar lógica pura en `core/` testeable.

## 10. Documentación

- Sincronizar `README.md`, `docs/architecture.md` ante cambio de estructura/tecnología.
- Cada sesión: `docs/sessions/session-XX.md` con qué se hizo/funciona/falta/cómo probar.

## 11. Alcance

- Respetar `docs/sessions/backlog.md` para ideas futuras. No implementar fuera de sesión.
- Sesión 1 prohíbe simulación, componentes funcionales, backend, auth, etc. (ver AGENTS.md §11).
