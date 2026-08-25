"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { FeeService } from "@/services/fee.service";
import { createFeeStructureSchema } from "@/lib/validations/fee.schema";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function createFeeStructureAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();

  // Extract items from dynamic form
  const rawItemsJson = formData.get("itemsJson") as string;
  let items = [];
  try {
    items = JSON.parse(rawItemsJson || "[]");
  } catch {
    return { success: false, error: "Invalid fee items format." };
  }

  const rawData = {
    name: formData.get("name"),
    classId: formData.get("classId"),
    academicYearId: formData.get("academicYearId"),
    feeType: formData.get("feeType") || "MONTHLY",
    effectiveDate: formData.get("effectiveDate") || undefined,
    items,
  };

  const parsed = createFeeStructureSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    await FeeService.createFeeStructure(parsed.data, session.user.id);
    revalidatePath("/admin/fees");
    return { success: true, message: "Fee structure created successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create fee structure." };
  }
}

export async function toggleFeeStructureStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await FeeService.toggleStatus(id, isActive, session.user.id);
    revalidatePath("/admin/fees");
    return {
      success: true,
      message: `Fee structure ${isActive ? "activated" : "deactivated"} successfully.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle status." };
  }
}

export async function deleteFeeStructureAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await FeeService.deleteFeeStructure(id, session.user.id);
    revalidatePath("/admin/fees");
    return { success: true, message: "Fee structure deleted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete fee structure." };
  }
}
