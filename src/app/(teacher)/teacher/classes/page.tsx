import { requireTeacher } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { BookOpen, Users, CalendarCheck, PenTool, Award, Clock } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "My Teaching Classes",
};

export default async function TeacherClassesPage() {
  const session = await requireTeacher();

  // Find teacher and their assignments
  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    include: {
      teacherAssignments: {
        where: { isActive: true },
        include: {
          class: true,
          section: {
            include: {
              _count: {
                select: { students: { where: { isActive: true } } },
              },
            },
          },
          subject: true,
          academicYear: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Teaching Classes"
        description="Active grade sections and courses assigned to you for the current academic session."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!teacher?.teacherAssignments || teacher.teacherAssignments.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            No classes or courses are currently assigned to your profile. Please contact the administrator.
          </div>
        ) : (
          teacher.teacherAssignments.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">
                  {a.subject.code}
                </span>
                <h3 className="text-lg font-bold mt-0.5">
                  {a.class.name} — Section {a.section.name}
                </h3>
                <p className="text-xs text-emerald-100 mt-1">{a.subject.name}</p>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="w-4 h-4 text-emerald-600" /> Enrolled Students
                  </span>
                  <span className="font-bold text-slate-900">
                    {a.section._count.students} Students
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-4 h-4 text-emerald-600" /> Academic Session
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {a.academicYear.name}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link
                  href="/teacher/attendance"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" /> Attendance
                </Link>
                <Link
                  href="/teacher/marks"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  <PenTool className="w-3.5 h-3.5" /> Marks Entry
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
