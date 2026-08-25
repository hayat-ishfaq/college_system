import { requireAdmin } from "@/lib/auth/permissions";
import { ExamService } from "@/services/exam.service";
import { ClassService } from "@/services/class.service";
import { SubjectService } from "@/services/subject.service";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { ExamManagementClient } from "./ExamManagementClient";
import { serializeData } from "@/lib/utils";

export const metadata = {
  title: "Examinations Management",
};

export default async function ExaminationsPage() {
  await requireAdmin();

  const [exams, classes, subjects, academicYears] = await Promise.all([
    ExamService.getAllExams(),
    ClassService.getAllClasses(),
    SubjectService.getAllSubjects(),
    prisma.academicYear.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Examinations & Date Sheets"
        description="Define examination terms, configure paper schedules by class and section, and control marks entry locks."
      />
      <ExamManagementClient
        exams={serializeData(exams)}
        classes={serializeData(classes)}
        subjects={serializeData(subjects)}
        academicYears={serializeData(academicYears)}
      />
    </div>
  );
}
