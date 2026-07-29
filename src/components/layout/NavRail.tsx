import { CalendarRange, ClipboardList, LayoutDashboard, Settings } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import turbineMark from "../../imports/Container.png";

export type NavView = "planner" | "workorders";

interface Props {
  view: NavView;
  onNavigate: (view: NavView) => void;
}

const items: { icon: typeof LayoutDashboard; label: string; view?: NavView }[] = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: CalendarRange, label: "Job Planner", view: "planner" },
  { icon: ClipboardList, label: "Work Orders", view: "workorders" },
];

export function NavRail({ view, onNavigate }: Props) {
  return (
    <nav className="flex w-16 shrink-0 flex-col items-center border-r border-border-default bg-bg-base py-3">
      <div className="mb-4 flex h-11 w-11 items-center justify-center">
        <img src={turbineMark} alt="WindAI" className="h-8 w-8 object-contain" />
      </div>
      <div className="flex flex-1 flex-col items-center gap-1">
        {items.map(({ icon: Icon, label, view: itemView }) => {
          const selected = itemView === view;
          return (
            <Tooltip key={label} label={label} side="right">
              <button
                type="button"
                onClick={itemView ? () => onNavigate(itemView) : undefined}
                className={`flex h-11 w-11 items-center justify-center rounded-[8px] transition ${
                  selected
                    ? "bg-accent-dim text-accent-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Icon size={20} />
              </button>
            </Tooltip>
          );
        })}
      </div>
      <Tooltip label="Settings" side="right">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-[8px] text-text-muted transition hover:text-text-primary"
        >
          <Settings size={20} />
        </button>
      </Tooltip>
    </nav>
  );
}
