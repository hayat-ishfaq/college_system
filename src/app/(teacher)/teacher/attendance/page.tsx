import { requireTeacher } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { TeacherAttendanceClient } from "./TeacherAttendanceClient";

export const metadata = {
  title: "Mark Attendance",
};

export default async function TeacherAttendancePage() {
  const session = await requireTeacher();

  // Get teacher record
  const teacher = await prisma.teacher.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!teacher) {
    return (
      <div className="p-8 text-center text-slate-500">
        No teacher record found. Please contact admin.
      </div>
    );
  }

  // Get sections assigned to this teacher
  const assignments = await prisma.teacherAssignment.findMany({
    where: { teacherId: teacher.id, isActive: true },
    select: {
      section: {
        select: {
          id: true,
          name: true,
          class: { select: { name: true } },
        },
      },
      academicYear: {
        select: { id: true, isCurrent: true },
      },
    },
    distinct: ["sectionId"],
  });

  // Deduplicate sections
  const sectionMap = new Map<string, { id: string; name: string; class: { name: string } }>();
  for (const a of assignments) {
    if (a.section) sectionMap.set(a.section.id, a.section);
  }
  const assignedSections = Array.from(sectionMap.values());

  const currentYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Mark Attendance"
        description="Select a class section and date, then mark each student's attendance status for the day."
      />
      {assignedSections.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm p-6 rounded-xl">
          You have no active class assignments. Ask the admin to assign you to a section.
        </div>
      ) : (
        <TeacherAttendanceClient
          assignedSections={assignedSections}
          academicYearId={currentYear?.id || ""}
        />
      )}
    </div>
  );
}
