"use client";
import React from "react";
import { photorealSvgString } from "./svgString";

type PhotoProps = {
  width: number;
  height: number;
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

export function LedPhoto({ width, height, color = "azul" }: PhotoProps) {
  const html = photorealSvgString("led", width, height, { color });
  return <HtmlSvg html={html} width={width} height={height} label="LED" />;
}

export function ResistorPhoto({ width, height, resistencia }: PhotoProps & { resistencia?: string }) {
  const html = photorealSvgString("resistor", width, height, { resistencia: resistencia ?? "1kΩ" });
  return <HtmlSvg html={html} width={width} height={height} label="Resistencia" />;
}

export function Esp32Photo({ width, height }: PhotoProps) {
  const html = photorealSvgString("esp32", width, height, {});
  return <HtmlSvg html={html} width={width} height={height} label="ESP32" />;
}

// Selector central — solo 3 ids válidos, visual puro sin simulación
export function Photoreal({
  definitionId,
  width,
  height,
  props,
}: {
  definitionId: string;
  width: number;
  height: number;
  props: Record<string, string | number>;
}) {
  const id = definitionId.toLowerCase();
  const html = photorealSvgString(id, width, height, props as Record<string, string | number>);
  return <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }} dangerouslySetInnerHTML={{ __html: html }} />;
}
