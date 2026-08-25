"use client";

import React, { useState, useTransition } from "react";
import {
  Plus,
  Calendar,
  Clock,
  Lock,
  Unlock,
  Trash2,
  BookOpen,
  Award,
  Loader2,
  ChevronDown,
  Layers,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createExamAction,
  updateExamStatusAction,
  deleteExamAction,
  createExamScheduleAction,
  toggleScheduleLockAction,
  deleteExamScheduleAction,
} from "./actions";
import { formatDate } from "@/lib/utils";
import { ExamStatus } from "@prisma/client";

interface ExamItem {
  id: string;
  name: string;
  type: string;
  startDate: Date;
  endDate: Date;
  status: ExamStatus;
  academicYear: { id: string; name: string };
  class: { id: string; name: string } | null;
  examSchedules: Array<{
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    room: string | null;
    maxMarks: number;
    isLocked: boolean;
    section: { id: string; name: string };
    subject: { id: string; name: string; code: string };
    _count: { marks: number };
  }>;
}

interface Props {
  exams: ExamItem[];
  classes: Array<{
    id: string;
    name: string;
    sections: Array<{ id: string; name: string }>;
  }>;
  subjects: Array<{ id: string; name: string; code: string }>;
  academicYears: Array<{ id: string; name: string; isCurrent: boolean }>;
}

