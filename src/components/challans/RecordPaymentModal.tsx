"use client";

import React, { useState, useTransition } from "react";
import {
  X,
  Loader2,
  BadgeCheck,
  CreditCard,
  Banknote,
  Smartphone,
  University,
} from "lucide-react";
import { toast } from "sonner";
import { recordPaymentAction } from "@/app/(admin)/admin/challans/actions";
import { formatCurrency } from "@/lib/utils";

interface PaymentModalProps {
  challan: {
    id: string;
    challanNumber: string;
    totalAmount: any;
    student: { firstName: string; lastName: string; admissionNumber: string };
    month: number;
    year: number;
  } | null;
  onClose: () => void;
}

const MONTH_NAMES = [
  "","January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "BANK", label: "Bank Transfer", icon: University },
  { value: "ONLINE", label: "Online / EasyPaisa", icon: Smartphone },
  { value: "OTHER", label: "Cheque / Other", icon: CreditCard },
];

export function RecordPaymentModal({ challan, onClose }: PaymentModalProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedMethod, setSelectedMethod] = useState("CASH");

  if (!challan) return null;

  const today = new Date().toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await recordPaymentAction(formData);
      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Record Payment</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challan Summary */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Challan No:</span>
            <span className="font-mono font-bold text-blue-800">{challan.challanNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Student:</span>
            <span className="font-semibold text-slate-800">{challan.student.firstName} {challan.student.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fee Month:</span>
            <span className="font-bold text-slate-800">{MONTH_NAMES[challan.month]} {challan.year}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Amount Due:</span>
            <span className="font-extrabold text-lg text-emerald-700">{formatCurrency(Number(challan.totalAmount))}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <input type="hidden" name="challanId" value={challan.id} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date *</label>
              <input
                name="paymentDate"
                type="date"
                required
                defaultValue={today}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Received *</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">PKR</span>
                <input
                  name="amountReceived"
                  type="number"
                  required
                  min="1"
                  defaultValue={Number(challan.totalAmount)}
                  className="w-full pl-10 pr-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Payment Method *</label>
            <input type="hidden" name="paymentMethod" value={selectedMethod} />
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setSelectedMethod(method.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      selectedMethod === method.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {method.label}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedMethod !== "CASH" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transaction Reference / Cheque No.
              </label>
              <input
                name="transactionRef"
                type="text"
                placeholder="Enter transaction ID or cheque number"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks (Optional)</label>
            <textarea
              name="remarks"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Recording..." : "Confirm Payment ✓"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
