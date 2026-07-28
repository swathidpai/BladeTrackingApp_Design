import { useEffect } from "react";

export interface ToastData {
  id: number;
  message: string;
  onUndo?: () => void;
}

interface Props {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}

export function ToastStack({ toasts, onDismiss }: Props) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className="pointer-events-auto flex items-center gap-4 rounded-[6px] border border-border-strong bg-surface-raised px-4 py-2.5 text-sm text-text-primary shadow-2xl">
      <span>{toast.message}</span>
      {toast.onUndo && (
        <button
          type="button"
          onClick={() => {
            toast.onUndo?.();
            onDismiss(toast.id);
          }}
          className="font-medium text-accent-primary transition hover:brightness-110"
        >
          Undo
        </button>
      )}
    </div>
  );
}