const STATUS_BADGES: Record<ExamStatus, { label: string; colors: string }> = {
  DRAFT: { label: "Draft", colors: "bg-slate-100 text-slate-700 border-slate-200" },
  SCHEDULED: { label: "Scheduled", colors: "bg-blue-50 text-blue-700 border-blue-200" },
  ONGOING: { label: "Ongoing", colors: "bg-amber-50 text-amber-700 border-amber-200" },
  COMPLETED: { label: "Completed", colors: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Cancelled", colors: "bg-red-50 text-red-700 border-red-200" },
};

export function ExamManagementClient({
  exams,
  classes,
  subjects,
  academicYears,
}: Props) {
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [scheduleModalExam, setScheduleModalExam] = useState<ExamItem | null>(null);
  const [isPending, startTransition] = useTransition();

  // Schedule modal form state
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const currentAcademicYear = academicYears.find((y) => y.isCurrent) || academicYears[0];

  function handleCreateExam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createExamAction(formData);
      if (res.success) {
        toast.success(res.message);
        setIsExamModalOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleCreateSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createExamScheduleAction(formData);
      if (res.success) {
        toast.success(res.message);
        setScheduleModalExam(null);
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleToggleLock(scheduleId: string, currentLocked: boolean) {
    startTransition(async () => {
      const res = await toggleScheduleLockAction(scheduleId, !currentLocked);
      if (res.success) toast.success(res.message);
      else toast.error(res.error);
    });
  }

  function handleDeleteSchedule(scheduleId: string) {
    if (!confirm("Delete this scheduled exam paper?")) return;
    startTransition(async () => {
      const res = await deleteExamScheduleAction(scheduleId);
      if (res.success) toast.success(res.message);
      else toast.error(res.error);
    });
  }

  function handleDeleteExam(examId: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}" and all associated paper schedules?`)) return;
    startTransition(async () => {
      const res = await deleteExamAction(examId);
      if (res.success) toast.success(res.message);
      else toast.error(res.error);
    });
  }

  function handleStatusChange(examId: string, status: ExamStatus) {
    startTransition(async () => {
      const res = await updateExamStatusAction(examId, status);
      if (res.success) toast.success(res.message);
      else toast.error(res.error);
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-slate-800">
            {exams.length} Examination Terms Defined
          </span>
        </div>
        <button
          onClick={() => setIsExamModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Examination Term
        </button>
      </div>

      {/* Exams List */}
      <div className="space-y-6">
        {exams.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No examinations created yet. Create a term to begin scheduling papers.</p>
          </div>
        ) : (
          exams.map((exam) => {
            const statusCfg = STATUS_BADGES[exam.status] || STATUS_BADGES.DRAFT;
            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Exam Term Header */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900">
                        {exam.name}
                      </h3>
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.colors}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Session: <span className="font-semibold text-slate-700">{exam.academicYear.name}</span> · Term: {formatDate(exam.startDate)} to {formatDate(exam.endDate)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Dropdown */}
                    <select
                      value={exam.status}
                      disabled={isPending}
                      onChange={(e) => handleStatusChange(exam.id, e.target.value as ExamStatus)}
                      className="px-2.5 py-1 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>

                    <button
                      onClick={() => setScheduleModalExam(exam)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Schedule Paper
                    </button>

                    <button
                      onClick={() => handleDeleteExam(exam.id, exam.name)}
                      disabled={isPending}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Scheduled Papers Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                      <tr>
                        <th className="px-4 py-2.5 text-left">Subject</th>
                        <th className="px-4 py-2.5 text-left">Section</th>
                        <th className="px-4 py-2.5 text-left">Date & Time</th>
                        <th className="px-4 py-2.5 text-left">Room</th>
                        <th className="px-4 py-2.5 text-center">Max Marks</th>
                        <th className="px-4 py-2.5 text-center">Marks Entered</th>
                        <th className="px-4 py-2.5 text-center">Lock Status</th>
                        <th className="px-4 py-2.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {exam.examSchedules.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            No subject papers scheduled for this exam yet. Click "Schedule Paper" above.
                          </td>
                        </tr>
                      ) : (
                        exam.examSchedules.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {s.subject.name} <span className="text-slate-400 font-mono">({s.subject.code})</span>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-700">
                              Section {s.section.name}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {formatDate(s.date)} · <span className="font-mono">{s.startTime} – {s.endTime}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 font-mono">
                              {s.room || "—"}
                            </td>
                            <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                              {s.maxMarks}
                            </td>
                            <td className="px-4 py-3 text-center font-mono">
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold">
                                {s._count.marks} students
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleToggleLock(s.id, s.isLocked)}
                                disabled={isPending}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                                  s.isLocked
                                    ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                    : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                }`}
                              >
                                {s.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                {s.isLocked ? "Locked" : "Open"}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleDeleteSchedule(s.id)}
                                disabled={isPending}
                                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Examination Term */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Create Examination Term</h3>
              <button onClick={() => setIsExamModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateExam} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Title *</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Examination 2026"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Type *</label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MID_TERM">Mid Term</option>
                    <option value="FINAL">Final Term</option>
                    <option value="MONTHLY_TEST">Monthly Test</option>
                    <option value="ANNUAL">Annual Exam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Session *</label>
                  <select
                    name="academicYearId"
                    required
                    defaultValue={currentAcademicYear?.id}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {academicYears.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name} {y.isCurrent ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    name="startDate"
                    type="date"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    name="endDate"
                    type="date"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Paper */}
      {scheduleModalExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Schedule Examination Paper</h3>
                <p className="text-xs text-slate-500 mt-0.5">{scheduleModalExam.name}</p>
              </div>
              <button onClick={() => setScheduleModalExam(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateSchedule} className="p-6 space-y-4 text-sm">
              <input type="hidden" name="examId" value={scheduleModalExam.id} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Class *</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section *</label>
                  <select
                    name="sectionId"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {(selectedClass?.sections || []).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                <select
                  name="subjectId"
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Date *</label>
                  <input
                    name="date"
                    type="date"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
                  <input
                    name="startTime"
                    type="time"
                    required
                    defaultValue="09:00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
                  <input
                    name="endTime"
                    type="time"
                    required
                    defaultValue="12:00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Marks *</label>
                  <input
                    name="maxMarks"
                    type="number"
                    min="1"
                    required
                    defaultValue={100}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Hall</label>
                  <input
                    name="room"
                    type="text"
                    placeholder="e.g. Hall A"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScheduleModalExam(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
