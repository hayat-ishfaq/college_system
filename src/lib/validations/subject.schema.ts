import { z } from "zod";

export const createSubjectSchema = z.object({
  code: z
    .string()
    .min(2, "Subject code must be at least 2 characters")
    .max(20)
    .toUpperCase(),
  name: z.string().min(2, "Subject name must be at least 2 characters").max(100),
  description: z.string().optional().nullable(),
  creditHours: z.coerce.number().int().min(1).max(10).optional().nullable(),
});

export const updateSubjectSchema = createSubjectSchema.extend({
  id: z.string(),
  isActive: z.boolean().optional(),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
