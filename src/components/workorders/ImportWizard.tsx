import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, ChevronLeft, FileSpreadsheet, Upload, X } from "lucide-react";
import { useStore } from "../../store";
import { Button } from "../ui/Button";
import { Dropdown } from "../ui/Dropdown";
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
  { n: 1, label: "Import File" },
  { n: 2, label: "Map Data" },
  { n: 3, label: "Preview & Confirm" },
] as const;

export function ImportWizard({ onBack, onImported }: Props) {
  const workOrders = useStore((s) => s.workOrders);
  const addWorkOrders = useStore((s) => s.addWorkOrders);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedWorkbook | null>(null);
  const [mapping, setMapping] = useState<Mapping>({});
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function discardAndBack() {
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

  const allMapped = !!(mapping.name && mapping.number && mapping.functionalLocation);
  const mappedValues = [mapping.name, mapping.number, mapping.functionalLocation].filter(Boolean);
  const hasDuplicateMapping = new Set(mappedValues).size !== mappedValues.length;
  const canMap = allMapped && !hasDuplicateMapping;

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

  const canGoNext = step === 1 ? !!parsed : step === 2 ? canMap : true;

  function goNext() {
    if (step === 1 && parsed) setStep(2);
    else if (step === 2 && canMap) setStep(3);
    else if (step === 3) confirmImport();
  }

  function goBack() {
    if (step === 1) discardAndBack();
    else setStep((s) => (s - 1) as 1 | 2);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto scroll-slim">
        <div className="flex items-center gap-3 px-6 py-6">
          <button
            type="button"
            onClick={discardAndBack}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] text-text-secondary transition hover:bg-surface-active hover:text-text-primary"
            aria-label="Back to Work Orders"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-[22px] font-medium leading-none tracking-[-0.2px] text-text-primary">
            Import Work Orders
          </h1>
        </div>

        <StepIndicator current={step} onJump={(n) => n < step && setStep(n)} />

        <div className="px-6 py-6">
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
            />
          )}
          {step === 2 && parsed && (
            <Step2
              parsed={parsed}
              mapping={mapping}
              setMapping={setMapping}
              derivedExample={derivedExample}
              hasDuplicateMapping={hasDuplicateMapping}
            />
          )}
          {step === 3 && <Step3 preview={preview} />}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-border-default bg-surface px-6 py-4">
        <Button variant="ghost" onClick={goBack}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={goNext}
          disabled={!canGoNext || (step === 3 && (!preview || preview.toImport.length === 0))}
        >
          {step === 3 ? "Save and import" : "Save and Next"}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ stepper --- */

function StepIndicator({ current, onJump }: { current: number; onJump: (n: 1 | 2 | 3) => void }) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 pb-6">
      {STEPS.map((s, i) => {
        const state = s.n < current ? "done" : s.n === current ? "active" : "upcoming";
        return (
          <div key={s.n} className="flex items-center gap-3">
            <button
              type="button"
              disabled={state !== "done"}
              onClick={() => onJump(s.n)}
              className={`flex flex-col items-center gap-1.5 ${state === "done" ? "cursor-pointer" : "cursor-default"}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium ${
                  state === "active"
                    ? "border-2 border-accent-primary text-accent-primary"
                    : state === "done"
                      ? "text-accent-primary"
                      : "border border-border-strong text-text-muted"
                }`}
              >
                {state === "done" ? <Check size={13} strokeWidth={3} /> : s.n}
              </span>
              <span
                className={`text-[13px] font-medium ${
                  state === "upcoming" ? "text-text-muted" : "text-accent-primary"
                }`}
              >
                {s.n}. {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && <span className="mb-4 h-px w-24 bg-border-default" />}
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
}: {
  fileName: string | null;
  parsed: ParsedWorkbook | null;
  error: string | null;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onDrop: (e: React.DragEvent) => void;
  onFile: (f: File) => void;
  onRemove: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className="flex cursor-pointer flex-col items-center gap-3 rounded-[6px] border border-dashed border-border-strong bg-surface-raised px-6 py-16 text-center transition hover:border-accent-primary"
      >
        <Upload size={28} className="text-text-muted" />
        <div>
          <p className="text-[15px] font-medium text-text-primary">
            Drop an Excel file here, or click to browse
          </p>
          <p className="mt-1 text-[13px] text-text-muted">.xlsx, .xls or .csv — a SAP work order export</p>
        </div>
      </div>

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

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-[6px] border border-attention/40 bg-attention-bg/60 px-3 py-2 text-[13px] text-text-secondary">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-attention" />
          {error}
        </div>
      )}

      {parsed && (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-3 rounded-[6px] border border-border-default bg-surface-raised px-4 py-3">
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

          <div className="mb-3 rounded-[6px] border border-accent-primary/40 bg-accent-primary/10 px-3 py-2 text-[13px] text-text-primary">
            <span className="font-medium">{parsed.rows.length}</span> Work Orders and{" "}
            <span className="font-medium">{parsed.headers.length}</span> columns
          </div>

          <RawPreviewTable parsed={parsed} rowLimit={10} />
        </div>
      )}
    </div>
  );
}

