"use client";

import React, { useState } from "react";
import {
  Award,
  Filter,
  Download,
  Printer,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BarChart3,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { StudentResultSummary } from "@/services/result.service";

interface ExamOption {
  id: string;
  name: string;
  type: string;
}

interface ClassOption {
  id: string;
  name: string;
  sections: Array<{ id: string; name: string }>;
}

interface Props {
  results: StudentResultSummary[];
  exams: ExamOption[];
  classes: ClassOption[];
  selectedExamId: string;
  selectedClassId: string;
  selectedSectionId: string;
}

export function ResultManagementClient({
  results,
  exams,
  classes,
  selectedExamId,
  selectedClassId,
  selectedSectionId,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  }

  const filteredResults = results.filter((r) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      r.studentName.toLowerCase().includes(query) ||
      r.admissionNumber.toLowerCase().includes(query) ||
      (r.rollNumber && r.rollNumber.toLowerCase().includes(query))
    );
  });

  // Calculate high-level metrics
  const totalStudents = results.length;
  const passedCount = results.filter((r) => r.status === "PASS").length;
  const failedCount = results.filter((r) => r.status === "FAIL").length;
  const passRate = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;
  const avgPercentage =
    totalStudents > 0
      ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / totalStudents)
      : 0;
  const topScore =
    totalStudents > 0 ? Math.max(...results.map((r) => r.totalObtainedMarks)) : 0;

  function exportCSV() {
    const examName = exams.find((e) => e.id === selectedExamId)?.name || "Exam";
    const headers = [
      "Rank",
      "Student Name",
      "Admission #",
      "Roll #",
      "Class",
      "Section",
      "Total Marks",
      "Obtained Marks",
      "Percentage",
      "Grade",
      "Status",
    ];

    const rows = filteredResults.map((r) => [
      r.rank,
      r.studentName,
      r.admissionNumber,
      r.rollNumber || "",
      r.className,
      r.sectionName,
      r.totalMaxMarks,
      r.totalObtainedMarks,
      `${r.percentage}%`,
      r.grade,
      r.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.map(String).map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results-${examName.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />

        {/* Exam Selector */}
        <select
          value={selectedExamId}
          onChange={(e) => updateFilter("examId", e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.name} ({exam.type})
            </option>
          ))}
        </select>

        {/* Class Filter */}
        <select
          value={selectedClassId}
          onChange={(e) => updateFilter("classId", e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Section Filter */}
        <select
          value={selectedSectionId}
          onChange={(e) => updateFilter("sectionId", e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sections</option>
          {(selectedClass?.sections || []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Search Input */}
        <div className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by name, roll #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-xs outline-none w-full"
          />
        </div>

        <button
          onClick={exportCSV}
          disabled={results.length === 0}
          className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all disabled:opacity-40 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export Tabulation
        </button>
      </div>

      {/* Analytics KPI Cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase mb-1">
              <span>Appeared</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalStudents}
            </div>
            <span className="text-[11px] text-slate-400">Total enrolled</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-emerald-700 font-bold uppercase mb-1">
              <span>Passed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {passedCount}
            </div>
            <span className="text-[11px] text-emerald-600">{passRate}% pass rate</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-red-700 font-bold uppercase mb-1">
              <span>Failed</span>
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-black text-red-700 font-mono">
              {failedCount}
            </div>
            <span className="text-[11px] text-red-600">{100 - passRate}% fail rate</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase mb-1">
              <span>Class Avg</span>
              <BarChart3 className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {avgPercentage}%
            </div>
            <span className="text-[11px] text-slate-400">Mean percentage</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase mb-1">
              <span>Top Score</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 font-mono">
              {topScore}
            </div>
            <span className="text-[11px] text-slate-400">Highest obtained</span>
          </div>
        </div>
      )}

      {/* Tabulation Sheet Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left w-16">Rank</th>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Class & Section</th>
                <th className="px-4 py-3 text-center">Marks (Obt / Max)</th>
                <th className="px-4 py-3 text-center">Percentage</th>
                <th className="px-4 py-3 text-center">Grade</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    No results calculated for this selection. Ensure teachers have submitted marks.
                  </td>
                </tr>
              ) : (
                filteredResults.map((row) => (
                  <tr key={row.studentId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-center font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-black ${
                          row.rank === 1
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : row.rank === 2
                            ? "bg-slate-200 text-slate-800"
                            : row.rank === 3
                            ? "bg-amber-50 text-amber-700"
                            : "text-slate-500"
                        }`}
                      >
                        #{row.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900 block">
                        {row.studentName}
                      </span>
                      <span className="text-xs text-slate-400">
                        Roll #{row.rollNumber || "—"} · {row.admissionNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {row.className} — {row.sectionName}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                      <span className="text-blue-700">{row.totalObtainedMarks}</span>
                      <span className="text-slate-400 font-normal"> / {row.totalMaxMarks}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold">
                      <span
                        className={`${
                          row.percentage >= 70
                            ? "text-emerald-700"
                            : row.percentage >= 50
                            ? "text-slate-800"
                            : "text-red-600"
                        }`}
                      >
                        {row.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-black font-mono ${
                          row.grade === "A+" || row.grade === "A"
                            ? "bg-emerald-100 text-emerald-800"
                            : row.grade === "B" || row.grade === "C"
                            ? "bg-blue-100 text-blue-800"
                            : row.grade === "D"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          row.status === "PASS"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/admin/results/${row.studentId}/${selectedExamId}/print`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 rounded-lg transition-all"
                        title="Print Official Report Card"
                      >
                        <Printer className="w-3.5 h-3.5" /> Report Card
                      </Link>
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
