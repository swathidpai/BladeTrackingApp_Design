import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  width?: number;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}

export function Modal({ title, subtitle, width = 560, onClose, children, footer }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-auto py-16"
      style={{ backgroundColor: "rgba(2,6,23,0.65)" }}
      onMouseDown={onClose}
    >
      <div
        style={{ width }}
        className="rounded-[10px] border border-border-strong bg-surface shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-lg font-medium text-text-primary">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[13px] text-text-secondary">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted transition hover:text-text-primary"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-5 px-6 py-6">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t border-border-default px-6 py-4">
          {footer}
        </div>
      </div>
    </div>
  );
}
