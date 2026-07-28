import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Job, REASONS, TurbineStatus } from "../../data";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Pill } from "../ui/Pill";
import { Dropdown, Field } from "../ui/Dropdown";
import { Stepper } from "../ui/Stepper";

interface Props {
  job: Job;
  onClose: () => void;
  onConfirm: (reasons: string[], patch: Partial<Job>) => void;
}

export function CancelReasonModal({ job, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState<string[]>(job.cancelReasons.length ? job.cancelReasons : []);
  const [extra, setExtra] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [newReason, setNewReason] = useState("");
  const [techs, setTechs] = useState<number | null>(job.techs);
  const [duration, setDuration] = useState<number | null>(job.duration);
  const [turbineStatus, setTurbineStatus] = useState<TurbineStatus | null>(job.turbineStatus);

  const toggle = (r: string) =>
    setSelected((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));

  const allReasons = [...REASONS, ...extra];

  return (
    <Modal
      title="Why was this job cancelled?"
      width={520}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(selected, { techs, duration, turbineStatus })}
          >
            Cancel job
          </Button>
        </>
      }
    >
      <div>
        <span className="mb-2 block text-[13px] font-medium text-text-primary">Reasons</span>
        <div className="flex flex-wrap gap-2">
          {allReasons.map((r) => (
            <Pill key={r} label={r} selected={selected.includes(r)} onClick={() => toggle(r)} />
          ))}
          {adding ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-accent-primary bg-surface-raised px-2 py-0.5">
              <input
                autoFocus
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="New reason"
                className="w-24 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none"
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
                <Check size={14} strokeWidth={2.5} />
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

      <div className="h-px bg-border-strong" />

      <div>
        <p className="mb-3 text-[13px] font-medium text-text-primary">
          Confirm the details
          <span className="ml-2 font-normal text-text-muted">edit if anything changed</span>
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Techs">
            <Stepper value={techs} onChange={setTechs} min={1} placeholder="—" />
          </Field>
          <Field label="Duration">
            <Stepper value={duration} onChange={setDuration} min={1} suffix="hr" placeholder="—" />
          </Field>
          <Field label="Turbine status">
            <Dropdown
              value={turbineStatus}
              onChange={(v) => setTurbineStatus(v as TurbineStatus)}
              options={[
                { value: "Online", label: "Online" },
                { value: "Offline", label: "Offline" },
              ]}
              placeholder="Status"
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
