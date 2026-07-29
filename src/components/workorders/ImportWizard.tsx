import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, ChevronLeft, FileSpreadsheet, Upload, X } from "lucide-react";
import { useStore } from "../../store";
import { Button } from "../ui/Button";
import { Dropdown, Field } from "../ui/Dropdown";
import { deriveFromFunctionalLocation } from "./deriveAsset";
import {
  FIELD_LABELS,
  ImportError,
  ImportPreview,
  MappableField,
  Mapping,
  ParsedWorkbook,
  autoDetectMapping,
  buildPreview,
  parseWorkbookFile,
  previewRowToWorkOrder,
} from "./importUtils";

interface Props {
  onBack: () => void;
  onImported: (count: number) => void;
}

const STEPS = [
  { n: 1, label: "Import file" },
  { n: 2, label: "Map columns" },
  { n: 3, label: "Preview & confirm" },
] as const;

const FIELD_TONE: Record<MappableField, { text: string; bg: string; border: string }> = {
  name: { text: "text-accent-primary", bg: "bg-accent-primary/10", border: "border-accent-primary" },
  number: { text: "text-success", bg: "bg-success/10", border: "border-success" },
  functionalLocation: { text: "text-cancelled", bg: "bg-cancelled/10", border: "border-cancelled" },
};

