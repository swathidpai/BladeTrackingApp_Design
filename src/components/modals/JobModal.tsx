import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Job, JobType, TurbineStatus, nextId } from "../../data";
import { longLabel, missingFields } from "../../utils";
import { useStore } from "../../store";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Dropdown, Field, TextInput } from "../ui/Dropdown";
import { Stepper } from "../ui/Stepper";
import { WorkOrderField } from "../ui/WorkOrderField";

interface Props {
  day: string;
  job?: Job; // present => edit
  onClose: () => void;
  onSave: (job: Job) => void;
}

export function JobModal({ day, job, onClose, onSave }: Props) {
  const editing = !!job;
  const jobTypes = useStore((s) => s.jobTypes);
  const [name, setName] = useState(job?.name ?? "");
  const [type, setType] = useState<JobType | null>(job?.type ?? null);
  const [techs, setTechs] = useState<number | null>(job?.techs ?? null);
  const [duration, setDuration] = useState<number | null>(job?.duration ?? null);
  const [turbine, setTurbine] = useState(job?.turbine ?? "");
  const [turbineStatus, setTurbineStatus] = useState<TurbineStatus | null>(job?.turbineStatus ?? null);
  const [workOrder, setWorkOrder] = useState<string | null>(job?.workOrder ?? null);

  const draft: Job = {
    id: job?.id ?? nextId(),
    name: name.trim() || "Untitled job",
    type: type ?? jobTypes[0]?.name ?? "Blade Repair",
    techs,
    duration,
    turbine: turbine.trim() || "—",
    turbineStatus,
    workOrder,
    status: job?.status ?? "planned",
    cancelReasons: job?.cancelReasons ?? [],
    day: job?.day ?? day,
    originalDay: job?.originalDay ?? day,
  };
  const missing = missingFields(draft);

  const typeOptions = jobTypes.map((t) => ({ value: t.name, label: t.name, description: t.description }));

  return (
    <Modal
      title={editing ? "Edit job" : "New job"}
      subtitle={longLabel(job?.day ?? day)}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(draft)}>{editing ? "Save job" : "Create job"}</Button>
        </>
      }
    >
      <Field label="Job name">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. T1 Blade C repair" />
      </Field>

      <Field label="Job type">
        <Dropdown
          value={type}
          onChange={(v) => setType(v as JobType)}
          options={typeOptions}
          placeholder="Select a job type"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Number of techs">
          <Stepper value={techs} onChange={setTechs} min={1} placeholder="Set techs" />
        </Field>
        <Field label="Duration">
          <Stepper value={duration} onChange={setDuration} min={1} suffix="hr" placeholder="Set hours" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Turbine">
          <TextInput value={turbine} onChange={(e) => setTurbine(e.target.value)} placeholder="e.g. T1" />
        </Field>
        <Field label="Turbine status">
          <Dropdown
            value={turbineStatus}
            onChange={(v) => setTurbineStatus(v as TurbineStatus)}
            options={[
              { value: "Online", label: "Online" },
              { value: "Offline", label: "Offline" },
            ]}
            placeholder="Select status"
          />
        </Field>
      </div>

      <WorkOrderField workOrder={workOrder} onChange={setWorkOrder} workType={type} />

      {missing.length > 0 && (
        <div className="flex items-start gap-2 rounded-[6px] border border-attention/40 bg-attention-bg/60 px-3 py-2 text-[13px] text-text-secondary">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-attention" />
          Some details are missing. This job will be flagged for attention.
        </div>
      )}
    </Modal>
  );
}