function RawPreviewTable({ parsed, rowLimit }: { parsed: ParsedWorkbook; rowLimit: number }) {
  return (
    <div className="max-h-96 overflow-auto rounded-[6px] border border-border-default scroll-slim">
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

type FieldTone = { text: string; bg: string; border: string; dot: string };

// Three field-keyed tints, chosen to read distinctly from one another on the
// dark background: blue for name, cyan for number, violet for functional
// location. Not part of the app's core token set — scoped to this preview
// highlighting only.
const FIELD_TONE: Record<MappableField, FieldTone> = {
  name: { text: "text-accent-primary", bg: "bg-accent-primary/10", border: "border-accent-primary", dot: "bg-accent-primary" },
  number: { text: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400", dot: "bg-cyan-400" },
  functionalLocation: { text: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400", dot: "bg-violet-400" },
};

const FIELD_ORDER: MappableField[] = ["name", "number", "functionalLocation"];

function Step2({
  parsed,
  mapping,
  setMapping,
  derivedExample,
  hasDuplicateMapping,
}: {
  parsed: ParsedWorkbook;
  mapping: Mapping;
  setMapping: (updater: (m: Mapping) => Mapping) => void;
  derivedExample: { raw: string; asset: string; subAsset: string } | null;
  hasDuplicateMapping: boolean;
}) {
  const [activeField, setActiveField] = useState<MappableField | null>(null);

  const fieldForHeader = (header: string): MappableField | null => {
    for (const f of FIELD_ORDER) if (mapping[f] === header) return f;
    return null;
  };

  function example(field: MappableField): string | null {
    const col = mapping[field];
    if (!col) return null;
    const value = parsed.rows[0]?.[col];
    return value ? `${col} → "${value}"` : null;
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* 1. Preview table, three-colour highlighting keyed to each field */}
      <div className="mb-4 max-h-56 overflow-auto rounded-[6px] border border-border-default scroll-slim">
        <table className="w-full text-left text-[13px]">
          <thead className="sticky top-0 bg-surface-active text-text-secondary">
            <tr>
              {parsed.headers.map((h) => {
                const field = fieldForHeader(h);
                const tone = field ? FIELD_TONE[field] : null;
                const active = field && field === activeField;
                return (
                  <th
                    key={h}
                    className={`whitespace-nowrap border px-3 py-2 font-medium ${
                      tone ? `${tone.border} ${tone.bg} ${tone.text}` : "border-transparent"
                    } ${active ? "border-2" : ""}`}
                  >
                    <span className="flex items-center gap-1.5">
                      {tone && <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />}
                      {h}
                    </span>
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
                  const tone = field ? FIELD_TONE[field] : null;
                  const active = field && field === activeField;
                  return (
                    <td
                      key={h}
                      className={`whitespace-nowrap border px-3 py-2 ${
                        tone ? `${tone.border} ${tone.bg} text-text-primary` : "border-transparent"
                      } ${active ? "border-2" : ""}`}
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

      {/* 2. Reassurance line */}
      <p className="mb-5 text-[13px] text-text-secondary">
        We matched these columns for you — check they look right, or change any.
      </p>

      {/* 3-4. Mapping rows, all visible, with optional active-row emphasis */}
      <div className="space-y-2">
        <MappingRow
          field="name"
          label={`${FIELD_LABELS.name} *`}
          value={mapping.name ?? null}
          example={example("name")}
          headers={parsed.headers}
          active={activeField === "name"}
          onFocus={() => setActiveField("name")}
          onChange={(v) => setMapping((m) => ({ ...m, name: v }))}
        />
        <MappingRow
          field="number"
          label={`${FIELD_LABELS.number} *`}
          value={mapping.number ?? null}
          example={example("number")}
          headers={parsed.headers}
          active={activeField === "number"}
          onFocus={() => setActiveField("number")}
          onChange={(v) => setMapping((m) => ({ ...m, number: v }))}
        />
        <MappingRow
          field="functionalLocation"
          label="Functional location *"
          value={mapping.functionalLocation ?? null}
          example={example("functionalLocation")}
          headers={parsed.headers}
          active={activeField === "functionalLocation"}
          onFocus={() => setActiveField("functionalLocation")}
          onChange={(v) => setMapping((m) => ({ ...m, functionalLocation: v }))}
        >
          {derivedExample && (
            <p className="mt-1.5 text-[12px] text-text-muted">
              Asset and sub-asset are read from this →{" "}
              <span className="text-text-secondary">
                {derivedExample.asset || "—"} · {derivedExample.subAsset || "—"}
              </span>
            </p>
          )}
        </MappingRow>
      </div>

      {hasDuplicateMapping && (
        <div className="mt-4 flex items-start gap-2 rounded-[6px] border border-attention/40 bg-attention-bg/60 px-3 py-2 text-[13px] text-text-secondary">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-attention" />
          The same column is mapped to more than one field — pick a different column for each.
        </div>
      )}
    </div>
  );
}

function MappingRow({
  field,
  label,
  value,
  example,
  headers,
  active,
  onFocus,
  onChange,
  children,
}: {
  field: MappableField;
  label: string;
  value: string | null;
  example: string | null;
  headers: string[];
  active: boolean;
  onFocus: () => void;
  onChange: (v: string) => void;
  children?: React.ReactNode;
}) {
  const tone = FIELD_TONE[field];
  return (
    <div
      onFocus={onFocus}
      onClick={onFocus}
      className={`rounded-[6px] border px-4 py-3 transition ${
        active ? "border-border-strong bg-surface-raised" : "border-transparent bg-transparent"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-48 shrink-0">
          <span className="flex items-center gap-1.5 text-[13px] font-medium text-text-primary">
            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
            {label}
          </span>
        </div>
        <div className="flex-1">
          <Dropdown
            value={value}
            onChange={onChange}
            options={headers.map((h) => ({ value: h, label: h }))}
            placeholder="Pick the column for this"
          />
        </div>
      </div>
      {value && example ? (
        <p className="mt-1.5 pl-52 text-[12px] text-text-muted">{example}</p>
      ) : !value ? (
        <p className="mt-1.5 pl-52 text-[12px] text-text-muted">
          We couldn't confidently match this — please choose a column.
        </p>
      ) : null}
      {children}
    </div>
  );
}

/* --------------------------------------------------------------------- step 3 --- */

function Step3({ preview }: { preview: ImportPreview | null }) {
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
    </div>
  );
}
