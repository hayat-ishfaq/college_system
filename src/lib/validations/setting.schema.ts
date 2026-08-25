import { z } from "zod";

export const institutionSettingsSchema = z.object({
  institution_name: z.string().min(2, "Institution name is required"),
  tagline: z.string().optional().nullable(),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Contact phone is required"),
  address: z.string().min(5, "Address is required"),
  website: z.string().optional().nullable(),
  bank_name: z.string().min(2, "Bank name is required"),
  bank_account_title: z.string().min(2, "Account title is required"),
  bank_account_no: z.string().min(5, "Account number is required"),
  bank_branch_code: z.string().min(2, "Branch code is required"),
  currency_symbol: z.string().default("PKR"),
  min_attendance_percentage: z.coerce.number().min(1).max(100).default(75),
  passing_percentage: z.coerce.number().min(1).max(100).default(40),
});

export const createAcademicYearSchema = z.object({
  name: z.string().min(4, "Session name is required (e.g. 2026-2027)"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  isCurrent: z.boolean().default(false),
});

export type InstitutionSettingsInput = z.infer<typeof institutionSettingsSchema>;
export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;
