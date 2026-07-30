import { ArrowRight, Plus, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store";
import { Breadcrumb } from "./Breadcrumb";

export function JobTypesListPage() {
  const navigate = useNavigate();
  const jobTypes = useStore((s) => s.jobTypes);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-slim">
      <div className="mx-auto w-full max-w-[1240px] px-8 py-8">
        <Breadcrumb items={[{ label: "Settings", to: "/settings" }, { label: "Job Types" }]} />
        <h1 className="mt-3 text-[28px] font-medium leading-none tracking-[-0.2px] text-text-primary">Job Types</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Add, edit and define work categories. Add default working hours, number of workers and colour.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-5">
          <button
            type="button"
            onClick={() => navigate("/settings/job-types/new")}
            className="flex flex-col items-center justify-center gap-2 rounded-[8px] border border-accent-primary bg-surface-active p-5 text-center transition hover:brightness-110"
          >
            <Plus size={28} className="text-accent-primary" />
            <span className="text-[15px] font-medium text-text-primary">Create new job type</span>
          </button>

          {jobTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate(`/settings/job-types/${t.id}`)}
              className="flex flex-col rounded-[8px] border border-border-default bg-surface-raised p-5 text-left transition hover:border-border-strong hover:bg-surface-active"
            >
              <Wrench size={20} style={{ color: t.color }} />
              <h3 className="mt-3 text-[17px] font-medium text-text-primary">{t.name}</h3>
              <p className="mt-1.5 line-clamp-2 text-[13px] text-text-secondary">{t.description}</p>
              <div className="mt-4 border-t border-border-default pt-3">
                <span className="inline-flex items-center gap-1 text-[13px] font-medium text-accent-primary">
                  View job details <ArrowRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
