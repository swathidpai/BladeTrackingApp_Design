import { useState } from "react";
import { Plus, X } from "lucide-react";
import { TeamMember, isValidEmail, nameFromEmail } from "../../data";
import { Button } from "../ui/Button";
import { TextInput } from "../ui/Dropdown";

interface Props {
  members: TeamMember[];
  onChange: (members: TeamMember[]) => void;
}

export function TeamMembersField({ members, onChange }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function addMember() {
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    if (members.some((m) => m.email.toLowerCase() === trimmed.toLowerCase())) {
      setError("This person is already on the team.");
      return;
    }
    onChange([...members, { email: trimmed, name: nameFromEmail(trimmed) }]);
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
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <TextInput
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addMember();
              }
            }}
            placeholder="Add a member by email."
            className={error ? "border-attention focus:border-attention" : ""}
          />
        </div>
        <Button variant="ghost" onClick={addMember}>
          <Plus size={15} /> Add
        </Button>
      </div>
      {error && <p className="mt-1.5 text-[12px] text-attention">{error}</p>}

      {members.length > 0 && (
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto scroll-slim pr-1">
          {members.map((m, i) => (
            <div
              key={m.email}
              className="flex items-center gap-2 rounded-[6px] border border-border-default bg-surface-raised px-3 py-2"
            >
              <input
                value={m.name}
                onChange={(e) => updateName(i, e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none"
              />
              <span className="shrink-0 truncate text-[12px] text-text-muted">{m.email}</span>
              <button
                type="button"
                onClick={() => removeMember(i)}
                className="shrink-0 text-text-muted transition hover:text-attention"
                aria-label={`Remove ${m.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
