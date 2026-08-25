"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { ExamService } from "@/services/exam.service";
import { createExamSchema, examScheduleSchema } from "@/lib/validations/exam.schema";
import { ExamStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function createExamAction(formData: FormData): Promise<ActionResult<any>> {
  const session = await requireAdmin();

  const rawData = {
    name: formData.get("name"),
    type: formData.get("type"),
    academicYearId: formData.get("academicYearId"),
    classId: formData.get("classId") || null,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    status: (formData.get("status") as ExamStatus) || "DRAFT",
  };

  const parsed = createExamSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    const exam = await ExamService.createExam(parsed.data, session.user.id);
    revalidatePath("/admin/examinations");
    return { success: true, message: `Exam "${exam.name}" created successfully.`, data: exam };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create exam." };
  }
}

export async function updateExamStatusAction(id: string, status: ExamStatus): Promise<ActionResult<any>> {
  const session = await requireAdmin();
  try {
    const updated = await ExamService.updateExamStatus(id, status, session.user.id);
    revalidatePath("/admin/examinations");
    return { success: true, message: `Exam status updated to ${status}.`, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update exam status." };
  }
}

export async function deleteExamAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await ExamService.deleteExam(id, session.user.id);
    revalidatePath("/admin/examinations");
    return { success: true, message: "Exam deleted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete exam." };
  }
}

export async function createExamScheduleAction(formData: FormData): Promise<ActionResult<any>> {
  const session = await requireAdmin();

  const rawData = {
    examId: formData.get("examId"),
    sectionId: formData.get("sectionId"),
    subjectId: formData.get("subjectId"),
    teacherAssignmentId: formData.get("teacherAssignmentId") || null,
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    room: formData.get("room") || null,
    maxMarks: Number(formData.get("maxMarks")),
  };

  const parsed = examScheduleSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    const schedule = await ExamService.createExamSchedule(parsed.data, session.user.id);
    revalidatePath("/admin/examinations");
    return { success: true, message: `Paper scheduled for ${schedule.subject.name}.`, data: schedule };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to schedule exam paper." };
  }
}

export async function toggleScheduleLockAction(id: string, isLocked: boolean): Promise<ActionResult<any>> {
  const session = await requireAdmin();
  try {
    const updated = await ExamService.toggleScheduleLock(id, isLocked, session.user.id);
    revalidatePath("/admin/examinations");
    return { success: true, message: `Marks entry ${isLocked ? "locked" : "unlocked"}.`, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle lock status." };
  }
}

export async function deleteExamScheduleAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await ExamService.deleteExamSchedule(id, session.user.id);
    revalidatePath("/admin/examinations");
    return { success: true, message: "Exam paper schedule removed." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to remove schedule." };
  }
}
