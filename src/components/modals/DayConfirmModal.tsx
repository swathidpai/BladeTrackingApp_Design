import { useState } from "react";
import { Job } from "../../data";
import { longLabel } from "../../utils";
import { useStore } from "../../store";
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
  const cancellationReasons = useStore((s) => s.cancellationReasons);

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
              {cancellationReasons.map((r) => (
                <Pill
                  key={r.id}
                  label={r.name}
                  selected={selected.includes(r.name)}
                  onClick={() => toggle(r.name)}
                  dotColor={r.color}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
