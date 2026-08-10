import { useState } from "react";
import { Info, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { TeamMember, slugifyKey } from "../../data";
import { useStore } from "../../store";
import { Button } from "../ui/Button";
import { Field, TextInput } from "../ui/Dropdown";
import { Modal } from "../ui/Modal";
import { Breadcrumb } from "./Breadcrumb";
import { ColorField } from "./ColorField";
import { TeamMembersField } from "./TeamMembersField";

export function TeamFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const teams = useStore((s) => s.teams);
  const addTeam = useStore((s) => s.addTeam);
  const updateTeam = useStore((s) => s.updateTeam);
  const deleteTeam = useStore((s) => s.deleteTeam);

  const isEdit = !!id;
  const editing = isEdit ? (teams.find((t) => t.id === id) ?? null) : null;

  const [name, setName] = useState(editing?.name ?? "");
  const [key, setKey] = useState(editing?.key ?? "");
  const [keyTouched, setKeyTouched] = useState(isEdit);
  const [color, setColor] = useState(editing?.color ?? "#84B8FF");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [members, setMembers] = useState<TeamMember[]>(editing?.members ?? []);
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
  const keyTaken = teams.some((t) => t.key === trimmedKey && t.id !== editing?.id);
  const canSave = name.trim().length > 0 && trimmedKey.length > 0 && !keyTaken;

  function save() {
    const payload = { name: name.trim(), key: trimmedKey, color, description: description.trim(), members };
    if (editing) {
      updateTeam(editing.id, payload);
    } else {
      addTeam(payload);
    }
    navigate("/settings/teams");
  }

  function confirmDelete() {
    if (editing) deleteTeam(editing.id);
    navigate("/settings/teams");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-slim">
      <div className="mx-auto w-full max-w-[720px] px-8 py-8 pb-24">
        <div className="flex items-start justify-between">
          <Breadcrumb
            items={[
              { label: "Settings", to: "/settings" },
              { label: "Teams", to: "/settings/teams" },
              { label: editing ? editing.name : "New team" },
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
              <Field label="Team name">
                <TextInput
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Team A"
                />
              </Field>
            </div>
            <Field label="Colour">
              <ColorField value={color} onChange={setColor} />
            </Field>
          </div>

          <div>
            <Field label="Team Key">
              <TextInput
                value={key}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="TEAM_A"
                className={keyTaken ? "border-attention focus:border-attention" : ""}
              />
            </Field>
            {keyTaken ? (
              <p className="mt-1.5 text-[12px] text-attention">This key is already used by another team.</p>
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
              placeholder="What this team covers"
              className="w-full resize-none rounded-[6px] border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition focus:border-border-strong"
            />
          </Field>

          <Field label="Add members">
            <TeamMembersField members={members} onChange={setMembers} />
          </Field>
        </div>
      </div>

      <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-border-strong bg-bg-base px-8 py-4">
        <Button variant="ghost" onClick={() => navigate("/settings/teams")}>
          Cancel
        </Button>
        <Button variant="primary" onClick={save} disabled={!canSave}>
          Save
        </Button>
      </div>

      {deleteConfirm && editing && (
        <Modal
          title="Delete this team?"
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
            This doesn't delete any work — work orders and jobs assigned to "{editing.name}" fall back to "No
            team".
          </p>
        </Modal>
      )}
    </div>
  );
}
