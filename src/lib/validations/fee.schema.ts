import { z } from "zod";
import { FeeType } from "@prisma/client";

export const feeItemSchema = z.object({
  name: z.string().min(2, "Fee head title is required").max(100),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  isOptional: z.boolean().default(false),
  description: z.string().optional().nullable(),
});

export const createFeeStructureSchema = z.object({
  name: z.string().min(2, "Fee structure name is required").max(100),
  classId: z.string().min(1, "Class is required"),
  academicYearId: z.string().min(1, "Academic Year is required"),
  feeType: z.nativeEnum(FeeType).default(FeeType.MONTHLY),
  effectiveDate: z.string().or(z.date()).optional(),
  items: z.array(feeItemSchema).min(1, "At least one fee item is required"),
});

export const updateFeeStructureSchema = createFeeStructureSchema.extend({
  id: z.string(),
  isActive: z.boolean().optional(),
});

export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>;
export type UpdateFeeStructureInput = z.infer<typeof updateFeeStructureSchema>;
export type FeeItemInput = z.infer<typeof feeItemSchema>;
