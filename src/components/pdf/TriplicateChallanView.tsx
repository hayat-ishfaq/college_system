"use client";

import React from "react";
import { formatDate, formatCurrency, numberToWords, getMonthName } from "@/lib/utils";
import { Printer, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ChallanData {
  id: string;
  challanNumber: string;
  month: number;
  year: number;
  issueDate: Date;
  dueDate: Date;
  status: string;
  totalAmount: any;
  discount: any;
  fine: any;
  remarks: string | null;
  student: {
    admissionNumber: string;
    rollNumber: string | null;
    firstName: string;
    lastName: string;
    fatherName: string | null;
    guardianPhone: string | null;
    section: {
      name: string;
      class: { name: string };
    } | null;
  };
  academicYear: {
    name: string;
  };
  challanItems: Array<{
    id: string;
    name: string;
    amount: any;
  }>;
  payment: {
    paymentDate: Date;
    paymentMethod: string;
    transactionRef: string | null;
  } | null;
}

export function TriplicateChallanView({
  challan,
  backUrl = "/admin/challans",
}: {
  challan: ChallanData;
  backUrl?: string;
}) {
  const copies = [
    { title: "BANK COPY", subtitle: "For Bank / Financial Records", color: "border-blue-800" },
    { title: "INSTITUTION COPY", subtitle: "For Accounts & Audit Department", color: "border-emerald-800" },
    { title: "STUDENT COPY", subtitle: "For Student / Guardian Records", color: "border-purple-800" },
  ];

  const totalNum = Number(challan.totalAmount);
  const amountWords = numberToWords(totalNum);
  const monthName = getMonthName(challan.month);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white">
      {/* Print Controls Header - Hidden during print */}
      <div className="max-w-[1200px] mx-auto mb-6 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Challans
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* A4 Landscape Triplicate Sheet Container */}
      <div className="max-w-[1200px] mx-auto bg-white p-6 rounded-2xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-2 print:max-w-none">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4 divide-y md:divide-y-0 md:divide-x-2 divide-dashed divide-slate-300">
          {copies.map((copy, index) => (
            <div
              key={index}
              className={`pt-6 md:pt-0 ${index > 0 ? "md:pl-6 print:pl-4" : ""} space-y-3 flex flex-col justify-between text-[11px] leading-tight`}
            >
              {/* Top Header */}
              <div>
                <div className="text-center pb-2 border-b border-slate-300">
                  <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-900 text-white rounded mb-1">
                    {copy.title}
                  </span>
                  <h1 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
                    Bright Future College
                  </h1>
                  <p className="text-[10px] text-slate-600">
                    Plot 42, H-8/4, Islamabad · Ph: +92 51 9283741
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                    HBL A/C: 0142-79012345-03 · Branch Code: 0142
                  </p>
                </div>

                {/* Challan & Student Metadata */}
                <div className="bg-slate-50 p-2 rounded border border-slate-200 mt-2 space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Challan No:</span>
                    <span className="font-mono font-bold text-blue-800">
                      {challan.challanNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fee Month:</span>
                    <span className="font-bold text-slate-800">
                      {monthName} {challan.year}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Issue Date:</span>
                    <span>{formatDate(challan.issueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold text-rose-700">Due Date:</span>
                    <span className="font-bold text-rose-700">{formatDate(challan.dueDate)}</span>
                  </div>
                </div>

                {/* Student Bio */}
                <div className="mt-2 space-y-0.5 border-b border-slate-200 pb-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student Name:</span>
                    <span className="font-bold text-slate-900">
                      {challan.student.firstName} {challan.student.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Father's Name:</span>
                    <span className="text-slate-800">
                      {challan.student.fatherName || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Admission #:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {challan.student.admissionNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Class & Section:</span>
                    <span className="font-bold text-slate-800">
                      {challan.student.section?.class.name} — {challan.student.section?.name} (Roll #{challan.student.rollNumber || "—"})
                    </span>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="mt-2">
                  <table className="w-full text-left text-[10px]">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-100 font-bold text-slate-700">
                        <th className="py-1 px-1.5">Fee Head</th>
                        <th className="py-1 px-1.5 text-right">Amount (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {challan.challanItems.map((item) => (
                        <tr key={item.id}>
                          <td className="py-1 px-1.5 text-slate-700">{item.name}</td>
                          <td className="py-1 px-1.5 text-right font-mono">
                            {formatCurrency(Number(item.amount)).replace("PKR", "").trim()}
                          </td>
                        </tr>
                      ))}
                      {Number(challan.discount) > 0 && (
                        <tr className="text-emerald-700 font-semibold">
                          <td className="py-1 px-1.5">Concession / Discount</td>
                          <td className="py-1 px-1.5 text-right font-mono">
                            -{formatCurrency(Number(challan.discount)).replace("PKR", "").trim()}
                          </td>
                        </tr>
                      )}
                      {Number(challan.fine) > 0 && (
                        <tr className="text-rose-700 font-semibold">
                          <td className="py-1 px-1.5">Late Surcharge / Fine</td>
                          <td className="py-1 px-1.5 text-right font-mono">
                            +{formatCurrency(Number(challan.fine)).replace("PKR", "").trim()}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-800 font-extrabold text-slate-900 bg-slate-50">
                        <td className="py-1.5 px-1.5">Total Payable</td>
                        <td className="py-1.5 px-1.5 text-right font-mono text-[11px] text-blue-900">
                          {formatCurrency(totalNum)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Amount in words */}
                <div className="mt-2 p-1.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-semibold text-slate-700 italic">
                  Amount: {amountWords}
                </div>
              </div>

              {/* Bottom Instructions & Signatures */}
              <div className="pt-4 space-y-4">
                <div className="text-[8px] text-slate-500 leading-tight">
                  <p>• Late fee fine of PKR 200 applicable after due date.</p>
                  <p>• Depositable at any online HBL / 1Link branch counter.</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-6 border-t border-slate-300 text-center text-[9px]">
                  <div>
                    <div className="border-b border-slate-400 pb-4 mb-1" />
                    <span className="text-slate-500 block">Bank Officer / Stamp</span>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 pb-4 mb-1" />
                    <span className="text-slate-500 block">Accounts Officer</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
