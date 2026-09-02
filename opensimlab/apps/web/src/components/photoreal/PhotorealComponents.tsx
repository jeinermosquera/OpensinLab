"use client";
import React from "react";
import { photorealSvgString } from "./svgString";

// Wrapper fotorrealista — SOLO 3 componentes fieles a imagen (ESP32, LED, Resistencia)
// Mantiene viewBox original y escala a def.width/def.height para que WOKWI_NORMS siga alineado.

type PhotoProps = {
  width: number;
  height: number;
  isLedOn?: boolean;
  hasCurrent?: boolean;
  color?: string;
  resistencia?: string;
};

function HtmlSvg({ html, width, height, label }: { html: string; width: number; height: number; label: string }) {
  return (
    <div
      style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function LedPhoto({ width, height, color = "azul", isLedOn }: PhotoProps) {
  const html = photorealSvgString("led", width, height, { color }, { ledOn: !!isLedOn });
  return <HtmlSvg html={html} width={width} height={height} label="LED" />;
}

export function ResistorPhoto({ width, height, resistencia, hasCurrent }: PhotoProps & { resistencia?: string }) {
  const html = photorealSvgString("resistor", width, height, { resistencia: resistencia ?? "1kΩ" }, { hasCurrent: !!hasCurrent });
  return <HtmlSvg html={html} width={width} height={height} label="Resistencia" />;
}

export function Esp32Photo({ width, height }: PhotoProps) {
  const html = photorealSvgString("esp32", width, height, {});
  return <HtmlSvg html={html} width={width} height={height} label="ESP32" />;
}

// Selector central — solo 3 ids válidos
export function Photoreal({
  definitionId,
  width,
  height,
  props,
  isLedOn,
  hasCurrent,
}: {
  definitionId: string;
  width: number;
  height: number;
  props: Record<string, string | number>;
  isLedOn?: boolean;
  hasCurrent?: boolean;
}) {
  const id = definitionId.toLowerCase();
  const html = photorealSvgString(id, width, height, props as Record<string, string | number>, { ledOn: !!isLedOn, hasCurrent: !!hasCurrent });
  return <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }} dangerouslySetInnerHTML={{ __html: html }} />;
}
