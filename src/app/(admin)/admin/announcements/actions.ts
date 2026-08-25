"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { AnnouncementService } from "@/services/announcement.service";
import { createAnnouncementSchema } from "@/lib/validations/announcement.schema";
import { AnnouncementTarget, AnnouncementPriority } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function createAnnouncementAction(formData: FormData): Promise<ActionResult<any>> {
  const session = await requireAdmin();

  const rawData = {
    title: formData.get("title"),
    content: formData.get("content"),
    target: (formData.get("target") as AnnouncementTarget) || "EVERYONE",
    priority: (formData.get("priority") as AnnouncementPriority) || "NORMAL",
    publishDate: formData.get("publishDate") || undefined,
    expiryDate: formData.get("expiryDate") || null,
    isActive: formData.get("isActive") === "true" || true,
  };

  const parsed = createAnnouncementSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    const item = await AnnouncementService.createAnnouncement(parsed.data, session.user.id);
    revalidatePath("/admin/announcements");
    revalidatePath("/teacher/announcements");
    revalidatePath("/student/announcements");
    return { success: true, message: "Announcement published and notifications sent.", data: item };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to publish announcement." };
  }
}

export async function toggleAnnouncementStatusAction(id: string, isActive: boolean): Promise<ActionResult<any>> {
  const session = await requireAdmin();
  try {
    const updated = await AnnouncementService.toggleStatus(id, isActive, session.user.id);
    revalidatePath("/admin/announcements");
    revalidatePath("/teacher/announcements");
    revalidatePath("/student/announcements");
    return { success: true, message: `Announcement ${isActive ? "activated" : "deactivated"}.`, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle status." };
  }
}

export async function deleteAnnouncementAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await AnnouncementService.deleteAnnouncement(id, session.user.id);
    revalidatePath("/admin/announcements");
    revalidatePath("/teacher/announcements");
    revalidatePath("/student/announcements");
    return { success: true, message: "Announcement deleted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete announcement." };
  }
}
