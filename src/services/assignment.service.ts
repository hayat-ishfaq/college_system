import { prisma } from "@/lib/db";
import type {
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from "@/lib/validations/assignment.schema";

export class AssignmentService {
  static async getAllAssignments(filter?: {
    classId?: string;
    sectionId?: string;
    teacherId?: string;
    subjectId?: string;
    academicYearId?: string;
  }) {
    const where: any = {};

    if (filter?.classId) where.classId = filter.classId;
    if (filter?.sectionId) where.sectionId = filter.sectionId;
    if (filter?.teacherId) where.teacherId = filter.teacherId;
    if (filter?.subjectId) where.subjectId = filter.subjectId;
    if (filter?.academicYearId) where.academicYearId = filter.academicYearId;

    return prisma.teacherAssignment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        teacher: true,
        subject: true,
        class: true,
        section: true,
        academicYear: true,
      },
    });
  }

  static async createAssignment(
    data: CreateAssignmentInput,
    userId?: string
  ) {
    // 1. Check for duplicate assignment
    const existing = await prisma.teacherAssignment.findUnique({
      where: {
        teacherId_subjectId_classId_sectionId_academicYearId: {
          teacherId: data.teacherId,
          subjectId: data.subjectId,
          classId: data.classId,
          sectionId: data.sectionId,
          academicYearId: data.academicYearId,
        },
      },
    });

    if (existing) {
      throw new Error(
        "This teacher is already assigned to this Subject and Class Section for the selected Academic Year."
      );
    }

    const assignment = await prisma.teacherAssignment.create({
      data: {
        teacherId: data.teacherId,
        subjectId: data.subjectId,
        classId: data.classId,
        sectionId: data.sectionId,
        academicYearId: data.academicYearId,
      },
      include: {
        teacher: true,
        subject: true,
        class: true,
        section: true,
      },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "ASSIGNMENT_CREATED",
          entity: "TeacherAssignment",
          entityId: assignment.id,
          details: `Assigned ${assignment.teacher.firstName} ${assignment.teacher.lastName} to ${assignment.subject.name} in ${assignment.class.name}-${assignment.section.name}.`,
        },
      });
    }

    return assignment;
  }

  static async toggleStatus(id: string, isActive: boolean, userId?: string) {
    const updated = await prisma.teacherAssignment.update({
      where: { id },
      data: { isActive },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: isActive ? "ASSIGNMENT_ACTIVATED" : "ASSIGNMENT_DEACTIVATED",
          entity: "TeacherAssignment",
          entityId: id,
          details: `Assignment ${isActive ? "activated" : "deactivated"}.`,
        },
      });
    }

    return updated;
  }

  static async deleteAssignment(id: string, userId?: string) {
    const deleted = await prisma.teacherAssignment.delete({
      where: { id },
      include: {
        teacher: true,
        subject: true,
      },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "ASSIGNMENT_DELETED",
          entity: "TeacherAssignment",
          entityId: id,
          details: `Removed assignment of ${deleted.teacher.firstName} ${deleted.teacher.lastName} for ${deleted.subject.name}.`,
        },
      });
    }

    return deleted;
  }
}
