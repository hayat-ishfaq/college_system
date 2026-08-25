import { requireStudent } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { AttendanceService } from "@/services/attendance.service";
import { formatDate, getMonthName } from "@/lib/utils";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock3,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { AttendanceStatus } from "@prisma/client";

export const metadata = {
  title: "My Attendance Record",
};

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; icon: any; className: string }
> = {
  PRESENT: {
    label: "Present",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  ABSENT: {
    label: "Absent",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200",
  },
  LATE: {
    label: "Late",
    icon: Clock3,
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  LEAVE: {
    label: "Leave",
    icon: Calendar,
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

export default async function StudentAttendancePage() {
  const session = await requireStudent();

  const student = await prisma.student.findFirst({
    where: { userId: session.user.id },
    include: {
      section: { include: { class: true } },
    },
  });

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500">
        No student profile linked to your account.
      </div>
    );
  }

  const [stats, summary] = await Promise.all([
    AttendanceService.getStudentAttendanceStats(student.id),
    AttendanceService.getStudentMonthlySummary(student.id),
  ]);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Attendance Record
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {student.firstName} {student.lastName} · {student.section?.class.name}{" "}
          ({student.section?.name}) · Roll #{student.rollNumber || "—"}
        </p>
      </div>

      {/* Main KPI Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
                stats.percentage >= 80
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : stats.percentage >= 65
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-red-500 bg-red-50 text-red-700"
              }`}
            >
              <div className="text-center">
                <span className="text-2xl font-black font-mono">
                  {stats.percentage}%
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-wider opacity-75">
                  Overall
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {stats.percentage >= 80
                ? "Excellent Standing 🎉"
                : stats.percentage >= 65
                ? "Satisfactory Attendance"
                : "Low Attendance Warning ⚠️"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Minimum 75% attendance is required to sit in final semester/board
              examinations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 w-full md:w-auto">
          <div className="text-center p-3 bg-emerald-50 rounded-xl border border-emerald-100 min-w-[70px]">
            <span className="block text-xl font-extrabold text-emerald-700 font-mono">
              {stats.present}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">
              Present
            </span>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100 min-w-[70px]">
            <span className="block text-xl font-extrabold text-red-700 font-mono">
              {stats.absent}
            </span>
            <span className="text-[11px] font-semibold text-red-600">
              Absent
            </span>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-100 min-w-[70px]">
            <span className="block text-xl font-extrabold text-amber-700 font-mono">
              {stats.late}
            </span>
            <span className="text-[11px] font-semibold text-amber-600">
              Late
            </span>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100 min-w-[70px]">
            <span className="block text-xl font-extrabold text-blue-700 font-mono">
              {stats.leave}
            </span>
            <span className="text-[11px] font-semibold text-blue-600">
              Leave
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Summary Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">
            Monthly Performance Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 text-left">Month</th>
                <th className="px-5 py-3 text-center">Total Days</th>
                <th className="px-5 py-3 text-center text-emerald-700">
                  Present
                </th>
                <th className="px-5 py-3 text-center text-red-700">Absent</th>
                <th className="px-5 py-3 text-center text-amber-700">Late</th>
                <th className="px-5 py-3 text-center text-blue-700">Leave</th>
                <th className="px-5 py-3 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.monthly.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-slate-400 text-sm"
                  >
                    No attendance records found yet.
                  </td>
                </tr>
              ) : (
                summary.monthly.map((m) => {
                  const pct =
                    m.total > 0
                      ? Math.round(((m.present + m.late) / m.total) * 100)
                      : 0;
                  return (
                    <tr
                      key={`${m.year}-${m.month}`}
                      className="hover:bg-slate-50/50"
                    >
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        {getMonthName(m.month)} {m.year}
                      </td>
                      <td className="px-5 py-3 text-center font-mono font-bold text-slate-700">
                        {m.total}
                      </td>
                      <td className="px-5 py-3 text-center font-bold text-emerald-700">
                        {m.present}
                      </td>
                      <td className="px-5 py-3 text-center font-bold text-red-700">
                        {m.absent}
                      </td>
                      <td className="px-5 py-3 text-center font-bold text-amber-700">
                        {m.late}
                      </td>
                      <td className="px-5 py-3 text-center font-bold text-blue-700">
                        {m.leave}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                            pct >= 75
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">
            Recent Daily Activity Log
          </h2>
        </div>
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {summary.records.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No daily logs recorded yet.
            </div>
          ) : (
            summary.records.map((r, i) => {
              const cfg =
                STATUS_CONFIG[r.status as AttendanceStatus] ||
                STATUS_CONFIG.PRESENT;
              const Icon = cfg.icon;
              return (
                <div
                  key={i}
                  className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg border ${cfg.className}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-800">
                        {formatDate(r.date)}
                      </span>
                      {r.remarks && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {r.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.className}`}
                  >
                    {cfg.label}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
