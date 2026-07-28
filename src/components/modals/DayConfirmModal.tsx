import { useState } from "react";
import { Plus } from "lucide-react";
import { Job, REASONS } from "../../data";
import { longLabel } from "../../utils";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Pill } from "../ui/Pill";

interface Props {
  day: string;
  mode: "complete" | "cancel";
  jobs: Job[]; // all jobs on the day
  onClose: () => void;
  onConfirm: (reasons: string[]) => void;
}

export function DayConfirmModal({ day, mode, jobs, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [extra, setExtra] = useState<string[]>([]);
  const [newReason, setNewReason] = useState("");
  const [adding, setAdding] = useState(false);

  const affected = jobs.filter((j) => j.status === "planned");
  const skipped = jobs.length - affected.length;
  const complete = mode === "complete";

  const toggle = (r: string) =>
    setSelected((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));

  return (
    <Modal
      title={
        complete
          ? `Mark all ${affected.length} jobs on ${longLabel(day)} as successful?`
          : `Cancel all ${affected.length} jobs on ${longLabel(day)}?`
      }
      width={420}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={complete ? "success" : "danger"}
            onClick={() => onConfirm(selected)}
            disabled={affected.length === 0}
          >
            {complete ? "Mark all successful" : "Cancel all jobs"}
          </Button>
        </>
      }
    >
      <ul className="space-y-1 text-[13px] text-text-secondary">
        {affected.map((j) => (
          <li key={j.id} className="truncate">
            {j.name}
          </li>
        ))}
      </ul>

      {skipped > 0 && (
        <p className="text-[13px] text-text-muted">
          {skipped} {skipped === 1 ? "job already has" : "jobs already have"} a status and will not be
          changed.
        </p>
      )}

      {!complete && (
        <>
          <div className="h-px bg-border-strong" />
          <div>
            <p className="mb-2 text-[13px] text-text-secondary">
              This reason will be applied to all {affected.length} jobs.
            </p>
            <div className="flex flex-wrap gap-2">
              {[...REASONS, ...extra].map((r) => (
                <Pill key={r} label={r} selected={selected.includes(r)} onClick={() => toggle(r)} />
              ))}
              {adding ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-accent-primary bg-surface-raised px-2 py-0.5">
                  <input
                    autoFocus
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    className="w-20 bg-transparent text-[13px] text-text-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    className="text-accent-primary"
                    onClick={() => {
                      if (newReason.trim()) {
                        setExtra((p) => [...p, newReason.trim()]);
                        setSelected((p) => [...p, newReason.trim()]);
                      }
                      setNewReason("");
                      setAdding(false);
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-accent-primary/60 px-3 py-1 text-[13px] font-medium text-accent-primary transition hover:bg-accent-dim"
                >
                  <Plus size={13} /> Add reason
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
