"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { ClassService } from "@/services/class.service";
import {
  createClassSchema,
  updateClassSchema,
  createSectionSchema,
  updateSectionSchema,
} from "@/lib/validations/class.schema";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function createClassAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  };

  const parsed = createClassSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    await ClassService.createClass(parsed.data, session.user.id);
    revalidatePath("/admin/classes");
    return { success: true, message: "Class created successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create class." };
  }
}

export async function updateClassAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();

  const rawData = {
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    isActive: formData.get("isActive") === "true",
  };

  const parsed = updateClassSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    await ClassService.updateClass(parsed.data, session.user.id);
    revalidatePath("/admin/classes");
    return { success: true, message: "Class updated successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update class." };
  }
}

export async function deleteClassAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await ClassService.deleteClass(id, session.user.id);
    revalidatePath("/admin/classes");
    return { success: true, message: "Class deleted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete class." };
  }
}

export async function createSectionAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();

  const rawData = {
    name: formData.get("name"),
    classId: formData.get("classId"),
    capacity: formData.get("capacity") || undefined,
    room: formData.get("room") || undefined,
  };

  const parsed = createSectionSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    await ClassService.createSection(parsed.data, session.user.id);
    revalidatePath("/admin/classes");
    return { success: true, message: "Section created successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create section." };
  }
}

export async function deleteSectionAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await ClassService.deleteSection(id, session.user.id);
    revalidatePath("/admin/classes");
    return { success: true, message: "Section deleted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete section." };
  }
}
