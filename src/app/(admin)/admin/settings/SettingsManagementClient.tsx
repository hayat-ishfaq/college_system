"use client";

import React, { useState, useTransition } from "react";
import {
  Building2,
  Calendar,
  ShieldCheck,
  Save,
  Plus,
  Loader2,
  CheckCircle2,
  Landmark,
  GraduationCap,
  History,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  saveInstitutionSettingsAction,
  createAcademicYearAction,
  setActiveAcademicYearAction,
} from "./actions";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { InstitutionSettingsInput } from "@/lib/validations/setting.schema";

interface AcademicYearItem {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  _count: {
    students: number;
    feeStructures: number;
    challans: number;
    exams: number;
  };
}

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  details: string | null;
  createdAt: Date;
  user: { email: string; role: string } | null;
}

interface Props {
  initialSettings: InstitutionSettingsInput;
  academicYears: AcademicYearItem[];
  auditLogs: AuditLogItem[];
}

export function SettingsManagementClient({
  initialSettings,
  academicYears,
  auditLogs,
}: Props) {
  const [activeTab, setActiveTab] = useState<"profile" | "sessions" | "audit">("profile");
  const [isPending, startTransition] = useTransition();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [auditSearch, setAuditSearch] = useState("");

  function handleSaveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await saveInstitutionSettingsAction(formData);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleCreateSession(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createAcademicYearAction(formData);
      if (res.success) {
        toast.success(res.message);
        setIsSessionModalOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleSetActiveSession(id: string) {
    startTransition(async () => {
      const res = await setActiveAcademicYearAction(id);
      if (res.success) toast.success(res.message);
      else toast.error(res.error);
    });
  }

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!auditSearch) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.user?.email && log.user.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
            activeTab === "profile"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" /> Institution & Bank
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
            activeTab === "sessions"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" /> Academic Sessions
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
            activeTab === "audit"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Security & Audit Trail
        </button>
      </div>

      {/* Tab 1: Institution Profile & Bank Accounts */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* General Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> College Identity & Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Name *</label>
                <input
                  name="institution_name"
                  type="text"
                  required
                  defaultValue={initialSettings.institution_name}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motto / Tagline</label>
                <input
                  name="tagline"
                  type="text"
                  defaultValue={initialSettings.tagline || ""}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email Address *</label>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={initialSettings.email}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  name="phone"
                  type="text"
                  required
                  defaultValue={initialSettings.phone}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Address *</label>
                <input
                  name="address"
                  type="text"
                  required
                  defaultValue={initialSettings.address}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  name="website"
                  type="text"
                  defaultValue={initialSettings.website || ""}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Code</label>
                <input
                  name="currency_symbol"
                  type="text"
                  defaultValue={initialSettings.currency_symbol}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Bank Challan Account Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600" /> Bank Account (Printed on Fee Challans)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name *</label>
                <input
                  name="bank_name"
                  type="text"
                  required
                  defaultValue={initialSettings.bank_name}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Title *</label>
                <input
                  name="bank_account_title"
                  type="text"
                  required
                  defaultValue={initialSettings.bank_account_title}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account / IBAN Number *</label>
                <input
                  name="bank_account_no"
                  type="text"
                  required
                  defaultValue={initialSettings.bank_account_no}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Code *</label>
                <input
                  name="bank_branch_code"
                  type="text"
                  required
                  defaultValue={initialSettings.bank_branch_code}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Academic Thresholds */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" /> Academic Standing Thresholds
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minimum Exam Attendance Threshold (%)
                </label>
                <input
                  name="min_attendance_percentage"
                  type="number"
                  min="1"
                  max="100"
                  required
                  defaultValue={initialSettings.min_attendance_percentage}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-400">Students below this percentage receive an exam warning.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minimum Subject Passing Percentage (%)
                </label>
                <input
                  name="passing_percentage"
                  type="number"
                  min="1"
                  max="100"
                  required
                  defaultValue={initialSettings.passing_percentage}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-400">Passing score threshold for course evaluation.</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Global Configuration
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Academic Sessions */}
      {activeTab === "sessions" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-800">
                {academicYears.length} Academic Sessions
              </span>
            </div>
            <button
              onClick={() => setIsSessionModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Academic Session
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academicYears.map((year) => (
              <div
                key={year.id}
                className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${
                  year.isCurrent
                    ? "border-blue-500 ring-2 ring-blue-100"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 font-mono">
                      {year.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(year.startDate)} to {formatDate(year.endDate)}
                    </p>
                  </div>

                  {year.isCurrent ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Current
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetActiveSession(year.id)}
                      disabled={isPending}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Set Active
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block">Students</span>
                    <span className="font-bold text-slate-800 font-mono">{year._count.students}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block">Challans</span>
                    <span className="font-bold text-slate-800 font-mono">{year._count.challans}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block">Fee Models</span>
                    <span className="font-bold text-slate-800 font-mono">{year._count.feeStructures}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block">Exams</span>
                    <span className="font-bold text-slate-800 font-mono">{year._count.exams}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal: Create Academic Session */}
          {isSessionModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Add Academic Session</h3>
                  <button onClick={() => setIsSessionModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <form onSubmit={handleCreateSession} className="p-6 space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Session Name *</label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. 2026-2027"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                      <input
                        name="startDate"
                        type="date"
                        required
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                      <input
                        name="endDate"
                        type="date"
                        required
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      name="isCurrent"
                      type="checkbox"
                      value="true"
                      id="isCurrentCheckbox"
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <label htmlFor="isCurrentCheckbox" className="text-xs font-semibold text-slate-700">
                      Set as current active session
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsSessionModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 cursor-pointer"
                    >
                      {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      Create Session
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: System Audit Trail */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-800">
                System Activity & Audit Logs ({auditLogs.length} events)
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit actions, actors, details..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="bg-transparent border-none text-xs outline-none w-full"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Timestamp</th>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Entity</th>
                    <th className="px-4 py-3 text-left">Actor / User</th>
                    <th className="px-4 py-3 text-left">Activity Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No audit logs matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {log.entity}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {log.user ? (
                            <span>
                              {log.user.email} <span className="text-[10px] text-slate-400">({log.user.role})</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">SYSTEM</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-700 max-w-md truncate" title={log.details || ""}>
                          {log.details || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
