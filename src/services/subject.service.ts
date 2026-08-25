import { prisma } from "@/lib/db";
import type {
  CreateSubjectInput,
  UpdateSubjectInput,
} from "@/lib/validations/subject.schema";

export class SubjectService {
  static async getAllSubjects() {
    return prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            teacherAssignments: { where: { isActive: true } },
            examSchedules: true,
          },
        },
      },
    });
  }

  static async getSubjectById(id: string) {
    return prisma.subject.findUnique({
      where: { id },
      include: {
        teacherAssignments: {
          include: {
            teacher: true,
            class: true,
            section: true,
          },
        },
      },
    });
  }

  static async createSubject(data: CreateSubjectInput, userId?: string) {
    const existing = await prisma.subject.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new Error(`Subject with code "${data.code}" already exists.`);
    }

    const subject = await prisma.subject.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        creditHours: data.creditHours,
      },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "SUBJECT_CREATED",
          entity: "Subject",
          entityId: subject.id,
          details: `Subject "${subject.name}" (${subject.code}) created.`,
        },
      });
    }

    return subject;
  }

  static async updateSubject(data: UpdateSubjectInput, userId?: string) {
    const updated = await prisma.subject.update({
      where: { id: data.id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        creditHours: data.creditHours,
        isActive: data.isActive,
      },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "SUBJECT_UPDATED",
          entity: "Subject",
          entityId: updated.id,
          details: `Subject "${updated.name}" updated.`,
        },
      });
    }

    return updated;
  }

  static async deleteSubject(id: string, userId?: string) {
    const activeAssignments = await prisma.teacherAssignment.count({
      where: { subjectId: id },
    });

    if (activeAssignments > 0) {
      throw new Error(
        `Cannot delete subject. It has ${activeAssignments} active teacher assignment(s).`
      );
    }

    const deleted = await prisma.subject.delete({
      where: { id },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "SUBJECT_DELETED",
          entity: "Subject",
          entityId: id,
          details: `Subject "${deleted.name}" deleted.`,
        },
      });
    }

    return deleted;
  }
}
