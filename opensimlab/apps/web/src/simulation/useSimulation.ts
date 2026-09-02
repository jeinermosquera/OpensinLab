"use client";

import { useCallback, useMemo, useState } from "react";
import type { CircuitState } from "@/core/state/circuit";
import { runSimulation, type GpioState, type SimulationResult } from "./SimulationEngine";

export type UseSimulationReturn = {
  gpioState: GpioState;
  result: SimulationResult;
  isHigh: boolean;
  toggleGpio: () => void;
  setGpio: (level: "HIGH" | "LOW") => void;
  setHigh: () => void;
  setLow: () => void;
};

export function useSimulation(circuit: CircuitState): UseSimulationReturn {
  const [gpioState, setGpioState] = useState<GpioState>({ "esp32-gpio2": "LOW" });

  const result: SimulationResult = useMemo(() => runSimulation(circuit, gpioState), [circuit, gpioState]);

  const toggleGpio = useCallback(() => {
    setGpioState((prev) => ({ "esp32-gpio2": prev["esp32-gpio2"] === "HIGH" ? "LOW" : "HIGH" }));
  }, []);

  const setGpio = useCallback((level: "HIGH" | "LOW") => {
    setGpioState({ "esp32-gpio2": level });
  }, []);

  const setHigh = useCallback(() => setGpioState({ "esp32-gpio2": "HIGH" }), []);
  const setLow = useCallback(() => setGpioState({ "esp32-gpio2": "LOW" }), []);

  return { gpioState, result, isHigh: gpioState["esp32-gpio2"] === "HIGH", toggleGpio, setGpio, setHigh, setLow };
}
