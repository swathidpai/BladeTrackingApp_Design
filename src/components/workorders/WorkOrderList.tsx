import { useMemo, useState } from "react";
import { GripVertical, Search, Trash2 } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { WorkOrder } from "../../data";
import { Dropdown } from "../ui/Dropdown";

export const LIST_ROW_PREFIX = "wo-row-";

type StatusFilter = "open" | "complete" | "all";

interface Props {
  workOrders: WorkOrder[];
  onToggleStatus: (wo: WorkOrder) => void;
  onDelete: (wo: WorkOrder) => void;
}

export function WorkOrderList({ workOrders, onToggleStatus, onDelete }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("open");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workOrders.filter((w) => {
      if (status !== "all" && w.status !== status) return false;
      if (!q) return true;
      return (
        w.name.toLowerCase().includes(q) ||
        w.number.toLowerCase().includes(q) ||
        w.asset.toLowerCase().includes(q) ||
        w.subAsset.toLowerCase().includes(q)
      );
    });
  }, [workOrders, query, status]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-text-secondary">Search</span>
          <div className="flex h-9 w-80 items-center gap-2 rounded-[6px] border border-border-default bg-surface-raised px-3">
            <Search size={14} className="text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, work order number, or functional location"
              className="h-full flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-text-secondary">Status</span>
          <div className="w-44">
            <Dropdown
              value={status}
              onChange={(v) => setStatus(v as StatusFilter)}
              options={[
                { value: "open", label: "Not completed" },
                { value: "complete", label: "Completed" },
                { value: "all", label: "All" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 scroll-slim">
        {workOrders.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-text-secondary">
            No work orders match "{query || status}".
          </p>
        ) : (
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="text-text-secondary">
                <th className="w-8 py-2" />
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Work Order Number</th>
                <th className="py-2 font-medium">Functional Location</th>
                <th className="py-2 font-medium">Asset</th>
                <th className="py-2 font-medium">Sub-Asset</th>
                <th className="py-2 font-medium" />
                <th className="w-8 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((wo) => (
                <Row key={wo.id} wo={wo} onToggleStatus={onToggleStatus} onDelete={onDelete} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Row({
  wo,
  onToggleStatus,
  onDelete,
}: {
  wo: WorkOrder;
  onToggleStatus: (wo: WorkOrder) => void;
  onDelete: (wo: WorkOrder) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${LIST_ROW_PREFIX}${wo.id}`,
    data: { kind: "workorder", workOrder: wo },
  });
  const complete = wo.status === "complete";

  return (
    <tr
      ref={setNodeRef}
      className={`border-t border-border-default text-text-primary transition ${
        isDragging ? "opacity-40" : ""
      } ${complete ? "opacity-60" : ""}`}
    >
      <td className="py-3">
        <button
          {...attributes}
          {...listeners}
          className="flex h-6 w-6 cursor-grab items-center justify-center text-text-muted transition hover:text-text-primary active:cursor-grabbing"
          aria-label={`Drag ${wo.name} onto a day to plan it`}
        >
          <GripVertical size={15} />
        </button>
      </td>
      <td className="py-3 pr-3 font-medium text-accent-primary">{wo.name}</td>
      <td className="py-3 pr-3 text-text-secondary">{wo.number}</td>
      <td className="py-3 pr-3 text-text-secondary">{wo.functionalLocation || "—"}</td>
      <td className="py-3 pr-3 text-text-secondary">{wo.asset || "—"}</td>
      <td className="py-3 pr-3 text-text-secondary">{wo.subAsset || "—"}</td>
      <td className="py-3 pr-3">
        <button
          type="button"
          onClick={() => onToggleStatus(wo)}
          className={`h-7 rounded-[4px] border px-2.5 text-[12px] font-medium transition ${
            complete
              ? "border-border-default bg-surface-raised text-text-secondary hover:text-text-primary"
              : "border-success/60 text-success hover:bg-success/15"
          }`}
        >
          {complete ? "Completed" : "Not completed"}
        </button>
      </td>
      <td className="py-3">
        <button
          type="button"
          onClick={() => onDelete(wo)}
          className="flex h-7 w-7 items-center justify-center rounded-[4px] text-text-muted transition hover:text-attention"
          aria-label={`Delete ${wo.name}`}
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-1 py-16 text-center">
      <p className="text-[15px] text-text-primary">No work orders yet</p>
      <p className="text-[13px] text-text-secondary">
        Import work orders from SAP, or add one manually to get started.
      </p>
    </div>
  );
}
