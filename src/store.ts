import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CancellationReasonDef,
  Job,
  JobTypeDef,
  SEED_CANCELLATION_REASONS,
  SEED_JOBS,
  SEED_JOB_TYPES,
  SEED_TEAMS,
  Team,
  WORK_ORDERS,
  WorkOrder,
  nextCancellationReasonId,
  nextJobTypeId,
  nextTeamId,
  nextWorkOrderId,
} from "./data";

interface Store {
  jobs: Job[];
  workOrders: WorkOrder[];
  jobTypes: JobTypeDef[];
  cancellationReasons: CancellationReasonDef[];
  teams: Team[];

  setJobs: (updater: Job[] | ((prev: Job[]) => Job[])) => void;
  updateJob: (id: string, patch: Partial<Job>) => void;
  addJob: (job: Job) => void;
  deleteJob: (id: string) => void;

  addWorkOrder: (wo: Omit<WorkOrder, "id" | "createdAt">) => WorkOrder;
  addWorkOrders: (wos: Omit<WorkOrder, "id" | "createdAt">[]) => WorkOrder[];
  toggleWorkOrderStatus: (id: string) => void;
  setWorkOrderStatusByNumber: (number: string, status: WorkOrder["status"]) => void;
  /** Removes the work order and cascades to every job linked to it. Returns what was removed, for undo. */
  deleteWorkOrder: (id: string) => { workOrder: WorkOrder | null; removedJobs: Job[] };
  /** Undo counterpart to deleteWorkOrder. */
  restoreWorkOrder: (workOrder: WorkOrder, jobs: Job[]) => void;

  addJobType: (jt: Omit<JobTypeDef, "id">) => JobTypeDef;
  updateJobType: (id: string, patch: Partial<Omit<JobTypeDef, "id">>) => void;
  /** Removes the job type from the picker only — jobs/work orders already using its name keep it. */
  deleteJobType: (id: string) => void;

  addCancellationReason: (r: Omit<CancellationReasonDef, "id">) => CancellationReasonDef;
  updateCancellationReason: (id: string, patch: Partial<Omit<CancellationReasonDef, "id">>) => void;
  /** Removes the reason from the picker only — jobs already cancelled for it keep the recorded name. */
  deleteCancellationReason: (id: string) => void;

  addTeam: (t: Omit<Team, "id" | "createdAt">) => Team;
  updateTeam: (id: string, patch: Partial<Omit<Team, "id" | "createdAt">>) => void;
  /** Removes the team — work orders/jobs referencing it fall back to "No team", their work is untouched. */
  deleteTeam: (id: string) => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      jobs: SEED_JOBS,
      workOrders: WORK_ORDERS,
      jobTypes: SEED_JOB_TYPES,
      cancellationReasons: SEED_CANCELLATION_REASONS,
      teams: SEED_TEAMS,

      setJobs: (updater) =>
        set((s) => ({ jobs: typeof updater === "function" ? updater(s.jobs) : updater })),
      updateJob: (id, patch) =>
        set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)) })),
      addJob: (job) => set((s) => ({ jobs: [...s.jobs, job] })),
      deleteJob: (id) => set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })),

      addWorkOrder: (wo) => {
        const record: WorkOrder = { ...wo, id: nextWorkOrderId(), createdAt: new Date().toISOString() };
        set((s) => ({ workOrders: [...s.workOrders, record] }));
        return record;
      },
      addWorkOrders: (wos) => {
        const records = wos.map((wo) => ({
          ...wo,
          id: nextWorkOrderId(),
          createdAt: new Date().toISOString(),
        }));
        set((s) => ({ workOrders: [...s.workOrders, ...records] }));
        return records;
      },
      toggleWorkOrderStatus: (id) =>
        set((s) => ({
          workOrders: s.workOrders.map((w) =>
            w.id === id ? { ...w, status: w.status === "open" ? "complete" : "open" } : w,
          ),
        })),
      setWorkOrderStatusByNumber: (number, status) =>
        set((s) => ({
          workOrders: s.workOrders.map((w) => (w.number === number ? { ...w, status } : w)),
        })),
      deleteWorkOrder: (id) => {
        const workOrder = get().workOrders.find((w) => w.id === id) ?? null;
        const removedJobs = workOrder ? get().jobs.filter((j) => j.workOrder === workOrder.number) : [];
        set((s) => ({
          workOrders: s.workOrders.filter((w) => w.id !== id),
          jobs: workOrder ? s.jobs.filter((j) => j.workOrder !== workOrder.number) : s.jobs,
        }));
        return { workOrder, removedJobs };
      },
      restoreWorkOrder: (workOrder, jobs) =>
        set((s) => ({
          workOrders: [...s.workOrders, workOrder],
          jobs: [...s.jobs, ...jobs],
        })),

      addJobType: (jt) => {
        const record: JobTypeDef = { ...jt, id: nextJobTypeId() };
        set((s) => ({ jobTypes: [...s.jobTypes, record] }));
        return record;
      },
      updateJobType: (id, patch) =>
        set((s) => ({ jobTypes: s.jobTypes.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteJobType: (id) => set((s) => ({ jobTypes: s.jobTypes.filter((t) => t.id !== id) })),

      addCancellationReason: (r) => {
        const record: CancellationReasonDef = { ...r, id: nextCancellationReasonId() };
        set((s) => ({ cancellationReasons: [...s.cancellationReasons, record] }));
        return record;
      },
      updateCancellationReason: (id, patch) =>
        set((s) => ({
          cancellationReasons: s.cancellationReasons.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      deleteCancellationReason: (id) =>
        set((s) => ({ cancellationReasons: s.cancellationReasons.filter((r) => r.id !== id) })),

      addTeam: (t) => {
        const record: Team = { ...t, id: nextTeamId(), createdAt: new Date().toISOString() };
        set((s) => ({ teams: [...s.teams, record] }));
        return record;
      },
      updateTeam: (id, patch) =>
        set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTeam: (id) =>
        set((s) => ({
          teams: s.teams.filter((t) => t.id !== id),
          workOrders: s.workOrders.map((w) => (w.teamId === id ? { ...w, teamId: undefined } : w)),
          jobs: s.jobs.map((j) => (j.teamId === id ? { ...j, teamId: undefined } : j)),
        })),
    }),
    { name: "windai-blade-tracking" },
  ),
);
