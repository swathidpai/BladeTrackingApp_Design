import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ASSETS, SUB_ASSETS, suggestFunctionalLocation } from "../../data";
import { useStore } from "../../store";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Dropdown, Field, TextInput } from "../ui/Dropdown";
import { TeamDropdown } from "../ui/TeamDropdown";

interface Props {
  onClose: () => void;
}

export function AddWorkOrderModal({ onClose }: Props) {
  const workOrders = useStore((s) => s.workOrders);
  const teams = useStore((s) => s.teams);
  const addWorkOrder = useStore((s) => s.addWorkOrder);

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [asset, setAsset] = useState<string | null>(null);
  const [subAsset, setSubAsset] = useState<string | null>(null);
  const [functionalLocation, setFunctionalLocation] = useState("");
  const [flTouched, setFlTouched] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);

  const duplicate = number.trim() ? workOrders.some((w) => w.number === number.trim()) : false;
  const canSave = name.trim() && number.trim() && !duplicate;

  function pickAsset(v: string) {
    setAsset(v);
    if (!flTouched && v && subAsset) setFunctionalLocation(suggestFunctionalLocation(v, subAsset));
  }
  function pickSubAsset(v: string) {
    setSubAsset(v);
    if (!flTouched && asset && v) setFunctionalLocation(suggestFunctionalLocation(asset, v));
  }

  function save() {
    if (!canSave) return;
    addWorkOrder({
      name: name.trim(),
      number: number.trim(),
      functionalLocation: functionalLocation.trim(),
      asset: asset ?? "",
      subAsset: subAsset ?? "",
      status: "open",
      source: "manual",
      teamId,
    });
    onClose();
  }

  return (
    <Modal
      title="New work order"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={!canSave}>
            Create work order
          </Button>
        </>
      }
    >
      <Field label="Work order name">
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. GEV: 01 P1 Blade A Repair 2026"
        />
      </Field>

      <Field label="SAP work order number">
        <TextInput
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
          placeholder="e.g. 24000155808"
          inputMode="numeric"
        />
      </Field>
      {duplicate && (
        <div className="-mt-3 flex items-start gap-2 rounded-[6px] border border-attention/40 bg-attention-bg/60 px-3 py-2 text-[13px] text-text-secondary">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-attention" />
          A work order with that number already exists.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Asset">
          <Dropdown
            value={asset}
            onChange={pickAsset}
            options={ASSETS.map((a) => ({ value: a, label: a }))}
            placeholder="Select asset"
          />
        </Field>
        <Field label="Sub-asset">
          <Dropdown
            value={subAsset}
            onChange={pickSubAsset}
            options={SUB_ASSETS.map((a) => ({ value: a, label: a }))}
            placeholder="Select sub-asset"
          />
        </Field>
      </div>

      <Field label="Functional location">
        <TextInput
          value={functionalLocation}
          onChange={(e) => {
            setFlTouched(true);
            setFunctionalLocation(e.target.value);
          }}
          placeholder="e.g. ACME.OWF01.GT04.MDA11"
        />
      </Field>

      <Field label="Team">
        <TeamDropdown teams={teams} value={teamId} onChange={setTeamId} />
      </Field>
    </Modal>
  );
}
