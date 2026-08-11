// Job types are user-managed (Settings > Job Types), so this is any string —
// the canonical set lives in the store's `jobTypes`, seeded from SEED_JOB_TYPES below.
export type JobType = string;
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
  teamId?: string | null; // set per job on the planner; no default, no inheritance
}

export type WorkOrderStatus = "open" | "complete";
export type WorkOrderSource = "import" | "manual";

export interface WorkOrder {
  id: string;
  number: string;
  name: string; // SAP short text / description
  functionalLocation: string;
  asset: string;
  subAsset: string;
  type?: JobType; // inferred from the name; drives the "related work orders" match
  status: WorkOrderStatus;
  source: WorkOrderSource;
  createdAt: string; // ISO
}

export interface TeamMember {
  email: string;
  name: string; // looked up (or derived) from the email; editable
}

/** A team as configured in Settings — assignable to work orders, which propagates to their jobs. */
export interface Team {
  id: string;
  name: string;
  key: string; // slug/unique id, auto-filled from the name, editable
  color: string;
  description: string;
  members: TeamMember[];
  createdAt: string; // ISO
}

/** Best-effort friendly name from an email's local-part when no real directory lookup is wired up. */
export function deriveNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const words = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
  return words.length ? words.join(" ") : email;
}

/** Best-effort guess at a work order's job type from its name, for the linker match. */
export function inferJobType(name: string): JobType | undefined {
  const s = name.toLowerCase();
  if (s.includes("tip")) return "Blade Tip Repair";
  if (s.includes("paint") || s.includes("recoat") || s.includes("coat")) return "Blade Painting";
  if (s.includes("tower")) return "Tower Cleaning";
  if (s.includes("blade")) return "Blade Repair";
  return undefined;
}

const SUB_ASSET_CODES: Record<string, string> = {
  "Blade A": "MDA11",
  "Blade B": "MDA12",
  "Blade C": "MDA13",
  Tower: "MDA20",
  Nacelle: "MDA30",
  Hub: "MDA40",
};

/** A plausible SAP-style functional location, suggested (and editable) when adding a work order. */
export function suggestFunctionalLocation(asset: string, subAsset: string) {
  const code = SUB_ASSET_CODES[subAsset] ?? "MDA00";
  return `ACME.OWF01.G${asset}.${code}`;
}

export interface WorkTypeDefaults {
  techs: number;
  duration: number;
  turbineStatus: TurbineStatus;
}

/** A job type as configured in Settings — the source of the "work type" picker everywhere. */
export interface JobTypeDef {
  id: string;
  name: string;
  key: string; // slug/unique id, auto-filled from the name, editable
  color: string;
  description: string;
  defaults: WorkTypeDefaults;
}

export const JOB_TYPE_COLORS: { name: string; value: string }[] = [
  { name: "Blue", value: "#84B8FF" },
  { name: "Pink", value: "#F472B6" },
  { name: "Violet", value: "#A78BFA" },
  { name: "Green", value: "#34D399" },
  { name: "Amber", value: "#FBBF24" },
  { name: "Cyan", value: "#22D3EE" },
  { name: "Orange", value: "#FB923C" },
  { name: "Rose", value: "#FB7185" },
];

