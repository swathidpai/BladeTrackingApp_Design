import { useState } from "react";
import { AlertTriangle, ClipboardList, Plus, Search, X } from "lucide-react";
import { Job, JobType, JOB_TYPES, TurbineStatus, WORK_ORDERS, nextId } from "../../data";
import { longLabel, missingFields } from "../../utils";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Dropdown, Field, TextInput } from "../ui/Dropdown";
import { Stepper } from "../ui/Stepper";

interface Props {
  day: string;
  job?: Job; // present => edit
  onClose: () => void;
  onSave: (job: Job) => void;
}

export function JobModal({ day, job, onClose, onSave }: Props) {
  const editing = !!job;
  const [name, setName] = useState(job?.name ?? "");
  const [type, setType] = useState<JobType | null>(job?.type ?? null);
  const [techs, setTechs] = useState<number | null>(job?.techs ?? null);
  const [duration, setDuration] = useState<number | null>(job?.duration ?? null);
  const [turbine, setTurbine] = useState(job?.turbine ?? "");
  const [turbineStatus, setTurbineStatus] = useState<TurbineStatus | null>(job?.turbineStatus ?? null);
  const [workOrder, setWorkOrder] = useState(job?.workOrder ?? "");

  // Linked work orders (chips)
  const [chips, setChips] = useState<string[]>(job?.workOrder ? [job.workOrder] : []);
  const [query, setQuery] = useState("");
  const [addingType, setAddingType] = useState(false);
  const [newType, setNewType] = useState("");
  const [extraTypes, setExtraTypes] = useState<string[]>([]);

  const draft: Job = {
    id: job?.id ?? nextId(),
    name: name.trim() || "Untitled job",
    type: (type ?? "Blade Repair") as JobType,
    techs,
    duration,
    turbine: turbine.trim() || "—",
    turbineStatus,
    workOrder: chips[0] ?? (workOrder.trim() || null),
    status: job?.status ?? "planned",
    cancelReasons: job?.cancelReasons ?? [],
    day: job?.day ?? day,
    originalDay: job?.originalDay ?? day,
  };
  const missing = missingFields(draft);

  const results = WORK_ORDERS.filter(
    (w) =>
      !chips.includes(w.number) &&
      (w.number.includes(query) || w.description.toLowerCase().includes(query.toLowerCase())),
  );

  const typeOptions = [
    ...JOB_TYPES.map((t) => ({ value: t.name, label: t.name, description: t.description })),
    ...extraTypes.map((t) => ({ value: t, label: t, description: "Custom job type" })),
  ];

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
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. C4 Blade C repair" />
      </Field>

      <Field label="Job type">
        <Dropdown
          value={type}
          onChange={(v) => setType(v as JobType)}
          options={typeOptions}
          placeholder="Select a job type"
          footer={
            addingType ? (
              <div className="flex items-center gap-1 px-2 py-1.5">
                <TextInput
                  autoFocus
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="New job type"
                  className="h-8"
                />
                <button
                  type="button"
                  className="text-accent-primary"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (newType.trim()) {
                      setExtraTypes((p) => [...p, newType.trim()]);
                      setType(newType.trim() as JobType);
                    }
                    setNewType("");
                    setAddingType(false);
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-sm text-accent-primary transition hover:bg-surface-active"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setAddingType(true);
                }}
              >
                <Plus size={14} /> Add job type
              </button>
            )
          }
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
          <TextInput value={turbine} onChange={(e) => setTurbine(e.target.value)} placeholder="e.g. C4" />
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

      <Field label="Work order number">
        <TextInput value={workOrder} onChange={(e) => setWorkOrder(e.target.value)} placeholder="e.g. 40021874" />
      </Field>

      {/* Asana-style linker */}
      <div>
        <span className="mb-1.5 block text-[13px] font-medium text-text-primary">Linked work orders</span>
        {chips.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {chips.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1.5 rounded-[6px] bg-surface-raised px-2 py-1 text-[13px] text-text-primary"
              >
                <ClipboardList size={12} className="text-text-muted" />
                {c}
                <button type="button" onClick={() => setChips((p) => p.filter((x) => x !== c))}>
                  <X size={13} className="text-text-muted transition hover:text-text-primary" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-[6px] border border-border-default bg-surface-raised px-3">
            <Search size={15} className="text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search work orders by number or description"
              className="h-10 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
          {query && results.length > 0 && (
            <div className="absolute z-40 mt-1 max-h-56 w-full overflow-auto rounded-[6px] border border-border-strong bg-surface-raised py-1 shadow-xl scroll-slim">
              {results.map((w) => (
                <button
                  key={w.number}
                  type="button"
                  onClick={() => {
                    setChips((p) => [...p, w.number]);
                    setQuery("");
                  }}
                  className="block w-full px-3 py-2 text-left transition hover:bg-surface-active"
                >
                  <div className="flex items-center justify-between text-sm text-text-primary">
                    <span>{w.number}</span>
                    <span className="text-[12px] text-text-muted">{w.turbine}</span>
                  </div>
                  <div className="text-[12px] text-text-secondary">{w.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {missing.length > 0 && (
        <div className="flex items-start gap-2 rounded-[6px] border border-attention/40 bg-attention-bg/60 px-3 py-2 text-[13px] text-text-secondary">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-attention" />
          Some details are missing. This job will be flagged for attention.
        </div>
      )}
    </Modal>
  );
}
