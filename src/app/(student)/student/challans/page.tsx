import { requireStudent } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { ChallanStatus } from "@prisma/client";
import Link from "next/link";
import { formatCurrency, formatDate, getMonthName } from "@/lib/utils";
import { Printer, BadgeCheck, Clock, AlertTriangle, XCircle, Receipt } from "lucide-react";

export const metadata = {
  title: "My Fee Challans",
};

const STATUS_CONFIG: Record<ChallanStatus, { label: string; className: string; icon: any }> = {
  PAID: { label: "Paid", className: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: BadgeCheck },
  UNPAID: { label: "Unpaid", className: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock },
  OVERDUE: { label: "Overdue", className: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-500 border-slate-200", icon: XCircle },
};

export default async function StudentChallansPage() {
  const session = await requireStudent();

  const student = await prisma.student.findFirst({
    where: { userId: session.user.id },
    include: {
      section: { include: { class: true } },
    },
  });

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No student record found for your account. Please contact the admin.</p>
      </div>
    );
  }

  const challans = await prisma.challan.findMany({
    where: { studentId: student.id },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: {
      challanItems: true,
      payment: true,
      academicYear: true,
    },
  });

  const totalBilled = challans.reduce((a, c) => a + Number(c.totalAmount), 0);
  const totalPaid = challans.filter((c) => c.status === "PAID").reduce((a, c) => a + Number(c.payment?.amountReceived || 0), 0);
  const totalDue = challans.filter((c) => c.status === "UNPAID" || c.status === "OVERDUE").reduce((a, c) => a + Number(c.totalAmount), 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Fee Challans</h1>
        <p className="text-sm text-slate-500 mt-1">
          {student.firstName} {student.lastName} — {student.section?.class.name} · {student.section?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5">
          <div className="text-xs font-bold text-blue-600 uppercase mb-1">Total Billed</div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{formatCurrency(totalBilled)}</div>
          <div className="text-xs text-slate-400">{challans.length} challans issued</div>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-5">
          <div className="text-xs font-bold text-emerald-600 uppercase mb-1">Total Paid</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-700">{formatCurrency(totalPaid)}</div>
          <div className="text-xs text-slate-400">{challans.filter((c) => c.status === "PAID").length} challans cleared</div>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
          <div className="text-xs font-bold text-amber-600 uppercase mb-1">Amount Due</div>
          <div className="text-2xl font-extrabold font-mono text-amber-700">{formatCurrency(totalDue)}</div>
          <div className="text-xs text-slate-400">{challans.filter((c) => c.status === "UNPAID" || c.status === "OVERDUE").length} challans pending</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Challan History</h2>
        </div>

        {challans.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No challans issued to your account yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {challans.map((challan) => {
              const cfg = STATUS_CONFIG[challan.status as ChallanStatus] || STATUS_CONFIG.UNPAID;
              const StatusIcon = cfg.icon;
              return (
                <div key={challan.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl border ${cfg.className}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-blue-800">
                          {challan.challanNumber}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-800 mt-0.5">
                        {getMonthName(challan.month)} {challan.year} — {challan.academicYear.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Due: {formatDate(challan.dueDate)}
                        {challan.payment && (
                          <span className="ml-2 text-emerald-600 font-medium">
                            · Paid on {formatDate(challan.payment.paymentDate)} via {challan.payment.paymentMethod}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400">
                        {challan.challanItems.map((item) => (
                          <span key={item.id}>
                            {item.name}: {formatCurrency(Number(item.amount))}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-extrabold font-mono text-slate-900">
                        {formatCurrency(Number(challan.totalAmount))}
                      </div>
                    </div>
                    <Link
                      href={`/student/challans/${challan.id}/print`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
