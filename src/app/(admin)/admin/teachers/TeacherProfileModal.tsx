"use client";

import React from "react";
import {
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Award,
  MapPin,
  X,
  UserCheck,
} from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";

interface TeacherProfileModalProps {
  teacher: any;
  onClose: () => void;
}

export function TeacherProfileModal({
  teacher,
  onClose,
}: TeacherProfileModalProps) {
  if (!teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-xl font-bold text-white shadow-inner">
              {getInitials(`${teacher.firstName} ${teacher.lastName}`)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">
                  {teacher.firstName} {teacher.lastName}
                </h2>
                <span className="bg-white/20 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {teacher.employeeId}
                </span>
              </div>
              <p className="text-emerald-100 text-sm mt-0.5">
                {teacher.specialization || "Faculty Member"}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Key Contact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">Email</span>
                <span className="font-medium text-slate-800">{teacher.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">Phone</span>
                <span className="font-medium text-slate-800">
                  {teacher.phone || "Not provided"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">Qualification</span>
                <span className="font-medium text-slate-800">
                  {teacher.qualification || "—"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">Joining Date</span>
                <span className="font-medium text-slate-800">
                  {formatDate(teacher.joiningDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Classes and Courses */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Current Teaching Assignments ({teacher.teacherAssignments?.length || 0})
            </h3>
            <div className="space-y-2">
              {!teacher.teacherAssignments || teacher.teacherAssignments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No courses or classes assigned yet.
                </p>
              ) : (
                teacher.teacherAssignments.map((a: any) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        {a.class.name} — Section {a.section.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {a.subject.name} ({a.subject.code})
                      </span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      Active
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Address Information */}
          {teacher.address && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Residential Address
              </h3>
              <p className="text-xs text-slate-700 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {teacher.address}, {teacher.city || ""}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
