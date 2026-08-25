import { prisma } from "@/lib/db";
import { AttendanceStatus } from "@prisma/client";
import type { MarkAttendanceInput } from "@/lib/validations/attendance.schema";

export interface AttendanceFilterParams {
  sectionId?: string;
  classId?: string;
  studentId?: string;
  date?: string;       // ISO date string
  month?: number;
  year?: number;
  status?: AttendanceStatus;
  academicYearId?: string;
}

export interface MonthlyAttendanceSummary {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  rollNumber: string | null;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
}

export class AttendanceService {
  /**
   * Get today's attendance roster for a given section.
   * Returns students with their attendance record if it exists.
   */
  static async getDailyRoster(sectionId: string, date: string) {
    const dateObj = new Date(date);
    dateObj.setUTCHours(0, 0, 0, 0);

    const students = await prisma.student.findMany({
      where: { sectionId, isActive: true },
      orderBy: [{ rollNumber: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
        rollNumber: true,
        profilePhoto: true,
        attendances: {
          where: { date: dateObj },
          select: { id: true, status: true, remarks: true },
          take: 1,
        },
      },
    });

    return students.map((s) => ({
      ...s,
      attendance: s.attendances[0] || null,
    }));
  }

  /**
   * Mark / overwrite attendance for a full section on a given date.
   * Uses upsert per student to allow re-marking.
   */
  static async markDailyAttendance(
    data: MarkAttendanceInput,
    markedById?: string
  ) {
    const dateObj = new Date(data.date);
    dateObj.setUTCHours(0, 0, 0, 0);

    const results = await Promise.allSettled(
      data.records.map((record) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date: dateObj,
            },
          },
          update: {
            status: record.status,
            remarks: record.remarks || null,
            markedById: markedById || null,
          },
          create: {
            studentId: record.studentId,
            sectionId: data.sectionId,
            academicYearId: data.academicYearId,
            date: dateObj,
            status: record.status,
            remarks: record.remarks || null,
            markedById: markedById || null,
          },
        })
      )
    );

    const saved = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (markedById) {
      await prisma.auditLog.create({
        data: {
          userId: markedById,
          action: "ATTENDANCE_MARKED",
          entity: "Attendance",
          details: `Marked attendance for section ${data.sectionId} on ${data.date}: ${saved} saved, ${failed} failed.`,
        },
      });
    }

    return { saved, failed, total: data.records.length };
  }

  /**
   * Get attendance records for a section, filtered by date range or month.
   */
  static async getSectionAttendance(params: AttendanceFilterParams) {
    const where: any = {};

    if (params.sectionId) where.sectionId = params.sectionId;
    if (params.studentId) where.studentId = params.studentId;
    if (params.status) where.status = params.status;

    if (params.date) {
      const d = new Date(params.date);
      d.setUTCHours(0, 0, 0, 0);
      where.date = d;
    } else if (params.month && params.year) {
      const start = new Date(Date.UTC(params.year, params.month - 1, 1));
      const end = new Date(Date.UTC(params.year, params.month, 0, 23, 59, 59));
      where.date = { gte: start, lte: end };
    }

    if (params.classId && !params.sectionId) {
      where.section = { classId: params.classId };
    }

    return prisma.attendance.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "asc" }],
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true,
            rollNumber: true,
            section: { select: { name: true, class: { select: { name: true } } } },
          },
        },
      },
    });
  }

  /**
   * Calculate monthly attendance summary for a section.
   */
  static async getMonthlySummary(
    sectionId: string,
    month: number,
    year: number
  ): Promise<MonthlyAttendanceSummary[]> {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const students = await prisma.student.findMany({
      where: { sectionId, isActive: true },
      orderBy: [{ rollNumber: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
        rollNumber: true,
        attendances: {
          where: {
            sectionId,
            date: { gte: start, lte: end },
          },
          select: { status: true },
        },
      },
    });

    return students.map((s) => {
      const present = s.attendances.filter((a) => a.status === AttendanceStatus.PRESENT).length;
      const absent = s.attendances.filter((a) => a.status === AttendanceStatus.ABSENT).length;
      const late = s.attendances.filter((a) => a.status === AttendanceStatus.LATE).length;
      const leave = s.attendances.filter((a) => a.status === AttendanceStatus.LEAVE).length;
      const totalDays = s.attendances.length;
      // Present + Late count as present for percentage
      const percentage = totalDays > 0 ? Math.round(((present + late) / totalDays) * 100) : 0;

      return {
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        admissionNumber: s.admissionNumber,
        rollNumber: s.rollNumber,
        totalDays,
        present,
        absent,
        late,
        leave,
        percentage,
      };
    });
  }

  /**
   * Get a student's monthly attendance summary for the student portal.
   */
  static async getStudentMonthlySummary(studentId: string) {
    const attendances = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      select: { date: true, status: true, remarks: true },
    });

    // Group by month/year
    const byMonth: Record<string, {
      month: number; year: number; present: number; absent: number; late: number; leave: number; total: number;
    }> = {};

    for (const a of attendances) {
      const d = new Date(a.date);
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
      if (!byMonth[key]) {
        byMonth[key] = {
          month: d.getUTCMonth() + 1,
          year: d.getUTCFullYear(),
          present: 0, absent: 0, late: 0, leave: 0, total: 0,
        };
      }
      byMonth[key].total++;
      byMonth[key][a.status.toLowerCase() as "present" | "absent" | "late" | "leave"]++;
    }

    return {
      records: attendances,
      monthly: Object.values(byMonth).sort((a, b) => b.year - a.year || b.month - a.month),
    };
  }

  /**
   * Get the overall attendance percentage for a student.
   */
  static async getStudentAttendanceStats(studentId: string) {
    const [total, present, absent, late, leave] = await Promise.all([
      prisma.attendance.count({ where: { studentId } }),
      prisma.attendance.count({ where: { studentId, status: AttendanceStatus.PRESENT } }),
      prisma.attendance.count({ where: { studentId, status: AttendanceStatus.ABSENT } }),
      prisma.attendance.count({ where: { studentId, status: AttendanceStatus.LATE } }),
      prisma.attendance.count({ where: { studentId, status: AttendanceStatus.LEAVE } }),
    ]);

    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { total, present, absent, late, leave, percentage };
  }
}
