import { requireStudent } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { CalendarCheck, Award, FileText, FlaskConical, Megaphone } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function StudentDashboardPage() {
  const session = await requireStudent();

  // Find student profile
  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      section: {
        include: {
          class: true,
        },
      },
      academicYear: true,
      challans: {
        where: { status: "UNPAID" },
        orderBy: { dueDate: "asc" },
      },
      attendances: true,
      marks: {
        include: {
          examSchedule: {
            include: {
              exam: true,
              subject: true,
            },
          },
        },
      },
    },
  });

  // Calculate Attendance stats
  const totalDays = student?.attendances.length || 0;
  const presentDays =
    student?.attendances.filter(
      (a) => a.status === "PRESENT" || a.status === "LATE"
    ).length || 0;
  const attendanceRate =
    totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // Calculate Pending Fees
  const pendingFeeTotal =
    student?.challans.reduce(
      (acc, c) => acc + Number(c.totalAmount),
      0
    ) || 0;

  // Fetch announcements for student/everyone
  const announcements = await prisma.announcement.findMany({
    where: {
      isActive: true,
      target: { in: ["EVERYONE", "STUDENTS"] },
    },
    take: 3,
    orderBy: { publishDate: "desc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hello, ${student ? `${student.firstName} ${student.lastName}` : "Student"}`}
        description={
          student?.section
            ? `${student.section.class.name} · Section ${student.section.name} · Roll No: ${student.rollNumber || "—"}`
            : "Student Portal"
        }
      />

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="My Attendance"
          value={`${attendanceRate}%`}
          description={`${presentDays} of ${totalDays || 1} days present`}
          icon={CalendarCheck}
          iconColorClass="text-emerald-600"
          iconBgClass="bg-emerald-50"
        />
        <StatCard
          title="Pending Fees"
          value={formatCurrency(pendingFeeTotal)}
          description={
            student?.challans.length
              ? `${student.challans.length} unpaid challan(s)`
              : "All dues cleared"
          }
          icon={FileText}
          iconColorClass={pendingFeeTotal > 0 ? "text-amber-600" : "text-emerald-600"}
          iconBgClass={pendingFeeTotal > 0 ? "bg-amber-50" : "bg-emerald-50"}
        />
        <StatCard
          title="Exams Evaluated"
          value={student?.marks.length || 0}
          description="Subject marks published"
          icon={Award}
          iconColorClass="text-violet-600"
          iconBgClass="bg-violet-50"
        />
        <StatCard
          title="Student Notices"
          value={announcements.length}
          description="Recent updates"
          icon={Megaphone}
          iconColorClass="text-blue-600"
          iconBgClass="bg-blue-50"
        />
      </div>

      {/* Grid: Pending Challans & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Challans */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              Fee Challans
            </h2>
            <Link
              href="/student/challans"
              className="text-xs text-violet-600 hover:text-violet-700 font-medium"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {!student?.challans.length ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                No unpaid challans pending. You are up to date!
              </p>
            ) : (
              student.challans.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Challan #{c.challanNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      Due: {formatDate(c.dueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(Number(c.totalAmount))}
                    </p>
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      UNPAID
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              Campus Notices
            </h2>
            <Link
              href="/student/announcements"
              className="text-xs text-violet-600 hover:text-violet-700 font-medium"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {announcements.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                No active announcements for students.
              </p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">
                      {a.title}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(a.publishDate)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{a.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
