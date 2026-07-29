import * as XLSX from "xlsx";
import { WorkOrder, WorkOrderSource, WorkOrderStatus, inferJobType } from "../../data";

export type MappableField = "number" | "name" | "functionalLocation" | "asset" | "subAsset";

export const REQUIRED_FIELDS: MappableField[] = ["number", "name"];

export const FIELD_LABELS: Record<MappableField, string> = {
  number: "Work order number",
  name: "Name / short text",
  functionalLocation: "Functional location",
  asset: "Asset",
  subAsset: "Sub-asset",
};

const FIELD_PATTERNS: Record<MappableField, RegExp[]> = {
  number: [/work\s*order\s*number/i, /wo\s*number/i, /order\s*number/i, /^number$/i, /^order$/i],
  name: [/short\s*text/i, /description/i, /work\s*order\s*name/i, /^name$/i, /^title$/i],
  functionalLocation: [/functional\s*location/i, /floc/i, /func\.?\s*loc/i],
  asset: [/^asset$/i, /equipment/i, /^asset\b/i],
  subAsset: [/sub[\s-]?asset/i, /component/i],
};

export type Mapping = Partial<Record<MappableField, string>>; // field -> source column header

export interface ParsedWorkbook {
  headers: string[];
  rows: Record<string, string>[];
}

export class ImportError extends Error {}

/** Reads the first sheet of an uploaded .xlsx/.xls file into headers + string rows. */
export async function parseWorkbookFile(file: File): Promise<ParsedWorkbook> {
  const name = file.name.toLowerCase();
  if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
    throw new ImportError("That's not an Excel file — please upload a .xlsx or .xls file.");
  }

  const buffer = await file.arrayBuffer();
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array" });
  } catch {
    throw new ImportError("Couldn't read that file — it may be corrupted or not a real Excel file.");
  }

  const sheetName = workbook.SheetNames[0];
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
  // Short text / description often share a source column; if description matched
  // and name didn't get a distinct column, this still works since both patterns
  // target the same `name` field.
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

/** Applies the confirmed mapping to raw rows, validating and de-duplicating. */
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
    toImport.push({
      number,
      name,
      functionalLocation: mapping.functionalLocation ? row[mapping.functionalLocation]?.trim() ?? "" : "",
      asset: mapping.asset ? row[mapping.asset]?.trim() ?? "" : "",
      subAsset: mapping.subAsset ? row[mapping.subAsset]?.trim() ?? "" : "",
    });
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
