import { requireAdmin } from "@/lib/auth/permissions";
import { ChallanService } from "@/services/challan.service";
import { TriplicateChallanView } from "@/components/pdf/TriplicateChallanView";
import { notFound } from "next/navigation";
import { serializeData } from "@/lib/utils";

export const metadata = {
  title: "Triplicate Fee Challan Printable",
};

export default async function AdminChallanPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const challan = await ChallanService.getChallanById(id);
  if (!challan) notFound();

  return (
    <TriplicateChallanView
      challan={serializeData(challan)}
      backUrl="/admin/challans"
    />
  );
}
