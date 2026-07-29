import { JobType, WORK_ORDERS } from "../../data";
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
  const linked = workOrder ? WORK_ORDERS.find((w) => w.number === workOrder) : undefined;
  const byType = workType ? WORK_ORDERS.filter((w) => w.type === workType) : WORK_ORDERS;
  const pool = linked && !byType.includes(linked) ? [linked, ...byType] : byType.length ? byType : WORK_ORDERS;

  const options = pool.map((w) => ({
    value: w.number,
    label: `${w.number} — ${w.description}`,
    description: w.turbine,
  }));

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="SAP work order number">
        <TextInput
          value={workOrder ?? ""}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 8) || null)}
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
