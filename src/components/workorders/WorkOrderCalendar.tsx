import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Job } from "../../data";
import { dateNumber, dayName, isToday, monthName, shortLabel } from "../../utils";

export const CALENDAR_DAY_PREFIX = "wo-day-";
export const CALENDAR_JOB_PREFIX = "wo-job-";

interface Props {
  days: string[];
  jobsByDay: Map<string, Job[]>;
  onStep: (weeks: number) => void;
  onToday: () => void;
  onDeleteJob: (job: Job) => void;
}

export function WorkOrderCalendar({ days, jobsByDay, onStep, onToday, onDeleteJob }: Props) {
  const first = days[0];
  const last = days[days.length - 1];
  const firstMonth = monthName(first);
  const lastMonth = monthName(last);
  const rangeLabel =
    firstMonth === lastMonth
      ? `${dateNumber(first)} – ${dateNumber(last)} ${firstMonth}`
      : `${shortLabel(first)} – ${shortLabel(last)}`;

  return (
    <div className="border-b border-border-default">
      <div className="flex items-center gap-3 px-6 py-3">
        <button
          type="button"
          onClick={() => onStep(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-text-secondary transition hover:bg-surface-active hover:text-text-primary"
          aria-label="Previous 7 days"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-[13px] font-medium text-text-secondary">{rangeLabel}</p>
        <button
          type="button"
          onClick={() => onStep(1)}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-text-secondary transition hover:bg-surface-active hover:text-text-primary"
          aria-label="Next 7 days"
        >
          <ChevronRight size={18} />
        </button>
        <button
          type="button"
          onClick={onToday}
          className="ml-auto flex h-8 items-center rounded-[6px] border border-border-default px-3 text-[13px] font-medium text-text-secondary transition hover:bg-surface-active hover:text-text-primary"
        >
          Today
        </button>
      </div>

      <div className="flex">
        {days.map((day) => (
          <DayColumn key={day} day={day} jobs={jobsByDay.get(day) ?? []} onDeleteJob={onDeleteJob} />
        ))}
      </div>
    </div>
  );
}

function DayColumn({ day, jobs, onDeleteJob }: { day: string; jobs: Job[]; onDeleteJob: (job: Job) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `${CALENDAR_DAY_PREFIX}${day}`, data: { kind: "day", day } });
  const today = isToday(day);

  return (
    <div
      ref={setNodeRef}
      data-day={day}
      className={`flex min-h-[190px] flex-1 flex-col border-r border-border-default p-2 transition last:border-r-0 ${
        today ? "bg-surface-active" : "bg-surface"
      } ${isOver ? "outline outline-2 -outline-offset-2 outline-accent-primary" : ""}`}
    >
      <div className="mb-2 px-1">
        <div className={`text-[11px] font-medium uppercase tracking-[0.8px] ${today ? "text-accent-primary" : "text-text-muted"}`}>
          {dayName(day)}
        </div>
        <div className={`text-[16px] leading-tight ${today ? "text-accent-primary" : "text-text-primary"}`}>
          {dateNumber(day)}
        </div>
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto scroll-slim">
        {jobs.map((job) => (
          <PlannedChip key={job.id} job={job} onDelete={() => onDeleteJob(job)} />
        ))}
      </div>
    </div>
  );
}

function PlannedChip({ job, onDelete }: { job: Job; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${CALENDAR_JOB_PREFIX}${job.id}`,
    data: { kind: "job", job },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={job.name}
      className={`flex cursor-grab items-center gap-1.5 rounded-[6px] border border-border-default bg-surface-raised px-2 py-1.5 text-[12px] text-text-primary transition active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <span className="min-w-0 flex-1 truncate">{job.name}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="shrink-0 text-text-muted transition hover:text-attention"
        aria-label={`Remove ${job.name}`}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
