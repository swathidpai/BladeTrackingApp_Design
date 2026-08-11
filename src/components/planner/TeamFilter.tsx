import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Users } from "lucide-react";
import { Team } from "../../data";
import { NO_TEAM_FILTER_ID } from "../../utils";

interface Props {
  teams: Team[];
  selected: string[]; // team ids + NO_TEAM_FILTER_ID; empty = all teams
  onChange: (ids: string[]) => void;
}

export function TeamFilter({ teams, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
      ? "All teams"
      : selected.length === 1
        ? (teams.find((t) => t.id === selected[0])?.name ?? "No team")
        : `${selected.length} teams`;

  const singleColor =
    selected.length === 1 ? teams.find((t) => t.id === selected[0])?.color : undefined;

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
          <Users size={14} />
        )}
        {label}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-1.5 w-56 rounded-[8px] border border-border-strong bg-surface-raised p-2 shadow-2xl">
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-[13px] font-medium text-text-primary">Team</span>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[12px] text-accent-primary transition hover:brightness-110"
              >
                All teams
              </button>
            )}
          </div>
          <div className="max-h-64 space-y-0.5 overflow-y-auto scroll-slim">
            <button
              type="button"
              onClick={() => toggle(NO_TEAM_FILTER_ID)}
              className="flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left text-[13px] transition hover:bg-surface-active"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-border-strong" />
              <span className="flex-1 truncate text-text-primary">No team</span>
              {selected.includes(NO_TEAM_FILTER_ID) && <Check size={13} className="text-accent-primary" />}
            </button>
            {teams.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                className="flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left text-[13px] transition hover:bg-surface-active"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="flex-1 truncate text-text-primary">{t.name}</span>
                {selected.includes(t.id) && <Check size={13} className="text-accent-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
