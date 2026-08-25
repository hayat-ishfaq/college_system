"use client";

import React, { useState, useTransition } from "react";
import {
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { generateBulkChallansAction } from "@/app/(admin)/admin/challans/actions";

interface BulkGenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classes: Array<{ id: string; name: string; sections: Array<{ id: string; name: string }> }>;
  academicYears: Array<{ id: string; name: string; isCurrent: boolean }>;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export function BulkGenerateDialog({
  isOpen,
  onClose,
  classes,
  academicYears,
}: BulkGenerateDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const [result, setResult] = useState<{
    generated: number;
    alreadyExisted: number;
    failed: number;
    totalStudents: number;
    errors: string[];
  } | null>(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentAcademicYear = academicYears.find((y) => y.isCurrent) || academicYears[0];

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Compute default due date (last day of selected month)
  function getDefaultDueDate(month: number, year: number) {
    const d = new Date(year, month, 0); // last day of month
    return d.toISOString().split("T")[0];
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await generateBulkChallansAction(formData);
      if (res.success) {
        toast.success(res.message);
        setResult(res.data as any);
      } else {
        toast.error(res.error);
      }
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Bulk Challan Generator</h3>
            <p className="text-xs text-slate-500 mt-0.5">Generate monthly fee challans for all active students</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm overflow-y-auto flex-1">
          {/* Class & Section */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class *</label>
              <select
                name="classId"
                required
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Section (Optional)</label>
              <select
                name="sectionId"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sections</option>
                {(selectedClass?.sections || []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Month *</label>
              <select
                name="month"
                required
                defaultValue={currentMonth}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MONTHS.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Year *</label>
              <select
                name="year"
                required
                defaultValue={currentYear}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Session *</label>
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

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Due Date *</label>
            <input
              name="dueDate"
              type="date"
              required
              defaultValue={getDefaultDueDate(currentMonth, currentYear)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Discount & Fine */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Global Discount (PKR)</label>
              <input
                name="discount"
                type="number"
                min="0"
                defaultValue={0}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Late Fine (PKR)</label>
              <input
                name="fine"
                type="number"
                min="0"
                defaultValue={0}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks (Optional)</label>
            <textarea
              name="remarks"
              rows={2}
              placeholder="e.g. August monthly fee..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Result Banner */}
          {result && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <p className="font-bold text-slate-800 text-sm">Generation Summary</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-xl font-extrabold text-emerald-700">{result.generated}</div>
                  <div className="text-emerald-600">Generated</div>
                </div>
                <div className="text-center p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-xl font-extrabold text-amber-700">{result.alreadyExisted}</div>
                  <div className="text-amber-600">Existed</div>
                </div>
                <div className="text-center p-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-xl font-extrabold text-red-700">{result.failed}</div>
                  <div className="text-red-600">Failed</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {result ? "Close" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Generating..." : "Generate Challans"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
