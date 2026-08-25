"use client";

import React, { useState, useTransition, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarDays,
  Save,
  Loader2,
  UserCheck,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { markAttendanceAction } from "./actions";
import { getInitials } from "@/lib/utils";

type Status = "PRESENT" | "ABSENT" | "LATE" | "LEAVE";

interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  rollNumber: string | null;
  attendance: { id: string; status: Status; remarks: string | null } | null;
}

interface Section {
  id: string;
  name: string;
  class: { name: string };
}

interface Props {
  assignedSections: Section[];
  academicYearId: string;
}

const STATUS_CONFIG: Record<Status, { label: string; icon: any; colors: string }> = {
  PRESENT: {
    label: "Present",
    icon: CheckCircle2,
    colors: "border-emerald-400 bg-emerald-50 text-emerald-700",
  },
  ABSENT: {
    label: "Absent",
    icon: XCircle,
    colors: "border-red-400 bg-red-50 text-red-700",
  },
  LATE: {
    label: "Late",
    icon: Clock3,
    colors: "border-amber-400 bg-amber-50 text-amber-700",
  },
  LEAVE: {
    label: "Leave",
    icon: CalendarDays,
    colors: "border-blue-400 bg-blue-50 text-blue-700",
  },
};

const ALL_STATUSES: Status[] = ["PRESENT", "ABSENT", "LATE", "LEAVE"];

export function TeacherAttendanceClient({ assignedSections, academicYearId }: Props) {
  const [selectedSectionId, setSelectedSectionId] = useState(
    assignedSections[0]?.id || ""
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [roster, setRoster] = useState<StudentRow[]>([]);
  const [records, setRecords] = useState<Record<string, Status>>({});
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const selectedSection = assignedSections.find(
    (s) => s.id === selectedSectionId
  );

  // Fetch roster whenever section or date changes
  useEffect(() => {
    if (!selectedSectionId || !selectedDate) return;
    setIsLoadingRoster(true);

    fetch(
      `/api/attendance/roster?sectionId=${selectedSectionId}&date=${selectedDate}`
    )
      .then((r) => r.json())
      .then((data: StudentRow[]) => {
        setRoster(data);
        // Pre-fill with existing records or default PRESENT
        const initial: Record<string, Status> = {};
        data.forEach((s) => {
          initial[s.id] = (s.attendance?.status as Status) || "PRESENT";
        });
        setRecords(initial);
      })
      .catch(() => toast.error("Failed to load student roster."))
      .finally(() => setIsLoadingRoster(false));
  }, [selectedSectionId, selectedDate]);

  function setAllStatus(status: Status) {
    const next = { ...records };
    Object.keys(next).forEach((k) => (next[k] = status));
    setRecords(next);
  }

  function setStudentStatus(studentId: string, status: Status) {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  }

  const counts = Object.values(records).reduce(
    (acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc; },
    {} as Record<Status, number>
  );

  function handleSave() {
    if (roster.length === 0) {
      toast.error("No students in roster.");
      return;
    }

    const recordsList = Object.entries(records).map(([studentId, status]) => ({
      studentId,
      status,
      remarks: null,
    }));

    const formData = new FormData();
    formData.append("sectionId", selectedSectionId);
    formData.append("date", selectedDate);
    formData.append("academicYearId", academicYearId);
    formData.append("recordsJson", JSON.stringify(recordsList));

    startSaving(async () => {
      const res = await markAttendanceAction(formData);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    });
  }

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Section Picker */}
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">
            Section:
          </label>
          <div className="relative">
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="pl-3 pr-8 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {assignedSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.class.name} — {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isToday && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
              Today
            </span>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving || roster.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 ml-auto"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Save Attendance"}
        </button>
      </div>

      {/* Summary Badges + Mark-All Buttons */}
      {roster.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {ALL_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const Icon = cfg.icon;
            return (
              <button
                key={s}
                onClick={() => setAllStatus(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all hover:shadow-sm ${cfg.colors}`}
              >
                <Icon className="w-3.5 h-3.5" />
                Mark All {cfg.label}
                <span className="ml-1 bg-white/60 rounded-full px-1.5 font-extrabold">
                  {counts[s] || 0}
                </span>
              </button>
            );
          })}
          <span className="ml-auto text-xs text-slate-400">
            {roster.length} students
          </span>
        </div>
      )}

      {/* Attendance Roster */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoadingRoster ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
            <p className="text-sm">Loading student roster…</p>
          </div>
        ) : roster.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <UserCheck className="w-8 h-8 mb-3 text-slate-300" />
            <p className="text-sm">No active students found in this section.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {roster.map((student, idx) => {
              const currentStatus = records[student.id] || "PRESENT";

              return (
                <div
                  key={student.id}
                  className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                    currentStatus === "ABSENT"
                      ? "bg-red-50/40"
                      : currentStatus === "LATE"
                      ? "bg-amber-50/40"
                      : currentStatus === "LEAVE"
                      ? "bg-blue-50/40"
                      : "hover:bg-slate-50/60"
                  }`}
                >
                  {/* Index & Avatar */}
                  <span className="text-xs text-slate-400 w-6 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getInitials(`${student.firstName} ${student.lastName}`)}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm truncate">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-xs text-slate-400">
                      Roll #{student.rollNumber || "—"} · {student.admissionNumber}
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5">
                    {ALL_STATUSES.map((status) => {
                      const cfg = STATUS_CONFIG[status];
                      const Icon = cfg.icon;
                      const isActive = currentStatus === status;
                      return (
                        <button
                          key={status}
                          onClick={() => setStudentStatus(student.id, status)}
                          title={cfg.label}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                            isActive
                              ? cfg.colors + " shadow-sm"
                              : "border-slate-200 text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="hidden sm:block">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
