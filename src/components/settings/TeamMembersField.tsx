import { useState } from "react";
import { Plus, X } from "lucide-react";
import { TeamMember, deriveNameFromEmail } from "../../data";
import { TextInput } from "../ui/Dropdown";

interface Props {
  members: TeamMember[];
  onChange: (members: TeamMember[]) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function TeamMembersField({ members, onChange }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function addMember() {
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    if (members.some((m) => m.email.toLowerCase() === trimmed.toLowerCase())) {
      setError("This person is already on the team.");
      return;
    }
    onChange([...members, { email: trimmed, name: deriveNameFromEmail(trimmed) }]);
    setEmail("");
    setError(null);
  }

  function updateName(index: number, name: string) {
    onChange(members.map((m, i) => (i === index ? { ...m, name } : m)));
  }

  function removeMember(index: number) {
    onChange(members.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex gap-2">
        <TextInput
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addMember();
            }
          }}
          placeholder="Add a member by email"
          className={error ? "border-attention focus:border-attention" : ""}
        />
        <button
          type="button"
          onClick={addMember}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-[6px] border border-accent-primary/60 px-3 text-[13px] font-medium text-accent-primary transition hover:bg-accent-dim"
        >
          <Plus size={14} /> Add
        </button>
      </div>
      {error && <p className="mt-1.5 text-[12px] text-attention">{error}</p>}

      {members.length > 0 && (
        <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto scroll-slim pr-1">
          {members.map((m, i) => (
            <div
              key={m.email}
              className="flex items-center gap-2 rounded-[6px] border border-border-default bg-surface-raised px-2.5 py-1.5"
            >
              <input
                value={m.name}
                onChange={(e) => updateName(i, e.target.value)}
                className="w-40 shrink-0 bg-transparent text-sm text-text-primary focus:outline-none"
              />
              <span className="flex-1 truncate text-[13px] text-text-muted">{m.email}</span>
              <button
                type="button"
                onClick={() => removeMember(i)}
                className="shrink-0 text-text-muted transition hover:text-attention"
                aria-label={`Remove ${m.name}`}
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
