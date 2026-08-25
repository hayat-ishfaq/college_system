"use server";

import { requireTeacher } from "@/lib/auth/permissions";
import { ResultService } from "@/services/result.service";
import { saveMarksSchema } from "@/lib/validations/mark.schema";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function saveMarksAction(
  formData: FormData
): Promise<ActionResult<any>> {
  const session = await requireTeacher();

  const rawMarksJson = formData.get("marksJson") as string;
  let marks = [];
  try {
    marks = JSON.parse(rawMarksJson || "[]");
  } catch {
    return { success: false, error: "Invalid marks format." };
  }

  const rawData = {
    examScheduleId: formData.get("examScheduleId"),
    marks,
  };

  const parsed = saveMarksSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
    };
  }

  try {
    const result = await ResultService.saveMarks(parsed.data, session.user.id);
    revalidatePath("/teacher/marks");
    revalidatePath("/admin/results");
    revalidatePath("/student/results");
    return {
      success: true,
      message: `Marks recorded successfully for ${result.savedCount} students.`,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to save marks.",
    };
  }
}
