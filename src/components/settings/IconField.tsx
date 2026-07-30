import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { REASON_ICON_KEYS, reasonIconComponent } from "./reasonIcons";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

function iconLabel(key: string) {
  return key
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function IconField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Current = reasonIconComponent(value);

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
        <span className="flex items-center gap-2 text-text-primary">
          <Current size={16} />
          {iconLabel(value)}
        </span>
        <ChevronDown size={16} className="text-text-muted" />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 grid w-full grid-cols-6 gap-1 rounded-[6px] border border-border-strong bg-surface-raised p-2 shadow-xl">
          {REASON_ICON_KEYS.map((key) => {
            const Icon = reasonIconComponent(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                aria-label={iconLabel(key)}
                title={iconLabel(key)}
                className={`flex h-9 w-9 items-center justify-center rounded-[6px] border transition hover:bg-surface-active ${
                  key === value
                    ? "border-accent-primary bg-surface-active text-accent-primary"
                    : "border-transparent text-text-secondary"
                }`}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
