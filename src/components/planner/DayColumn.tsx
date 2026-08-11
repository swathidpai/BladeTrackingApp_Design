import { Check, Plus, X } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Job, Team } from "../../data";
import { dateNumber, dayName, isPast, isToday, isWeekend } from "../../utils";
import { SortableJobCard } from "./SortableJobCard";
import { Tooltip } from "../ui/Tooltip";

interface Props {
  dayKey: string;
  jobs: Job[];
  activeId: string | null;
  isOver?: boolean;
  teams: Team[];
  onAddJob: (day: string) => void;
  onMarkAllComplete: (day: string) => void;
  onCancelAll: (day: string) => void;
  onSetStatus: (job: Job) => void;
  onDuplicate: (job: Job) => void;
  onDelete: (job: Job) => void;
  onReasonClick: (job: Job) => void;
  onLinkWorkOrder: (job: Job) => void;
  onTeamChange: (job: Job, teamId: string | null) => void;
}

export function DayColumn({
  dayKey,
  jobs,
  activeId,
  teams,
  onAddJob,
  onMarkAllComplete,
  onCancelAll,
  onSetStatus,
  onDuplicate,
  onDelete,
  onReasonClick,
  onLinkWorkOrder,
  onTeamChange,
}: Props) {
  const today = isToday(dayKey);
  const past = isPast(dayKey);
  const weekend = isWeekend(dayKey);
  const { setNodeRef, isOver } = useDroppable({ id: dayKey, data: { containerId: dayKey } });

  return (
    <div className="flex min-w-0 flex-1 flex-col border-r border-border-default last:border-r-0">
      {/* Header */}
      <div
        className={`relative flex h-[72px] shrink-0 items-start justify-between px-3 pt-3 ${
          today ? "bg-surface-active" : weekend ? "bg-black/20" : "bg-surface"
        }`}
      >
        {today && <span className="absolute inset-x-0 top-0 h-0.5 bg-accent-primary" />}
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.8px] text-text-muted">
            {dayName(dayKey)}
          </div>
          <div
            className={`text-[22px] leading-tight ${
              today ? "text-accent-primary" : past ? "text-text-muted" : "text-text-primary"
            }`}
          >
            {dateNumber(dayKey)}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip label="Mark all successful">
            <button
              type="button"
              onClick={() => onMarkAllComplete(dayKey)}
              className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-success/60 text-success transition hover:bg-success/15"
            >
              <Check size={15} strokeWidth={2.5} />
            </button>
          </Tooltip>
          <Tooltip label="Cancel all jobs">
            <button
              type="button"
              onClick={() => onCancelAll(dayKey)}
              className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-attention/60 text-attention transition hover:bg-attention/15"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Add-job row */}
      <button
        type="button"
        onClick={() => onAddJob(dayKey)}
        className="group/add flex h-[52px] shrink-0 items-center justify-center border-y border-border-default text-[13px] text-text-secondary transition hover:bg-surface-active hover:text-accent-primary"
      >
        <span className="flex items-center gap-1 rounded-[6px] px-3 py-1.5 group-hover/add:outline group-hover/add:outline-1 group-hover/add:outline-dashed group-hover/add:outline-accent-primary">
          <Plus size={14} /> New job
        </span>
      </button>

      {/* Card stack */}
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 overflow-y-auto p-2 scroll-slim transition ${
          isOver ? "bg-accent-primary/[0.06]" : ""
        }`}
      >
        <SortableContext items={jobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <SortableJobCard
              key={job.id}
              job={job}
              containerId={dayKey}
              activeId={activeId}
              teams={teams}
              onSetStatus={() => onSetStatus(job)}
              onDuplicate={() => onDuplicate(job)}
              onDelete={() => onDelete(job)}
              onReasonClick={() => onReasonClick(job)}
              onLinkWorkOrder={() => onLinkWorkOrder(job)}
              onTeamChange={(teamId) => onTeamChange(job, teamId)}
            />
          ))}
        </SortableContext>
        {isOver && jobs.length === 0 && (
          <div className="h-24 rounded-[6px] border border-dashed border-accent-primary" />
        )}
      </div>
    </div>
  );
}
