import { requireTeacher } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Users, BookOpen, GraduationCap, Phone, Mail } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";

export const metadata = {
  title: "My Enrolled Students",
};

export default async function TeacherStudentsPage() {
  const session = await requireTeacher();

  // Find teacher record
  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    include: {
      teacherAssignments: {
        where: { isActive: true },
        select: { sectionId: true },
      },
    },
  });

  const assignedSectionIds =
    teacher?.teacherAssignments.map((a) => a.sectionId) || [];

  // Fetch students in assigned sections only
  const students =
    assignedSectionIds.length > 0
      ? await prisma.student.findMany({
          where: {
            sectionId: { in: assignedSectionIds },
            isActive: true,
          },
          orderBy: [
            { section: { class: { name: "asc" } } },
            { section: { name: "asc" } },
            { rollNumber: "asc" },
          ],
          include: {
            section: { include: { class: true } },
            user: { select: { email: true } },
          },
        })
      : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Enrolled Students"
        description="Students strictly enrolled in your designated teaching sections."
        action={
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {students.length} Total Enrolled
          </span>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Admission #</th>
                <th className="py-3.5 px-4">Class & Section</th>
                <th className="py-3.5 px-4">Guardian Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    No enrolled students found in your assigned teaching sections.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {getInitials(`${s.firstName} ${s.lastName}`)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {s.firstName} {s.lastName}
                          </div>
                          <div className="text-xs text-slate-400">
                            {s.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {s.rollNumber || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {s.admissionNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800">
                        <BookOpen className="w-3 h-3 text-slate-500" />
                        {s.section?.class.name} — {s.section?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{s.guardianName || s.fatherName || "—"}</div>
                      <div className="text-slate-400">{s.guardianPhone || "—"}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
