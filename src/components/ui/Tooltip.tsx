import { ReactNode, useState } from "react";

interface Props {
  label: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "right";
}

export function Tooltip({ label, children, side = "top" }: Props) {
  const [open, setOpen] = useState(false);
  if (!label) return <>{children}</>;

  const pos =
    side === "bottom"
      ? "top-full mt-1.5 left-1/2 -translate-x-1/2"
      : side === "right"
        ? "left-full ml-1.5 top-1/2 -translate-y-1/2"
        : "bottom-full mb-1.5 left-1/2 -translate-x-1/2";

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-[4px] border border-border-strong bg-surface-raised px-2 py-1 text-[11px] font-medium text-text-primary shadow-lg ${pos}`}
        >
          {label}
        </span>
      )}
    </span>
  );
}
