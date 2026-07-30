import { useEffect, useState } from "react";
import { ASSETS, Job, JobStatus, JobType, SUB_ASSETS, TurbineStatus } from "../../data";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Pill } from "../ui/Pill";
import { Dropdown, Field, TextInput } from "../ui/Dropdown";
import { Stepper } from "../ui/Stepper";
import { Accordion } from "../ui/Accordion";
import { WorkOrderField } from "../ui/WorkOrderField";
import { Switch } from "../ui/Switch";
import { useStore } from "../../store";

interface Props {
  job: Job;
  initialBranch?: JobStatus;
  onClose: () => void;
  onSave: (patch: Partial<Job>, status: JobStatus, opts?: { workOrderComplete?: boolean }) => void;
}

type Branch = "planned" | "complete" | "cancelled";

const TAGS: { value: Branch; label: string; tone: "accent" | "success" | "danger" }[] = [
  { value: "planned", label: "Planned", tone: "accent" },
  { value: "complete", label: "Successful", tone: "success" },
  { value: "cancelled", label: "Cancelled", tone: "danger" },
];

type DetailField = "techs" | "duration" | "turbineStatus";

export function StatusModal({ job, initialBranch, onClose, onSave }: Props) {
  const [branch, setBranch] = useState<Branch>(initialBranch ?? job.status);
  const [reasons, setReasons] = useState<string[]>(job.cancelReasons);

  const [techs, setTechs] = useState<number | null>(job.techs);
  const [duration, setDuration] = useState<number | null>(job.duration);
  const [turbineStatus, setTurbineStatus] = useState<TurbineStatus | null>(job.turbineStatus);
  const [edited, setEdited] = useState<Set<DetailField>>(new Set());

  const [moreOpen, setMoreOpen] = useState(branch === "planned");
  const [jobName, setJobName] = useState(job.name);
  const [workOrder, setWorkOrder] = useState<string | null>(job.workOrder);
  const [asset, setAsset] = useState<string | null>(job.asset ?? null);
  const [subAsset, setSubAsset] = useState<string | null>(job.subAsset ?? null);
  const [workType, setWorkType] = useState<JobType>(job.type);

  const workOrders = useStore((s) => s.workOrders);
  const jobTypes = useStore((s) => s.jobTypes);
  const cancellationReasons = useStore((s) => s.cancellationReasons);
  const linkedWorkOrder = job.workOrder ? workOrders.find((w) => w.number === job.workOrder) : undefined;
  const [markComplete, setMarkComplete] = useState(linkedWorkOrder?.status === "complete");

  // "More details" defaults open on Planned, collapsed on Successful/Cancelled.
  useEffect(() => {
    setMoreOpen(branch === "planned");
  }, [branch]);

  const toggleReason = (r: string) =>
    setReasons((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));

  function setTechsManual(v: number) {
    setTechs(v);
    setEdited((p) => new Set(p).add("techs"));
  }
  function setDurationManual(v: number) {
    setDuration(v);
    setEdited((p) => new Set(p).add("duration"));
  }
  function setTurbineStatusManual(v: TurbineStatus) {
    setTurbineStatus(v);
    setEdited((p) => new Set(p).add("turbineStatus"));
  }

  // Choosing a work type pre-fills techs, duration and turbine status from its
  // defaults — but never overwrites a field the user has hand-edited.
  function pickWorkType(t: JobType) {
    setWorkType(t);
    const d = jobTypes.find((j) => j.name === t)?.defaults;
    if (d) {
      if (!edited.has("techs")) setTechs(d.techs);
      if (!edited.has("duration")) setDuration(d.duration);
      if (!edited.has("turbineStatus")) setTurbineStatus(d.turbineStatus);
    }
  }

  const typeOptions = jobTypes.map((t) => ({ value: t.name, label: t.name, description: t.description }));

  const title = asset && subAsset ? `${asset} ${subAsset} · ${jobName}` : jobName;

  function save() {
    onSave(
      {
        name: jobName.trim() || job.name,
        status: branch,
        cancelReasons: branch === "cancelled" ? reasons : [],
        techs,
        duration,
        turbineStatus,
        asset,
        subAsset,
        type: workType,
        workOrder,
      },
      branch,
      branch === "complete" && workOrder ? { workOrderComplete: markComplete } : undefined,
    );
  }

  return (
    <Modal
      title={title}
      width={620}
      onClose={onClose}
      footerAlign="between"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save}>
            Save
          </Button>
        </>
      }
    >
      {/* Status selector */}
      <div>
        <span className="mb-2 block text-[13px] font-medium text-text-primary">Status</span>
        <div className="flex gap-2">
          {TAGS.map((t) => (
            <Pill
              key={t.value}
              label={t.label}
              tone={t.tone}
              selected={branch === t.value}
              onClick={() => setBranch(t.value)}
            />
          ))}
        </div>
      </div>

      {/* Reasons — cancelled only */}
      {branch === "cancelled" && (
        <>
          <div>
            <span className="mb-2 block text-[13px] font-medium text-text-primary">Reasons</span>
            <div className="flex flex-wrap gap-2">
              {cancellationReasons.map((r) => (
                <Pill
                  key={r.id}
                  label={r.name}
                  selected={reasons.includes(r.name)}
                  onClick={() => toggleReason(r.name)}
                  dotColor={r.color}
                />
              ))}
            </div>
          </div>
          <div className="h-px bg-border-strong" />
        </>
      )}

      {/* Confirm the details — every branch */}
      <div>
        <p className="mb-3 text-[13px] font-medium text-text-primary">
          Confirm the details
          <span className="ml-2 font-normal text-text-muted">edit if anything changed</span>
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Techs" right={edited.has("techs") && <EditedMarker />}>
            <Stepper value={techs} onChange={setTechsManual} min={1} placeholder="—" />
          </Field>
          <Field label="Duration" right={edited.has("duration") && <EditedMarker />}>
            <Stepper value={duration} onChange={setDurationManual} min={1} suffix="hr" placeholder="—" />
          </Field>
          <Field label="Turbine status" right={edited.has("turbineStatus") && <EditedMarker />}>
            <Dropdown
              value={turbineStatus}
              onChange={(v) => setTurbineStatusManual(v as TurbineStatus)}
              options={[
                { value: "Online", label: "Online" },
                { value: "Offline", label: "Offline" },
              ]}
              placeholder="Status"
            />
          </Field>
        </div>
      </div>

      <div className="h-px bg-border-strong" />

      {/* Work type — always visible */}
      <Field label="Work type">
        <Dropdown
          value={workType}
          onChange={(v) => pickWorkType(v as JobType)}
          options={typeOptions}
          placeholder="Select work type"
        />
      </Field>

      {/* SAP work order — constant across Planned / Successful / Cancelled */}
      <WorkOrderField workOrder={workOrder} onChange={setWorkOrder} workType={workType} />

      <div className="h-px bg-border-strong" />

      {/* More details accordion */}
      <Accordion label="More details" open={moreOpen} onToggle={() => setMoreOpen((o) => !o)}>
        <Field label="Job name">
          <TextInput value={jobName} onChange={(e) => setJobName(e.target.value)} />
        </Field>
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
      </Accordion>

      {/* Successful only — two-way flag with the linked work order's own status */}
      {branch === "complete" && (
        <div className="flex items-center justify-between rounded-[6px] border border-border-default px-3 py-2.5">
          <div>
            <p className="text-[13px] font-medium text-text-primary">Mark work order as complete</p>
            <p className="text-[12px] text-text-muted">
              {workOrder
                ? "Updates the linked work order's status — doesn't affect this job's outcome."
                : "Link a work order above to enable this."}
            </p>
          </div>
          <Switch checked={markComplete} onChange={setMarkComplete} disabled={!workOrder} />
        </div>
      )}
    </Modal>
  );
}

function EditedMarker() {
  return <span className="text-[11px] text-text-muted">edited</span>;
}
