import { z } from "zod";
import { AttendanceStatus } from "@prisma/client";

export const markAttendanceSchema = z.object({
  sectionId: z.string().min(1, "Section is required"),
  date: z.string().min(1, "Date is required"),
  academicYearId: z.string().min(1, "Academic Year is required"),
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.nativeEnum(AttendanceStatus),
      remarks: z.string().optional().nullable(),
    })
  ).min(1, "At least one student record is required"),
});

export const updateAttendanceRecordSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(AttendanceStatus),
  remarks: z.string().optional().nullable(),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type UpdateAttendanceRecordInput = z.infer<typeof updateAttendanceRecordSchema>;
