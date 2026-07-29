import { JobType } from "../../data";
import { useStore } from "../../store";
import { Dropdown, Field, TextInput } from "./Dropdown";

interface Props {
  workOrder: string | null;
  onChange: (v: string | null) => void;
  workType: JobType | null;
}

/**
 * SAP work order number (typed directly) plus a dropdown that links an
 * existing work order — pre-filtered to the ones matching the selected work
 * type. The dropdown always keeps the currently linked order visible even if
 * it doesn't match the current type filter, so a manually-typed/mismatched
 * number still reads as linked rather than looking cleared.
 */
export function WorkOrderField({ workOrder, onChange, workType }: Props) {
  const workOrders = useStore((s) => s.workOrders);
  const linked = workOrder ? workOrders.find((w) => w.number === workOrder) : undefined;
  const byType = workType ? workOrders.filter((w) => w.type === workType) : workOrders;
  const pool =
    linked && !byType.includes(linked) ? [linked, ...byType] : byType.length ? byType : workOrders;

  const options = pool.map((w) => ({
    value: w.number,
    label: `${w.number} — ${w.name}`,
    description: w.asset,
  }));

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="SAP work order number">
        <TextInput
          value={workOrder ?? ""}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "") || null)}
          placeholder="e.g. 40021874"
          inputMode="numeric"
        />
      </Field>
      <Field label="Link work order">
        <Dropdown
          value={workOrder}
          onChange={onChange}
          options={options}
          placeholder={workType ? `Related to ${workType}` : "Select a work order"}
        />
      </Field>
    </div>
  );
}
