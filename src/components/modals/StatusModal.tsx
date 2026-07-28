import { useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import {
  ASSETS,
  Job,
  JobStatus,
  JOB_TYPES,
  JobType,
  REASONS,
  SUB_ASSETS,
  TurbineStatus,
} from "../../data";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Pill } from "../ui/Pill";
import { Dropdown, Field } from "../ui/Dropdown";
import { Stepper } from "../ui/Stepper";

interface Props {
  job: Job;
  onClose: () => void;
  onSave: (patch: Partial<Job>, status: JobStatus) => void;
}

type Branch = "planned" | "complete" | "cancelled";

const TAGS: { value: Branch; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "complete", label: "Successful" },
  { value: "cancelled", label: "Cancelled" },
];

export function StatusModal({ job, onClose, onSave }: Props) {
  const [branch, setBranch] = useState<Branch>(job.status);
  const [reasons, setReasons] = useState<string[]>(job.cancelReasons);
  const [extra, setExtra] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [newReason, setNewReason] = useState("");

  const [techs, setTechs] = useState<number | null>(job.techs);
  const [duration, setDuration] = useState<number | null>(job.duration);
  const [turbineStatus, setTurbineStatus] = useState<TurbineStatus | null>(job.turbineStatus);

  const [moreOpen, setMoreOpen] = useState(false);
  const [asset, setAsset] = useState<string | null>(job.asset ?? job.turbine ?? null);
  const [subAsset, setSubAsset] = useState<string | null>(job.subAsset ?? null);
  const [workType, setWorkType] = useState<JobType>(job.type);

  const toggleReason = (r: string) =>
    setReasons((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));

  // Choosing a work type pre-fills techs, duration and turbine status from its defaults.
  function pickWorkType(t: JobType) {
    setWorkType(t);
    const d = JOB_TYPES.find((j) => j.name === t)?.defaults;
    if (d) {
      setTechs(d.techs);
      setDuration(d.duration);
      setTurbineStatus(d.turbineStatus);
    }
  }

  const allReasons = [...REASONS, ...extra];

  const primary =
    branch === "planned"
      ? { label: "Save", variant: "primary" as const }
      : branch === "complete"
        ? { label: "Mark successful", variant: "success" as const }
        : { label: "Cancel job", variant: "danger" as const };

  function save() {
    onSave(
      {
        status: branch,
        cancelReasons: branch === "cancelled" ? reasons : [],
        techs,
        duration,
        turbineStatus,
        asset,
        subAsset,
        type: workType,
      },
      branch,
    );
  }

  return (
    <Modal
      title="Set job status"
      subtitle={job.name}
      width={520}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button variant={primary.variant} onClick={save}>
            {primary.label}
          </Button>
        </>
      }
    >
      {/* Branch selector */}
      <div className="flex gap-2">
        {TAGS.map((t) => (
          <Pill
            key={t.value}
            label={t.label}
            selected={branch === t.value}
            onClick={() => setBranch(t.value)}
          />
        ))}
      </div>

      {/* Branch body */}
      {branch === "planned" && (
        <p className="text-[13px] text-text-secondary">
          This job stays on the schedule with no outcome recorded yet.
        </p>
      )}

      {branch === "cancelled" && (
        <div>
          <span className="mb-2 block text-[13px] font-medium text-text-primary">Reasons</span>
          <div className="flex flex-wrap gap-2">
            {allReasons.map((r) => (
              <Pill key={r} label={r} selected={reasons.includes(r)} onClick={() => toggleReason(r)} />
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
                      setReasons((p) => [...p, newReason.trim()]);
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
      )}

      {/* Confirm details — shown for successful and cancelled */}
      {(branch === "complete" || branch === "cancelled") && (
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
      )}

      {/* More details accordion */}
      <div className="rounded-[6px] border border-border-default">
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          className="flex w-full items-center justify-between px-3 py-2.5 text-[13px] font-medium text-text-primary"
        >
          More details
          <ChevronDown
            size={16}
            className={`text-text-muted transition ${moreOpen ? "rotate-180" : ""}`}
          />
        </button>
        {moreOpen && (
          <div className="space-y-3 border-t border-border-default p-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Asset">
                <Dropdown
                  value={asset}
                  onChange={setAsset}
                  options={ASSETS.map((a) => ({ value: a, label: a }))}
                  placeholder="Select asset"
                />
              </Field>
              <Field label="Sub-asset">
                <Dropdown
                  value={subAsset}
                  onChange={setSubAsset}
                  options={SUB_ASSETS.map((a) => ({ value: a, label: a }))}
                  placeholder="Select sub-asset"
                />
              </Field>
            </div>
            <Field label="Work type">
              <Dropdown
                value={workType}
                onChange={(v) => pickWorkType(v as JobType)}
                options={JOB_TYPES.map((t) => ({
                  value: t.name,
                  label: t.name,
                  description: t.description,
                }))}
                placeholder="Select work type"
              />
            </Field>
            <p className="text-[12px] text-text-muted">
              Choosing a work type pre-fills techs, duration and turbine status.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
