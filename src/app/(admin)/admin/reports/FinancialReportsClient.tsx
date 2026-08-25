"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Download,
  Filter,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, getMonthName } from "@/lib/utils";

const MONTHS = [
  "","January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface ClassWiseStat {
  className: string;
  billed: number;
  collected: number;
  pending: number;
  total: number;
  paid: number;
}

interface ChallanRecord {
  id: string;
  challanNumber: string;
  month: number;
  year: number;
  status: string;
  totalAmount: any;
  student: {
    admissionNumber: string;
    firstName: string;
    lastName: string;
    section?: { name: string; class: { name: string } };
  };
  payment: { amountReceived: any; paymentMethod: string; paymentDate: Date } | null;
}

interface Props {
  totalBilled: number;
  totalCollected: number;
  totalPending: number;
  recoveryRate: number;
  totalChallans: number;
  paidCount: number;
  unpaidCount: number;
  overdueCount: number;
  classWise: ClassWiseStat[];
  allChallans: ChallanRecord[];
  selectedMonth: number;
  selectedYear: number;
}

export function FinancialReportsClient({
  totalBilled,
  totalCollected,
  totalPending,
  recoveryRate,
  totalChallans,
  paidCount,
  unpaidCount,
  overdueCount,
  classWise,
  allChallans,
  selectedMonth,
  selectedYear,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`);
  }

  function exportCSV() {
    const headers = ["Challan #","Student","Admission #","Class","Section","Month","Year","Amount","Status","Payment Method","Payment Date"];
    const rows = allChallans.map((c) => [
      c.challanNumber,
      `${c.student.firstName} ${c.student.lastName}`,
      c.student.admissionNumber,
      c.student.section?.class.name || "",
      c.student.section?.name || "",
      MONTHS[c.month],
      c.year,
      Number(c.totalAmount),
      c.status,
      c.payment?.paymentMethod || "",
      c.payment ? new Date(c.payment.paymentDate).toLocaleDateString() : "",
    ]);

    const csv = [headers, ...rows].map((r) => r.map(String).map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fee-report-${MONTHS[selectedMonth]}-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const stats = [
    {
      label: "Total Billed",
      value: formatCurrency(totalBilled),
      sub: `${totalChallans} challans issued`,
      icon: DollarSign,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      iconBg: "bg-blue-100",
    },
    {
      label: "Amount Collected",
      value: formatCurrency(totalCollected),
      sub: `${paidCount} challans paid`,
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg: "bg-emerald-100",
    },
    {
      label: "Amount Pending",
      value: formatCurrency(totalPending),
      sub: `${unpaidCount} unpaid · ${overdueCount} overdue`,
      icon: TrendingDown,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      iconBg: "bg-amber-100",
    },
    {
      label: "Recovery Rate",
      value: `${recoveryRate}%`,
      sub: recoveryRate >= 80 ? "Excellent collection" : recoveryRate >= 60 ? "Moderate collection" : "Needs attention",
      icon: BarChart3,
      color: recoveryRate >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200",
      iconBg: recoveryRate >= 80 ? "bg-emerald-100" : "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Period Filter Row */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-semibold text-slate-700">Showing report for:</span>
        <select
          value={selectedMonth}
          onChange={(e) => updateFilter("month", e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none"
        >
          {MONTHS.slice(1).map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => updateFilter("year", e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none"
        >
          {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          onClick={exportCSV}
          className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white rounded-xl border p-5 ${stat.color} shadow-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider opacity-70">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">{stat.value}</div>
              <div className="text-xs mt-1 opacity-70">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Recovery Rate Progress */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">Monthly Collection Progress</h3>
          <span className="text-sm font-bold text-slate-600">{recoveryRate}% recovered</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${
              recoveryRate >= 80 ? "bg-emerald-500" : recoveryRate >= 60 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${recoveryRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>PKR 0</span>
          <span>{formatCurrency(totalBilled)}</span>
        </div>
      </div>

      {/* Class-wise Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Class-Wise Collection — {getMonthName(selectedMonth)} {selectedYear}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Class</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Challans</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Billed</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Collected</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Pending</th>
                <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Recovery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classWise.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                    No data available for the selected period.
                  </td>
                </tr>
              ) : (
                classWise.map((row) => {
                  const rate = row.billed > 0 ? Math.round((row.collected / row.billed) * 100) : 0;
                  return (
                    <tr key={row.className} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-semibold text-slate-800">{row.className}</td>
                      <td className="px-5 py-3 text-right text-slate-600">
                        {row.paid}/{row.total}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-slate-800">
                        {formatCurrency(row.billed)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(row.collected)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-amber-700">
                        {formatCurrency(row.pending)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden max-w-24">
                            <div
                              className={`h-2 rounded-full ${rate >= 80 ? "bg-emerald-500" : rate >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600 min-w-[32px]">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
