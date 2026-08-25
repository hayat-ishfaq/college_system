"use client";

import React, { useState } from "react";
import {
  Plus,
  BookOpen,
  UserCheck,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Layers,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  createAssignmentAction,
  toggleAssignmentStatusAction,
  deleteAssignmentAction,
} from "./actions";

interface AssignmentItem {
  id: string;
  isActive: boolean;
  teacher: { id: string; firstName: string; lastName: string; employeeId: string };
  subject: { id: string; name: string; code: string };
  class: { id: string; name: string };
  section: { id: string; name: string };
  academicYear: { id: string; name: string };
}

interface TeacherOption {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

interface SubjectOption {
  id: string;
  name: string;
  code: string;
}

interface ClassOption {
  id: string;
  name: string;
  sections: Array<{ id: string; name: string }>;
}

interface AcademicYearOption {
  id: string;
  name: string;
  isCurrent: boolean;
}

export function AssignmentManagementClient({
  assignments,
  teachers,
  subjects,
  classes,
  academicYears,
}: {
  assignments: AssignmentItem[];
  teachers: TeacherOption[];
  subjects: SubjectOption[];
  classes: ClassOption[];
  academicYears: AcademicYearOption[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const currentAcademicYear =
    academicYears.find((y) => y.isCurrent) || academicYears[0];

  const filtered = assignments.filter((a) => {
    const query = searchTerm.toLowerCase();
    const teacherName = `${a.teacher.firstName} ${a.teacher.lastName}`.toLowerCase();
    const matchesSearch =
      teacherName.includes(query) ||
      a.teacher.employeeId.toLowerCase().includes(query) ||
      a.subject.name.toLowerCase().includes(query) ||
      a.subject.code.toLowerCase().includes(query) ||
      a.class.name.toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (selectedClassFilter !== "all" && a.class.id !== selectedClassFilter)
      return false;
    return true;
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createAssignmentAction(formData);
    setIsLoading(false);

    if (res.success) {
      toast.success(res.message);
      setIsModalOpen(false);
    } else {
      toast.error(res.error);
    }
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    const res = await toggleAssignmentStatusAction(id, !currentStatus);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to unassign this course?")) return;
    const res = await deleteAssignmentAction(id);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by teacher, subject, class…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Map New Assignment
        </button>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Assigned Course</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Academic Session</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No teacher assignments found.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {a.teacher.firstName} {a.teacher.lastName}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {a.teacher.employeeId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">
                        {a.subject.name}
                      </span>
                      <span className="text-xs text-blue-600 font-mono font-semibold ml-1.5">
                        ({a.subject.code})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        {a.class.name} — Section {a.section.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {a.academicYear.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggle(a.id, a.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer ${
                          a.isActive
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {a.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Unassign Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Map Assignment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Map Teacher to Subject & Class
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty Member *
                </label>
                <select
                  name="teacherId"
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a teacher…</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject *
                </label>
                <select
                  name="subjectId"
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a subject…</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Class *
                  </label>
                  <select
                    name="classId"
                    required
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Section *
                  </label>
                  <select
                    name="sectionId"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {!selectedClass?.sections ||
                    selectedClass.sections.length === 0 ? (
                      <option value="">No sections available</option>
                    ) : (
                      selectedClass.sections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          Section {sec.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Year *
                </label>
                <select
                  name="academicYearId"
                  required
                  defaultValue={currentAcademicYear?.id}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name} {y.isCurrent ? "(Current)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
