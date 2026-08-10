import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Team } from "../../data";

interface Props {
  teams: Team[];
  value: string | null; // teamId, or null for "No team"
  onChange: (teamId: string | null) => void;
  compact?: boolean; // smaller trigger, for inline table use
}

export function TeamDropdown({ teams, value, onChange, compact }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = teams.find((t) => t.id === value);

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
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={`flex items-center justify-between gap-2 rounded-[6px] border border-border-default bg-surface-raised transition hover:border-border-strong ${
          compact ? "h-7 px-2 text-[12px]" : "h-10 w-full px-3 text-sm"
        }`}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {current ? (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: current.color }} />
          ) : (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-border-strong" />
          )}
          <span className={`truncate ${current ? "text-text-primary" : "text-text-muted"}`}>
            {current?.name ?? "No team"}
          </span>
        </span>
        <ChevronDown size={compact ? 13 : 16} className="shrink-0 text-text-muted" />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 min-w-[180px] overflow-auto rounded-[6px] border border-border-strong bg-surface-raised py-1 shadow-xl">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
              setOpen(false);
            }}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-surface-active ${
              value === null ? "bg-surface-active" : ""
            }`}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-border-strong" />
            <span className="text-text-primary">No team</span>
          </button>
          {teams.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(t.id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-surface-active ${
                t.id === value ? "bg-surface-active" : ""
              }`}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
              <span className="text-text-primary">{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
