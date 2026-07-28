import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Check, CheckCircle2, ChevronDown, ChevronLeft, X } from "lucide-react";
import { Job, JobStatus, TODAY } from "../../data";
import {
  addDays,
  dateNumber,
  dayName,
  isToday,
  longLabel,
  missingFields,
  needsAttention,
} from "../../utils";
import { JobCard } from "../planner/JobCard";
import { TypeTag } from "../ui/Pill";
import { Tooltip } from "../ui/Tooltip";
import { Button } from "../ui/Button";
import { ReschedulePicker } from "./ReschedulePicker";

interface Props {
  jobs: Job[];
  onBack: () => void;
  onStatus: (job: Job, s: JobStatus) => void;
  onReschedule: (job: Job, day: string, time: string) => void;
  onSetStatus: (job: Job) => void;
  onDuplicate: (job: Job) => void;
  onDelete: (job: Job) => void;
  onMarkAllComplete: (day: string) => void;
  onCancelAll: (day: string) => void;
}

export function ResolveScreen(props: Props) {
  const { jobs, onBack, onStatus, onReschedule } = props;

  const attention = useMemo(() => jobs.filter(needsAttention), [jobs]);
  const groups = useMemo(() => {
    const map = new Map<string, Job[]>();
    for (const j of attention) {
      if (!map.has(j.originalDay)) map.set(j.originalDay, []);
      map.get(j.originalDay)!.push(j);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [attention]);

  const flat = useMemo(() => groups.flatMap(([, list]) => list), [groups]);
  const flatIds = flat.map((j) => j.id);
  const flatKey = flatIds.join(",");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [pulseId, setPulseId] = useState<string | null>(null);
  const prevOrder = useRef<string[]>([]);

  // Keep exactly one row selected; when the selected row resolves, advance to
  // the next surviving row down (or the previous, or the first).
  useEffect(() => {
    if (selectedId && flatIds.includes(selectedId)) {
      prevOrder.current = flatIds;
      return;
    }
    let next: string | null = flatIds[0] ?? null;
    if (selectedId) {
      const old = prevOrder.current;
      const idx = old.indexOf(selectedId);
      if (idx >= 0) {
        for (let i = idx + 1; i < old.length; i++) {
          if (flatIds.includes(old[i])) { next = old[i]; break; }
        }
        if (next === (flatIds[0] ?? null)) {
          for (let i = idx - 1; i >= 0; i--) {
            if (flatIds.includes(old[i])) { next = old[i]; break; }
          }
        }
      }
    }
    setSelectedId(next);
    prevOrder.current = flatIds;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatKey]);

  // Arrow-key navigation; Enter opens the reschedule picker on the selected row.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!selectedId || openPicker) return;
      const idx = flatIds.indexOf(selectedId);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedId(flatIds[Math.min(flatIds.length - 1, idx + 1)]);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedId(flatIds[Math.max(0, idx - 1)]);
      } else if (e.key === "Enter") {
        e.preventDefault();
        setOpenPicker(selectedId);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedId, openPicker, flatKey]);

  const cleared = attention.length === 0;
  const selectedJob = jobs.find((j) => j.id === selectedId) ?? null;
  const anchor = selectedJob?.originalDay ?? TODAY;
  const threeDays = [addDays(anchor, -1), anchor, addDays(anchor, 1)];

  function reschedule(job: Job, day: string, time: string) {
    setOpenPicker(null);
    onReschedule(job, day, time);
    if (threeDays.includes(day)) {
      setPulseId(job.id);
      setTimeout(() => setPulseId((p) => (p === job.id ? null : p)), 1100);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Panel header (spans panel width only; calendar has its own headers) */}
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[480px] shrink-0 flex-col border-r border-border-strong bg-surface">
          <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border-default bg-bg-base px-4">
            <Tooltip label="Back to job planner" side="bottom">
              <button
                type="button"
                onClick={onBack}
                className="flex h-8 w-8 items-center justify-center rounded-[6px] text-text-secondary transition hover:bg-surface-active hover:text-text-primary"
                aria-label="Back to job planner"
              >
                <ChevronLeft size={20} />
              </button>
            </Tooltip>
            <h1 className="text-[22px] font-medium text-text-primary">Interrupted jobs</h1>
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-[6px] border px-1.5 text-[13px] font-medium ${
                cleared
                  ? "border-transparent bg-surface-raised text-text-muted"
                  : "border-attention bg-attention-bg text-attention"
              }`}
            >
              {attention.length}
            </span>
          </div>

          {/* Grouped rows */}
          <div className="flex-1 overflow-y-auto scroll-slim">
            {cleared ? (
              <EmptyState onBack={onBack} />
            ) : (
              groups.map(([day, list]) => (
                <div key={day}>
                  <div className="sticky top-0 z-10 flex h-9 items-center justify-between border-b border-border-default bg-surface-active px-4">
                    <span className="text-[13px] font-medium text-text-primary">{longLabel(day)}</span>
                    <span className="text-[13px] text-text-secondary">{list.length}</span>
                  </div>
                  {list.map((job) => (
                    <InterruptedRow
                      key={job.id}
                      job={job}
                      selected={job.id === selectedId}
                      pickerOpen={openPicker === job.id}
                      onSelect={() => setSelectedId(job.id)}
                      onComplete={() => onStatus(job, "complete")}
                      onCancel={() => onStatus(job, "cancelled")}
                      onOpenPicker={() => setOpenPicker(job.id)}
                      onClosePicker={() => setOpenPicker(null)}
                      onReschedule={(d, t) => reschedule(job, d, t)}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Three-day calendar, anchored to the selected job's planned date */}
        <div className="flex min-w-0 flex-1">
          {cleared ? (
            <ClearedCalendar />
          ) : (
            threeDays.map((day, i) => (
              <ThreeDayColumn
                key={day}
                day={day}
                anchor={i === 1}
                jobs={jobs.filter((j) => j.day === day)}
                pulseId={pulseId}
                onSetStatus={props.onSetStatus}
                onDuplicate={props.onDuplicate}
                onDelete={props.onDelete}
                onMarkAllComplete={() => props.onMarkAllComplete(day)}
                onCancelAll={() => props.onCancelAll(day)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ row --- */

function InterruptedRow({
  job,
  selected,
  pickerOpen,
  onSelect,
  onComplete,
  onCancel,
  onOpenPicker,
  onClosePicker,
  onReschedule,
}: {
  job: Job;
  selected: boolean;
  pickerOpen: boolean;
  onSelect: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onOpenPicker: () => void;
  onClosePicker: () => void;
  onReschedule: (day: string, time: string) => void;
}) {
  const missing = missingFields(job);

  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer border-b border-border-default px-4 py-3 transition ${
        selected
          ? "border-l-2 border-l-accent-primary bg-surface-active"
          : "border-l-2 border-l-transparent hover:bg-surface-active/50"
      }`}
    >
      {/* selection notch pointing at the calendar */}
      {selected && (
        <span className="absolute -right-px top-1/2 -translate-y-1/2">
          <span className="block h-0 w-0 border-y-[6px] border-r-[8px] border-y-transparent border-r-accent-primary" />
        </span>
      )}

      {/* Line 1 — job name + missing badge */}
      <div className="flex items-center gap-2">
        <h3
          title={job.name}
          className={`min-w-0 flex-1 truncate text-[15px] font-medium ${
            selected ? "text-text-primary" : "text-text-primary/85"
          }`}
        >
          {job.name}
        </h3>
        {missing.length > 0 && (
          <Tooltip label={`Missing: ${missing.join(", ")}`}>
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-attention text-[10px] font-bold text-white">
              !
            </span>
          </Tooltip>
        )}
      </div>

      {/* Line 2 — metadata left, controls right */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px] text-text-secondary">
          <span className="whitespace-nowrap">{job.techs != null ? `${job.techs} techs` : "— techs"}</span>
          <Dot />
          <span className="whitespace-nowrap">{job.duration != null ? `${job.duration} hr` : "— hr"}</span>
          <Dot />
          <span className="whitespace-nowrap">{job.turbine}</span>
          <TypeTag label={job.type} />
        </div>

        <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Tooltip label="Mark successful">
            <button
              type="button"
              onClick={onComplete}
              className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-success text-success transition hover:bg-success/15"
              aria-label="Mark successful"
            >
              <Check size={15} strokeWidth={2.5} />
            </button>
          </Tooltip>
          <Tooltip label="Cancel job">
            <button
              type="button"
              onClick={onCancel}
              className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-attention text-attention transition hover:bg-attention/15"
              aria-label="Cancel job"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </Tooltip>
          <div className="relative">
            <button
              type="button"
              onClick={onOpenPicker}
              className={`flex h-7 items-center gap-1 rounded-[6px] border px-2 text-[13px] transition ${
                pickerOpen
                  ? "border-accent-primary text-accent-primary"
                  : "border-border-default text-text-primary hover:border-accent-primary hover:text-accent-primary"
              }`}
            >
              <Calendar size={13} />
              {dateNumber(job.day)} {shortMonth(job.day)}
              <ChevronDown size={13} />
            </button>
            {pickerOpen && (
              <ReschedulePicker
                currentDay={job.day}
                onCancel={onClosePicker}
                onConfirm={onReschedule}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="text-text-muted">·</span>;
}

function shortMonth(key: string) {
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return M[Number(key.slice(5, 7)) - 1];
}

/* --------------------------------------------------------- calendar cols --- */

function ThreeDayColumn({
  day,
  anchor,
  jobs,
  pulseId,
  onSetStatus,
  onDuplicate,
  onDelete,
  onMarkAllComplete,
  onCancelAll,
}: {
  day: string;
  anchor: boolean;
  jobs: Job[];
  pulseId: string | null;
  onSetStatus: (job: Job) => void;
  onDuplicate: (job: Job) => void;
  onDelete: (job: Job) => void;
  onMarkAllComplete: () => void;
  onCancelAll: () => void;
}) {
  const today = isToday(day);
  return (
    <div className="flex min-w-0 flex-1 flex-col border-r border-border-default last:border-r-0">
      <div
        className={`relative flex h-[72px] shrink-0 items-center justify-between px-3 ${
          anchor ? "bg-surface-active" : "bg-surface"
        }`}
      >
        {anchor && <span className="absolute inset-x-0 top-0 h-0.5 bg-accent-primary" />}
        <div>
          {anchor && (
            <div className="text-[11px] font-medium uppercase tracking-[0.8px] text-accent-primary">
              Planned for
            </div>
          )}
          <div className="text-[11px] font-medium uppercase tracking-[0.8px] text-text-muted">
            {dayName(day)}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[22px] leading-tight ${today ? "text-accent-primary" : "text-text-primary"}`}>
              {dateNumber(day)}
            </span>
          </div>
          {today && <span className="mt-0.5 block h-1 w-1 rounded-full bg-accent-primary" />}
        </div>
        <div className="flex items-center gap-1.5">
          <Tooltip label="Mark all successful">
            <button
              type="button"
              onClick={onMarkAllComplete}
              className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-border-default text-success transition hover:bg-success/15 hover:border-success"
              aria-label="Mark all successful"
            >
              <Check size={15} strokeWidth={2.5} />
            </button>
          </Tooltip>
          <Tooltip label="Cancel all">
            <button
              type="button"
              onClick={onCancelAll}
              className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-border-default text-attention transition hover:bg-attention/15 hover:border-attention"
              aria-label="Cancel all"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2 scroll-slim">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={pulseId === job.id ? "rounded-[6px] ring-2 ring-accent-primary" : ""}
          >
            <JobCard
              job={job}
              onSetStatus={() => onSetStatus(job)}
              onDuplicate={() => onDuplicate(job)}
              onDelete={() => onDelete(job)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- empty --- */

function EmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <CheckCircle2 size={40} className="text-success" />
      <p className="text-[15px] text-text-primary">All jobs are up to date</p>
      <p className="text-[13px] text-text-secondary">Nothing is waiting to be resolved</p>
      <Button className="mt-2" onClick={onBack}>
        Back to job planner
      </Button>
    </div>
  );
}

function ClearedCalendar() {
  return (
    <div className="flex flex-1 items-center justify-center bg-surface">
      <p className="text-[13px] text-text-muted">Select a job to see the days around it</p>
    </div>
  );
}
