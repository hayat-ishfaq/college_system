"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { ChallanService } from "@/services/challan.service";
import { generateBulkChallanSchema, recordPaymentSchema } from "@/lib/validations/challan.schema";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function generateBulkChallansAction(formData: FormData): Promise<ActionResult<any>> {
  const session = await requireAdmin();

  const rawData = {
    classId: formData.get("classId"),
    sectionId: formData.get("sectionId") || null,
    month: Number(formData.get("month")),
    year: Number(formData.get("year")),
    academicYearId: formData.get("academicYearId"),
    dueDate: formData.get("dueDate"),
    issueDate: formData.get("issueDate") || undefined,
    discount: Number(formData.get("discount") || 0),
    fine: Number(formData.get("fine") || 0),
    remarks: formData.get("remarks") || null,
  };

  const parsed = generateBulkChallanSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    const result = await ChallanService.generateBulkChallans(parsed.data, session.user.id);
    revalidatePath("/admin/challans");
    return {
      success: true,
      message: `✅ Challans Generated — ${result.generated} new, ${result.alreadyExisted} already existed, ${result.failed} failed.`,
      data: result,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to generate challans." };
  }
}

export async function recordPaymentAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();

  const rawData = {
    challanId: formData.get("challanId"),
    paymentDate: formData.get("paymentDate"),
    amountReceived: Number(formData.get("amountReceived")),
    paymentMethod: formData.get("paymentMethod") || "CASH",
    transactionRef: formData.get("transactionRef") || null,
    remarks: formData.get("remarks") || null,
  };

  const parsed = recordPaymentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    await ChallanService.recordPayment(parsed.data, session.user.id);
    revalidatePath("/admin/challans");
    return { success: true, message: "Payment recorded and challan marked as PAID." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to record payment." };
  }
}

export async function cancelChallanAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await ChallanService.cancelChallan(id, session.user.id);
    revalidatePath("/admin/challans");
    return { success: true, message: "Challan cancelled successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to cancel challan." };
  }
}
