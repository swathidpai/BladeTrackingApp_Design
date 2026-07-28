import { Job, TODAY } from "./data";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function parse(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function keyOf(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Shift a date key by n days, returning a new key. */
export function addDays(key: string, n: number) {
  const d = parse(key);
  d.setDate(d.getDate() + n);
  return keyOf(d);
}

/** Seven-day window; day 1 is yesterday, day 2 is today, shifted by whole weeks. */
export function weekWindow(offsetWeeks: number) {
  return Array.from({ length: 7 }, (_, i) => addDays(TODAY, -1 + offsetWeeks * 7 + i));
}

export function dayName(key: string) {
  return DAY_NAMES[parse(key).getDay()];
}
export function fullDayName(key: string) {
  return DAY_NAMES_FULL[parse(key).getDay()];
}
export function dateNumber(key: string) {
  return parse(key).getDate();
}
export function monthName(key: string) {
  return MONTHS[parse(key).getMonth()];
}
export function isWeekend(key: string) {
  const d = parse(key).getDay();
  return d === 0 || d === 6;
}
export function isToday(key: string) {
  return key === TODAY;
}
export function isPast(key: string) {
  return parse(key) < parse(TODAY);
}

/** "Tuesday 22 July" */
export function longLabel(key: string) {
  return `${fullDayName(key)} ${dateNumber(key)} ${monthName(key)}`;
}
/** "22 July" */
export function shortLabel(key: string) {
  return `${dateNumber(key)} ${monthName(key)}`;
}

export const REQUIRED = ["workOrder", "techs", "duration", "turbineStatus"] as const;

export function missingFields(job: Job): string[] {
  const out: string[] = [];
  if (!job.workOrder) out.push("work order");
  if (job.techs == null) out.push("tech count");
  if (job.duration == null) out.push("duration");
  if (!job.turbineStatus) out.push("turbine status");
  return out;
}

/**
 * A job needs attention when required fields are missing, OR its day has
 * passed with no status set (an outcome nobody reported).
 */
export function needsAttention(job: Job): boolean {
  const missing = missingFields(job).length > 0;
  const staleOutcome = job.status === "planned" && isPast(job.day);
  return missing || staleOutcome;
}

export function attentionReason(job: Job): string {
  const missing = missingFields(job);
  const stale = job.status === "planned" && isPast(job.day);
  if (missing.length && stale) return `Missing: ${missing.join(", ")}; day has passed with no outcome`;
  if (missing.length) return `Missing: ${missing.join(", ")}`;
  if (stale) return "Day has passed with no outcome";
  return "";
}
