"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { TeacherService } from "@/services/teacher.service";
import {
  createTeacherSchema,
  updateTeacherSchema,
} from "@/lib/validations/teacher.schema";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function createTeacherAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();

  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    employeeId: formData.get("employeeId") || undefined,
    qualification: formData.get("qualification") || undefined,
    specialization: formData.get("specialization") || undefined,
    gender: (formData.get("gender") as any) || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    joiningDate: formData.get("joiningDate") || undefined,
  };

  const parsed = createTeacherSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    await TeacherService.createTeacher(parsed.data, session.user.id);
    revalidatePath("/admin/teachers");
    return { success: true, message: "Faculty member registered successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create teacher." };
  }
}

export async function updateTeacherAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();

  const rawData = {
    id: formData.get("id"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    qualification: formData.get("qualification") || undefined,
    specialization: formData.get("specialization") || undefined,
    gender: (formData.get("gender") as any) || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    isActive: formData.get("isActive") === "true",
  };

  const parsed = updateTeacherSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    await TeacherService.updateTeacher(parsed.data, session.user.id);
    revalidatePath("/admin/teachers");
    return { success: true, message: "Faculty profile updated successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update teacher." };
  }
}

export async function toggleTeacherStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await TeacherService.toggleStatus(id, isActive, session.user.id);
    revalidatePath("/admin/teachers");
    return {
      success: true,
      message: `Teacher ${isActive ? "activated" : "deactivated"} successfully.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to change status." };
  }
}

export async function deleteTeacherAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await TeacherService.deleteTeacher(id, session.user.id);
    revalidatePath("/admin/teachers");
    return { success: true, message: "Teacher deleted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete teacher." };
  }
}
