import { requireStudent } from "@/lib/auth/permissions";
import { ChallanService } from "@/services/challan.service";
import { TriplicateChallanView } from "@/components/pdf/TriplicateChallanView";
import { notFound, redirect } from "next/navigation";
import { serializeData } from "@/lib/utils";

export const metadata = {
  title: "My Fee Challan",
};

export default async function StudentChallanPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireStudent();
  const { id } = await params;

  const challan = await ChallanService.getChallanById(id);
  if (!challan) notFound();

  // Strict ownership authorization
  if (challan.student.userId !== session.user.id) {
    redirect("/student/challans");
  }

  return (
    <TriplicateChallanView
      challan={serializeData(challan)}
      backUrl="/student/challans"
    />
  );
}
