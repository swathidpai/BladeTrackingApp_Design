import { Minus, Plus } from "lucide-react";

interface Props {
  value: number | null;
  onChange: (v: number) => void;
  min?: number;
  suffix?: string;
  placeholder?: string;
}

export function Stepper({ value, onChange, min = 0, suffix, placeholder }: Props) {
  const v = value ?? min;
  return (
    <div className="flex h-10 items-center rounded-[6px] border border-border-default bg-surface-raised">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, v - 1))}
        className="flex h-full w-9 items-center justify-center text-text-muted transition hover:text-text-primary"
        aria-label="Decrease"
      >
        <Minus size={15} />
      </button>
      <div className="flex flex-1 items-center justify-center gap-1 border-x border-border-default text-sm text-text-primary">
        {value == null ? (
          <span className="text-text-muted">{placeholder ?? "—"}</span>
        ) : (
          <>
            <span>{value}</span>
            {suffix && <span className="text-text-muted">{suffix}</span>}
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(v + 1)}
        className="flex h-full w-9 items-center justify-center text-text-muted transition hover:text-text-primary"
        aria-label="Increase"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
