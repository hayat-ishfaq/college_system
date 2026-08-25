import { requireTeacher } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { BookOpen, Users, CalendarCheck, PenTool, FlaskConical, Megaphone } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function TeacherDashboardPage() {
  const session = await requireTeacher();

  // Find teacher record
  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    include: {
      teacherAssignments: {
        where: { isActive: true },
        include: {
          class: true,
          section: true,
          subject: true,
        },
      },
    },
  });

  const assignedSectionIds =
    teacher?.teacherAssignments.map((a) => a.sectionId) || [];

  const [totalStudentsInAssigned, upcomingExams, announcements] =
    await Promise.all([
      assignedSectionIds.length > 0
        ? prisma.student.count({
            where: {
              sectionId: { in: assignedSectionIds },
              isActive: true,
            },
          })
        : 0,
      prisma.examSchedule.findMany({
        where: {
          sectionId: { in: assignedSectionIds },
        },
        take: 3,
        include: {
          exam: true,
          subject: true,
          section: {
            include: { class: true },
          },
        },
        orderBy: { date: "asc" },
      }),
      prisma.announcement.findMany({
        where: {
          isActive: true,
          target: { in: ["EVERYONE", "TEACHERS"] },
        },
        take: 4,
        orderBy: { publishDate: "desc" },
      }),
    ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${teacher ? `${teacher.firstName} ${teacher.lastName}` : "Faculty Member"}`}
        description="Here is an overview of your assigned classes, students, and exam schedules."
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Classes"
          value={teacher?.teacherAssignments.length || 0}
          description="Active teaching sections"
          icon={BookOpen}
          iconColorClass="text-emerald-600"
          iconBgClass="bg-emerald-50"
        />
        <StatCard
          title="Total Students"
          value={totalStudentsInAssigned}
          description="In your enrolled classes"
          icon={Users}
          iconColorClass="text-blue-600"
          iconBgClass="bg-blue-50"
        />
        <StatCard
          title="Scheduled Exams"
          value={upcomingExams.length}
          description="Awaiting evaluation"
          icon={FlaskConical}
          iconColorClass="text-purple-600"
          iconBgClass="bg-purple-50"
        />
        <StatCard
          title="Announcements"
          value={announcements.length}
          description="Active notices"
          icon={Megaphone}
          iconColorClass="text-amber-600"
          iconBgClass="bg-amber-50"
        />
      </div>

      {/* Assigned Classes List & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes list */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            My Teaching Assignments
          </h2>
          <div className="space-y-3">
            {teacher?.teacherAssignments.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                No active class assignments assigned yet.
              </p>
            ) : (
              teacher?.teacherAssignments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-lg"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      {a.class.name} — Section {a.section.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Subject: <span className="font-medium text-slate-700">{a.subject.name}</span> ({a.subject.code})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/teacher/attendance"
                      className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Attendance
                    </Link>
                    <Link
                      href="/teacher/marks"
                      className="text-xs px-2.5 py-1.5 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700"
                    >
                      Marks
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Faculty Notices
          </h2>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                No notices available.
              </p>
            ) : (
              announcements.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(item.publishDate)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{item.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
