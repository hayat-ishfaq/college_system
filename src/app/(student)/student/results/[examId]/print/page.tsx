import { requireStudent } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { ResultService } from "@/services/result.service";
import { ReportCardView } from "@/components/pdf/ReportCardView";
import { notFound, redirect } from "next/navigation";
import { serializeData } from "@/lib/utils";

export const metadata = {
  title: "My Official Report Card",
};

export default async function StudentReportCardPrintPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const session = await requireStudent();
  const { examId } = await params;

  const student = await prisma.student.findFirst({
    where: { userId: session.user.id },
  });

  if (!student) redirect("/student/results");

  try {
    const data = await ResultService.getStudentReportCard(student.id, examId);
    return (
      <ReportCardView
        student={serializeData(data.student)}
        exam={serializeData(data.exam)}
        result={serializeData(data.result)}
        totalStudentsInSection={data.totalStudentsInSection}
        backUrl="/student/results"
      />
    );
  } catch {
    notFound();
  }
}