export function ImportWizard({ onBack, onImported }: Props) {
  const workOrders = useStore((s) => s.workOrders);
  const addWorkOrders = useStore((s) => s.addWorkOrders);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedWorkbook | null>(null);
  const [mapping, setMapping] = useState<Mapping>({});
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleBack() {
    if (fileName && !window.confirm("Discard this import and go back to Work Orders?")) return;
    onBack();
  }

  async function handleFile(file: File) {
    setError(null);
    try {
      const wb = await parseWorkbookFile(file);
      setParsed(wb);
      setFileName(file.name);
      setMapping(autoDetectMapping(wb.headers));
    } catch (e) {
      setError(e instanceof ImportError ? e.message : "Something went wrong reading that file.");
      setParsed(null);
      setFileName(null);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const canMap = !!(mapping.name && mapping.number && mapping.functionalLocation);

  const preview: ImportPreview | null = useMemo(() => {
    if (step !== 3 || !parsed || !canMap) return null;
    const existingNumbers = new Set(workOrders.map((w) => w.number));
    return buildPreview(parsed.rows, mapping, existingNumbers);
  }, [step, parsed, mapping, canMap, workOrders]);

  function confirmImport() {
    if (!preview || preview.toImport.length === 0) return;
    const created = addWorkOrders(preview.toImport.map((r) => previewRowToWorkOrder(r)));
    onImported(created.length);
  }

  const derivedExample = useMemo(() => {
    if (!parsed || !mapping.functionalLocation) return null;
    const raw = parsed.rows[0]?.[mapping.functionalLocation];
    if (!raw) return null;
    const { asset, subAsset } = deriveFromFunctionalLocation(raw);
    return { raw, asset, subAsset };
  }, [parsed, mapping.functionalLocation]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-slim">
      <div className="flex items-center gap-3 px-6 py-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-text-secondary transition hover:bg-surface-active hover:text-text-primary"
          aria-label="Back to Work Orders"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-[28px] font-medium leading-none tracking-[-0.2px] text-text-primary">
          Import Work Orders
        </h1>
      </div>

      <StepIndicator current={step} onJump={(n) => n < step && setStep(n)} />

      <div className="flex-1 px-6 pb-10 pt-6">
        {step === 1 && (
          <Step1
            fileName={fileName}
            parsed={parsed}
            error={error}
            fileRef={fileRef}
            onDrop={onDrop}
            onFile={handleFile}
            onRemove={() => {
              setFileName(null);
              setParsed(null);
              setMapping({});
              setError(null);
            }}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && parsed && (
          <Step2
            parsed={parsed}
            mapping={mapping}
            setMapping={setMapping}
            derivedExample={derivedExample}
            canMap={canMap}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3 preview={preview} onBack={() => setStep(2)} onConfirm={confirmImport} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ stepper --- */

function StepIndicator({ current, onJump }: { current: number; onJump: (n: 1 | 2 | 3) => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-border-default px-6 pb-6">
      {STEPS.map((s, i) => {
        const state = s.n < current ? "done" : s.n === current ? "active" : "upcoming";
        return (
          <div key={s.n} className="flex items-center gap-3">
            <button
              type="button"
              disabled={state !== "done"}
              onClick={() => onJump(s.n)}
              className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13px] font-medium transition ${
                state === "done" ? "cursor-pointer hover:bg-surface-active" : "cursor-default"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium ${
                  state === "active"
                    ? "bg-accent-primary text-bg-base"
                    : state === "done"
                      ? "bg-success text-bg-base"
                      : "border border-border-strong text-text-muted"
                }`}
              >
                {state === "done" ? <Check size={13} strokeWidth={3} /> : s.n}
              </span>
              <span className={state === "upcoming" ? "text-text-muted" : "text-text-primary"}>{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-8 bg-border-default" />}
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------------- step 1 --- */

function Step1({
  fileName,
  parsed,
  error,
  fileRef,
  onDrop,
  onFile,
  onRemove,
  onNext,
}: {
  fileName: string | null;
  parsed: ParsedWorkbook | null;
  error: string | null;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onDrop: (e: React.DragEvent) => void;
  onFile: (f: File) => void;
  onRemove: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      {!parsed ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-3 rounded-[6px] border border-dashed border-border-strong bg-surface-raised px-6 py-16 text-center transition hover:border-accent-primary"
        >
          <Upload size={28} className="text-text-muted" />
          <div>
            <p className="text-[15px] font-medium text-text-primary">
              + Choose or drag a file to import
            </p>
            <p className="mt-1 text-[13px] text-text-muted">Only .xlsx or .csv files</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 rounded-[6px] border border-border-default bg-surface-raised px-4 py-3">
            <FileSpreadsheet size={20} className="shrink-0 text-accent-primary" />
            <span className="min-w-0 flex-1 truncate text-[14px] text-text-primary">{fileName}</span>
            <button
              type="button"
              onClick={onRemove}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] text-text-muted transition hover:text-attention"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </div>

          <p className="mt-3 text-[13px] text-text-secondary">
            <span className="font-medium text-text-primary">{parsed.rows.length}</span> work order
            {parsed.rows.length === 1 ? "" : "s"} found ·{" "}
            <span className="font-medium text-text-primary">{parsed.headers.length}</span> column
            {parsed.headers.length === 1 ? "" : "s"}
          </p>

          <RawPreviewTable parsed={parsed} rowLimit={10} />
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-[6px] border border-attention/40 bg-attention-bg/60 px-3 py-2 text-[13px] text-text-secondary">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-attention" />
          {error}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />

      <div className="mt-6 flex justify-end">
        <Button variant="primary" onClick={onNext} disabled={!parsed}>
          Next
        </Button>
      </div>
    </div>
  );
}

function RawPreviewTable({ parsed, rowLimit }: { parsed: ParsedWorkbook; rowLimit: number }) {
  return (
    <div className="mt-3 max-h-96 overflow-auto rounded-[6px] border border-border-default scroll-slim">
      <table className="w-full text-left text-[13px]">
        <thead className="sticky top-0 bg-surface-active text-text-secondary">
          <tr>
            {parsed.headers.map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parsed.rows.slice(0, rowLimit).map((row, i) => (
            <tr key={i} className="border-t border-border-default text-text-secondary">
              {parsed.headers.map((h) => (
                <td key={h} className="whitespace-nowrap px-3 py-2">
                  {row[h] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {parsed.rows.length > rowLimit && (
        <p className="border-t border-border-default px-3 py-2 text-[12px] text-text-muted">
          + {parsed.rows.length - rowLimit} more row{parsed.rows.length - rowLimit === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------- step 2 --- */

function Step2({
  parsed,
  mapping,
  setMapping,
  derivedExample,
  canMap,
  onBack,
  onNext,
}: {
  parsed: ParsedWorkbook;
  mapping: Mapping;
  setMapping: (updater: (m: Mapping) => Mapping) => void;
  derivedExample: { raw: string; asset: string; subAsset: string } | null;
  canMap: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const fieldForHeader = (header: string): MappableField | null => {
    for (const f of Object.keys(mapping) as MappableField[]) {
      if (mapping[f] === header) return f;
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-4xl">
      <p className="mb-3 text-[13px] text-text-secondary">
        Choose which column from your file becomes each field.
      </p>

      <div className="max-h-64 overflow-auto rounded-[6px] border border-border-default scroll-slim">
        <table className="w-full text-left text-[13px]">
          <thead className="sticky top-0 bg-surface-active text-text-secondary">
            <tr>
              {parsed.headers.map((h) => {
                const field = fieldForHeader(h);
                return (
                  <th
                    key={h}
                    className={`whitespace-nowrap px-3 py-2 font-medium ${
                      field ? FIELD_TONE[field].text : ""
                    }`}
                  >
                    {h}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {parsed.rows.slice(0, 3).map((row, i) => (
              <tr key={i} className="border-t border-border-default text-text-secondary">
                {parsed.headers.map((h) => {
                  const field = fieldForHeader(h);
                  return (
                    <td
                      key={h}
                      className={`whitespace-nowrap px-3 py-2 ${
                        field ? `${FIELD_TONE[field].bg} text-text-primary` : ""
                      }`}
                    >
                      {row[h] || "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <Field label={FIELD_LABELS.name}>
            <Dropdown
              value={mapping.name ?? null}
              onChange={(v) => setMapping((m) => ({ ...m, name: v }))}
              options={parsed.headers.map((h) => ({ value: h, label: h }))}
              placeholder="Select column…"
            />
          </Field>
          <p className="mt-1 text-[12px] text-text-muted">This column becomes the job title.</p>
        </div>

        <Field label={FIELD_LABELS.number}>
          <Dropdown
            value={mapping.number ?? null}
            onChange={(v) => setMapping((m) => ({ ...m, number: v }))}
            options={parsed.headers.map((h) => ({ value: h, label: h }))}
            placeholder="Select column…"
          />
        </Field>

        <div>
          <Field label={FIELD_LABELS.functionalLocation}>
            <Dropdown
              value={mapping.functionalLocation ?? null}
              onChange={(v) => setMapping((m) => ({ ...m, functionalLocation: v }))}
              options={parsed.headers.map((h) => ({ value: h, label: h }))}
              placeholder="Select column…"
            />
          </Field>
          <p className="mt-1 text-[12px] text-text-muted">
            Asset and Sub-asset are read automatically from this.
            {derivedExample && (
              <>
                {" "}
                e.g. "{derivedExample.raw}" → Asset{" "}
                <span className="text-text-secondary">{derivedExample.asset || "—"}</span> ·{" "}
                <span className="text-text-secondary">{derivedExample.subAsset || "—"}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onNext} disabled={!canMap}>
          Save &amp; next
        </Button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- step 3 --- */

function Step3({
  preview,
  onBack,
  onConfirm,
}: {
  preview: ImportPreview | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  if (!preview) return null;

  return (
    <div className="mx-auto max-w-4xl">
      <p className="mb-3 text-[13px] text-text-secondary">
        <span className="font-medium text-text-primary">{preview.toImport.length}</span> work order
        {preview.toImport.length === 1 ? "" : "s"} ready to import.
      </p>

      {(preview.duplicateNumbers.length > 0 || preview.skippedMissingFields > 0) && (
        <div className="mb-4 flex items-start gap-2 rounded-[6px] border border-cancelled/40 bg-cancelled-bg/60 px-3 py-2 text-[13px] text-text-secondary">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-cancelled" />
          <div>
            {preview.duplicateNumbers.length > 0 && (
              <p>
                {preview.duplicateNumbers.length} already exist{preview.duplicateNumbers.length === 1 ? "s" : ""}{" "}
                and will be skipped ({preview.duplicateNumbers.slice(0, 5).join(", ")}
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
        <div className="max-h-96 overflow-auto rounded-[6px] border border-border-default scroll-slim">
          <table className="w-full text-left text-[13px]">
            <thead className="sticky top-0 bg-surface-active text-text-secondary">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Work Order Number</th>
                <th className="px-3 py-2 font-medium">Functional Location</th>
                <th className="px-3 py-2 font-medium">Asset</th>
                <th className="px-3 py-2 font-medium">Sub-asset</th>
              </tr>
            </thead>
            <tbody>
              {preview.toImport.map((r) => (
                <tr key={r.number} className="border-t border-border-default text-text-primary">
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2 text-text-secondary">{r.number}</td>
                  <td className="px-3 py-2 text-text-secondary">{r.functionalLocation || "—"}</td>
                  <td className="px-3 py-2 text-text-secondary">{r.asset || "—"}</td>
                  <td className="px-3 py-2 text-text-secondary">{r.subAsset || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={preview.toImport.length === 0}>
          Save and import
        </Button>
      </div>
    </div>
  );
}
