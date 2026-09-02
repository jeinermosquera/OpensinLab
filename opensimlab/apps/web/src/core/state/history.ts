import type { CircuitState } from "./circuit";

// Historial lineal para undo/redo — Sesión 02
// Mantiene pasado/presente/futuro sin mutar estados

export type HistoryState = {
  past: CircuitState[];
  present: CircuitState;
  future: CircuitState[];
};

export type HistoryAction =
  | { type: "SET"; next: CircuitState }
  | { type: "UNDO" }
  | { type: "REDO" };

const MAX_HISTORY = 50;

function clone(s: CircuitState): CircuitState {
  return { components: s.components.map((c) => ({ ...c, props: { ...c.props } })), wires: s.wires.map((w) => ({ ...w, from: { ...w.from }, to: { ...w.to } })), selectedId: s.selectedId };
}

export function createHistory(initial: CircuitState): HistoryState {
  return { past: [], present: clone(initial), future: [] };
}

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "SET": {
      const next = clone(action.next);
      // evita empujar duplicados
      if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
      const past = [...state.past, clone(state.present)];
      if (past.length > MAX_HISTORY) past.shift();
      return { past, present: next, future: [] };
    }
    case "UNDO": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return { past: newPast, present: clone(previous), future: [clone(state.present), ...state.future] };
    }
    case "REDO": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return { past: [...state.past, clone(state.present)], present: clone(next), future: newFuture };
    }
    default:
      return state;
  }
}
