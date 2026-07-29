import { useEffect, useMemo, useRef, useState } from "react";
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, Plus, Upload } from "lucide-react";
import { JOB_TYPES, Job, WorkOrder, nextId } from "../../data";
import { dateNumber, fullDayName, todayWindow } from "../../utils";
import { useStore } from "../../store";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { ToastStack, type ToastData } from "../ui/Toast";
import { WorkOrderCalendar } from "./WorkOrderCalendar";
import { WorkOrderList } from "./WorkOrderList";
import { AddWorkOrderModal } from "./AddWorkOrderModal";

let toastSeq = 0;

export function WorkOrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobs = useStore((s) => s.jobs);
  const workOrders = useStore((s) => s.workOrders);
  const addJob = useStore((s) => s.addJob);
  const updateJob = useStore((s) => s.updateJob);
  const deleteJobAction = useStore((s) => s.deleteJob);
  const toggleWorkOrderStatus = useStore((s) => s.toggleWorkOrderStatus);
  const deleteWorkOrder = useStore((s) => s.deleteWorkOrder);
  const restoreWorkOrder = useStore((s) => s.restoreWorkOrder);

  const [weekOffset, setWeekOffset] = useState(0);
  const days = useMemo(() => todayWindow(weekOffset), [weekOffset]);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WorkOrder | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function pushToast(message: string, onUndo?: () => void) {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, message, onUndo }]);
  }
  const dismissToast = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  // Flash a toast carried over from a redirect (e.g. after an import), then
  // clear it from history so it doesn't reappear on refresh or back/forward.
  // Guarded with a ref because StrictMode double-invokes mount effects in
  // dev, which would otherwise push the same toast twice before the
  // clearing navigate() below takes effect.
  const flashHandled = useRef(false);
  useEffect(() => {
    if (flashHandled.current) return;
    flashHandled.current = true;
    const flash = (location.state as { toast?: string } | null)?.toast;
    if (flash) {
      pushToast(flash);
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jobsByDay = useMemo(() => {
    const map = new Map<string, Job[]>();
    for (const job of jobs) {
      if (!map.has(job.day)) map.set(job.day, []);
      map.get(job.day)!.push(job);
    }
    return map;
  }, [jobs]);

  function planWorkOrder(wo: WorkOrder, day: string) {
    const defaults = wo.type ? JOB_TYPES.find((t) => t.name === wo.type)?.defaults : undefined;
    const job: Job = {
      id: nextId(),
      name: wo.name,
      type: wo.type ?? "Blade Repair",
      techs: defaults?.techs ?? null,
      duration: defaults?.duration ?? null,
      turbine: wo.asset,
      turbineStatus: defaults?.turbineStatus ?? null,
      workOrder: wo.number,
      status: "planned",
      cancelReasons: [],
      asset: wo.asset,
      subAsset: wo.subAsset,
      day,
      originalDay: day,
    };
    addJob(job);
    pushToast(`${wo.name} planned for ${fullDayName(day)} ${dateNumber(day)}`, () => deleteJobAction(job.id));
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const overData = over.data.current as { kind?: string; day?: string } | undefined;
    if (overData?.kind !== "day" || !overData.day) return;
    const day = overData.day;

    const activeData = active.data.current as { kind?: string; workOrder?: WorkOrder; job?: Job } | undefined;
    if (activeData?.kind === "workorder" && activeData.workOrder) {
      planWorkOrder(activeData.workOrder, day);
    } else if (activeData?.kind === "job" && activeData.job) {
      const job = activeData.job;
      if (job.day === day) return;
      const fromDay = job.day;
      updateJob(job.id, { day });
      pushToast(`${job.name} moved to ${fullDayName(day)} ${dateNumber(day)}`, () =>
        updateJob(job.id, { day: fromDay }),
      );
    }
  }

  function deleteJobFromCalendar(job: Job) {
    deleteJobAction(job.id);
    pushToast(`${job.name} removed from the plan`, () => addJob(job));
  }

  function confirmDeleteWorkOrder() {
    if (!deleteTarget) return;
    const { workOrder, removedJobs } = deleteWorkOrder(deleteTarget.id);
    if (workOrder) {
      pushToast(
        removedJobs.length > 0
          ? `${workOrder.name} deleted — ${removedJobs.length} planned job${removedJobs.length === 1 ? "" : "s"} removed too`
          : `${workOrder.name} deleted`,
        () => restoreWorkOrder(workOrder, removedJobs),
      );
    }
    setDeleteTarget(null);
  }

  const affectedJobCount = deleteTarget
    ? jobs.filter((j) => j.workOrder === deleteTarget.number).length
    : 0;

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-slim">
        <div className="flex items-center justify-between px-6 py-6">
          <h1 className="text-[28px] font-medium leading-none tracking-[-0.2px] text-text-primary">
            Work Orders
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/work-orders/import")}>
              <Upload size={15} /> Import work orders
            </Button>
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              <Plus size={15} /> New work order
            </Button>
          </div>
        </div>

        <WorkOrderCalendar
          days={days}
          jobsByDay={jobsByDay}
          onStep={(weeks) => setWeekOffset((o) => o + weeks)}
          onToday={() => setWeekOffset(0)}
          onDeleteJob={deleteJobFromCalendar}
        />

        <WorkOrderList
          workOrders={workOrders}
          onToggleStatus={(wo) => {
            toggleWorkOrderStatus(wo.id);
            pushToast(wo.status === "open" ? `${wo.name} marked complete` : `${wo.name} reopened`);
          }}
          onDelete={setDeleteTarget}
        />
      </div>

      {addOpen && <AddWorkOrderModal onClose={() => setAddOpen(false)} />}
      {deleteTarget && (
        <Modal
          title="Delete this work order?"
          subtitle={deleteTarget.name}
          width={440}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDeleteWorkOrder}>
                Delete work order
              </Button>
            </>
          }
        >
          {affectedJobCount > 0 && (
            <div className="flex items-start gap-2 rounded-[6px] border border-attention/40 bg-attention-bg/60 px-3 py-2 text-[13px] text-text-secondary">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-attention" />
              This work order has {affectedJobCount} planned job{affectedJobCount === 1 ? "" : "s"}. Deleting
              it will also remove {affectedJobCount === 1 ? "that job" : "those jobs"} from the calendar and
              Job Planner.
            </div>
          )}
        </Modal>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </DndContext>
  );
}
