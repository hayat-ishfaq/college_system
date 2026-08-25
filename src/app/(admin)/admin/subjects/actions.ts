"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { SubjectService } from "@/services/subject.service";
import {
  createSubjectSchema,
  updateSubjectSchema,
} from "@/lib/validations/subject.schema";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function createSubjectAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();

  const rawData = {
    code: formData.get("code"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    creditHours: formData.get("creditHours") || undefined,
  };

  const parsed = createSubjectSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    await SubjectService.createSubject(parsed.data, session.user.id);
    revalidatePath("/admin/subjects");
    return { success: true, message: "Subject created successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create subject." };
  }
}

export async function updateSubjectAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();

  const rawData = {
    id: formData.get("id"),
    code: formData.get("code"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    creditHours: formData.get("creditHours") || undefined,
    isActive: formData.get("isActive") === "true",
  };

  const parsed = updateSubjectSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    await SubjectService.updateSubject(parsed.data, session.user.id);
    revalidatePath("/admin/subjects");
    return { success: true, message: "Subject updated successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update subject." };
  }
}

export async function deleteSubjectAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await SubjectService.deleteSubject(id, session.user.id);
    revalidatePath("/admin/subjects");
    return { success: true, message: "Subject deleted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete subject." };
  }
}
