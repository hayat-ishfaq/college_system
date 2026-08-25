import { z } from "zod";

export const studentMarkEntrySchema = z.object({
  studentId: z.string().min(1),
  obtainedMarks: z.coerce.number().min(0).optional().nullable(),
  isAbsent: z.boolean().default(false),
  remarks: z.string().optional().nullable(),
});

export const saveMarksSchema = z.object({
  examScheduleId: z.string().min(1, "Exam Schedule ID is required"),
  marks: z.array(studentMarkEntrySchema).min(1, "At least one mark entry is required"),
});

export type StudentMarkEntryInput = z.infer<typeof studentMarkEntrySchema>;
export type SaveMarksInput = z.infer<typeof saveMarksSchema>;
