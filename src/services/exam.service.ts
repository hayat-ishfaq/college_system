import { prisma } from "@/lib/db";
import { ExamStatus } from "@prisma/client";
import type {
  CreateExamInput,
  ExamScheduleInput,
} from "@/lib/validations/exam.schema";

export class ExamService {
  static async getAllExams(filter?: {
    academicYearId?: string;
    classId?: string;
    status?: ExamStatus;
  }) {
    const where: any = {};
    if (filter?.academicYearId) where.academicYearId = filter.academicYearId;
    if (filter?.classId) where.classId = filter.classId;
    if (filter?.status) where.status = filter.status;

    return prisma.exam.findMany({
      where,
      orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
      include: {
        academicYear: true,
        class: true,
        examSchedules: {
          include: {
            section: true,
            subject: true,
            _count: { select: { marks: true } },
          },
        },
      },
    });
  }

  static async getExamById(id: string) {
    return prisma.exam.findUnique({
      where: { id },
      include: {
        academicYear: true,
        class: true,
        examSchedules: {
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
          include: {
            section: { include: { class: true } },
            subject: true,
            teacherAssignment: {
              include: { teacher: true },
            },
            marks: {
              include: { student: true },
            },
          },
        },
      },
    });
  }

  static async createExam(data: CreateExamInput, userId?: string) {
    const exam = await prisma.exam.create({
      data: {
        name: data.name,
        type: data.type,
        academicYearId: data.academicYearId,
        classId: data.classId || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status,
      },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "EXAM_CREATED",
          entity: "Exam",
          entityId: exam.id,
          details: `Created examination term "${exam.name}" (${exam.type}).`,
        },
      });
    }

    return exam;
  }

  static async updateExamStatus(
    id: string,
    status: ExamStatus,
    userId?: string
  ) {
    const updated = await prisma.exam.update({
      where: { id },
      data: { status },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "EXAM_STATUS_UPDATED",
          entity: "Exam",
          entityId: id,
          details: `Updated exam status to ${status}.`,
        },
      });
    }

    return updated;
  }

  static async deleteExam(id: string, userId?: string) {
    const deleted = await prisma.exam.delete({
      where: { id },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "EXAM_DELETED",
          entity: "Exam",
          entityId: id,
          details: `Deleted examination "${deleted.name}".`,
        },
      });
    }

    return deleted;
  }

  static async createExamSchedule(data: ExamScheduleInput, userId?: string) {
    // Check if slot already exists
    const existing = await prisma.examSchedule.findUnique({
      where: {
        examId_sectionId_subjectId: {
          examId: data.examId,
          sectionId: data.sectionId,
          subjectId: data.subjectId,
        },
      },
    });

    if (existing) {
      throw new Error(
        "A schedule paper for this subject in this section already exists for this exam."
      );
    }

    const schedule = await prisma.examSchedule.create({
      data: {
        examId: data.examId,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        teacherAssignmentId: data.teacherAssignmentId || null,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room || null,
        maxMarks: data.maxMarks,
      },
      include: {
        subject: true,
        section: true,
      },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "EXAM_SCHEDULE_CREATED",
          entity: "ExamSchedule",
          entityId: schedule.id,
          details: `Scheduled ${schedule.subject.name} for Section ${schedule.section.name} (Max: ${schedule.maxMarks}).`,
        },
      });
    }

    return schedule;
  }

  static async toggleScheduleLock(
    id: string,
    isLocked: boolean,
    userId?: string
  ) {
    const updated = await prisma.examSchedule.update({
      where: { id },
      data: { isLocked },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: isLocked ? "EXAM_MARKS_LOCKED" : "EXAM_MARKS_UNLOCKED",
          entity: "ExamSchedule",
          entityId: id,
          details: `${isLocked ? "Locked" : "Unlocked"} mark entry for paper.`,
        },
      });
    }

    return updated;
  }

  static async deleteExamSchedule(id: string, userId?: string) {
    const deleted = await prisma.examSchedule.delete({
      where: { id },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "EXAM_SCHEDULE_DELETED",
          entity: "ExamSchedule",
          entityId: id,
          details: `Removed exam paper schedule.`,
        },
      });
    }

    return deleted;
  }
}
