import { useState } from "react";
import { Info, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { TurbineStatus, slugifyJobTypeKey } from "../../data";
import { useStore } from "../../store";
import { Button } from "../ui/Button";
import { Dropdown, Field, TextInput } from "../ui/Dropdown";
import { Modal } from "../ui/Modal";
import { Stepper } from "../ui/Stepper";
import { Breadcrumb } from "./Breadcrumb";
import { ColorField } from "./ColorField";

export function JobTypeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const jobTypes = useStore((s) => s.jobTypes);
  const addJobType = useStore((s) => s.addJobType);
  const updateJobType = useStore((s) => s.updateJobType);
  const deleteJobType = useStore((s) => s.deleteJobType);

  const isEdit = !!id;
  const editing = isEdit ? (jobTypes.find((t) => t.id === id) ?? null) : null;

  const [name, setName] = useState(editing?.name ?? "");
  const [key, setKey] = useState(editing?.key ?? "");
  const [keyTouched, setKeyTouched] = useState(isEdit);
  const [color, setColor] = useState(editing?.color ?? "#84B8FF");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [hours, setHours] = useState(editing?.defaults.duration ?? 8);
  const [techs, setTechs] = useState(editing?.defaults.techs ?? 2);
  const [turbineStatus, setTurbineStatus] = useState<TurbineStatus>(
    editing?.defaults.turbineStatus ?? "Offline",
  );
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  function handleNameChange(v: string) {
    setName(v);
    if (!keyTouched) setKey(slugifyJobTypeKey(v));
  }
  function handleKeyChange(v: string) {
    setKeyTouched(true);
    setKey(v.toUpperCase().replace(/[^A-Z0-9_]/g, ""));
  }

  const trimmedKey = key.trim();
  const keyTaken = jobTypes.some((t) => t.key === trimmedKey && t.id !== editing?.id);
  const canSave = name.trim().length > 0 && trimmedKey.length > 0 && !keyTaken;

  function save() {
    const payload = {
      name: name.trim(),
      key: trimmedKey,
      color,
      description: description.trim(),
      defaults: { techs, duration: hours, turbineStatus },
    };
    if (editing) {
      updateJobType(editing.id, payload);
    } else {
      addJobType(payload);
    }
    navigate("/settings/job-types");
  }

  function confirmDelete() {
    if (editing) deleteJobType(editing.id);
    navigate("/settings/job-types");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-slim">
      <div className="mx-auto w-full max-w-[720px] px-8 py-8 pb-24">
        <div className="flex items-start justify-between">
          <Breadcrumb
            items={[
              { label: "Settings", to: "/settings" },
              { label: "Job Types", to: "/settings/job-types" },
              { label: editing ? editing.name : "New job type" },
            ]}
          />
          {editing && (
            <Button variant="ghost" onClick={() => setDeleteConfirm(true)}>
              <Trash2 size={15} /> Delete
            </Button>
          )}
        </div>

        <div className="mt-8 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Job Type Name">
                <TextInput
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Blade Repair"
                />
              </Field>
            </div>
            <Field label="Colour">
              <ColorField value={color} onChange={setColor} />
            </Field>
          </div>

          <div>
            <Field label="Job Type Key">
              <TextInput
                value={key}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="BLADE_REPAIR"
                className={keyTaken ? "border-attention focus:border-attention" : ""}
              />
            </Field>
            {keyTaken ? (
              <p className="mt-1.5 text-[12px] text-attention">This key is already used by another job type.</p>
            ) : (
              <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-text-muted">
                <Info size={12} /> Auto-filled from the name. Edit directly to override.
              </p>
            )}
          </div>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What this job type covers"
              className="w-full resize-none rounded-[6px] border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition focus:border-border-strong"
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Default Hours">
              <Stepper value={hours} onChange={setHours} min={1} suffix="hr" />
            </Field>
            <Field label="Default Techs">
              <Stepper value={techs} onChange={setTechs} min={1} />
            </Field>
            <Field label="Default Turbine Status">
              <Dropdown
                value={turbineStatus}
                onChange={(v) => setTurbineStatus(v as TurbineStatus)}
                options={[
                  { value: "Offline", label: "Turbine must be offline" },
                  { value: "Online", label: "Turbine remains online" },
                ]}
                placeholder="Select"
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-border-strong bg-bg-base px-8 py-4">
        <Button variant="ghost" onClick={() => navigate("/settings/job-types")}>
          Cancel
        </Button>
        <Button variant="primary" onClick={save} disabled={!canSave}>
          Save
        </Button>
      </div>

      {deleteConfirm && editing && (
        <Modal
          title="Delete this job type?"
          width={420}
          onClose={() => setDeleteConfirm(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </>
          }
        >
          <p className="text-[13px] text-text-secondary">
            Jobs already using "{editing.name}" keep their type; new jobs won't be able to select it.
          </p>
        </Modal>
      )}
    </div>
  );
}
