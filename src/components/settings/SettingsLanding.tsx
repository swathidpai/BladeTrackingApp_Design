import { ArrowRight, Box, CalendarX, Home, Layers, LucideIcon, Users, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CARDS: { key: string; icon: LucideIcon; title: string; description: string; to: string }[] = [
  {
    key: "assets",
    icon: Box,
    title: "Assets",
    description: "Add and edit the equipment/assets required to track tasks in this project.",
    to: "/settings/assets",
  },
  {
    key: "sub-assets",
    icon: Layers,
    title: "Sub Assets",
    description: "Manage components that belong to a parent asset.",
    to: "/settings/sub-assets",
  },
  {
    key: "job-types",
    icon: Wrench,
    title: "Job Types",
    description: "Add, edit and define work categories. Add default working hours, number of workers and colour.",
    to: "/settings/job-types",
  },
  {
    key: "cancellation-reasons",
    icon: CalendarX,
    title: "Cancellation Reasons",
    description: "Add and edit cancellation reasons for a job.",
    to: "/settings/cancellation-reasons",
  },
  {
    key: "teams",
    icon: Users,
    title: "Teams",
    description: "Create and assign teams to work orders.",
    to: "/settings/teams",
  },
];

export function SettingsLanding() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-slim">
      <div className="mx-auto w-full max-w-[1240px] px-8 py-8">
        <div className="flex items-center gap-1.5 text-[13px]">
          <Home size={14} className="text-accent-primary" />
          <span className="font-medium text-accent-primary">Settings</span>
        </div>
        <h1 className="mt-3 text-[28px] font-medium leading-none tracking-[-0.2px] text-text-primary">Settings</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Add job types, cancellation reasons, assets and sub-assets.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-5">
          {CARDS.map(({ key, icon: Icon, title, description, to }) => (
            <button
              key={key}
              type="button"
              onClick={() => navigate(to)}
              className="flex flex-col rounded-[8px] border border-border-default bg-surface-raised p-5 text-left transition hover:border-border-strong hover:bg-surface-active"
            >
              <Icon size={20} className="text-text-secondary" />
              <h3 className="mt-3 text-[17px] font-medium text-text-primary">{title}</h3>
              <p className="mt-1.5 line-clamp-2 text-[13px] text-text-secondary">{description}</p>
              <div className="mt-4 border-t border-border-default pt-3">
                <span className="inline-flex items-center gap-1 text-[13px] font-medium text-accent-primary">
                  View {title} <ArrowRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
