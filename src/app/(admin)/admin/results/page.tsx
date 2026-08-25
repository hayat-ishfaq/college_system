import { requireAdmin } from "@/lib/auth/permissions";
import { ExamService } from "@/services/exam.service";
import { ClassService } from "@/services/class.service";
import { ResultService } from "@/services/result.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResultManagementClient } from "./ResultManagementClient";
import { serializeData } from "@/lib/utils";

export const metadata = {
  title: "Results & Tabulation Sheets",
};

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const [exams, classes] = await Promise.all([
    ExamService.getAllExams(),
    ClassService.getAllClasses(),
  ]);

  const selectedExamId = params.examId || (exams.length > 0 ? exams[0].id : "");
  const selectedClassId = params.classId || "";
  const selectedSectionId = params.sectionId || "";

  let results: any[] = [];
  if (selectedExamId) {
    results = await ResultService.calculateExamResults(selectedExamId, {
      classId: selectedClassId || undefined,
      sectionId: selectedSectionId || undefined,
    });
  }

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Examination Results & Transcripts"
        description="View class tabulation sheets, student positions, aggregate grades, and print official report cards."
      />
      <ResultManagementClient
        results={serializeData(results)}
        exams={serializeData(exams)}
        classes={serializeData(classes)}
        selectedExamId={selectedExamId}
        selectedClassId={selectedClassId}
        selectedSectionId={selectedSectionId}
      />
    </div>
  );
}
