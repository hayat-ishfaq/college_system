"use server";

import { requireTeacher } from "@/lib/auth/permissions";
import { AttendanceService } from "@/services/attendance.service";
import { markAttendanceSchema } from "@/lib/validations/attendance.schema";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function markAttendanceAction(
  formData: FormData
): Promise<ActionResult<any>> {
  const session = await requireTeacher();

  const rawRecordsJson = formData.get("recordsJson") as string;
  let records = [];
  try {
    records = JSON.parse(rawRecordsJson || "[]");
  } catch {
    return { success: false, error: "Invalid attendance records format." };
  }

  const rawData = {
    sectionId: formData.get("sectionId"),
    date: formData.get("date"),
    academicYearId: formData.get("academicYearId"),
    records,
  };

  const parsed = markAttendanceSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
    };
  }

  try {
    const result = await AttendanceService.markDailyAttendance(
      parsed.data,
      session.user.id
    );
    revalidatePath("/teacher/attendance");
    revalidatePath("/admin/attendance");
    return {
      success: true,
      message: `Attendance saved — ${result.saved}/${result.total} records recorded.`,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to save attendance.",
    };
  }
}
