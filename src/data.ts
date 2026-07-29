export type JobType = "Blade Repair" | "Blade Tip Repair" | "Blade Painting" | "Tower Cleaning";
export type JobStatus = "planned" | "complete" | "cancelled";
export type TurbineStatus = "Online" | "Offline";

export interface Job {
  id: string;
  name: string;
  type: JobType;
  techs: number | null;
  duration: number | null; // hours
  turbine: string;
  turbineStatus: TurbineStatus | null;
  workOrder: string | null;
  status: JobStatus;
  cancelReasons: string[];
  asset?: string | null; // turbine asset
  subAsset?: string | null; // component within the asset
  day: string; // ISO date key yyyy-mm-dd — the day it currently sits on
  originalDay: string; // day it was first scheduled (for resolve backlog grouping)
}

export interface WorkOrder {
  number: string;
  description: string;
  turbine: string;
  type: JobType; // drives the "related work orders" match on the selected job type
}

export interface WorkTypeDefaults {
  techs: number;
  duration: number;
  turbineStatus: TurbineStatus;
}

export const JOB_TYPES: {
  name: JobType;
  description: string;
  defaults: WorkTypeDefaults;
}[] = [
  {
    name: "Blade Repair",
    description: "Structural or laminate repair on a blade section",
    defaults: { techs: 3, duration: 8, turbineStatus: "Offline" },
  },
  {
    name: "Blade Tip Repair",
    description: "Repair or reinforcement of the blade tip section",
    defaults: { techs: 2, duration: 6, turbineStatus: "Offline" },
  },
  {
    name: "Blade Painting",
    description: "Recoating and leading-edge protection",
    defaults: { techs: 4, duration: 12, turbineStatus: "Offline" },
  },
  {
    name: "Tower Cleaning",
    description: "Wash-down and inspection of the tower",
    defaults: { techs: 2, duration: 4, turbineStatus: "Online" },
  },
];

// Assets (turbines) and the sub-assets within each, for the status modal.
export const ASSETS = ["C4", "C7", "D2", "A11", "B6"];
export const SUB_ASSETS = ["Blade A", "Blade B", "Blade C", "Tower", "Nacelle", "Hub"];

export const REASONS = ["Wind", "Fog", "Rain", "Lightning", "Humidity", "Gust", "Wave Height"];

export const WORK_ORDERS: WorkOrder[] = [
  { number: "40021874", description: "Blade C trailing edge crack", turbine: "C4", type: "Blade Repair" },
  { number: "40021912", description: "Leading edge erosion survey", turbine: "D2", type: "Blade Repair" },
  { number: "40022003", description: "Tower base corrosion clean", turbine: "A11", type: "Tower Cleaning" },
  { number: "40022155", description: "Blade A lightning strike check", turbine: "B6", type: "Blade Repair" },
  { number: "40022210", description: "Recoat blade B outboard", turbine: "C7", type: "Blade Painting" },
  { number: "40022288", description: "Blade C repair follow-up", turbine: "C4", type: "Blade Repair" },
  { number: "40022351", description: "Blade B tip erosion repair", turbine: "D2", type: "Blade Tip Repair" },
  { number: "40022410", description: "Tower wash-down inspection", turbine: "B6", type: "Tower Cleaning" },
  { number: "40022455", description: "Blade C recoat leading edge", turbine: "C7", type: "Blade Painting" },
];

// Deterministic "today" so the mock is consistent across screens.
// Today = Tue 22 Jul 2025. Window rule: day 1 = yesterday, day 2 = today.
export const TODAY = "2025-07-22";

export const WEEK_DAYS = [
  "2025-07-21", // Mon (yesterday)
  "2025-07-22", // Tue (today)
  "2025-07-23", // Wed
  "2025-07-24", // Thu
  "2025-07-25", // Fri
  "2025-07-26", // Sat
  "2025-07-27", // Sun
];

let n = 0;
const uid = () => `job-${++n}`;

