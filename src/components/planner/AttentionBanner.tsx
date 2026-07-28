import { AlertTriangle } from "lucide-react";

interface Props {
  count: number;
  onResolve: () => void;
}

export function AttentionBanner({ count, onResolve }: Props) {
  if (count < 1) return null;
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 bg-attention-bg px-6">
      <span className="flex h-5 min-w-5 items-center justify-center rounded-[4px] bg-attention px-1.5 text-[13px] font-bold text-white">
        {count}
      </span>
      <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
        <AlertTriangle size={16} className="text-attention" />
        {count === 1 ? "1 job needs attention" : `${count} jobs need attention`}
      </span>
      <button
        type="button"
        onClick={onResolve}
        className="ml-auto flex h-8 items-center rounded-[6px] bg-attention px-3.5 text-sm font-medium text-white transition hover:brightness-110"
      >
        Resolve
      </button>
    </div>
  );
}
