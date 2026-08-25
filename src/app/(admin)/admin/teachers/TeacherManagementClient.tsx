"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  UserCheck,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import {
  createTeacherAction,
  updateTeacherAction,
  toggleTeacherStatusAction,
  deleteTeacherAction,
} from "./actions";
import { TeacherProfileModal } from "./TeacherProfileModal";
import { formatDate, getInitials } from "@/lib/utils";

interface TeacherItem {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  qualification: string | null;
  specialization: string | null;
  joiningDate: Date;
  isActive: boolean;
  address: string | null;
  city: string | null;
  teacherAssignments: Array<{
    id: string;
    subject: { name: string; code: string };
    class: { name: string };
    section: { name: string };
  }>;
}

export function TeacherManagementClient({
  teachers,
}: {
  teachers: TeacherItem[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState<TeacherItem | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<TeacherItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filtered = teachers.filter((t) => {
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
    const matchSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.specialization &&
        t.specialization.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;
    if (statusFilter === "active") return t.isActive;
    if (statusFilter === "inactive") return !t.isActive;
    return true;
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    let res;
    if (editingTeacher) {
      formData.append("id", editingTeacher.id);
      formData.append("isActive", String(editingTeacher.isActive));
      res = await updateTeacherAction(formData);
    } else {
      res = await createTeacherAction(formData);
    }
    setIsLoading(false);

    if (res.success) {
      toast.success(res.message);
      setIsModalOpen(false);
      setEditingTeacher(null);
    } else {
      toast.error(res.error);
    }
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    const res = await toggleTeacherStatusAction(id, !currentStatus);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete faculty member "${name}"?`))
      return;
    const res = await deleteTeacherAction(id);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, employee ID, email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Faculty</option>
            <option value="inactive">Inactive Faculty</option>
          </select>
        </div>

        <button
          onClick={() => {
            setEditingTeacher(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Faculty Member
        </button>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4">Assigned Classes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No faculty members found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {getInitials(`${t.firstName} ${t.lastName}`)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {t.firstName} {t.lastName}
                          </div>
                          <div className="text-xs text-slate-400">
                            Joined {formatDate(t.joiningDate)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {t.employeeId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-900">{t.email}</div>
                      <div className="text-xs text-slate-500">{t.phone || "—"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        {t.specialization || "—"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.qualification || ""}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {t.teacherAssignments.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">
                            Unassigned
                          </span>
                        ) : (
                          t.teacherAssignments.map((a) => (
                            <span
                              key={a.id}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700"
                            >
                              {a.class.name}-{a.section.name} ({a.subject.code})
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(t.id, t.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                          t.isActive
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        title="Click to toggle status"
                      >
                        {t.isActive ? (
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
                          onClick={() => setViewingTeacher(t)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTeacher(t);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Teacher"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(t.id, `${t.firstName} ${t.lastName}`)
                          }
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Teacher"
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
      </div>

      {/* Modal: Create/Edit Teacher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingTeacher
                  ? "Edit Faculty Member"
                  : "Register New Faculty Member"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    defaultValue={editingTeacher?.firstName || ""}
                    placeholder="e.g. Muhammad"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    defaultValue={editingTeacher?.lastName || ""}
                    placeholder="e.g. Ali"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={editingTeacher?.email || ""}
                    placeholder="teacher@institution.edu.pk"
                    disabled={!!editingTeacher}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="text"
                    defaultValue={editingTeacher?.phone || ""}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qualification
                  </label>
                  <input
                    name="qualification"
                    type="text"
                    defaultValue={editingTeacher?.qualification || ""}
                    placeholder="e.g. M.Sc. Mathematics"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specialization
                  </label>
                  <input
                    name="specialization"
                    type="text"
                    defaultValue={editingTeacher?.specialization || ""}
                    placeholder="e.g. Pure Mathematics"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    name="city"
                    type="text"
                    defaultValue={editingTeacher?.city || "Islamabad"}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custom Employee ID
                  </label>
                  <input
                    name="employeeId"
                    type="text"
                    defaultValue={editingTeacher?.employeeId || ""}
                    placeholder="Leave blank for auto-generate"
                    disabled={!!editingTeacher}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              {!editingTeacher && (
                <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  ℹ️ A teacher login account will automatically be provisioned with default password <code className="font-mono font-bold text-emerald-700">Teacher@123</code>.
                </p>
              )}

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
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingTeacher ? "Update Faculty" : "Register Faculty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Detail Modal */}
      {viewingTeacher && (
        <TeacherProfileModal
          teacher={viewingTeacher}
          onClose={() => setViewingTeacher(null)}
        />
      )}
    </div>
  );
}
