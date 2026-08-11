import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Job, Team } from "../../data";
import { JobCard } from "./JobCard";

interface Props {
  job: Job;
  containerId: string;
  activeId: string | null;
  fullWidth?: boolean;
  showHandle?: boolean;
  inlineMissing?: boolean;
  teams?: Team[];
  onTeamChange?: (teamId: string | null) => void;
  onSetStatus: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onReasonClick?: () => void;
  onLinkWorkOrder?: () => void;
  onMissingClick?: () => void;
}

export function SortableJobCard({ job, containerId, activeId, ...rest }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
    data: { containerId, job },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <JobCard
        job={job}
        handleProps={{ ...attributes, ...listeners }}
        dimmed={isDragging || activeId === job.id}
        {...rest}
      />
    </div>
  );
}
