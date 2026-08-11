import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { useAnchoredPosition } from "../../hooks/useAnchoredPosition";

export interface FilterOption {
  id: string;
  name: string;
  color?: string; // omitted for a neutral outline dot (e.g. "No team")
}

interface Props {
  icon: LucideIcon;
  panelLabel: string; // small heading inside the popover, e.g. "Team" / "Job type"
  allLabel: string; // trigger + reset-link text when nothing is selected, e.g. "All teams"
  options: FilterOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

const PANEL_WIDTH = 224;

/** Multi-select popover filter — colour-dot options with checkmarks, an "all" reset, portal-positioned so it always stays inside the viewport. */
export function MultiSelectFilter({ icon: Icon, panelLabel, allLabel, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pos = useAnchoredPosition(ref, open, PANEL_WIDTH, "right");

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  const label =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? (options.find((o) => o.id === selected[0])?.name ?? allLabel)
        : `${selected.length} selected`;

  const singleColor = selected.length === 1 ? options.find((o) => o.id === selected[0])?.color : undefined;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 items-center gap-1.5 rounded-[6px] border px-3 text-[13px] font-medium transition ${
          selected.length > 0
            ? "border-accent-primary/60 text-accent-primary"
            : "border-border-default text-text-secondary hover:bg-surface-active hover:text-text-primary"
        }`}
      >
        {singleColor ? (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: singleColor }} />
        ) : (
          <Icon size={14} />
        )}
        {label}
        <ChevronDown size={14} />
      </button>

      {open &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: PANEL_WIDTH }}
            className="z-50 rounded-[8px] border border-border-strong bg-surface-raised p-2 shadow-2xl"
          >
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-[13px] font-medium text-text-primary">{panelLabel}</span>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-[12px] text-accent-primary transition hover:brightness-110"
                >
                  {allLabel}
                </button>
              )}
            </div>
            <div className="max-h-64 space-y-0.5 overflow-y-auto scroll-slim">
              {options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggle(o.id)}
                  className="flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left text-[13px] transition hover:bg-surface-active"
                >
                  {o.color ? (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: o.color }} />
                  ) : (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-border-strong" />
                  )}
                  <span className="flex-1 truncate text-text-primary">{o.name}</span>
                  {selected.includes(o.id) && <Check size={13} className="text-accent-primary" />}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
