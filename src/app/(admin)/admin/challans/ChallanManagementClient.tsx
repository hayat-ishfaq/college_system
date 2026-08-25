"use client";

import React, { useState, useTransition } from "react";
import {
  Search,
  Zap,
  Eye,
  BadgeCheck,
  XCircle,
  Printer,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { BulkGenerateDialog } from "@/components/challans/BulkGenerateDialog";
import { RecordPaymentModal } from "@/components/challans/RecordPaymentModal";
import { cancelChallanAction } from "./actions";
import { formatCurrency, formatDate, getMonthName } from "@/lib/utils";
import Link from "next/link";

interface ChallanItem {
  id: string;
  challanNumber: string;
  month: number;
  year: number;
  issueDate: Date;
  dueDate: Date;
  status: "PAID" | "UNPAID" | "OVERDUE" | "CANCELLED";
  totalAmount: any;
  discount: any;
  fine: any;
  remarks: string | null;
  student: {
    id: string;
    userId?: string;
    admissionNumber: string;
    rollNumber: string | null;
    firstName: string;
    lastName: string;
    section: { name: string; class: { name: string } } | null;
  };
  academicYear: { name: string };
  challanItems: Array<{ id: string; name: string; amount: any }>;
  payment: {
    paymentDate: Date;
    paymentMethod: string;
    transactionRef: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PAID: { label: "Paid", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  UNPAID: { label: "Unpaid", className: "bg-amber-100 text-amber-800 border-amber-200" },
  OVERDUE: { label: "Overdue", className: "bg-red-100 text-red-800 border-red-200" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-500 border-slate-200" },
};

export function ChallanManagementClient({
  challans,
  total,
  page,
  totalPages,
  classes,
  academicYears,
  initialFilters,
}: {
  challans: ChallanItem[];
  total: number;
  page: number;
  totalPages: number;
  classes: Array<{ id: string; name: string; sections: Array<{ id: string; name: string }> }>;
  academicYears: Array<{ id: string; name: string; isCurrent: boolean }>;
  initialFilters: Record<string, string>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [paymentChallan, setPaymentChallan] = useState<ChallanItem | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  function setPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  }

  async function handleCancel(id: string, num: string) {
    if (!confirm(`Cancel challan ${num}? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await cancelChallanAction(id);
      if (res.success) toast.success(res.message);
      else toast.error(res.error);
    });
  }

  const MONTHS = [
    "", "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by challan number, name, admission no..."
            defaultValue={initialFilters.search || ""}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                updateFilter("search", (e.target as HTMLInputElement).value);
            }}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          onClick={() => setIsBulkOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
        >
          <Zap className="w-4 h-4" /> Generate Challans
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center text-sm">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={initialFilters.status || ""}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={initialFilters.month || ""}
          onChange={(e) => updateFilter("month", e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none"
        >
          <option value="">All Months</option>
          {MONTHS.slice(1).map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={initialFilters.year || ""}
          onChange={(e) => updateFilter("year", e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none"
        >
          <option value="">All Years</option>
          {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          value={initialFilters.classId || ""}
          onChange={(e) => updateFilter("classId", e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-slate-400">{total} challans</span>
      </div>

      {/* Challans Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Challan #</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Student</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Class</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Fee Month</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Due Date</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {challans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No challans found. Generate challans using the button above.</p>
                  </td>
                </tr>
              ) : (
                challans.map((challan) => {
                  const statusCfg = STATUS_CONFIG[challan.status] || STATUS_CONFIG.UNPAID;
                  return (
                    <tr key={challan.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">
                        {challan.challanNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 text-sm">
                          {challan.student.firstName} {challan.student.lastName}
                        </div>
                        <div className="text-xs text-slate-400">{challan.student.admissionNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {challan.student.section?.class.name} — {challan.student.section?.name}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                        {getMonthName(challan.month)} {challan.year}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(challan.dueDate)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(Number(challan.totalAmount))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/admin/challans/${challan.id}/print`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Print Triplicate PDF"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>
                          {challan.status === "UNPAID" && (
                            <button
                              onClick={() => setPaymentChallan(challan)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Record Payment"
                            >
                              <BadgeCheck className="w-4 h-4" />
                            </button>
                          )}
                          {(challan.status === "UNPAID" || challan.status === "OVERDUE") && (
                            <button
                              onClick={() => handleCancel(challan.id, challan.challanNumber)}
                              disabled={isPending}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Cancel Challan"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {challan.status === "PAID" && (
                            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                              <BadgeCheck className="w-3.5 h-3.5" />
                              {challan.payment?.paymentMethod}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
            <span className="text-slate-500 text-xs">
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <BulkGenerateDialog
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        classes={classes}
        academicYears={academicYears}
      />
      <RecordPaymentModal
        challan={paymentChallan as any}
        onClose={() => setPaymentChallan(null)}
      />
    </div>
  );
}
