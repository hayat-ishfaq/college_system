"use client";

import React, { useState } from "react";
import {
  Plus,
  BadgeDollarSign,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Layers,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  createFeeStructureAction,
  toggleFeeStructureStatusAction,
  deleteFeeStructureAction,
} from "./actions";
import { formatCurrency, formatDate } from "@/lib/utils";

interface FeeStructureItem {
  id: string;
  name: string;
  feeType: string;
  effectiveDate: Date;
  isActive: boolean;
  class: { id: string; name: string };
  academicYear: { id: string; name: string };
  feeItems: Array<{
    id: string;
    name: string;
    amount: any;
    isOptional: boolean;
  }>;
}

interface ClassOption {
  id: string;
  name: string;
}

interface AcademicYearOption {
  id: string;
  name: string;
  isCurrent: boolean;
}

export function FeeStructureManagementClient({
  feeStructures,
  classes,
  academicYears,
}: {
  feeStructures: FeeStructureItem[];
  classes: ClassOption[];
  academicYears: AcademicYearOption[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic fee items state for creation modal
  const [items, setItems] = useState([
    { name: "Tuition Fee", amount: 5000, isOptional: false },
    { name: "Computer Lab Fee", amount: 1000, isOptional: false },
    { name: "Assessment & Exam Fee", amount: 800, isOptional: false },
  ]);

  const currentAcademicYear =
    academicYears.find((y) => y.isCurrent) || academicYears[0];

  function addItem() {
    setItems([...items, { name: "", amount: 500, isOptional: false }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: string, value: any) {
    const next = [...items];
    (next[index] as any)[field] = value;
    setItems(next);
  }

  const modalTotal = items.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("itemsJson", JSON.stringify(items));

    const res = await createFeeStructureAction(formData);
    setIsLoading(false);

    if (res.success) {
      toast.success(res.message);
      setIsModalOpen(false);
    } else {
      toast.error(res.error);
    }
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    const res = await toggleFeeStructureStatusAction(id, !currentStatus);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete fee structure "${name}"?`))
      return;
    const res = await deleteFeeStructureAction(id);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <BadgeDollarSign className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold text-slate-800">
            {feeStructures.length} Active Fee Structures
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Create Fee Structure
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feeStructures.map((f) => {
          const totalAmount = f.feeItems.reduce(
            (acc, i) => acc + Number(i.amount),
            0
          );

          return (
            <div
              key={f.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 mb-1">
                    {f.class.name}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {f.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Session: {f.academicYear.name} · {f.feeType}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggle(f.id, f.isActive)}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      f.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {f.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => handleDelete(f.id, f.name)}
                    className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="p-5 flex-1 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Fee Breakdown Items ({f.feeItems.length})
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {f.feeItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-2 flex items-center justify-between"
                    >
                      <span className="text-slate-700 font-medium">
                        {item.name}
                        {item.isOptional && (
                          <span className="text-[10px] text-slate-400 ml-1">
                            (Optional)
                          </span>
                        )}
                      </span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatCurrency(Number(item.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Total */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase">
                  Total Monthly Fee
                </span>
                <span className="text-base font-extrabold text-emerald-700 font-mono">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Fee Structure */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Create Fee Structure Template
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Structure Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Grade 10 Standard Fee 2025-2026"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Applicable Class *
                  </label>
                  <select
                    name="classId"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    Academic Year *
                  </label>
                  <select
                    name="academicYearId"
                    required
                    defaultValue={currentAcademicYear?.id}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {academicYears.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name} {y.isCurrent ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Fee Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase text-slate-500">
                    Fee Breakdown Heads
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Head
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Fee Head (e.g. Tuition)"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(index, "name", e.target.value)
                        }
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                      />
                      <div className="relative w-28">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                          PKR
                        </span>
                        <input
                          type="number"
                          required
                          min="0"
                          value={item.amount}
                          onChange={(e) =>
                            updateItem(index, "amount", Number(e.target.value))
                          }
                          className="w-full pl-8 pr-2 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 mt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">
                    Total Calculated Fee:
                  </span>
                  <span className="text-sm font-extrabold text-emerald-900 font-mono">
                    {formatCurrency(modalTotal)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
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
                  Save Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
