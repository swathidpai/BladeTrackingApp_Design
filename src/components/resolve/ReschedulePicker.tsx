import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { fullDayName, isPast, isToday } from "../../utils";
import { Button } from "../ui/Button";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WD = ["S", "M", "T", "W", "T", "F", "S"];

function keyOf(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** 30-minute increments, 06:00 – 18:00 — the working window. */
const TIMES = Array.from({ length: 25 }, (_, i) => {
  const mins = 6 * 60 + i * 30;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
});

interface Props {
  currentDay: string; // the job's currently-planned date key
  onCancel: () => void;
  onConfirm: (day: string, time: string) => void;
}

export function ReschedulePicker({ currentDay, onCancel, onConfirm }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [time, setTime] = useState("08:00");
  const [timeOpen, setTimeOpen] = useState(false);
  const [viewY, setViewY] = useState(() => Number(currentDay.slice(0, 4)));
  const [viewM, setViewM] = useState(() => Number(currentDay.slice(5, 7)) - 1);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onCancel();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onCancel]);

  const cells = useMemo(() => {
    const first = new Date(viewY, viewM, 1);
    const lead = first.getDay();
    const count = new Date(viewY, viewM + 1, 0).getDate();
    const out: (string | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= count; d++) out.push(keyOf(viewY, viewM, d));
    return out;
  }, [viewY, viewM]);

  function stepMonth(n: number) {
    const d = new Date(viewY, viewM + n, 1);
    setViewY(d.getFullYear());
    setViewM(d.getMonth());
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-1.5 w-80 rounded-[10px] border border-border-strong bg-surface-raised p-3 shadow-2xl"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Month header */}
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => stepMonth(-1)}
          className="flex h-7 w-7 items-center justify-center rounded-[4px] text-text-secondary transition hover:bg-surface-active hover:text-text-primary"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-[14px] font-medium text-text-primary">
          {MONTHS[viewM]} {viewY}
        </span>
        <button
          type="button"
          onClick={() => stepMonth(1)}
          className="flex h-7 w-7 items-center justify-center rounded-[4px] text-text-secondary transition hover:bg-surface-active hover:text-text-primary"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday initials */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WD.map((w, i) => (
          <div key={i} className="flex h-6 items-center justify-center text-[11px] text-text-muted">
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((key, i) => {
          if (!key) return <div key={i} />;
          const disabled = isPast(key);
          const planned = key === currentDay;
          const picked = key === chosen;
          const today = isToday(key);
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => setChosen(key)}
              className={`flex h-9 items-center justify-center rounded-[6px] text-[13px] transition ${
                picked
                  ? "bg-accent-primary font-medium text-bg-base"
                  : planned
                    ? "border border-accent-primary text-accent-primary"
                    : disabled
                      ? "cursor-not-allowed text-text-muted"
                      : `text-text-primary hover:bg-surface-active ${today ? "font-medium text-accent-primary" : ""}`
              }`}
            >
              {Number(key.slice(8))}
            </button>
          );
        })}
      </div>

      {/* Start time */}
      <div className="mt-3 border-t border-border-default pt-3">
        <span className="mb-1.5 block text-[13px] font-medium text-text-primary">Start time</span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setTimeOpen((o) => !o)}
            className="flex h-9 w-full items-center justify-between rounded-[6px] border border-border-default bg-surface px-3 text-sm text-text-primary transition hover:border-border-strong"
          >
            {time}
            <ChevronDown size={15} className="text-text-muted" />
          </button>
          {timeOpen && (
            <div className="absolute bottom-full z-10 mb-1 max-h-48 w-full overflow-auto rounded-[6px] border border-border-strong bg-surface-raised py-1 shadow-xl scroll-slim">
              {TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTime(t);
                    setTimeOpen(false);
                  }}
                  className={`block w-full px-3 py-1.5 text-left text-sm transition hover:bg-surface-active ${
                    t === time ? "text-accent-primary" : "text-text-primary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!chosen} onClick={() => chosen && onConfirm(chosen, time)}>
          Reschedule
        </Button>
      </div>
    </div>
  );
}

/** "Thursday 24 July, 08:00" — for the reschedule toast. */
export function moveLabel(day: string, time: string) {
  return `${fullDayName(day)} ${Number(day.slice(8))} ${MONTHS[Number(day.slice(5, 7)) - 1]}, ${time}`;
}
