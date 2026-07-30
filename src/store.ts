import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Job, SEED_JOBS, WORK_ORDERS, WorkOrder, nextWorkOrderId } from "./data";

interface Store {
  jobs: Job[];
  workOrders: WorkOrder[];

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
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      jobs: SEED_JOBS,
      workOrders: WORK_ORDERS,

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
    }),
    { name: "windai-blade-tracking" },
  ),
);
