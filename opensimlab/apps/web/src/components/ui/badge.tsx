import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "accent" | "mono";
}) {
  const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none";
  const variants: Record<string, string> = {
    default: "bg-white border-[var(--color-border)] text-[var(--color-text-muted)]",
    muted: "bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-faint)]",
    accent: "bg-[var(--accent-subtle)] border-[var(--accent)]/20 text-[var(--accent-strong)]",
    mono: "bg-white border-[var(--color-border)] text-[var(--color-text-faint)] font-mono text-[10px] tracking-wide",
  };
  return <span className={cn(base, variants[variant], className)}>{children}</span>;
}
