import {
  Check,
  ChevronDown,
  Copy,
  GripVertical,
  Trash2,
  X,
  ClipboardList,
  Plus,
} from "lucide-react";
import { Job } from "../../data";
import { attentionReason, missingFields, needsAttention } from "../../utils";
import { TypeTag } from "../ui/Pill";
import { Tooltip } from "../ui/Tooltip";

interface Props {
  job: Job;
  onSetStatus: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onReasonClick?: () => void;
  onLinkWorkOrder?: () => void;
  fullWidth?: boolean;
  handleProps?: Record<string, unknown>; // drag handle listeners/attributes
  showHandle?: boolean; // always-visible handle (resolve backlog)
  dimmed?: boolean; // source gap while dragging
  inlineMissing?: boolean; // show inline "Missing: …" line (resolve)
  onMissingClick?: () => void;
}

function surfaceStyle(job: Job) {
  const attention = needsAttention(job);
  if (job.status === "complete") return "border-success bg-success-bg";
  if (job.status === "cancelled") return "border-cancelled bg-cancelled-bg";
  if (attention) return "border-attention/60 bg-surface-raised";
  return "border-border-default bg-surface-raised";
}

// The single status control reflects the current status by label, glyph and colour.
function statusControl(job: Job) {
  if (job.status === "complete")
    return {
      label: "Successful",
      icon: Check,
      tip: "Successful — change status",
      className: "border-success bg-success/20 text-success",
    };
  if (job.status === "cancelled")
    return {
      label: "Cancelled",
      icon: X,
      tip: "Cancelled — change status",
      className: "border-cancelled bg-cancelled/20 text-cancelled",
    };
  return {
    label: "Set status",
    icon: ChevronDown,
    tip: "Set status",
    className: "border-border-default bg-surface-raised text-text-secondary hover:text-text-primary",
  };
}

export function JobCard({
  job,
  onSetStatus,
  onDuplicate,
  onDelete,
  onReasonClick,
  onLinkWorkOrder,
  fullWidth,
  handleProps,
  showHandle,
  dimmed,
  inlineMissing,
  onMissingClick,
}: Props) {
  const attention = needsAttention(job);
  const missing = missingFields(job);
  const status = statusControl(job);
  const StatusIcon = status.icon;

  return (
    <div
      className={`group relative rounded-[6px] border p-3 pl-5 transition ${surfaceStyle(job)} ${
        dimmed ? "opacity-40" : ""
      } ${fullWidth ? "w-full" : ""}`}
    >
      {/* Attention badge */}
      {attention && (
        <Tooltip label={attentionReason(job)}>
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-attention text-[10px] font-bold text-white">
            !
          </span>
        </Tooltip>
      )}

      {/* Drag handle — sits in the left gutter, aligned with the top row.
          Omitted entirely where drag is disabled (e.g. the three-day calendar). */}
      {(handleProps || showHandle) && (
        <button
          {...handleProps}
          className={`absolute left-0.5 top-3 cursor-grab touch-none text-text-muted transition active:cursor-grabbing ${
            showHandle ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          aria-label="Drag to reschedule"
        >
          <GripVertical size={15} />
        </button>
      )}

      {/* Title */}
      <h3 title={job.name} className="truncate text-[15px] font-medium text-text-primary">
        {job.name}
      </h3>

      {/* Metadata */}
      <div className="mt-1.5 flex items-center gap-3 overflow-hidden text-[13px] text-text-secondary">
        <span className="whitespace-nowrap">
          {job.techs != null ? `${job.techs} techs` : "— techs"}
        </span>
        <span className="whitespace-nowrap">
          {job.duration != null ? `${job.duration} hr` : "— hr"}
        </span>
        <span className="truncate">{job.turbine}</span>
      </div>

      {/* Work order row + type tag (tag wraps below only if it must) */}
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px]">
        {job.workOrder ? (
          <span className="flex items-center gap-1.5 whitespace-nowrap text-text-secondary">
            <ClipboardList size={13} className="shrink-0" />
            {job.workOrder}
          </span>
        ) : (
          <button
            type="button"
            onClick={onLinkWorkOrder}
            className="flex items-center gap-1 whitespace-nowrap text-text-muted transition hover:text-accent-primary"
          >
            <Plus size={13} className="shrink-0" /> Link work order
          </button>
        )}
        <div className="ml-auto shrink-0">
          <TypeTag label={job.type} />
        </div>
      </div>

      {/* Inline missing line (resolve backlog) */}
      {inlineMissing && missing.length > 0 && (
        <button
          type="button"
          onClick={onMissingClick}
          className="mt-2 block text-left text-[13px] text-attention transition hover:brightness-110"
        >
          Missing: {missing.join(", ")}
        </button>
      )}

      {/* Action row — status / duplicate / delete */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-default pt-3">
        <Tooltip label={status.tip}>
          <button
            type="button"
            onClick={onSetStatus}
            className={`flex h-7 items-center gap-1 whitespace-nowrap rounded-[4px] border px-2 text-[13px] font-medium transition hover:brightness-110 ${status.className}`}
            aria-label={status.label}
          >
            {status.label}
            <StatusIcon size={13} strokeWidth={2.5} />
          </button>
        </Tooltip>
        <div className="flex items-center gap-1">
          <IconAction label="Duplicate" onClick={onDuplicate}>
            <Copy size={15} />
          </IconAction>
          <IconAction label="Delete" danger onClick={onDelete}>
            <Trash2 size={15} />
          </IconAction>
        </div>
      </div>

      {/* Reason footer — cancelled only */}
      {job.status === "cancelled" && job.cancelReasons.length > 0 && (
        <Tooltip label={job.cancelReasons.join(", ")}>
          <button
            type="button"
            onClick={onReasonClick}
            className="mt-2 block w-full truncate border-t border-border-default pt-2 text-left text-[13px] text-text-secondary transition hover:text-text-primary"
          >
            {reasonSummary(job.cancelReasons)}
          </button>
        </Tooltip>
      )}
    </div>
  );
}

function reasonSummary(reasons: string[]) {
  if (reasons.length <= 2) return reasons.join(", ");
  return `${reasons.slice(0, 2).join(", ")} and ${reasons.length - 2} more…`;
}

function IconAction({
  label,
  danger,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        onClick={onClick}
        className={`flex h-7 w-7 items-center justify-center rounded-[4px] border border-transparent transition hover:border-border-strong hover:bg-surface-active ${
          danger ? "text-text-muted hover:text-attention" : "text-text-muted hover:text-text-primary"
        }`}
        aria-label={label}
      >
        {children}
      </button>
    </Tooltip>
  );
}
