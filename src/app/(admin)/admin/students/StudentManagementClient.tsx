"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Download,
  Filter,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import {
  toggleStudentStatusAction,
  deleteStudentAction,
} from "./actions";
import { StudentDetailModal } from "./StudentDetailModal";
import { AdmissionDialog } from "./AdmissionDialog";
import { formatDate, getInitials } from "@/lib/utils";

interface StudentItem {
  id: string;
  admissionNumber: string;
  rollNumber: string | null;
  firstName: string;
  lastName: string;
  gender: string | null;
  bloodGroup: string | null;
  admissionDate: Date;
  isActive: boolean;
  guardianName: string | null;
  guardianPhone: string | null;
  fatherName: string | null;
  dateOfBirth: Date | null;
  emergencyContact: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  user: { email: string; isActive: boolean } | null;
  section: {
    id: string;
    name: string;
    class: { id: string; name: string };
  } | null;
  academicYear: { id: string; name: string } | null;
}

interface ClassOption {
  id: string;
  name: string;
  sections: Array<{ id: string; name: string }>;
}

export function StudentManagementClient({
  initialStudents,
  classes,
}: {
  initialStudents: StudentItem[];
  classes: ClassOption[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [selectedSectionId, setSelectedSectionId] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [viewingStudent, setViewingStudent] = useState<StudentItem | null>(null);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);

  // Available sections based on selected class
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Filter students
  const filtered = initialStudents.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      fullName.includes(query) ||
      s.admissionNumber.toLowerCase().includes(query) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(query)) ||
      (s.guardianName && s.guardianName.toLowerCase().includes(query)) ||
      (s.user?.email && s.user.email.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (selectedClassId !== "all" && s.section?.class.id !== selectedClassId)
      return false;

    if (selectedSectionId !== "all" && s.section?.id !== selectedSectionId)
      return false;

    if (statusFilter === "active") return s.isActive;
    if (statusFilter === "inactive") return !s.isActive;

    return true;
  });

  // Client-side pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStudents = filtered.slice(startIndex, startIndex + pageSize);

  // Status toggle
  async function handleToggleStatus(id: string, currentStatus: boolean) {
    const res = await toggleStudentStatusAction(id, !currentStatus);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  }

  // Delete
  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete student record "${name}"?`))
      return;
    const res = await deleteStudentAction(id);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  }

  // Export to CSV
  function handleExportCSV() {
    if (filtered.length === 0) {
      toast.error("No students to export.");
      return;
    }

    const headers = [
      "Admission No",
      "Roll No",
      "First Name",
      "Last Name",
      "Class",
      "Section",
      "Gender",
      "Guardian Name",
      "Guardian Phone",
      "Portal Email",
      "Status",
      "Admission Date",
    ];

    const rows = filtered.map((s) => [
      `"${s.admissionNumber}"`,
      `"${s.rollNumber || ""}"`,
      `"${s.firstName}"`,
      `"${s.lastName}"`,
      `"${s.section?.class.name || ""}"`,
      `"${s.section?.name || ""}"`,
      `"${s.gender || ""}"`,
      `"${s.guardianName || s.fatherName || ""}"`,
      `"${s.guardianPhone || ""}"`,
      `"${s.user?.email || ""}"`,
      `"${s.isActive ? "Active" : "Inactive"}"`,
      `"${formatDate(s.admissionDate)}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `edumanage_students_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filtered.length} students to CSV.`);
  }

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, roll no, admission no, email…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-all"
            >
              <Download className="w-4 h-4 text-slate-500" /> Export CSV
            </button>
            <button
              onClick={() => setIsAdmissionOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> New Admission
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Class Stream
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedSectionId("all");
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Section
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => {
                setSelectedSectionId(e.target.value);
                setCurrentPage(1);
              }}
              disabled={selectedClassId === "all"}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="all">All Sections</option>
              {selectedClass?.sections.map((s) => (
                <option key={s.id} value={s.id}>
                  Section {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Enrollment Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="all">All Students</option>
              <option value="active">Active Enrolled</option>
              <option value="inactive">Inactive / Withdrawn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Admission #</th>
                <th className="py-3.5 px-4">Class & Section</th>
                <th className="py-3.5 px-4">Guardian / Contact</th>
                <th className="py-3.5 px-4">Enrollment Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <GraduationCap className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    No students match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {getInitials(`${s.firstName} ${s.lastName}`)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {s.firstName} {s.lastName}
                          </div>
                          <div className="text-xs text-slate-400">
                            Roll No: {s.rollNumber || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {s.admissionNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800">
                        <BookOpen className="w-3 h-3 text-slate-500" />
                        {s.section?.class.name} — {s.section?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        {s.guardianName || s.fatherName || "—"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {s.guardianPhone || s.user?.email || "—"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {formatDate(s.admissionDate)}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(s.id, s.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                          s.isActive
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        title="Click to toggle status"
                      >
                        {s.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingStudent(s)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(s.id, `${s.firstName} ${s.lastName}`)
                          }
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filtered.length === 0 ? 0 : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-800">
              {Math.min(startIndex + pageSize, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {filtered.length}
            </span>{" "}
            students
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Admission Dialog Wizard */}
      <AdmissionDialog
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        classes={classes}
      />

      {/* Student Detail Modal */}
      {viewingStudent && (
        <StudentDetailModal
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
        />
      )}
    </div>
  );
}
