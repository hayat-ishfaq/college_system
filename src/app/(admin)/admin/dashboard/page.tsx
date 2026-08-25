import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import {
  Users,
  UserCheck,
  BookOpen,
  BadgeDollarSign,
  CalendarCheck,
  FlaskConical,
  ArrowUpRight,
  Clock,
  Megaphone,
} from "lucide-react";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Run all dashboard aggregation queries in parallel
  const [
    totalStudents,
    activeStudents,
    inactiveStudents,
    totalTeachers,
    activeTeachers,
    totalClasses,
    activeClasses,
    monthlyChallans,
    todayAttendance,
    upcomingExams,
    recentAuditLogs,
    recentAnnouncements,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { isActive: true } }),
    prisma.student.count({ where: { isActive: false } }),
    prisma.teacher.count(),
    prisma.teacher.count({ where: { isActive: true } }),
    prisma.class.count(),
    prisma.class.count({ where: { isActive: true } }),
    prisma.challan.findMany({
      where: {
        month: currentMonth,
        year: currentYear,
      },
      select: {
        totalAmount: true,
        status: true,
        payment: {
          select: {
            amountReceived: true,
          },
        },
      },
    }),
    prisma.attendance.groupBy({
      by: ["status"],
      where: {
        date: today,
      },
      _count: {
        status: true,
      },
    }),
    prisma.exam.findMany({
      where: {
        startDate: { gte: today },
      },
      orderBy: { startDate: "asc" },
      take: 3,
      include: {
        academicYear: true,
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
    }),
    prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { publishDate: "desc" },
      take: 3,
    }),
  ]);

  // Calculate Fee statistics for current month
  let monthlyCollected = 0;
  let monthlyPending = 0;

  for (const ch of monthlyChallans) {
    const amount = Number(ch.totalAmount);
    if (ch.status === "PAID" && ch.payment) {
      monthlyCollected += Number(ch.payment.amountReceived);
    } else if (ch.status === "UNPAID" || ch.status === "OVERDUE") {
      monthlyPending += amount;
    }
  }

  // Calculate Today's attendance percentage
  let totalAttendanceMarked = 0;
  let presentCount = 0;
  for (const group of todayAttendance) {
    const count = group._count.status;
    totalAttendanceMarked += count;
    if (group.status === "PRESENT" || group.status === "LATE") {
      presentCount += count;
    }
  }

  const attendancePercentage =
    totalAttendanceMarked > 0
      ? Math.round((presentCount / totalAttendanceMarked) * 100)
      : activeStudents > 0
      ? 100 // fallback if seeded or fresh
      : 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <PageHeader
        title="Admin Dashboard"
        description="Welcome to Bright Future College administration portal. Overview of real-time metrics."
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Academic Year 2025-2026
            </span>
          </div>
        }
      />

      {/* Top 6 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <StatCard
          title="Total Students"
          value={totalStudents}
          description={`${activeStudents} active · ${inactiveStudents} inactive`}
          icon={Users}
          iconColorClass="text-blue-600"
          iconBgClass="bg-blue-50"
        />
        <StatCard
          title="Total Teachers"
          value={totalTeachers}
          description={`${activeTeachers} active faculty`}
          icon={UserCheck}
          iconColorClass="text-emerald-600"
          iconBgClass="bg-emerald-50"
        />
        <StatCard
          title="Classes & Wings"
          value={totalClasses}
          description={`${activeClasses} operational`}
          icon={BookOpen}
          iconColorClass="text-purple-600"
          iconBgClass="bg-purple-50"
        />
        <StatCard
          title="Fee Collected"
          value={formatCurrency(monthlyCollected)}
          description={`Pending: ${formatCurrency(monthlyPending)}`}
          icon={BadgeDollarSign}
          iconColorClass="text-emerald-600"
          iconBgClass="bg-emerald-50"
        />
        <StatCard
          title="Attendance Today"
          value={`${attendancePercentage}%`}
          description={
            totalAttendanceMarked > 0
              ? `${presentCount}/${totalAttendanceMarked} present`
              : "Marked classes on track"
          }
          icon={CalendarCheck}
          iconColorClass="text-amber-600"
          iconBgClass="bg-amber-50"
        />
        <StatCard
          title="Upcoming Exams"
          value={upcomingExams.length}
          description={
            upcomingExams[0]
              ? `Next: ${upcomingExams[0].name}`
              : "No upcoming exams"
          }
          icon={FlaskConical}
          iconColorClass="text-rose-600"
          iconBgClass="bg-rose-50"
        />
      </div>

      {/* Main Grid: Activity Feed & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (Audit Log) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Recent Activity & Audit Logs
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time operational events from database
              </p>
            </div>
            <Link
              href="/admin/reports"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recentAuditLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No recent activity recorded yet.
              </div>
            ) : (
              recentAuditLogs.map((log) => (
                <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {log.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {log.details || `Entity: ${log.entity}`} · by {log.user?.email || "System"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
                    {formatRelativeTime(log.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Active Notices
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Institution announcements</p>
            </div>
            <Link
              href="/admin/announcements"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Manage <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2 flex-1">
            {recentAnnouncements.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No active announcements found.
              </div>
            ) : (
              recentAnnouncements.map((item) => (
                <div key={item.id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">
                        {item.title}
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        item.priority === "URGENT" || item.priority === "HIGH"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{item.content}</p>
                  <span className="text-[10px] text-slate-400 block">
                    {formatDate(item.publishDate)} · Target: {item.target.toLowerCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
