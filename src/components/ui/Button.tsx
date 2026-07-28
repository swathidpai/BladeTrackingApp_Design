import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger" | "success" | "success-outline";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-accent-primary text-bg-base hover:brightness-110 border border-transparent",
  ghost:
    "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-active border border-border-default",
  danger: "bg-attention text-white hover:brightness-110 border border-transparent",
  success: "bg-success text-bg-base hover:brightness-110 border border-transparent",
  "success-outline":
    "bg-transparent text-success border border-success hover:bg-success/10",
};

export function Button({ variant = "primary", className = "", children, ...rest }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-[6px] px-3.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
