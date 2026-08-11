import { Users } from "lucide-react";
import { Team } from "../../data";
import { NO_TEAM_FILTER_ID } from "../../utils";
import { MultiSelectFilter } from "./MultiSelectFilter";

interface Props {
  teams: Team[];
  selected: string[]; // team ids + NO_TEAM_FILTER_ID; empty = all teams
  onChange: (ids: string[]) => void;
}

export function TeamFilter({ teams, selected, onChange }: Props) {
  const options = [
    { id: NO_TEAM_FILTER_ID, name: "No team" },
    ...teams.map((t) => ({ id: t.id, name: t.name, color: t.color })),
  ];

  return (
    <MultiSelectFilter
      icon={Users}
      panelLabel="Team"
      allLabel="All teams"
      options={options}
      selected={selected}
      onChange={onChange}
    />
  );
}
