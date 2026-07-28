import { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface Option {
  value: string;
  label: string;
  description?: string;
}

interface Props {
  value: string | null;
  options: Option[];
  onChange: (v: string) => void;
  placeholder?: string;
  footer?: ReactNode; // e.g. "+ Add job type" row
}

export function Dropdown({ value, options, onChange, placeholder = "Select…", footer }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between rounded-[6px] border border-border-default bg-surface-raised px-3 text-sm transition hover:border-border-strong"
      >
        <span className={current ? "text-text-primary" : "text-text-muted"}>
          {current?.label ?? placeholder}
        </span>
        <ChevronDown size={16} className="text-text-muted" />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 max-h-72 w-full overflow-auto rounded-[6px] border border-border-strong bg-surface-raised py-1 shadow-xl scroll-slim">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left transition hover:bg-surface-active ${
                o.value === value ? "bg-surface-active" : ""
              }`}
            >
              <div className="text-sm text-text-primary">{o.label}</div>
              {o.description && (
                <div className="mt-0.5 text-[12px] text-text-muted">{o.description}</div>
              )}
            </button>
          ))}
          {footer && (
            <>
              <div className="my-1 h-px bg-border-default" />
              <div onClick={() => setOpen(false)}>{footer}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Field({
  label,
  right,
  children,
}: {
  label: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between">
        <span className="text-[13px] font-medium text-text-primary">{label}</span>
        {right}
      </span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={`h-10 w-full rounded-[6px] border border-border-default bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-muted transition focus:border-border-strong ${className}`}
      {...rest}
    />
  );
}