export const SEED_JOBS: Job[] = [
  // Monday 21 (yesterday) — some outcomes late, some flagged
  {
    id: uid(), name: "C4 Blade C repair", type: "Blade Repair", techs: 2, duration: 8,
    turbine: "C4", turbineStatus: "Offline", workOrder: "40021874", status: "complete",
    cancelReasons: [], day: "2025-07-21", originalDay: "2025-07-21",
  },
  {
    id: uid(), name: "D2 Blade A leading edge", type: "Blade Repair", techs: 3, duration: 12,
    turbine: "D2", turbineStatus: "Offline", workOrder: "40021912", status: "cancelled",
    cancelReasons: ["Rain", "Lightning", "Gust", "Wind"], day: "2025-07-21", originalDay: "2025-07-21",
  },
  {
    id: uid(), name: "A11 Tower clean", type: "Tower Cleaning", techs: 2, duration: null,
    turbine: "A11", turbineStatus: null, workOrder: null, status: "planned",
    cancelReasons: [], day: "2025-07-21", originalDay: "2025-07-21",
  },
  {
    id: uid(), name: "B6 Blade A LE check", type: "Blade Repair", techs: null, duration: 6,
    turbine: "B6", turbineStatus: "Online", workOrder: "40022155", status: "planned",
    cancelReasons: [], day: "2025-07-21", originalDay: "2025-07-21",
  },
  // Tuesday 22 (today) — heavy
  {
    id: uid(), name: "C4 Blade C repair", type: "Blade Repair", techs: 2, duration: 8,
    turbine: "C4", turbineStatus: "Offline", workOrder: "40022288", status: "planned",
    cancelReasons: [], day: "2025-07-22", originalDay: "2025-07-22",
  },
  {
    id: uid(), name: "C7 Blade B recoat", type: "Blade Painting", techs: 4, duration: 12,
    turbine: "C7", turbineStatus: "Offline", workOrder: "40022210", status: "complete",
    cancelReasons: [], day: "2025-07-22", originalDay: "2025-07-22",
  },
  {
    id: uid(), name: "D2 Leading edge survey", type: "Blade Repair", techs: 2, duration: 4,
    turbine: "D2", turbineStatus: "Online", workOrder: "40021912", status: "cancelled",
    cancelReasons: ["Fog", "Wave Height"], day: "2025-07-22", originalDay: "2025-07-22",
  },
  {
    id: uid(), name: "A11 Tower clean", type: "Tower Cleaning", techs: 3, duration: 6,
    turbine: "A11", turbineStatus: "Online", workOrder: null, status: "planned",
    cancelReasons: [], day: "2025-07-22", originalDay: "2025-07-22",
  },
  // Wednesday 23 — heavy
  {
    id: uid(), name: "B6 Blade A repair", type: "Blade Repair", techs: 3, duration: 8,
    turbine: "B6", turbineStatus: "Offline", workOrder: "40022155", status: "planned",
    cancelReasons: [], day: "2025-07-23", originalDay: "2025-07-23",
  },
  {
    id: uid(), name: "C4 Tower clean", type: "Tower Cleaning", techs: 2, duration: 4,
    turbine: "C4", turbineStatus: "Online", workOrder: "40022003", status: "planned",
    cancelReasons: [], day: "2025-07-23", originalDay: "2025-07-23",
  },
  {
    id: uid(), name: "C7 Blade B painting", type: "Blade Painting", techs: 4, duration: 12,
    turbine: "C7", turbineStatus: "Offline", workOrder: "40022210", status: "planned",
    cancelReasons: [], day: "2025-07-23", originalDay: "2025-07-23",
  },
  // Thursday 24 — light
  {
    id: uid(), name: "D2 Blade C repair", type: "Blade Repair", techs: 2, duration: 6,
    turbine: "D2", turbineStatus: "Online", workOrder: "40021912", status: "planned",
    cancelReasons: [], day: "2025-07-24", originalDay: "2025-07-24",
  },
  // Friday 25 — light
  {
    id: uid(), name: "A11 Blade A recoat", type: "Blade Painting", techs: 3, duration: 8,
    turbine: "A11", turbineStatus: "Offline", workOrder: null, status: "planned",
    cancelReasons: [], day: "2025-07-25", originalDay: "2025-07-25",
  },
];

export function nextId() {
  return uid();
}
