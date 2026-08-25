"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import { Printer, ArrowLeft, Award, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

interface ReportCardProps {
  student: {
    id: string;
    admissionNumber: string;
    rollNumber: string | null;
    firstName: string;
    lastName: string;
    fatherName: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    section: {
      name: string;
      class: { name: string };
    } | null;
    academicYear: { name: string } | null;
  };
  exam: {
    id: string;
    name: string;
    type: string;
    startDate: Date;
    endDate: Date;
    academicYear: { name: string };
  };
  result: {
    totalMaxMarks: number;
    totalObtainedMarks: number;
    percentage: number;
    grade: string;
    status: "PASS" | "FAIL";
    rank: number;
    subjects: Array<{
      subjectCode: string;
      subjectName: string;
      maxMarks: number;
      obtainedMarks: number | null;
      isAbsent: boolean;
      percentage: number;
      grade: string;
      remarks: string | null;
    }>;
  } | null;
  totalStudentsInSection: number;
  backUrl?: string;
}

export function ReportCardView({
  student,
  exam,
  result,
  totalStudentsInSection,
  backUrl = "/admin/results",
}: ReportCardProps) {
  const gradingScale = [
    { grade: "A+", range: "90% – 100%", remarks: "Outstanding" },
    { grade: "A", range: "80% – 89%", remarks: "Excellent" },
    { grade: "B", range: "70% – 79%", remarks: "Very Good" },
    { grade: "C", range: "60% – 69%", remarks: "Good / Satisfactory" },
    { grade: "D", range: "50% – 59%", remarks: "Pass" },
    { grade: "F", range: "Below 50%", remarks: "Needs Improvement" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white">
      {/* Print Controls Header - Hidden during print */}
      <div className="max-w-[900px] mx-auto mb-6 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Results
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* A4 Printable Sheet Container */}
      <div className="max-w-[900px] mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-4 print:max-w-none space-y-6">
        {/* Institution Header */}
        <div className="text-center border-b-2 border-slate-900 pb-5">
          <div className="inline-block p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 mb-2">
            <Award className="w-8 h-8 mx-auto" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Bright Future College
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Plot 42, Education Boulevard, Sector H-8/4, Islamabad · Ph: +92 51 9283741
          </p>
          <div className="mt-3 inline-block px-4 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-widest">
            Official Academic Report Card — {exam.name}
          </div>
        </div>

        {/* Student Credentials Matrix */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Student Name</span>
            <span className="font-bold text-slate-900 text-sm">
              {student.firstName} {student.lastName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Father's Name</span>
            <span className="font-semibold text-slate-800">
              {student.fatherName || "—"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Admission No</span>
            <span className="font-mono font-bold text-blue-800">
              {student.admissionNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Roll Number</span>
            <span className="font-mono font-bold text-slate-800">
              {student.rollNumber || "—"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Class & Section</span>
            <span className="font-bold text-slate-800">
              {student.section?.class.name} — {student.section?.name}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Academic Session</span>
            <span className="font-semibold text-slate-800">
              {exam.academicYear.name}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Term Duration</span>
            <span className="text-slate-700">
              {formatDate(exam.startDate)} to {formatDate(exam.endDate)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Class Standing</span>
            <span className="font-bold text-emerald-800 font-mono">
              {result?.rank ? `Rank #${result.rank} / ${totalStudentsInSection}` : "—"}
            </span>
          </div>
        </div>

        {/* Subject-Wise Marks Breakdown Table */}
        <div className="overflow-hidden border border-slate-300 rounded-xl">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-slate-900 text-white uppercase font-bold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Subject Name</th>
                <th className="py-2.5 px-3 text-center">Max Marks</th>
                <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                <th className="py-2.5 px-3 text-center">Percentage</th>
                <th className="py-2.5 px-3 text-center">Grade</th>
                <th className="py-2.5 px-3 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {!result || result.subjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No examination marks recorded for this student in this term.
                  </td>
                </tr>
              ) : (
                result.subjects.map((sub, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-500">
                      {sub.subjectCode}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {sub.subjectName}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-600">
                      {sub.maxMarks}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      {sub.isAbsent ? (
                        <span className="text-red-600">ABSENT</span>
                      ) : sub.obtainedMarks !== null ? (
                        <span className="text-slate-900">{sub.obtainedMarks}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">
                      {sub.isAbsent ? "0%" : `${sub.percentage}%`}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-black font-mono text-[10px] ${
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
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {sub.remarks || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {result && (
              <tfoot className="bg-slate-100 border-t-2 border-slate-900 font-bold text-slate-900">
                <tr>
                  <td colSpan={2} className="py-2.5 px-3 uppercase text-[11px]">
                    Grand Total
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-xs">
                    {result.totalMaxMarks}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-xs text-blue-900 font-extrabold">
                    {result.totalObtainedMarks}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-xs text-emerald-900 font-extrabold">
                    {result.percentage}%
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-xs font-black">
                    {result.grade}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        result.status === "PASS"
                          ? "bg-emerald-200 text-emerald-900"
                          : "bg-red-200 text-red-900"
                      }`}
                    >
                      {result.status}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Overall Performance Summary & Key */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Summary Box */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Final Evaluation Summary
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-500">Aggregate Percentage:</span>
                <span className="block text-lg font-black text-emerald-800 font-mono">
                  {result?.percentage || 0}%
                </span>
              </div>
              <div>
                <span className="text-slate-500">Final Letter Grade:</span>
                <span className="block text-lg font-black text-blue-900 font-mono">
                  Grade {result?.grade || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Section Rank:</span>
                <span className="block font-bold text-slate-800 font-mono">
                  {result?.rank ? `Rank #${result.rank} / ${totalStudentsInSection}` : "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Result Status:</span>
                <span
                  className={`block font-extrabold ${
                    result?.status === "PASS" ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {result?.status || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Grading Scale Guide */}
          <div className="border border-slate-200 rounded-xl p-3 bg-white text-[10px]">
            <h3 className="font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[10px]">
              Grading Scale Key
            </h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {gradingScale.map((g) => (
                <div key={g.grade} className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span className="font-bold font-mono text-slate-800">{g.grade} ({g.range})</span>
                  <span className="text-slate-500">{g.remarks}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Signatures Footer */}
        <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-300 text-center text-xs">
          <div>
            <div className="border-b border-slate-400 pb-8 mb-2" />
            <span className="font-semibold text-slate-700 block">Class Incharge</span>
          </div>
          <div>
            <div className="border-b border-slate-400 pb-8 mb-2" />
            <span className="font-semibold text-slate-700 block">Controller of Examinations</span>
          </div>
          <div>
            <div className="border-b border-slate-400 pb-8 mb-2" />
            <span className="font-bold text-slate-900 block">Principal / Headmaster Stamp</span>
          </div>
        </div>
      </div>
    </div>
  );
}
