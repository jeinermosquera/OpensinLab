"use client";
import React from "react";
import { photorealSvgString } from "./svgString";

// Wrapper fotorrealista — delega a svgString que copia paths/colores/viewBox de @wokwi/elements 1.9.2
// Mantiene viewBox original de Wokwi y escala a def.width/def.height para que WOKWI_NORMS siga alineado.
// Solo visual — no cambia lógica de wiring/simulación.

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

export function LedPhoto({ width, height, color = "rojo", isLedOn }: PhotoProps) {
  const html = photorealSvgString("led", width, height, { color }, { ledOn: !!isLedOn });
  return <HtmlSvg html={html} width={width} height={height} label="LED" />;
}

export function ResistorPhoto({ width, height, resistencia, hasCurrent }: PhotoProps & { resistencia?: string }) {
  const html = photorealSvgString("resistor", width, height, { resistencia: resistencia ?? "220Ω" }, { hasCurrent: !!hasCurrent });
  return <HtmlSvg html={html} width={width} height={height} label="Resistencia" />;
}

export function CapacitorPhoto({ width, height }: PhotoProps) {
  const html = photorealSvgString("capacitor", width, height, {});
  return <HtmlSvg html={html} width={width} height={height} label="Capacitor" />;
}

export function ButtonPhoto({ width, height }: PhotoProps) {
  const html = photorealSvgString("button", width, height, {});
  return <HtmlSvg html={html} width={width} height={height} label="Pulsador" />;
}

export function BreadboardPhoto({ width, height }: PhotoProps) {
  const html = photorealSvgString("breadboard", width, height, {});
  return <HtmlSvg html={html} width={width} height={height} label="Protoboard" />;
}

export function UnoPhoto({ width, height }: PhotoProps) {
  const html = photorealSvgString("uno", width, height, {});
  return <HtmlSvg html={html} width={width} height={height} label="Arduino UNO" />;
}

export function Esp32Photo({ width, height }: PhotoProps) {
  const html = photorealSvgString("esp32", width, height, {});
  return <HtmlSvg html={html} width={width} height={height} label="ESP32" />;
}

export function Dht22Photo({ width, height }: PhotoProps) {
  const html = photorealSvgString("dht22", width, height, {});
  return <HtmlSvg html={html} width={width} height={height} label="DHT22" />;
}

export function UltrasonicPhoto({ width, height }: PhotoProps) {
  const html = photorealSvgString("ultrasonic", width, height, {});
  return <HtmlSvg html={html} width={width} height={height} label="HC-SR04" />;
}

export function ServoPhoto({ width, height }: PhotoProps) {
  const html = photorealSvgString("servo", width, height, {});
  return <HtmlSvg html={html} width={width} height={height} label="Servo" />;
}

// Nuevos — fieles a @wokwi/elements ssd1306-element, buzzer-element, potentiometer-element
export function OledPhoto({ width, height }: PhotoProps) {
  const html = photorealSvgString("oled", width, height, {});
  return <HtmlSvg html={html} width={width} height={height} label="OLED SSD1306" />;
}

export function BuzzerPhoto({ width, height, isLedOn }: PhotoProps) {
  const html = photorealSvgString("buzzer", width, height, { hasSignal: isLedOn ? 1 : 0 }, { ledOn: !!isLedOn });
  return <HtmlSvg html={html} width={width} height={height} label="Buzzer" />;
}

export function PotentiometerPhoto({ width, height }: PhotoProps & { value?: number }) {
  const html = photorealSvgString("potentiometer", width, height, { value: 50 });
  return <HtmlSvg html={html} width={width} height={height} label="Potenciómetro" />;
}

// Selector central — mantiene compatibilidad con ComponentView y svgString
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
  // normaliza ids alternativos (oled/ssd1306, buzzer, pot/potentiometer, ultrasonic/hc-sr04)
  const id = definitionId.toLowerCase();
  const html = photorealSvgString(id, width, height, props as Record<string, string | number>, { ledOn: !!isLedOn, hasCurrent: !!hasCurrent });
  // Para React, devolvemos wrapper con innerHTML — el SVG ya tiene tamaños correctos
  return <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }} dangerouslySetInnerHTML={{ __html: html }} />;
}
