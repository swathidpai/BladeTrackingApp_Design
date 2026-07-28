import { Check, Minus, X } from "lucide-react";
import { JobStatus } from "../../data";
import { Tooltip } from "./Tooltip";

interface Props {
  value: JobStatus;
  onChange: (s: JobStatus) => void;
}

const items: { status: JobStatus; tip: string; icon: typeof Check; color: string }[] = [
  { status: "planned", tip: "Clear status", icon: Minus, color: "var(--color-text-muted)" },
  { status: "complete", tip: "Mark complete", icon: Check, color: "var(--color-success)" },
  { status: "cancelled", tip: "Cancel job", icon: X, color: "var(--color-cancelled)" },
];

export function StatusToggleGroup({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      {items.map(({ status, tip, icon: Icon, color }) => {
        const active = value === status;
        return (
          <Tooltip key={status} label={tip}>
            <button
              type="button"
              onClick={() => onChange(status)}
              style={{
                width: 28,
                height: 28,
                borderColor: active || status !== "planned" ? color : "var(--color-border-default)",
                backgroundColor: active ? `color-mix(in srgb, ${color} 20%, transparent)` : "transparent",
                color: status === "planned" && !active ? "var(--color-text-muted)" : color,
              }}
              className="inline-flex items-center justify-center rounded-[4px] border transition"
              aria-pressed={active}
            >
              <Icon size={15} strokeWidth={2.5} />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
