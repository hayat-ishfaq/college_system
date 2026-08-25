import { requireAdmin } from "@/lib/auth/permissions";
import { AttendanceService } from "@/services/attendance.service";
import { ClassService } from "@/services/class.service";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdminAttendanceClient } from "./AdminAttendanceClient";
import { serializeData } from "@/lib/utils";

export const metadata = {
  title: "Attendance Management & Reports",
};

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const now = new Date();
  const month = Number(params.month || now.getMonth() + 1);
  const year = Number(params.year || now.getFullYear());
  const classId = params.classId || "";
  const sectionId = params.sectionId || "";
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = 20;

  const classes = await ClassService.getAllClasses();

  // If no section chosen, pick the first available section if present for monthly stats
  let effectiveSectionId = sectionId;
  if (!effectiveSectionId && classes.length > 0 && classes[0].sections.length > 0) {
    if (classId) {
      const selectedCls = classes.find((c) => c.id === classId);
      if (selectedCls && selectedCls.sections.length > 0) {
        effectiveSectionId = selectedCls.sections[0].id;
      }
    } else {
      effectiveSectionId = classes[0].sections[0].id;
    }
  }

  // Fetch monthly summary for the chosen section
  let monthlySummary: any[] = [];
  if (effectiveSectionId) {
    monthlySummary = await AttendanceService.getMonthlySummary(
      effectiveSectionId,
      month,
      year
    );
  }

  // Fetch daily records with pagination
  const dailyWhere: any = {};
  if (sectionId) dailyWhere.sectionId = sectionId;
  else if (classId) dailyWhere.section = { classId };

  if (params.date) {
    const d = new Date(params.date);
    d.setUTCHours(0, 0, 0, 0);
    dailyWhere.date = d;
  } else {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    dailyWhere.date = { gte: start, lte: end };
  }

  const [totalRecords, records] = await Promise.all([
    prisma.attendance.count({ where: dailyWhere }),
    prisma.attendance.findMany({
      where: dailyWhere,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ date: "desc" }, { createdAt: "asc" }],
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true,
            rollNumber: true,
            section: {
              select: {
                name: true,
                class: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Attendance Management"
        description="Monitor daily attendance rosters, section-wise monthly summaries, and export logs."
      />
      <AdminAttendanceClient
        records={serializeData(records)}
        monthlySummary={serializeData(monthlySummary)}
        classes={serializeData(classes)}
        selectedClassId={classId}
        selectedSectionId={effectiveSectionId}
        selectedMonth={month}
        selectedYear={year}
        initialFilters={params}
        totalRecords={totalRecords}
        page={page}
        totalPages={Math.ceil(totalRecords / pageSize)}
      />
    </div>
  );
}
