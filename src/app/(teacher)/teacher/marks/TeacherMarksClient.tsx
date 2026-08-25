"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Save,
  Loader2,
  Lock,
  Award,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { saveMarksAction } from "./actions";
import { calculateGrade, getInitials } from "@/lib/utils";

interface ExamPaperOption {
  id: string;
  maxMarks: number;
  isLocked: boolean;
  date: Date;
  exam: { id: string; name: string };
  subject: { name: string; code: string };
  section: { name: string; class: { name: string } };
}

interface StudentMarkRow {
  studentId: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  rollNumber: string | null;
  obtainedMarks: number | null;
  isAbsent: boolean;
  remarks: string;
}

export function TeacherMarksClient({
  scheduledPapers,
}: {
  scheduledPapers: ExamPaperOption[];
}) {
  const [selectedScheduleId, setSelectedScheduleId] = useState(
    scheduledPapers[0]?.id || ""
  );
  const [roster, setRoster] = useState<StudentMarkRow[]>([]);
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, startSaving] = useTransition();

  const currentPaper = scheduledPapers.find((p) => p.id === selectedScheduleId);

  useEffect(() => {
    if (!selectedScheduleId) return;
    setIsLoading(true);

    fetch(`/api/marks/roster?examScheduleId=${selectedScheduleId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRoster(data.roster);
        setMaxMarks(data.schedule.maxMarks);
        setIsLocked(data.schedule.isLocked);
      })
      .catch((err) => toast.error(err.message || "Failed to load roster."))
      .finally(() => setIsLoading(false));
  }, [selectedScheduleId]);

  function updateStudentMark(studentId: string, field: string, value: any) {
    setRoster((prev) =>
      prev.map((s) => {
        if (s.studentId !== studentId) return s;
        return { ...s, [field]: value };
      })
    );
  }

  function handleSave() {
    if (isLocked) {
      toast.error("Marks for this paper are locked by the administrator.");
      return;
    }

    // Validate marks do not exceed maxMarks
    for (const row of roster) {
      if (!row.isAbsent && row.obtainedMarks !== null) {
        if (row.obtainedMarks < 0 || row.obtainedMarks > maxMarks) {
          toast.error(
            `Marks for ${row.firstName} ${row.lastName} (${row.obtainedMarks}) exceed maximum marks (${maxMarks}).`
          );
          return;
        }
      }
    }

    const payload = roster.map((r) => ({
      studentId: r.studentId,
      obtainedMarks: r.isAbsent ? null : r.obtainedMarks,
      isAbsent: r.isAbsent,
      remarks: r.remarks || null,
    }));

    const formData = new FormData();
    formData.append("examScheduleId", selectedScheduleId);
    formData.append("marksJson", JSON.stringify(payload));

    startSaving(async () => {
      const res = await saveMarksAction(formData);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    });
  }

  if (scheduledPapers.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-6 rounded-xl">
        No examination papers scheduled for your assigned subjects/sections yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Paper Selector Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">
            Exam Paper:
          </label>
          <div className="relative flex-1 max-w-xl">
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {scheduledPapers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.exam.name} — {p.section.class.name} ({p.section.name}) · {p.subject.name} ({p.subject.code}) [Max: {p.maxMarks}]
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-800">
            Max Marks: <span className="font-mono font-black">{maxMarks}</span>
          </div>

          {isLocked && (
            <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Marks Locked
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving || isLocked || isLoading || roster.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Saving..." : "Save Marks"}
          </button>
        </div>
      </div>

      {/* Marks Entry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
            <p className="text-sm">Loading student marks roster…</p>
          </div>
        ) : roster.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            No active students enrolled in this section.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left w-12">#</th>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-center w-36">Obtained Marks</th>
                  <th className="px-4 py-3 text-center w-24">Absent?</th>
                  <th className="px-4 py-3 text-center w-28">Score / Grade</th>
                  <th className="px-4 py-3 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roster.map((student, idx) => {
                  const numMarks = student.obtainedMarks !== null ? Number(student.obtainedMarks) : null;
                  const pct = numMarks !== null && maxMarks > 0 ? Math.round((numMarks / maxMarks) * 100) : 0;
                  const grade = student.isAbsent ? "F" : numMarks !== null ? calculateGrade(pct) : "—";

                  return (
                    <tr
                      key={student.studentId}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        student.isAbsent ? "bg-red-50/40" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                            {getInitials(`${student.firstName} ${student.lastName}`)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {student.firstName} {student.lastName}
                            </span>
                            <span className="text-xs text-slate-400">
                              Roll #{student.rollNumber || "—"} · {student.admissionNumber}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max={maxMarks}
                          disabled={isLocked || student.isAbsent}
                          value={student.obtainedMarks ?? ""}
                          placeholder={`0 - ${maxMarks}`}
                          onChange={(e) =>
                            updateStudentMark(
                              student.studentId,
                              "obtainedMarks",
                              e.target.value === "" ? null : Number(e.target.value)
                            )
                          }
                          className="w-24 px-3 py-1.5 text-center font-mono font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={isLocked}
                            checked={student.isAbsent}
                            onChange={(e) =>
                              updateStudentMark(
                                student.studentId,
                                "isAbsent",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                          />
                          <span className="text-xs font-semibold text-slate-600">
                            Absent
                          </span>
                        </label>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {student.isAbsent ? (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 font-mono">
                            ABSENT
                          </span>
                        ) : numMarks !== null ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-700">
                              {pct}%
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-black font-mono ${
                                grade === "A+" || grade === "A"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : grade === "B" || grade === "C"
                                  ? "bg-blue-100 text-blue-800"
                                  : grade === "D"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {grade}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          disabled={isLocked}
                          value={student.remarks}
                          placeholder="Optional remarks..."
                          onChange={(e) =>
                            updateStudentMark(
                              student.studentId,
                              "remarks",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
