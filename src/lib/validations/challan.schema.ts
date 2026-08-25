import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

export const generateBulkChallanSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  sectionId: z.string().optional().nullable(),
  month: z.coerce.number().int().min(1).max(12, "Month must be between 1 and 12"),
  year: z.coerce.number().int().min(2020).max(2040),
  academicYearId: z.string().min(1, "Academic Year is required"),
  dueDate: z.string().or(z.date()),
  issueDate: z.string().or(z.date()).optional(),
  discount: z.coerce.number().min(0).default(0),
  fine: z.coerce.number().min(0).default(0),
  remarks: z.string().optional().nullable(),
});

export const recordPaymentSchema = z.object({
  challanId: z.string().min(1, "Challan ID is required"),
  paymentDate: z.string().or(z.date()),
  amountReceived: z.coerce.number().positive("Amount received must be greater than 0"),
  paymentMethod: z.enum(["CASH", "BANK", "ONLINE", "OTHER"]).default("CASH"),
  transactionRef: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export type GenerateBulkChallanInput = z.infer<typeof generateBulkChallanSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
