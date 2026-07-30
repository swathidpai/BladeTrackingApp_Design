import { CalendarRange, ClipboardList, LayoutDashboard, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Tooltip } from "../ui/Tooltip";
import turbineMark from "../../imports/Container.png";

const items: { icon: typeof LayoutDashboard; label: string; to?: string; match?: string[] }[] = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: CalendarRange, label: "Job Planner", to: "/planner", match: ["/", "/planner", "/resolve"] },
  { icon: ClipboardList, label: "Work Orders", to: "/work-orders", match: ["/work-orders"] },
];

export function NavRail() {
  const { pathname } = useLocation();

  return (
    <nav className="flex w-16 shrink-0 flex-col items-center border-r border-border-default bg-bg-base py-3">
      <div className="mb-4 flex h-11 w-11 items-center justify-center">
        <img src={turbineMark} alt="WindAI" className="h-8 w-8 object-contain" />
      </div>
      <div className="flex flex-1 flex-col items-center gap-1">
        {items.map(({ icon: Icon, label, to, match }) => {
          const selected = match?.some((m) => (m === "/" ? pathname === "/" : pathname.startsWith(m)));
          const content = (
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-[8px] transition ${
                selected
                  ? "bg-accent-dim text-accent-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Icon size={20} />
            </span>
          );
          return (
            <Tooltip key={label} label={label} side="right">
              {to ? (
                <Link to={to} aria-label={label}>
                  {content}
                </Link>
              ) : (
                <button type="button" aria-label={label}>
                  {content}
                </button>
              )}
            </Tooltip>
          );
        })}
      </div>
      <Tooltip label="Settings" side="right">
        <Link to="/settings" aria-label="Settings">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-[8px] transition ${
              pathname.startsWith("/settings")
                ? "bg-accent-dim text-accent-primary"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Settings size={20} />
          </span>
        </Link>
      </Tooltip>
    </nav>
  );
}
