"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { AssignmentService } from "@/services/assignment.service";
import { createAssignmentSchema } from "@/lib/validations/assignment.schema";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function createAssignmentAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();

  const rawData = {
    teacherId: formData.get("teacherId"),
    subjectId: formData.get("subjectId"),
    classId: formData.get("classId"),
    sectionId: formData.get("sectionId"),
    academicYearId: formData.get("academicYearId"),
  };

  const parsed = createAssignmentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    await AssignmentService.createAssignment(parsed.data, session.user.id);
    revalidatePath("/admin/assignments");
    revalidatePath("/teacher/classes");
    return { success: true, message: "Teacher assignment mapped successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create assignment." };
  }
}

export async function toggleAssignmentStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await AssignmentService.toggleStatus(id, isActive, session.user.id);
    revalidatePath("/admin/assignments");
    revalidatePath("/teacher/classes");
    return {
      success: true,
      message: `Assignment ${isActive ? "activated" : "deactivated"} successfully.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update status." };
  }
}

export async function deleteAssignmentAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await AssignmentService.deleteAssignment(id, session.user.id);
    revalidatePath("/admin/assignments");
    revalidatePath("/teacher/classes");
    return { success: true, message: "Assignment unmapped successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete assignment." };
  }
}
