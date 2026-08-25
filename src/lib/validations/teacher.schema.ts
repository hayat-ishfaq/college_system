import { z } from "zod";
import { Gender } from "@prisma/client";

export const createTeacherSchema = z.object({
  firstName: z.string().min(2, "First name is required").max(50),
  lastName: z.string().min(2, "Last name is required").max(50),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional().nullable(),
  employeeId: z.string().optional().nullable(),
  qualification: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  joiningDate: z.string().or(z.date()).optional().nullable(),
});

export const updateTeacherSchema = createTeacherSchema.extend({
  id: z.string(),
  isActive: z.boolean().optional(),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
