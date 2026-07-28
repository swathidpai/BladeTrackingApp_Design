import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Job, JobStatus, SEED_JOBS, nextId } from "./data";
import { fullDayName, dateNumber, monthName, needsAttention, weekWindow } from "./utils";
import { NavRail } from "./components/layout/NavRail";
import { TopBar } from "./components/layout/TopBar";
import { PlannerHeader } from "./components/planner/PlannerHeader";
import { AttentionBanner } from "./components/planner/AttentionBanner";
import { DayColumn } from "./components/planner/DayColumn";
import { JobCard } from "./components/planner/JobCard";
import { JobModal } from "./components/modals/JobModal";
import { CancelReasonModal } from "./components/modals/CancelReasonModal";
import { DayConfirmModal } from "./components/modals/DayConfirmModal";
import { StatusModal } from "./components/modals/StatusModal";
import { ResolveScreen } from "./components/resolve/ResolveScreen";
import { ToastStack, type ToastData } from "./components/ui/Toast";

type View = "planner" | "resolve";

let toastSeq = 0;

export default function App() {
  const [jobs, setJobs] = useState<Job[]>(SEED_JOBS);
  const [view, setView] = useState<View>("planner");
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDays = useMemo(() => weekWindow(weekOffset), [weekOffset]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const snapshot = useRef<Job[] | null>(null);

  // Modals
  const [jobModal, setJobModal] = useState<{ day: string; job?: Job } | null>(null);
  const [cancelModal, setCancelModal] = useState<Job | null>(null);
  const [statusModal, setStatusModal] = useState<Job | null>(null);
  const [dayModal, setDayModal] = useState<{ day: string; mode: "complete" | "cancel" } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const attentionCount = useMemo(() => jobs.filter(needsAttention).length, [jobs]);
  const activeJob = jobs.find((j) => j.id === activeId) ?? null;

  // ---- Toast helpers ----
  function pushToast(message: string, onUndo?: () => void) {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, message, onUndo }]);
  }
  const dismissToast = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  // ---- Job mutations ----
  function updateJob(id: string, patch: Partial<Job>) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }

  function handleStatus(job: Job, status: JobStatus) {
    if (status === "cancelled") {
      setCancelModal(job);
      return;
    }
    updateJob(job.id, { status, cancelReasons: status === "planned" ? [] : job.cancelReasons });
  }

  // Unified status modal (opened from a card's status button).
  function saveStatus(patch: Partial<Job>, status: JobStatus) {
    if (!statusModal) return;
    const before = jobs;
    updateJob(statusModal.id, patch);
    const name = statusModal.name;
    const message =
      status === "complete"
        ? `${name} marked successful`
        : status === "cancelled"
          ? `${name} cancelled`
          : `${name} set to planned`;
    pushToast(message, () => setJobs(before));
    setStatusModal(null);
  }

  function duplicateJob(job: Job) {
    const copy: Job = { ...job, id: nextId(), status: "planned", cancelReasons: [] };
    setJobs((prev) => {
      const i = prev.findIndex((j) => j.id === job.id);
      const next = [...prev];
      next.splice(i + 1, 0, copy);
      return next;
    });
    pushToast("Job duplicated");
  }

  function deleteJob(job: Job) {
    const before = jobs;
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    pushToast("Job deleted", () => setJobs(before));
  }

  function saveJob(job: Job) {
    const isEdit = !!jobModal?.job;
    setJobs((prev) => {
      const exists = prev.some((j) => j.id === job.id);
      return exists ? prev.map((j) => (j.id === job.id ? job : j)) : [...prev, job];
    });
    pushToast(isEdit ? "Job saved" : "Job created");
    setJobModal(null);
  }

  function confirmCancel(reasons: string[], patch: Partial<Job>) {
    if (cancelModal) {
      updateJob(cancelModal.id, { ...patch, status: "cancelled", cancelReasons: reasons });
      pushToast("Job cancelled");
    }
    setCancelModal(null);
  }

  function confirmDay(reasons: string[]) {
    if (!dayModal) return;
    const { day, mode } = dayModal;
    const affected = jobs.filter((j) => j.day === day && j.status === "planned");
    setJobs((prev) =>
      prev.map((j) =>
        j.day === day && j.status === "planned"
          ? {
              ...j,
              status: mode === "complete" ? "complete" : "cancelled",
              cancelReasons: mode === "cancel" ? reasons : j.cancelReasons,
            }
          : j,
      ),
    );
    pushToast(
      mode === "complete"
        ? `${affected.length} jobs marked successful`
        : `${affected.length} jobs cancelled`,
    );
    setDayModal(null);
  }

  // ---- Drag & drop (planner) ----
  function onDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
    snapshot.current = jobs;
  }

  function moveBetween(activeIdStr: string, overContainer: string, overId?: string) {
    setJobs((prev) => {
      const activeIdx = prev.findIndex((j) => j.id === activeIdStr);
      if (activeIdx < 0) return prev;
      const moved = { ...prev[activeIdx], day: overContainer };
      const without = prev.filter((j) => j.id !== activeIdStr);
      let insertAt = without.length;
      if (overId && overId !== overContainer) {
        const overIdx = without.findIndex((j) => j.id === overId);
        if (overIdx >= 0) insertAt = overIdx;
      } else {
        const lastIdx = without.map((j) => j.day).lastIndexOf(overContainer);
        insertAt = lastIdx >= 0 ? lastIdx + 1 : without.length;
      }
      const next = [...without];
      next.splice(insertAt, 0, moved);
      return next;
    });
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeContainer = (active.data.current?.containerId as string) ?? null;
    const overContainer = (over.data.current?.containerId as string) ?? (over.id as string);
    if (!activeContainer || !overContainer) return;
    if (activeContainer === overContainer) return;
    moveBetween(active.id as string, overContainer, over.id as string);
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) {
      snapshot.current = null;
      return;
    }

    const overContainer = (over.data.current?.containerId as string) ?? (over.id as string);

    setJobs((prev) => {
      const activeIdx = prev.findIndex((j) => j.id === active.id);
      const overIdx = prev.findIndex((j) => j.id === over.id);
      if (activeIdx < 0 || overIdx < 0 || activeIdx === overIdx) return prev;
      if (prev[activeIdx].day !== prev[overIdx].day) return prev;
      return arrayMove(prev, activeIdx, overIdx);
    });

    const before = snapshot.current?.find((j) => j.id === active.id);
    const activeJobNow = jobs.find((j) => j.id === active.id);
    if (before && activeJobNow && overContainer && before.day !== overContainer) {
      const snap = snapshot.current!;
      pushToast(
        `${activeJobNow.name} moved to ${fullDayName(overContainer)} ${dateNumber(overContainer)}`,
        () => setJobs(snap),
      );
    }
    snapshot.current = null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base text-text-primary">
      <NavRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />

        {view === "resolve" ? (
          <ResolveScreen
            jobs={jobs}
            onBack={() => setView("planner")}
            onStatus={handleStatus}
            onSetStatus={(job) => setStatusModal(job)}
            onDuplicate={duplicateJob}
            onDelete={deleteJob}
            onMarkAllComplete={(d) => setDayModal({ day: d, mode: "complete" })}
            onCancelAll={(d) => setDayModal({ day: d, mode: "cancel" })}
            onReschedule={(job, day, time) => {
              const snap = jobs;
              updateJob(job.id, { day });
              pushToast(
                `${job.name} moved to ${fullDayName(day)} ${dateNumber(day)} ${monthName(day)}, ${time}`,
                () => setJobs(snap),
              );
            }}
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <PlannerHeader
              days={weekDays}
              onStep={(weeks) => setWeekOffset((o) => o + weeks)}
              onToday={() => setWeekOffset(0)}
            />
            <AttentionBanner count={attentionCount} onResolve={() => setView("resolve")} />

            <div className="flex min-h-0 flex-1">
              {weekDays.map((day) => (
                <DayColumn
                  key={day}
                  dayKey={day}
                  jobs={jobs.filter((j) => j.day === day)}
                  activeId={activeId}
                  onAddJob={(d) => setJobModal({ day: d })}
                  onMarkAllComplete={(d) => setDayModal({ day: d, mode: "complete" })}
                  onCancelAll={(d) => setDayModal({ day: d, mode: "cancel" })}
                  onSetStatus={(job) => setStatusModal(job)}
                  onDuplicate={duplicateJob}
                  onDelete={deleteJob}
                  onReasonClick={(job) => setCancelModal(job)}
                  onLinkWorkOrder={(job) => setJobModal({ day: job.day, job })}
                />
              ))}
            </div>

            <DragOverlay>
              {activeJob && (
                <div className="rotate-2 opacity-95 shadow-2xl">
                  <JobCard
                    job={activeJob}
                    onSetStatus={() => {}}
                    onDuplicate={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {jobModal && (
        <JobModal
          day={jobModal.day}
          job={jobModal.job}
          onClose={() => setJobModal(null)}
          onSave={saveJob}
        />
      )}
      {statusModal && (
        <StatusModal
          job={statusModal}
          onClose={() => setStatusModal(null)}
          onSave={saveStatus}
        />
      )}
      {cancelModal && (
        <CancelReasonModal
          job={cancelModal}
          onClose={() => setCancelModal(null)}
          onConfirm={confirmCancel}
        />
      )}
      {dayModal && (
        <DayConfirmModal
          day={dayModal.day}
          mode={dayModal.mode}
          jobs={jobs.filter((j) => j.day === dayModal.day)}
          onClose={() => setDayModal(null)}
          onConfirm={confirmDay}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
