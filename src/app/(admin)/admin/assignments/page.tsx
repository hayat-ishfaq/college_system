import { requireAdmin } from "@/lib/auth/permissions";
import { AssignmentService } from "@/services/assignment.service";
import { TeacherService } from "@/services/teacher.service";
import { SubjectService } from "@/services/subject.service";
import { ClassService } from "@/services/class.service";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { AssignmentManagementClient } from "./AssignmentManagementClient";

export const metadata = {
  title: "Teacher Assignments",
};

export default async function AssignmentsPage() {
  await requireAdmin();

  const [assignments, teachers, subjects, classes, academicYears] =
    await Promise.all([
      AssignmentService.getAllAssignments(),
      TeacherService.getAllTeachers({ status: "active" }),
      SubjectService.getAllSubjects(),
      ClassService.getAllClasses(),
      prisma.academicYear.findMany({ orderBy: { startDate: "desc" } }),
    ]);

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Teacher & Course Assignments"
        description="Map faculty members to subjects, academic classes, and sections with duplicate protection."
      />
      <AssignmentManagementClient
        assignments={assignments}
        teachers={teachers}
        subjects={subjects}
        classes={classes}
        academicYears={academicYears}
      />
    </div>
  );
}
