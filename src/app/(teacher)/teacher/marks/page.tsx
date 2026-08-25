import { requireTeacher } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { TeacherMarksClient } from "./TeacherMarksClient";
import { serializeData } from "@/lib/utils";

export const metadata = {
  title: "Examination Marks Entry",
};

export default async function TeacherMarksPage() {
  const session = await requireTeacher();

  // Find teacher record
  const teacher = await prisma.teacher.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!teacher) {
    return (
      <div className="p-8 text-center text-slate-500">
        No teacher profile found linked to your account.
      </div>
    );
  }

  // Find all exam schedules assigned to this teacher or for this teacher's active assignments
  const teacherAssignments = await prisma.teacherAssignment.findMany({
    where: { teacherId: teacher.id, isActive: true },
    select: { id: true, subjectId: true, sectionId: true },
  });

  const sectionIds = teacherAssignments.map((a) => a.sectionId);
  const subjectIds = teacherAssignments.map((a) => a.subjectId);

  const schedules = await prisma.examSchedule.findMany({
    where: {
      OR: [
        { teacherAssignment: { teacherId: teacher.id } },
        {
          sectionId: { in: sectionIds },
          subjectId: { in: subjectIds },
        },
      ],
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      exam: true,
      subject: true,
      section: {
        include: { class: true },
      },
    },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Examination Marks Entry"
        description="Select scheduled examination papers and record student marks, attendance, and evaluation remarks."
      />
      <TeacherMarksClient scheduledPapers={serializeData(schedules)} />
    </div>
  );
}
