"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarDays,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate, getMonthName } from "@/lib/utils";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "LEAVE";

interface AttendanceRecord {
  id: string;
  date: Date;
  status: AttendanceStatus;
  remarks: string | null;
  student: {
    firstName: string;
    lastName: string;
    admissionNumber: string;
    rollNumber: string | null;
    section: { name: string; class: { name: string } } | null;
  };
}

interface MonthlyStat {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  rollNumber: string | null;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; icon: any; colors: string }> = {
  PRESENT: { label: "Present", icon: CheckCircle2, colors: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  ABSENT: { label: "Absent", icon: XCircle, colors: "bg-red-100 text-red-800 border-red-200" },
  LATE: { label: "Late", icon: Clock3, colors: "bg-amber-100 text-amber-800 border-amber-200" },
  LEAVE: { label: "Leave", icon: CalendarDays, colors: "bg-blue-100 text-blue-800 border-blue-200" },
};

const MONTHS = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

interface Props {
  records: AttendanceRecord[];
  monthlySummary: MonthlyStat[];
  classes: Array<{ id: string; name: string; sections: Array<{ id: string; name: string }> }>;
  selectedClassId: string;
  selectedSectionId: string;
  selectedMonth: number;
  selectedYear: number;
  initialFilters: Record<string, string>;
  totalRecords: number;
  page: number;
  totalPages: number;
}

export function AdminAttendanceClient({
  records,
  monthlySummary,
  classes,
  selectedClassId,
  selectedSectionId,
  selectedMonth,
  selectedYear,
  initialFilters,
  totalRecords,
  page,
  totalPages,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("monthly");
  const currentYear = new Date().getFullYear();

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  function setPage(n: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(n));
    router.push(`?${params.toString()}`);
  }

  function exportCSV() {
    const headers = ["Student","Admission #","Roll #","Class","Section","Date","Status","Remarks"];
    const rows = records.map((r) => [
      `${r.student.firstName} ${r.student.lastName}`,
      r.student.admissionNumber,
      r.student.rollNumber || "",
      r.student.section?.class.name || "",
      r.student.section?.name || "",
      formatDate(r.date),
      r.status,
      r.remarks || "",
    ]);
    const csv = [headers, ...rows].map((row) => row.map(String).map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${MONTHS[selectedMonth]}-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportMonthlySummaryCSV() {
    const headers = ["Student","Admission #","Roll #","Total Days","Present","Absent","Late","Leave","% Attendance"];
    const rows = monthlySummary.map((s) => [
      s.studentName, s.admissionNumber, s.rollNumber || "",
      s.totalDays, s.present, s.absent, s.late, s.leave, `${s.percentage}%`,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(String).map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-summary-${MONTHS[selectedMonth]}-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <select
          value={selectedClassId}
          onChange={(e) => updateFilter("classId", e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={selectedSectionId}
          onChange={(e) => updateFilter("sectionId", e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none"
        >
          <option value="">All Sections</option>
          {(selectedClass?.sections || []).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={(e) => updateFilter("month", e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none"
        >
          {MONTHS.slice(1).map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => updateFilter("year", e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none"
        >
          {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          onClick={activeTab === "daily" ? exportCSV : exportMonthlySummaryCSV}
          className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["monthly", "daily"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === tab
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "monthly" ? (
              <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Monthly Summary</span>
            ) : (
              <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Daily Records</span>
            )}
          </button>
        ))}
      </div>

      {/* Monthly Summary Tab */}
      {activeTab === "monthly" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">
              Monthly Attendance Summary — {getMonthName(selectedMonth)} {selectedYear}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Student</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-500">Days</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-emerald-600">Present</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-red-600">Absent</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-amber-600">Late</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-blue-600">Leave</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-500">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlySummary.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-slate-400 text-sm">No attendance data for this period.</td></tr>
                ) : (
                  monthlySummary.map((s, i) => (
                    <tr key={s.studentId} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-xs text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{s.studentName}</div>
                        <div className="text-xs text-slate-400">#{s.rollNumber || "—"} · {s.admissionNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-700">{s.totalDays}</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-700">{s.present}</td>
                      <td className="px-4 py-3 text-center font-bold text-red-700">{s.absent}</td>
                      <td className="px-4 py-3 text-center font-bold text-amber-700">{s.late}</td>
                      <td className="px-4 py-3 text-center font-bold text-blue-700">{s.leave}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden min-w-16">
                            <div
                              className={`h-2 rounded-full transition-all ${s.percentage >= 75 ? "bg-emerald-500" : s.percentage >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                              style={{ width: `${s.percentage}%` }}
                            />
                          </div>
                          <span className={`text-xs font-extrabold min-w-[36px] ${s.percentage >= 75 ? "text-emerald-700" : s.percentage >= 60 ? "text-amber-700" : "text-red-700"}`}>
                            {s.percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Records Tab */}
      {activeTab === "daily" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Class / Section</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400 text-sm">No attendance records found.</td></tr>
                ) : (
                  records.map((r) => {
                    const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.PRESENT;
                    const Icon = cfg.icon;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{r.student.firstName} {r.student.lastName}</div>
                          <div className="text-xs text-slate-400">{r.student.admissionNumber}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {r.student.section?.class.name} — {r.student.section?.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{formatDate(r.date)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.colors}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{r.remarks || "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">Page {page} of {totalPages} ({totalRecords} records)</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
