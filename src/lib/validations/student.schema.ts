import { z } from "zod";
import { Gender, BloodGroup } from "@prisma/client";

export const createStudentSchema = z.object({
  // Personal Info
  firstName: z.string().min(2, "First name is required").max(50),
  lastName: z.string().min(2, "Last name is required").max(50),
  email: z.string().email("Valid email is required for student portal access"),
  dateOfBirth: z.string().or(z.date()).optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  bloodGroup: z.nativeEnum(BloodGroup).optional().nullable(),
  profilePhoto: z.string().optional().nullable(),

  // Academic Info
  admissionNumber: z.string().optional().nullable(),
  rollNumber: z.string().optional().nullable(),
  sectionId: z.string().min(1, "Class Section is required"),
  academicYearId: z.string().optional().nullable(),
  admissionDate: z.string().or(z.date()).optional().nullable(),
  previousSchool: z.string().optional().nullable(),

  // Guardian Info
  fatherName: z.string().optional().nullable(),
  motherName: z.string().optional().nullable(),
  guardianName: z.string().optional().nullable(),
  guardianPhone: z.string().optional().nullable(),
  guardianEmail: z.string().email().optional().nullable().or(z.literal("")),
  emergencyContact: z.string().optional().nullable(),

  // Address
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
});

export const updateStudentSchema = createStudentSchema.extend({
  id: z.string(),
  isActive: z.boolean().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
