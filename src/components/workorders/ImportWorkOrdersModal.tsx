import { useRef, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Upload } from "lucide-react";
import { WorkOrder } from "../../data";
import { useStore } from "../../store";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Dropdown, Field } from "../ui/Dropdown";
import {
  FIELD_LABELS,
  ImportError,
  ImportPreview,
  MappableField,
  Mapping,
  ParsedWorkbook,
  REQUIRED_FIELDS,
  autoDetectMapping,
  buildPreview,
  parseWorkbookFile,
  previewRowToWorkOrder,
} from "./importUtils";

type Step = "upload" | "mapping" | "preview" | "done";

interface Props {
  onClose: () => void;
  onGoToPlanner: () => void;
}

export function ImportWorkOrdersModal({ onClose, onGoToPlanner }: Props) {
  const workOrders = useStore((s) => s.workOrders);
  const addWorkOrders = useStore((s) => s.addWorkOrders);

  const [step, setStep] = useState<Step>("upload");
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedWorkbook | null>(null);
  const [mapping, setMapping] = useState<Mapping>({});
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [imported, setImported] = useState<WorkOrder[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    try {
      const wb = await parseWorkbookFile(file);
      setParsed(wb);
      setMapping(autoDetectMapping(wb.headers));
      setStep("mapping");
    } catch (e) {
      setError(e instanceof ImportError ? e.message : "Something went wrong reading that file.");
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const canContinueMapping = REQUIRED_FIELDS.every((f) => mapping[f]);

  function goToPreview() {
    if (!parsed) return;
    const existingNumbers = new Set(workOrders.map((w) => w.number));
    setPreview(buildPreview(parsed.rows, mapping, existingNumbers));
    setStep("preview");
  }

  function confirmImport() {
    if (!preview) return;
    const created = addWorkOrders(preview.toImport.map((r) => previewRowToWorkOrder(r)));
    setImported(created);
    setStep("done");
  }

  return (
    <Modal
      title="Import work orders"
      width={680}
      onClose={onClose}
      footer={
        step === "upload" ? (
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        ) : step === "mapping" ? (
          <>
            <Button variant="ghost" onClick={() => setStep("upload")}>
              Back
            </Button>
            <Button variant="primary" onClick={goToPreview} disabled={!canContinueMapping}>
              Preview import
            </Button>
          </>
        ) : step === "preview" ? (
          <>
            <Button variant="ghost" onClick={() => setStep("mapping")}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={confirmImport}
              disabled={!preview || preview.toImport.length === 0}
            >
              Confirm import
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        )
      }
    >
      {step === "upload" && (
        <div>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-3 rounded-[6px] border border-dashed border-border-strong bg-surface-raised px-6 py-12 text-center transition hover:border-accent-primary"
          >
            <Upload size={28} className="text-text-muted" />
            <div>
              <p className="text-[14px] font-medium text-text-primary">
                Drop an Excel file here, or click to browse
              </p>
              <p className="mt-1 text-[13px] text-text-muted">.xlsx or .xls — a SAP work order export</p>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-[6px] border border-attention/40 bg-attention-bg/60 px-3 py-2 text-[13px] text-text-secondary">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-attention" />
              {error}
            </div>
          )}
        </div>
      )}

      {step === "mapping" && parsed && (
        <div>
          <p className="mb-4 text-[13px] text-text-secondary">
            Match each spreadsheet column to a field. Work order number and name are required.
          </p>
          <div className="space-y-3">
            {(Object.keys(FIELD_LABELS) as MappableField[]).map((field) => (
              <div key={field} className="grid grid-cols-2 items-center gap-3">
                <Field label={`${FIELD_LABELS[field]}${REQUIRED_FIELDS.includes(field) ? " *" : ""}`}>
                  <Dropdown
                    value={mapping[field] ?? null}
                    onChange={(v) => setMapping((m) => ({ ...m, [field]: v }))}
                    options={parsed.headers.map((h) => ({ value: h, label: h }))}
                    placeholder="Not mapped"
                  />
                </Field>
                <div className="mt-5 flex items-center gap-2 text-[13px] text-text-muted">
                  <ArrowRight size={14} />
                  {mapping[field] && parsed.rows[0] ? (
                    <span className="truncate text-text-secondary">
                      e.g. "{parsed.rows[0][mapping[field]!] || "—"}"
                    </span>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "preview" && preview && (
        <div>
          <p className="mb-3 text-[13px] text-text-secondary">
            <span className="font-medium text-text-primary">{preview.toImport.length}</span> work order
            {preview.toImport.length === 1 ? "" : "s"} will be created.
          </p>

          {(preview.duplicateNumbers.length > 0 || preview.skippedMissingFields > 0) && (
            <div className="mb-3 flex items-start gap-2 rounded-[6px] border border-cancelled/40 bg-cancelled-bg/60 px-3 py-2 text-[13px] text-text-secondary">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-cancelled" />
              <div>
                {preview.duplicateNumbers.length > 0 && (
                  <p>
                    {preview.duplicateNumbers.length} row{preview.duplicateNumbers.length === 1 ? "" : "s"}{" "}
                    skipped — work order number already exists ({preview.duplicateNumbers.slice(0, 5).join(", ")}
                    {preview.duplicateNumbers.length > 5 ? ", …" : ""}).
                  </p>
                )}
                {preview.skippedMissingFields > 0 && (
                  <p>
                    {preview.skippedMissingFields} row{preview.skippedMissingFields === 1 ? "" : "s"} skipped —
                    missing a work order number or name.
                  </p>
                )}
              </div>
            </div>
          )}

          {preview.toImport.length > 0 && (
            <div className="max-h-72 overflow-auto rounded-[6px] border border-border-default scroll-slim">
              <table className="w-full text-left text-[13px]">
                <thead className="sticky top-0 bg-surface-active text-text-secondary">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Number</th>
                    <th className="px-3 py-2 font-medium">Asset</th>
                    <th className="px-3 py-2 font-medium">Sub-asset</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.toImport.slice(0, 50).map((r) => (
                    <tr key={r.number} className="border-t border-border-default text-text-primary">
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2 text-text-secondary">{r.number}</td>
                      <td className="px-3 py-2 text-text-secondary">{r.asset || "—"}</td>
                      <td className="px-3 py-2 text-text-secondary">{r.subAsset || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.toImport.length > 50 && (
                <p className="border-t border-border-default px-3 py-2 text-[12px] text-text-muted">
                  + {preview.toImport.length - 50} more row{preview.toImport.length - 50 === 1 ? "" : "s"}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <CheckCircle2 size={40} className="text-success" />
          <div>
            <p className="text-[15px] font-medium text-text-primary">
              {imported.length} work order{imported.length === 1 ? "" : "s"} imported
            </p>
            <p className="mt-1 text-[13px] text-text-secondary">
              Drag them onto a day below to plan jobs, or head to the planner.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onGoToPlanner();
            }}
          >
            Go to Job Planner
          </Button>
        </div>
      )}
    </Modal>
  );
}
