import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters").max(50),
  description: z.string().optional(),
});

export const updateClassSchema = createClassSchema.extend({
  id: z.string(),
  isActive: z.boolean().optional(),
});

export const createSectionSchema = z.object({
  name: z.string().min(1, "Section name is required").max(10),
  classId: z.string().min(1, "Class is required"),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  room: z.string().optional().nullable(),
});

export const updateSectionSchema = createSectionSchema.extend({
  id: z.string(),
  isActive: z.boolean().optional(),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
