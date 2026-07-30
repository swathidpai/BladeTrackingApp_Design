import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { JOB_TYPE_COLORS } from "../../data";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function ColorField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = JOB_TYPE_COLORS.find((c) => c.value === value);

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
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: value }} />
          <span className={current ? "text-text-primary" : "text-text-muted"}>
            {current?.name ?? "Please select"}
          </span>
        </span>
        <ChevronDown size={16} className="text-text-muted" />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-full overflow-auto rounded-[6px] border border-border-strong bg-surface-raised py-1 shadow-xl">
          {JOB_TYPE_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                onChange(c.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-surface-active ${
                c.value === value ? "bg-surface-active" : ""
              }`}
            >
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c.value }} />
              <span className="text-sm text-text-primary">{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
