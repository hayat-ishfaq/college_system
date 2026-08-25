import { requireAdmin } from "@/lib/auth/permissions";
import { ChallanService } from "@/services/challan.service";
import { ClassService } from "@/services/class.service";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChallanManagementClient } from "./ChallanManagementClient";
import { ChallanStatus } from "@prisma/client";
import { serializeData } from "@/lib/utils";

export const metadata = {
  title: "Fee Challans Management",
};

export default async function ChallansPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const page = Math.max(1, Number(params.page || 1));
  const filters = {
    search: params.search || "",
    classId: params.classId || "",
    sectionId: params.sectionId || "",
    month: params.month ? Number(params.month) : undefined,
    year: params.year ? Number(params.year) : undefined,
    status: (params.status as ChallanStatus | undefined) || undefined,
    page,
    pageSize: 15,
  };

  const [challansResult, classes, academicYears] = await Promise.all([
    ChallanService.getChallans(filters),
    ClassService.getAllClasses(),
    prisma.academicYear.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Fee Challans"
        description="Generate monthly fee challans in bulk, record payments, and print triplicate A4 challan copies."
      />
      <ChallanManagementClient
        challans={serializeData(challansResult.data)}
        total={challansResult.total}
        page={challansResult.page}
        totalPages={challansResult.totalPages}
        classes={serializeData(classes)}
        academicYears={serializeData(academicYears)}
        initialFilters={params}
      />
    </div>
  );
}
