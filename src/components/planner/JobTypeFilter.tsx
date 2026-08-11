import { Wrench } from "lucide-react";
import { JobTypeDef } from "../../data";
import { MultiSelectFilter } from "./MultiSelectFilter";

interface Props {
  jobTypes: JobTypeDef[];
  selected: string[]; // job type names; empty = all types
  onChange: (names: string[]) => void;
}

export function JobTypeFilter({ jobTypes, selected, onChange }: Props) {
  const options = jobTypes.map((t) => ({ id: t.name, name: t.name, color: t.color }));

  return (
    <MultiSelectFilter
      icon={Wrench}
      panelLabel="Job type"
      allLabel="All job types"
      options={options}
      selected={selected}
      onChange={onChange}
    />
  );
}
