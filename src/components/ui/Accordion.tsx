import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function Accordion({ label, open, onToggle, children }: Props) {
  return (
    <div className="rounded-[6px] border border-border-default">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2.5 text-[13px] font-medium text-text-primary"
      >
        {label}
        <ChevronDown size={16} className={`text-text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-3 border-t border-border-default p-3">{children}</div>}
    </div>
  );
}
