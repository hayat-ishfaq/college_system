import { z } from "zod";
import { ExamStatus } from "@prisma/client";

export const createExamSchema = z.object({
  name: z.string().min(2, "Exam title is required").max(100),
  type: z.string().min(2, "Exam type is required"), // e.g. "MID_TERM", "FINAL", "MONTHLY_TEST"
  academicYearId: z.string().min(1, "Academic Year is required"),
  classId: z.string().optional().nullable(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  status: z.nativeEnum(ExamStatus).default(ExamStatus.DRAFT),
});

export const examScheduleSchema = z.object({
  examId: z.string().min(1, "Exam is required"),
  sectionId: z.string().min(1, "Section is required"),
  subjectId: z.string().min(1, "Subject is required"),
  teacherAssignmentId: z.string().optional().nullable(),
  date: z.string().or(z.date()),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  room: z.string().optional().nullable(),
  maxMarks: z.coerce.number().int().positive("Max marks must be greater than 0"),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type ExamScheduleInput = z.infer<typeof examScheduleSchema>;
