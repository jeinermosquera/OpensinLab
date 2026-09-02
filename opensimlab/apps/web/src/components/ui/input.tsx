import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-8 w-full rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1 text-[13px] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-ring)] disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
