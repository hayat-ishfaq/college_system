import { requireAdmin } from "@/lib/auth/permissions";
import { FeeService } from "@/services/fee.service";
import { ClassService } from "@/services/class.service";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeeStructureManagementClient } from "./FeeStructureManagementClient";
import { serializeData } from "@/lib/utils";

export const metadata = {
  title: "Fee Structures & Templates",
};

export default async function FeeStructuresPage() {
  await requireAdmin();

  const [feeStructures, classes, academicYears] = await Promise.all([
    FeeService.getAllFeeStructures(),
    ClassService.getAllClasses(),
    prisma.academicYear.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Fee Structure Templates"
        description="Define tuition fee heads, laboratory charges, assessment funds, and concessions across academic classes."
      />
      <FeeStructureManagementClient
        feeStructures={serializeData(feeStructures)}
        classes={serializeData(classes)}
        academicYears={serializeData(academicYears)}
      />
    </div>
  );
}
