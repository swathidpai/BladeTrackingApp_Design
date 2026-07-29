import * as XLSX from "xlsx";
import { WorkOrder, WorkOrderSource, WorkOrderStatus, inferJobType } from "../../data";
import { deriveFromFunctionalLocation } from "./deriveAsset";

export type MappableField = "name" | "number" | "functionalLocation";

export const FIELD_LABELS: Record<MappableField, string> = {
  name: "Work order name",
  number: "Work order number",
  functionalLocation: "Functional location",
};

const FIELD_PATTERNS: Record<MappableField, RegExp[]> = {
  name: [/^description$/i, /operation\s*short\s*text/i, /short\s*text/i, /description/i, /^name$/i],
  number: [/^order$/i, /work\s*order\s*number/i, /order\s*number/i],
  functionalLocation: [/functional\s*location/i, /floc/i, /func\.?\s*loc/i],
};

export type Mapping = Partial<Record<MappableField, string>>; // field -> source column header

export interface ParsedWorkbook {
  headers: string[];
  rows: Record<string, string>[];
}

export class ImportError extends Error {}

/** Reads an uploaded .xlsx/.xls/.csv file into headers + string rows. Prefers a sheet named "Data". */
export async function parseWorkbookFile(file: File): Promise<ParsedWorkbook> {
  const name = file.name.toLowerCase();
  if (![".xlsx", ".xls", ".csv"].some((ext) => name.endsWith(ext))) {
    throw new ImportError("That's not a spreadsheet — please upload a .xlsx, .xls or .csv file.");
  }

  const buffer = await file.arrayBuffer();
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array" });
  } catch {
    throw new ImportError("Couldn't read that file — it may be corrupted or not a real spreadsheet.");
  }

  const sheetName =
    workbook.SheetNames.find((n) => n.toLowerCase() === "data") ?? workbook.SheetNames[0];
  if (!sheetName) throw new ImportError("That workbook has no sheets.");
  const sheet = workbook.Sheets[sheetName];

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  if (raw.length === 0) throw new ImportError("That sheet is empty — there are no rows to import.");

  const headers = Object.keys(raw[0]);
  const rows = raw.map((r) => Object.fromEntries(headers.map((h) => [h, String(r[h] ?? "").trim()])));
  return { headers, rows };
}

/** Best-effort auto-detection of which spreadsheet column maps to which target field. */
export function autoDetectMapping(headers: string[]): Mapping {
  const mapping: Mapping = {};
  for (const field of Object.keys(FIELD_PATTERNS) as MappableField[]) {
    const patterns = FIELD_PATTERNS[field];
    const match = headers.find((h) => patterns.some((p) => p.test(h)));
    if (match) mapping[field] = match;
  }
  return mapping;
}

export interface PreviewRow {
  number: string;
  name: string;
  functionalLocation: string;
  asset: string;
  subAsset: string;
}

export interface ImportPreview {
  toImport: PreviewRow[];
  skippedMissingFields: number;
  duplicateNumbers: string[]; // numbers excluded because they already exist or repeat in this file
}

/** Applies the confirmed mapping to raw rows, deriving asset/sub-asset and de-duplicating. */
export function buildPreview(
  rows: Record<string, string>[],
  mapping: Mapping,
  existingNumbers: Set<string>,
): ImportPreview {
  const toImport: PreviewRow[] = [];
  const duplicateNumbers: string[] = [];
  let skippedMissingFields = 0;
  const seenInFile = new Set<string>();

  for (const row of rows) {
    const number = (mapping.number ? row[mapping.number] : "")?.trim();
    const name = (mapping.name ? row[mapping.name] : "")?.trim();
    if (!number || !name) {
      skippedMissingFields++;
      continue;
    }
    if (existingNumbers.has(number) || seenInFile.has(number)) {
      duplicateNumbers.push(number);
      continue;
    }
    seenInFile.add(number);
    const functionalLocation = mapping.functionalLocation ? row[mapping.functionalLocation]?.trim() ?? "" : "";
    const { asset, subAsset } = deriveFromFunctionalLocation(functionalLocation);
    toImport.push({ number, name, functionalLocation, asset, subAsset });
  }

  return { toImport, skippedMissingFields, duplicateNumbers };
}

export function previewRowToWorkOrder(
  row: PreviewRow,
  opts: { status?: WorkOrderStatus; source?: WorkOrderSource } = {},
): Omit<WorkOrder, "id" | "createdAt"> {
  return {
    number: row.number,
    name: row.name,
    functionalLocation: row.functionalLocation,
    asset: row.asset,
    subAsset: row.subAsset,
    type: inferJobType(row.name),
    status: opts.status ?? "open",
    source: opts.source ?? "import",
  };
}
