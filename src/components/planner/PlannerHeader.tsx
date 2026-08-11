import { ChevronLeft, ChevronRight } from "lucide-react";
import { Team } from "../../data";
import { dateNumber, monthName, shortLabel } from "../../utils";
import { TeamFilter } from "./TeamFilter";

interface Props {
  days: string[];
  teams: Team[];
  teamFilter: string[];
  onTeamFilterChange: (ids: string[]) => void;
  onStep: (weeks: number) => void;
  onToday: () => void;
}

export function PlannerHeader({ days, teams, teamFilter, onTeamFilterChange, onStep, onToday }: Props) {
  const first = days[0];
  const last = days[days.length - 1];
  const firstMonth = monthName(first);
  const lastMonth = monthName(last);
  const year = first.slice(0, 4);

  // "July 2025", or "July – August 2025" when the week spans two months.
  const monthLabel =
    firstMonth === lastMonth ? `${firstMonth} ${year}` : `${firstMonth} – ${lastMonth} ${year}`;

  // "22 – 28 July", or spelled with both months when it spans one.
  const rangeLabel =
    firstMonth === lastMonth
      ? `${dateNumber(first)} – ${dateNumber(last)} ${firstMonth}`
      : `${shortLabel(first)} – ${shortLabel(last)}`;

  return (
    <div className="flex items-center gap-6 border-b border-border-default bg-bg-base px-6 py-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onStep(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-text-secondary transition hover:bg-surface-active hover:text-text-primary"
          aria-label="Previous week"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-[28px] font-medium leading-none tracking-[-0.2px] text-text-primary">
            {monthLabel}
          </h1>
          <p className="mt-1 text-[13px] text-text-secondary">{rangeLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => onStep(1)}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-text-secondary transition hover:bg-surface-active hover:text-text-primary"
          aria-label="Next week"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <TeamFilter teams={teams} selected={teamFilter} onChange={onTeamFilterChange} />
        <button
          type="button"
          onClick={onToday}
          className="flex h-9 items-center rounded-[6px] border border-border-default px-3 text-[13px] font-medium text-text-secondary transition hover:bg-surface-active hover:text-text-primary"
        >
          Today
        </button>
      </div>
    </div>
  );
}
