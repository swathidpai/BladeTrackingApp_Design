import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, Users, X } from "lucide-react";
import { Team } from "../../data";
import { useAnchoredPosition } from "../../hooks/useAnchoredPosition";

const PANEL_WIDTH = 256; // w-64

interface Props {
  teams: Team[];
  value: string | null;
  onChange: (teamId: string | null) => void;
  /** "icon" = small circular button for the job card's action row. "field" = full-width labelled trigger for a form. */
  variant?: "icon" | "field";
}

/** Small popover team picker — searchable list + "No team", reused on the job card and in the job edit form. */
export function TeamPicker({ teams, value, onChange, variant = "icon" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const current = teams.find((t) => t.id === value);
  const pos = useAnchoredPosition(ref, open, PANEL_WIDTH);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(
    () => teams.filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase())),
    [teams, query],
  );

  function select(teamId: string | null) {
    onChange(teamId);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={ref} className="relative">
      {variant === "icon" ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
            current
              ? ""
              : "border-border-default text-text-muted hover:border-border-strong hover:text-text-primary"
          }`}
          style={
            current
              ? { backgroundColor: `${current.color}33`, color: current.color, borderColor: current.color }
              : undefined
          }
          aria-label={current ? `Team: ${current.name}` : "Assign a team"}
          title={current ? current.name : "Assign a team"}
        >
          <Users size={14} />
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          className="flex h-10 w-full items-center gap-2 rounded-[6px] border border-border-default bg-surface-raised px-3 text-sm transition hover:border-border-strong"
        >
          {current ? (
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: current.color }} />
          ) : (
            <span className="h-2 w-2 shrink-0 rounded-full border border-border-strong" />
          )}
          <span className={current ? "text-text-primary" : "text-text-muted"}>{current?.name ?? "No team"}</span>
        </button>
      )}

      {open &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: PANEL_WIDTH }}
            className="z-50 rounded-[8px] border border-border-strong bg-surface-raised p-2 shadow-2xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-medium text-text-primary">Team</span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
                className="text-text-muted transition hover:text-text-primary"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <div className="mb-2 flex items-center gap-2 rounded-[6px] border border-border-default bg-surface-active px-2">
              <Search size={13} className="shrink-0 text-text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search teams"
                className="h-8 flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none"
              />
            </div>
            <div className="max-h-56 space-y-0.5 overflow-y-auto scroll-slim">
              <button
                type="button"
                onClick={() => select(null)}
                className={`flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left text-[13px] transition hover:bg-surface-active ${
                  value === null ? "bg-surface-active" : ""
                }`}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-border-strong" />
                <span className="text-text-primary">No team</span>
              </button>
              {filtered.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => select(t.id)}
                  className={`flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left text-[13px] transition hover:bg-surface-active ${
                    t.id === value ? "bg-surface-active" : ""
                  }`}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="flex-1 truncate text-text-primary">{t.name}</span>
                  <span className="shrink-0 text-[11px] text-text-muted">{t.members.length}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-2 py-3 text-center text-[12px] text-text-muted">No teams match "{query}".</p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