/** Key-field auto-fill (job types, cancellation reasons): slugify the name into an uppercase, underscore id. */
export function slugifyKey(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

let jtN = 0;
const jtUid = () => `jt-seed-${++jtN}`;

export const SEED_JOB_TYPES: JobTypeDef[] = [
  {
    id: jtUid(),
    name: "Blade Repair",
    key: "BLADE_REPAIR",
    color: "#84B8FF",
    description: "Structural or laminate repair on a blade section",
    defaults: { techs: 3, duration: 8, turbineStatus: "Offline" },
  },
  {
    id: jtUid(),
    name: "Blade Tip Repair",
    key: "BLADE_TIP_REPAIR",
    color: "#22D3EE",
    description: "Repair or reinforcement of the blade tip section",
    defaults: { techs: 2, duration: 6, turbineStatus: "Offline" },
  },
  {
    id: jtUid(),
    name: "Blade Painting",
    key: "BLADE_PAINTING",
    color: "#A78BFA",
    description: "Recoating and leading-edge protection",
    defaults: { techs: 4, duration: 12, turbineStatus: "Offline" },
  },
  {
    id: jtUid(),
    name: "Tower Cleaning",
    key: "TOWER_CLEANING",
    color: "#34D399",
    description: "Wash-down and inspection of the tower",
    defaults: { techs: 2, duration: 4, turbineStatus: "Online" },
  },
];

// Assets (turbines) and the sub-assets within each, for the status modal.
export const ASSETS = ["T1", "T2", "T3", "T5", "T6"];
export const SUB_ASSETS = ["Blade A", "Blade B", "Blade C", "Tower", "Nacelle", "Hub"];

/** A cancellation reason as configured in Settings — the source of the "Reasons" pills everywhere. */
export interface CancellationReasonDef {
  id: string;
  name: string;
  key: string; // slug/unique id, auto-filled from the name, editable
  icon: string; // key into the settings-layer icon map (kept as a string so this module stays React-free)
  color: string;
  description: string;
}

let crN = 0;
const crUid = () => `cr-seed-${++crN}`;

export const SEED_CANCELLATION_REASONS: CancellationReasonDef[] = [
  {
    id: crUid(),
    name: "Wind",
    key: "WIND",
    icon: "wind",
    color: "#22D3EE",
    description: "Sustained wind speed exceeds the safe working limit on the blade or nacelle.",
  },
  {
    id: crUid(),
    name: "Fog",
    key: "FOG",
    icon: "cloud-fog",
    color: "#94A3B8",
    description: "Visibility too low for a safe transfer or blade work.",
  },
  {
    id: crUid(),
    name: "Rain",
    key: "RAIN",
    icon: "cloud-rain",
    color: "#84B8FF",
    description: "Wet conditions affecting footing, tools or coating cure time.",
  },
  {
    id: crUid(),
    name: "Lightning",
    key: "LIGHTNING",
    icon: "zap",
    color: "#FBBF24",
    description: "Electrical storm activity making work on the turbine unsafe.",
  },
  {
    id: crUid(),
    name: "Humidity",
    key: "HUMIDITY",
    icon: "droplets",
    color: "#A78BFA",
    description: "Humidity too high for coating or bonding work to cure properly.",
  },
  {
    id: crUid(),
    name: "Gust",
    key: "GUST",
    icon: "wind",
    color: "#34D399",
    description: "Sudden gusts exceeding the safe working threshold.",
  },
  {
    id: crUid(),
    name: "Wave Height",
    key: "WAVE_HEIGHT",
    icon: "waves",
    color: "#F87171",
    description: "Sea state too rough for a safe vessel transfer.",
  },
];

let teamN = 0;
const teamUid = () => `team-seed-${++teamN}`;

function seedMember(email: string): TeamMember {
  return { email, name: deriveNameFromEmail(email) };
}

export const SEED_TEAMS: Team[] = [
  {
    id: teamUid(),
    name: "Team A",
    key: "TEAM_A",
    color: "#84B8FF",
    description: "Blade repair crew.",
    members: [
      seedMember("dave.fell@acme-energy.com"),
      seedMember("priya.nair@acme-energy.com"),
      seedMember("sam.okafor@acme-energy.com"),
      seedMember("lena.brandt@acme-energy.com"),
      seedMember("marco.silva@acme-energy.com"),
    ],
    createdAt: "2025-07-01T09:00:00.000Z",
  },
  {
    id: teamUid(),
    name: "Team B",
    key: "TEAM_B",
    color: "#34D399",
    description: "Blade repair crew.",
    members: [
      seedMember("jon.aldridge@acme-energy.com"),
      seedMember("mei.tanaka@acme-energy.com"),
      seedMember("ines.costa@acme-energy.com"),
    ],
    createdAt: "2025-07-01T09:00:00.000Z",
  },
  {
    id: teamUid(),
    name: "Team C",
    key: "TEAM_C",
    color: "#A78BFA",
    description: "Tower and nacelle crew.",
    members: [
      seedMember("omar.hassan@acme-energy.com"),
      seedMember("freya.lund@acme-energy.com"),
      seedMember("carlos.mendez@acme-energy.com"),
      seedMember("anya.petrov@acme-energy.com"),
      seedMember("liam.oconnor@acme-energy.com"),
      seedMember("noor.siddiqui@acme-energy.com"),
      seedMember("tobias.klein@acme-energy.com"),
      seedMember("ruth.mwangi@acme-energy.com"),
    ],
    createdAt: "2025-07-01T09:00:00.000Z",
  },
];

let woN = 0;
const woUid = () => `wo-seed-${++woN}`;

function seedWorkOrder(
  number: string,
  name: string,
  asset: string,
  subAsset: string,
  opts: { status?: WorkOrderStatus; source?: WorkOrderSource } = {},
): WorkOrder {
  return {
    id: woUid(),
    number,
    name,
    asset,
    subAsset,
    functionalLocation: suggestFunctionalLocation(asset, subAsset),
    type: inferJobType(name),
    status: opts.status ?? "open",
    source: opts.source ?? "manual",
    createdAt: "2025-07-15T09:00:00.000Z",
  };
}

export const WORK_ORDERS: WorkOrder[] = [
  seedWorkOrder("40021874", "Blade C trailing edge crack", "T1", "Blade C"),
  seedWorkOrder("40021912", "Leading edge erosion survey", "T3", "Blade A"),
  seedWorkOrder("40022003", "Tower base corrosion clean", "T5", "Tower"),
  seedWorkOrder("40022155", "Blade A lightning strike check", "T6", "Blade A"),
  seedWorkOrder("40022210", "Recoat blade B outboard", "T2", "Blade B"),
  seedWorkOrder("40022288", "Blade C repair follow-up", "T1", "Blade C"),
  seedWorkOrder("40022351", "Blade B tip erosion repair", "T3", "Blade B"),
  seedWorkOrder("40022410", "Tower wash-down inspection", "T6", "Tower"),
  seedWorkOrder("40022455", "Blade C recoat leading edge", "T2", "Blade C"),
  seedWorkOrder("24000155879", "GEV: 15 P1 Blade A Repair 2026", "T27", "Blade A", { source: "import" }),
  seedWorkOrder("24000156044", "GEV: 12 P1 Blade C Repair 2026", "T19", "Blade C", { source: "import" }),
  seedWorkOrder("24000156087", "GEV: 23 P1 Blade B Repair 2026", "T55", "Blade B", { source: "import" }),
  seedWorkOrder("24000156090", "GEV: 26 P1 Blade C Repair 2026", "T67", "Blade C", {
    source: "import",
    status: "complete",
  }),
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
    id: uid(), name: "T1 Blade C repair", type: "Blade Repair", techs: 2, duration: 8,
    turbine: "T1", turbineStatus: "Offline", workOrder: "40021874", status: "complete",
    cancelReasons: [], day: "2025-07-21", originalDay: "2025-07-21",
  },
  {
    id: uid(), name: "T3 Blade A leading edge", type: "Blade Repair", techs: 3, duration: 12,
    turbine: "T3", turbineStatus: "Offline", workOrder: "40021912", status: "cancelled",
    cancelReasons: ["Rain", "Lightning", "Gust", "Wind"], day: "2025-07-21", originalDay: "2025-07-21",
  },
  {
    id: uid(), name: "T5 Tower clean", type: "Tower Cleaning", techs: 2, duration: null,
    turbine: "T5", turbineStatus: null, workOrder: null, status: "planned",
    cancelReasons: [], day: "2025-07-21", originalDay: "2025-07-21",
  },
  {
    id: uid(), name: "T6 Blade A LE check", type: "Blade Repair", techs: null, duration: 6,
    turbine: "T6", turbineStatus: "Online", workOrder: "40022155", status: "planned",
    cancelReasons: [], day: "2025-07-21", originalDay: "2025-07-21",
  },
  // Tuesday 22 (today) — heavy
  {
    id: uid(), name: "T1 Blade C repair", type: "Blade Repair", techs: 2, duration: 8,
    turbine: "T1", turbineStatus: "Offline", workOrder: "40022288", status: "planned",
    cancelReasons: [], day: "2025-07-22", originalDay: "2025-07-22",
  },
  {
    id: uid(), name: "T2 Blade B recoat", type: "Blade Painting", techs: 4, duration: 12,
    turbine: "T2", turbineStatus: "Offline", workOrder: "40022210", status: "complete",
    cancelReasons: [], day: "2025-07-22", originalDay: "2025-07-22",
  },
  {
    id: uid(), name: "T3 Leading edge survey", type: "Blade Repair", techs: 2, duration: 4,
    turbine: "T3", turbineStatus: "Online", workOrder: "40021912", status: "cancelled",
    cancelReasons: ["Fog", "Wave Height"], day: "2025-07-22", originalDay: "2025-07-22",
  },
  {
    id: uid(), name: "T5 Tower clean", type: "Tower Cleaning", techs: 3, duration: 6,
    turbine: "T5", turbineStatus: "Online", workOrder: null, status: "planned",
    cancelReasons: [], day: "2025-07-22", originalDay: "2025-07-22",
  },
  // Wednesday 23 — heavy
  {
    id: uid(), name: "T6 Blade A repair", type: "Blade Repair", techs: 3, duration: 8,
    turbine: "T6", turbineStatus: "Offline", workOrder: "40022155", status: "planned",
    cancelReasons: [], day: "2025-07-23", originalDay: "2025-07-23",
  },
  {
    id: uid(), name: "T1 Tower clean", type: "Tower Cleaning", techs: 2, duration: 4,
    turbine: "T1", turbineStatus: "Online", workOrder: "40022003", status: "planned",
    cancelReasons: [], day: "2025-07-23", originalDay: "2025-07-23",
  },
  {
    id: uid(), name: "T2 Blade B painting", type: "Blade Painting", techs: 4, duration: 12,
    turbine: "T2", turbineStatus: "Offline", workOrder: "40022210", status: "planned",
    cancelReasons: [], day: "2025-07-23", originalDay: "2025-07-23",
  },
  // Thursday 24 — light
  {
    id: uid(), name: "T3 Blade C repair", type: "Blade Repair", techs: 2, duration: 6,
    turbine: "T3", turbineStatus: "Online", workOrder: "40021912", status: "planned",
    cancelReasons: [], day: "2025-07-24", originalDay: "2025-07-24",
  },
  // Friday 25 — light
  {
    id: uid(), name: "T5 Blade A recoat", type: "Blade Painting", techs: 3, duration: 8,
    turbine: "T5", turbineStatus: "Offline", workOrder: null, status: "planned",
    cancelReasons: [], day: "2025-07-25", originalDay: "2025-07-25",
  },
];

// Collision-safe id generator for anything created at runtime (jobs, work
// orders). The seed data above uses its own incrementing counters, which is
// fine since they only ever run once per module load — but state now
// persists to localStorage, so a counter that resets to 0 on every reload
// would eventually mint an id that already exists in the persisted data.
function uniqueId(prefix: string) {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${rand}`;
}

export function nextId() {
  return uniqueId("job");
}

export function nextWorkOrderId() {
  return uniqueId("wo");
}

export function nextJobTypeId() {
  return uniqueId("jt");
}

export function nextCancellationReasonId() {
  return uniqueId("cr");
}

export function nextTeamId() {
  return uniqueId("team");
}
