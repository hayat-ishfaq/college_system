import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { FinancialReportsClient } from "./FinancialReportsClient";
import { serializeData } from "@/lib/utils";

export const metadata = {
  title: "Financial Reports & Analytics",
};

async function getReportData(month: number, year: number) {
  // Aggregate stats for the given month/year
  const [allChallans, paidChallans, classes] = await Promise.all([
    prisma.challan.findMany({
      where: { month, year },
      include: {
        student: {
          include: { section: { include: { class: true } } },
        },
        payment: true,
      },
    }),
    prisma.challan.findMany({
      where: { month, year, status: "PAID" },
      include: { payment: true },
    }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalBilled = allChallans.reduce((acc, c) => acc + Number(c.totalAmount), 0);
  const totalCollected = paidChallans.reduce(
    (acc, c) => acc + Number(c.payment?.amountReceived || 0),
    0
  );
  const totalPending = allChallans
    .filter((c) => c.status === "UNPAID" || c.status === "OVERDUE")
    .reduce((acc, c) => acc + Number(c.totalAmount), 0);

  // Class-wise breakdown
  const classWise: Record<string, {
    className: string;
    billed: number;
    collected: number;
    pending: number;
    total: number;
    paid: number;
  }> = {};

  for (const challan of allChallans) {
    const cls = challan.student?.section?.class;
    if (!cls) continue;
    if (!classWise[cls.id]) {
      classWise[cls.id] = {
        className: cls.name,
        billed: 0,
        collected: 0,
        pending: 0,
        total: 0,
        paid: 0,
      };
    }
    classWise[cls.id].billed += Number(challan.totalAmount);
    classWise[cls.id].total++;
    if (challan.status === "PAID") {
      classWise[cls.id].collected += Number(challan.payment?.amountReceived || 0);
      classWise[cls.id].paid++;
    } else if (challan.status === "UNPAID" || challan.status === "OVERDUE") {
      classWise[cls.id].pending += Number(challan.totalAmount);
    }
  }

  return {
    totalBilled,
    totalCollected,
    totalPending,
    recoveryRate: totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0,
    totalChallans: allChallans.length,
    paidCount: paidChallans.length,
    unpaidCount: allChallans.filter((c) => c.status === "UNPAID").length,
    overdueCount: allChallans.filter((c) => c.status === "OVERDUE").length,
    classWise: Object.values(classWise).sort((a, b) => b.billed - a.billed),
    allChallans,
  };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const now = new Date();
  const month = Number(params.month || now.getMonth() + 1);
  const year = Number(params.year || now.getFullYear());

  const reportData = await getReportData(month, year);

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Financial Reports"
        description="Monthly fee collection analytics, recovery rates, and class-wise revenue breakdown."
      />
      <FinancialReportsClient
        {...reportData}
        allChallans={serializeData(reportData.allChallans) as any}
        selectedMonth={month}
        selectedYear={year}
      />
    </div>
  );
}
