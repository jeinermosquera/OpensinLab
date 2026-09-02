"use client";
import { useEffect } from "react";

export function WokwiLoader() {
  useEffect(() => {
    // Carga bundle de wokwi-elements que registra los custom elements
    import("@wokwi/elements");
  }, []);
  return null;
}
