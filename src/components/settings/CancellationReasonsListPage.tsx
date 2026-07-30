import { ArrowRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store";
import { Breadcrumb } from "./Breadcrumb";
import { reasonIconComponent } from "./reasonIcons";

export function CancellationReasonsListPage() {
  const navigate = useNavigate();
  const cancellationReasons = useStore((s) => s.cancellationReasons);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-slim">
      <div className="mx-auto w-full max-w-[1240px] px-8 py-8">
        <Breadcrumb items={[{ label: "Settings", to: "/settings" }, { label: "Cancellation Reasons" }]} />
        <h1 className="mt-3 text-[28px] font-medium leading-none tracking-[-0.2px] text-text-primary">
          Cancellation Reasons
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Add and edit the reasons a job can be cancelled. These appear when you cancel a job in the planner.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-5">
          <button
            type="button"
            onClick={() => navigate("/settings/cancellation-reasons/new")}
            className="flex flex-col items-center justify-center gap-2 rounded-[8px] border border-accent-primary bg-surface-active p-5 text-center transition hover:brightness-110"
          >
            <Plus size={28} className="text-accent-primary" />
            <span className="text-[15px] font-medium text-text-primary">Create new cancellation reason</span>
          </button>

          {cancellationReasons.map((r) => {
            const Icon = reasonIconComponent(r.icon);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => navigate(`/settings/cancellation-reasons/${r.id}`)}
                className="flex flex-col rounded-[8px] border border-border-default bg-surface-raised p-5 text-left transition hover:border-border-strong hover:bg-surface-active"
              >
                <Icon size={20} style={{ color: r.color }} />
                <h3 className="mt-3 text-[17px] font-medium text-text-primary">{r.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-[13px] text-text-secondary">{r.description}</p>
                <div className="mt-4 border-t border-border-default pt-3">
                  <span className="inline-flex items-center gap-1 text-[13px] font-medium text-accent-primary">
                    View cancellation reason <ArrowRight size={14} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
