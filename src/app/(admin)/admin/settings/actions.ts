"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { SettingService } from "@/services/setting.service";
import {
  institutionSettingsSchema,
  createAcademicYearSchema,
} from "@/lib/validations/setting.schema";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function saveInstitutionSettingsAction(
  formData: FormData
): Promise<ActionResult<any>> {
  const session = await requireAdmin();

  const rawData = {
    institution_name: formData.get("institution_name"),
    tagline: formData.get("tagline") || null,
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    website: formData.get("website") || null,
    bank_name: formData.get("bank_name"),
    bank_account_title: formData.get("bank_account_title"),
    bank_account_no: formData.get("bank_account_no"),
    bank_branch_code: formData.get("bank_branch_code"),
    currency_symbol: formData.get("currency_symbol") || "PKR",
    min_attendance_percentage: Number(formData.get("min_attendance_percentage")),
    passing_percentage: Number(formData.get("passing_percentage")),
  };

  const parsed = institutionSettingsSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
    };
  }

  try {
    const updated = await SettingService.saveSettings(parsed.data, session.user.id);
    revalidatePath("/admin/settings");
    return { success: true, message: "Institution settings saved successfully.", data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save settings." };
  }
}

export async function createAcademicYearAction(
  formData: FormData
): Promise<ActionResult<any>> {
  const session = await requireAdmin();

  const rawData = {
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isCurrent: formData.get("isCurrent") === "true",
  };

  const parsed = createAcademicYearSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
    };
  }

  try {
    const year = await SettingService.createAcademicYear(parsed.data, session.user.id);
    revalidatePath("/admin/settings");
    revalidatePath("/admin/classes");
    revalidatePath("/admin/challans");
    return { success: true, message: `Academic session "${year.name}" created.`, data: year };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create academic year." };
  }
}

export async function setActiveAcademicYearAction(id: string): Promise<ActionResult<any>> {
  const session = await requireAdmin();
  try {
    await SettingService.setActiveAcademicYear(id, session.user.id);
    revalidatePath("/admin/settings");
    revalidatePath("/admin/classes");
    revalidatePath("/admin/challans");
    return { success: true, message: "Active academic session updated." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to set active session." };
  }
}
