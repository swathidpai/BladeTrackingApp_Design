import { useState } from "react";
import { Info, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { slugifyKey } from "../../data";
import { useStore } from "../../store";
import { Button } from "../ui/Button";
import { Field, TextInput } from "../ui/Dropdown";
import { Modal } from "../ui/Modal";
import { Breadcrumb } from "./Breadcrumb";
import { ColorField } from "./ColorField";
import { IconField } from "./IconField";
import { reasonIconComponent } from "./reasonIcons";

export function CancellationReasonFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const cancellationReasons = useStore((s) => s.cancellationReasons);
  const addCancellationReason = useStore((s) => s.addCancellationReason);
  const updateCancellationReason = useStore((s) => s.updateCancellationReason);
  const deleteCancellationReason = useStore((s) => s.deleteCancellationReason);

  const isEdit = !!id;
  const editing = isEdit ? (cancellationReasons.find((r) => r.id === id) ?? null) : null;

  const [name, setName] = useState(editing?.name ?? "");
  const [key, setKey] = useState(editing?.key ?? "");
  const [keyTouched, setKeyTouched] = useState(isEdit);
  const [icon, setIcon] = useState(editing?.icon ?? "wind");
  const [color, setColor] = useState(editing?.color ?? "#84B8FF");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  function handleNameChange(v: string) {
    setName(v);
    if (!keyTouched) setKey(slugifyKey(v));
  }
  function handleKeyChange(v: string) {
    setKeyTouched(true);
    setKey(v.toUpperCase().replace(/[^A-Z0-9_]/g, ""));
  }

  const trimmedKey = key.trim();
  const keyTaken = cancellationReasons.some((r) => r.key === trimmedKey && r.id !== editing?.id);
  const canSave = name.trim().length > 0 && trimmedKey.length > 0 && !keyTaken;

  const PreviewIcon = reasonIconComponent(icon);

  function save() {
    const payload = { name: name.trim(), key: trimmedKey, icon, color, description: description.trim() };
    if (editing) {
      updateCancellationReason(editing.id, payload);
    } else {
      addCancellationReason(payload);
    }
    navigate("/settings/cancellation-reasons");
  }

  function confirmDelete() {
    if (editing) deleteCancellationReason(editing.id);
    navigate("/settings/cancellation-reasons");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-slim">
      <div className="mx-auto w-full max-w-[720px] px-8 py-8 pb-24">
        <div className="flex items-start justify-between">
          <Breadcrumb
            items={[
              { label: "Settings", to: "/settings" },
              { label: "Cancellation Reasons", to: "/settings/cancellation-reasons" },
              { label: editing ? editing.name : "New cancellation reason" },
            ]}
          />
          {editing && (
            <Button variant="ghost" onClick={() => setDeleteConfirm(true)}>
              <Trash2 size={15} /> Delete
            </Button>
          )}
        </div>

        <div className="mt-8 space-y-5">
          <Field label="Cancellation reason name">
            <TextInput
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Wave Height"
            />
          </Field>

          <div>
            <Field label="Cancellation reason key">
              <TextInput
                value={key}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="WAVE_HEIGHT"
                className={keyTaken ? "border-attention focus:border-attention" : ""}
              />
            </Field>
            {keyTaken ? (
              <p className="mt-1.5 text-[12px] text-attention">This key is already used by another reason.</p>
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
              placeholder="What this reason means"
              className="w-full resize-none rounded-[6px] border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition focus:border-border-strong"
            />
          </Field>

          <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
            <Field label="Icon">
              <IconField value={icon} onChange={setIcon} />
            </Field>
            <Field label="Colour">
              <ColorField value={color} onChange={setColor} />
            </Field>
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-border-default bg-surface-raised">
              <PreviewIcon size={18} style={{ color }} />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-border-strong bg-bg-base px-8 py-4">
        <Button variant="ghost" onClick={() => navigate("/settings/cancellation-reasons")}>
          Cancel
        </Button>
        <Button variant="primary" onClick={save} disabled={!canSave}>
          Save
        </Button>
      </div>

      {deleteConfirm && editing && (
        <Modal
          title="Delete this cancellation reason?"
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
            Jobs already cancelled for "{editing.name}" keep that recorded reason; new cancellations won't be
            able to select it.
          </p>
        </Modal>
      )}
    </div>
  );
}
