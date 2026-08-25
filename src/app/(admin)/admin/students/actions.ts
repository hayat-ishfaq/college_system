"use server";

import { requireAdmin } from "@/lib/auth/permissions";
import { StudentService } from "@/services/student.service";
import {
  createStudentSchema,
  updateStudentSchema,
} from "@/lib/validations/student.schema";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function createStudentAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();

  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    dateOfBirth: formData.get("dateOfBirth") || undefined,
    gender: (formData.get("gender") as any) || undefined,
    bloodGroup: (formData.get("bloodGroup") as any) || undefined,
    admissionNumber: formData.get("admissionNumber") || undefined,
    rollNumber: formData.get("rollNumber") || undefined,
    sectionId: formData.get("sectionId"),
    academicYearId: formData.get("academicYearId") || undefined,
    admissionDate: formData.get("admissionDate") || undefined,
    previousSchool: formData.get("previousSchool") || undefined,
    fatherName: formData.get("fatherName") || undefined,
    motherName: formData.get("motherName") || undefined,
    guardianName: formData.get("guardianName") || undefined,
    guardianPhone: formData.get("guardianPhone") || undefined,
    guardianEmail: formData.get("guardianEmail") || undefined,
    emergencyContact: formData.get("emergencyContact") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    province: formData.get("province") || undefined,
    postalCode: formData.get("postalCode") || undefined,
  };

  const parsed = createStudentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    const student = await StudentService.createStudent(parsed.data, session.user.id);
    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");
    return {
      success: true,
      message: `Student ${student.firstName} ${student.lastName} enrolled successfully (Admission #${student.admissionNumber}).`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to admit student." };
  }
}

export async function updateStudentAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();

  const rawData = {
    id: formData.get("id"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    dateOfBirth: formData.get("dateOfBirth") || undefined,
    gender: (formData.get("gender") as any) || undefined,
    bloodGroup: (formData.get("bloodGroup") as any) || undefined,
    rollNumber: formData.get("rollNumber") || undefined,
    sectionId: formData.get("sectionId"),
    previousSchool: formData.get("previousSchool") || undefined,
    fatherName: formData.get("fatherName") || undefined,
    motherName: formData.get("motherName") || undefined,
    guardianName: formData.get("guardianName") || undefined,
    guardianPhone: formData.get("guardianPhone") || undefined,
    guardianEmail: formData.get("guardianEmail") || undefined,
    emergencyContact: formData.get("emergencyContact") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    province: formData.get("province") || undefined,
    postalCode: formData.get("postalCode") || undefined,
    isActive: formData.get("isActive") === "true",
  };

  const parsed = updateStudentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    await StudentService.updateStudent(parsed.data, session.user.id);
    revalidatePath("/admin/students");
    return { success: true, message: "Student record updated successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update student." };
  }
}

export async function toggleStudentStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await StudentService.toggleStatus(id, isActive, session.user.id);
    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");
    return {
      success: true,
      message: `Student status updated to ${isActive ? "Active" : "Inactive"}.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle status." };
  }
}

export async function deleteStudentAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  try {
    await StudentService.deleteStudent(id, session.user.id);
    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Student record deleted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete student." };
  }
}
