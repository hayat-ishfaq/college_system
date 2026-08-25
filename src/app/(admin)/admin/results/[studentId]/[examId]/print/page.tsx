import { requireAdmin } from "@/lib/auth/permissions";
import { ResultService } from "@/services/result.service";
import { ReportCardView } from "@/components/pdf/ReportCardView";
import { notFound } from "next/navigation";
import { serializeData } from "@/lib/utils";

export const metadata = {
  title: "Official Academic Report Card",
};

export default async function AdminReportCardPrintPage({
  params,
}: {
  params: Promise<{ studentId: string; examId: string }>;
}) {
  await requireAdmin();
  const { studentId, examId } = await params;

  try {
    const data = await ResultService.getStudentReportCard(studentId, examId);
    return (
      <ReportCardView
        student={serializeData(data.student)}
        exam={serializeData(data.exam)}
        result={serializeData(data.result)}
        totalStudentsInSection={data.totalStudentsInSection}
        backUrl="/admin/results"
      />
    );
  } catch {
    notFound();
  }
}
