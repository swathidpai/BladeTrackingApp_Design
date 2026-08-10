import { ArrowRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store";
import { Breadcrumb } from "./Breadcrumb";

export function TeamsListPage() {
  const navigate = useNavigate();
  const teams = useStore((s) => s.teams);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-slim">
      <div className="mx-auto w-full max-w-[1240px] px-8 py-8">
        <Breadcrumb items={[{ label: "Settings", to: "/settings" }, { label: "Teams" }]} />
        <h1 className="mt-3 text-[28px] font-medium leading-none tracking-[-0.2px] text-text-primary">Teams</h1>
        <p className="mt-2 text-sm text-text-secondary">Create and assign teams to work orders.</p>

        <div className="mt-8 grid grid-cols-3 gap-5">
          <button
            type="button"
            onClick={() => navigate("/settings/teams/new")}
            className="flex flex-col items-center justify-center gap-2 rounded-[8px] border border-accent-primary bg-surface-active p-5 text-center transition hover:brightness-110"
          >
            <Plus size={28} className="text-accent-primary" />
            <span className="text-[15px] font-medium text-text-primary">Create new team</span>
          </button>

          {teams.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate(`/settings/teams/${t.id}`)}
              className="flex flex-col rounded-[8px] border border-border-default bg-surface-raised p-5 text-left transition hover:border-border-strong hover:bg-surface-active"
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
                <h3 className="text-[17px] font-medium text-text-primary">{t.name}</h3>
              </div>
              <p className="mt-1.5 text-[13px] text-text-secondary">
                {t.members.length} {t.members.length === 1 ? "Member" : "Members"}
              </p>
              <div className="mt-4 border-t border-border-default pt-3">
                <span className="inline-flex items-center gap-1 text-[13px] font-medium text-accent-primary">
                  View team <ArrowRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
