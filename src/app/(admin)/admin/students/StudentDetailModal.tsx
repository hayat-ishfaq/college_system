"use client";

import React from "react";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  MapPin,
  HeartPulse,
  ShieldAlert,
  X,
  FileText,
  Award,
} from "lucide-react";
import { formatDate, formatCurrency, getInitials } from "@/lib/utils";

interface StudentDetailModalProps {
  student: any;
  onClose: () => void;
}

export function StudentDetailModal({
  student,
  onClose,
}: StudentDetailModalProps) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl font-bold text-white shadow-inner">
              {getInitials(`${student.firstName} ${student.lastName}`)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">
                  {student.firstName} {student.lastName}
                </h2>
                <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full font-mono">
                  {student.admissionNumber}
                </span>
              </div>
              <p className="text-blue-100 text-sm mt-0.5">
                {student.section?.class.name} — Section {student.section?.name} · Roll No: {student.rollNumber || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Grid: Academic & Personal Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div>
              <span className="text-xs text-slate-400 block">Student Email / Portal ID</span>
              <span className="font-medium text-slate-800">{student.user?.email || "—"}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Admission Date</span>
              <span className="font-medium text-slate-800">{formatDate(student.admissionDate)}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Date of Birth</span>
              <span className="font-medium text-slate-800">{formatDate(student.dateOfBirth)}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Gender</span>
              <span className="font-medium text-slate-800 capitalize">{student.gender?.toLowerCase() || "—"}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Blood Group</span>
              <span className="font-medium text-slate-800">{student.bloodGroup?.replace("_", " ") || "—"}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Academic Year</span>
              <span className="font-medium text-slate-800">{student.academicYear?.name || "2025-2026"}</span>
            </div>
          </div>

          {/* Guardian Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Guardian & Family Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white border border-slate-200 rounded-xl">
              <div>
                <span className="text-xs text-slate-400 block">Guardian Name</span>
                <span className="font-medium text-slate-800">{student.guardianName || student.fatherName || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Guardian Phone</span>
                <span className="font-medium text-slate-800">{student.guardianPhone || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Father's Name</span>
                <span className="font-medium text-slate-800">{student.fatherName || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Emergency Contact</span>
                <span className="font-medium text-slate-800">{student.emergencyContact || student.guardianPhone || "—"}</span>
              </div>
            </div>
          </div>

          {/* Residential Address */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Residential Address
            </h3>
            <p className="text-xs text-slate-700 flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              {student.address ? `${student.address}, ${student.city || ""} ${student.province || ""}` : "Address not provided"}
            </p>
          </div>
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
