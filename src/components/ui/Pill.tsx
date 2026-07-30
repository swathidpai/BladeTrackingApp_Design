import { Check } from "lucide-react";
import { useStore } from "../../store";

type Tone = "accent" | "success" | "danger";

interface Props {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  tone?: Tone;
}

const SELECTED_TONE: Record<Tone, string> = {
  accent: "border-accent-primary bg-accent-dim text-accent-primary",
  success: "border-success bg-success text-bg-base",
  danger: "border-attention bg-attention text-white",
};

/** Weather / reason multi-select pill; also used for the status branch tags. */
export function Pill({ label, selected = false, onClick, className = "", tone = "accent" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-medium transition ${
        selected
          ? SELECTED_TONE[tone]
          : "border-border-default bg-surface-raised text-text-secondary hover:text-text-primary"
      } ${className}`}
    >
      {selected && <Check size={13} strokeWidth={2.5} />}
      {label}
    </button>
  );
}

/** Static job-type tag — tinted with the job type's colour from Settings > Job Types. */
export function TypeTag({ label }: { label: string }) {
  const color = useStore((s) => s.jobTypes.find((t) => t.name === label)?.color);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-dim px-2 py-0.5 text-[11px] font-medium text-accent-primary">
      {color && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />}
      {label}
    </span>
  );
}
