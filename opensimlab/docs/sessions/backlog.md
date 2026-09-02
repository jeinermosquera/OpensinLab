# Backlog — Funcionalidades Futuras

> Ideas detectadas que pertenecen a sesiones posteriores. No implementar hasta que la sesión correspondiente lo autorice.

## Paneles redimensionables con drag

- Descripción: Permitir arrastrar el borde de ComponentsPanel y PropertiesPanel para ajustar ancho.
- Razón por la que se pospone: Requiere lógica de resize + persistencia; no esencial aún.
- Sesión sugerida: 03

## Zoom y pan reales en el canvas (rueda + minimapa)

- Descripción: Transformar coordenadas, rueda para zoom centrado en cursor, arrastrar para pan, minimapa.
- Razón por la que se pospone: S02 solo zoom escala visual; falta engine de viewport.
- Sesión sugerida: 03

## Búsqueda con fuzzy matching y categorías dinámicas

- Descripción: Mejorar filtro con ranking y categorías desde registry dinámico.
- Razón por la que se pospone: Filtro simple suficiente para S02.
- Sesión sugerida: 03

## Batch de historial en drag

- Descripción: Drag genera una sola entrada de undo/redo al soltar, no por pixel.
- Razón por la que se pospone: Requiere estado transitorio separado de historial.
- Sesión sugerida: 03

## Cableado y nodos

- Descripción: Conectar pines con cables, ruteo, validación.
- Razón por la que se pospone: Necesita modelo de wires y renderer de conexiones.
- Sesión sugerida: 03

## Persistencia de proyecto (guardar/cargar)

- Descripción: Guardar layout en localStorage / backend, API de proyectos.
- Razón por la que se pospone: Prohibido persistencia avanzada en S02 (solo memoria).
- Sesión sugerida: 03-04

## Motor de simulación

- Descripción: Simulación eléctrica, voltajes/corrientes, ejecución Arduino/ESP32.
- Razón por la que se pospone: Prohibido explícitamente en S02.
- Sesión sugerida: 04+

## Drag & drop de componentes al canvas — completado S02

- Descripción: Arrastrar items al lienzo y posicionarlos.
- Sesión realizada: 02
