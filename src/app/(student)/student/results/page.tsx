import { requireStudent } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { ResultService } from "@/services/result.service";
import { ExamService } from "@/services/exam.service";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Award,
  Printer,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BookOpen,
  Calendar,
  AlertCircle,
} from "lucide-react";

export const metadata = {
  title: "My Examination Results",
};

export default async function StudentResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await requireStudent();
  const params = await searchParams;

  const student = await prisma.student.findFirst({
    where: { userId: session.user.id },
    include: {
      section: { include: { class: true } },
      academicYear: true,
    },
  });

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500">
        No student profile linked to your account.
      </div>
    );
  }

  // Get all exams
  const exams = await prisma.exam.findMany({
    orderBy: { startDate: "desc" },
    include: { academicYear: true },
  });

  const selectedExamId = params.examId || (exams.length > 0 ? exams[0].id : "");

  let reportData: any = null;
  if (selectedExamId) {
    try {
      reportData = await ResultService.getStudentReportCard(
        student.id,
        selectedExamId
      );
    } catch {
      reportData = null;
    }
  }

  const result = reportData?.result;
  const currentExam = exams.find((e) => e.id === selectedExamId);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Academic Results & Transcripts
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {student.firstName} {student.lastName} · {student.section?.class.name} (
          {student.section?.name}) · Roll #{student.rollNumber || "—"}
        </p>
      </div>

      {/* Exam Term Selector */}
      {exams.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">
              Exam Term:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {exams.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/student/results?examId=${exam.id}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedExamId === exam.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {exam.name}
                </Link>
              ))}
            </div>
          </div>

          {result && (
            <Link
              href={`/student/results/${selectedExamId}/print`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Print Official Report Card
            </Link>
          )}
        </div>
      )}

      {/* Performance Summary Banner */}
      {result ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Overall Grade
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-blue-900">
                  {result.grade}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    result.status === "PASS"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.status}
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {result.status === "PASS" ? "Promoted / Cleared" : "Needs Retake"}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Marks Obtained
              </span>
              <div className="text-3xl font-black font-mono text-slate-900">
                {result.totalObtainedMarks}
                <span className="text-sm font-normal text-slate-400">
                  {" "}
                  / {result.totalMaxMarks}
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Total aggregate score
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Percentage
              </span>
              <div className="text-3xl font-black font-mono text-emerald-700">
                {result.percentage}%
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Across all evaluated subjects
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Class Position
              </span>
              <div className="text-3xl font-black font-mono text-amber-600">
                #{result.rank}
                <span className="text-sm font-normal text-slate-400">
                  {" "}
                  / {reportData.totalStudentsInSection}
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Section rank
              </span>
            </div>
          </div>

          {/* Subject Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">
                Subject-Wise Score Breakdown
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {currentExam?.name}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Code</th>
                    <th className="px-5 py-3 text-left">Subject</th>
                    <th className="px-5 py-3 text-center">Max Marks</th>
                    <th className="px-5 py-3 text-center">Marks Obtained</th>
                    <th className="px-5 py-3 text-center">Score %</th>
                    <th className="px-5 py-3 text-center">Grade</th>
                    <th className="px-5 py-3 text-left">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.subjects.map((sub: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-mono font-semibold text-slate-500 text-xs">
                        {sub.subjectCode}
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-900">
                        {sub.subjectName}
                      </td>
                      <td className="px-5 py-3 text-center font-mono text-slate-600">
                        {sub.maxMarks}
                      </td>
                      <td className="px-5 py-3 text-center font-mono font-bold">
                        {sub.isAbsent ? (
                          <span className="text-red-600">ABSENT</span>
                        ) : sub.obtainedMarks !== null ? (
                          <span className="text-slate-900">
                            {sub.obtainedMarks}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center font-mono font-semibold text-slate-700">
                        {sub.isAbsent ? "0%" : `${sub.percentage}%`}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-black font-mono ${
                            sub.grade === "A+" || sub.grade === "A"
                              ? "bg-emerald-100 text-emerald-800"
                              : sub.grade === "B" || sub.grade === "C"
                              ? "bg-blue-100 text-blue-800"
                              : sub.grade === "D"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {sub.grade}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {sub.remarks || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">
            No examination marks have been published for this term yet.
          </p>
        </div>
      )}
    </div>
  );
}
