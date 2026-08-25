import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { generateEmployeeId } from "@/lib/utils";
import type {
  CreateTeacherInput,
  UpdateTeacherInput,
} from "@/lib/validations/teacher.schema";

export class TeacherService {
  static async getAllTeachers(query?: { search?: string; status?: string }) {
    const where: any = {};

    if (query?.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
        { employeeId: { contains: query.search, mode: "insensitive" } },
        { specialization: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query?.status === "active") {
      where.isActive = true;
    } else if (query?.status === "inactive") {
      where.isActive = false;
    }

    return prisma.teacher.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        teacherAssignments: {
          where: { isActive: true },
          include: {
            subject: true,
            class: true,
            section: true,
          },
        },
      },
    });
  }

  static async getTeacherById(id: string) {
    return prisma.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, isActive: true, createdAt: true } },
        teacherAssignments: {
          include: {
            subject: true,
            class: true,
            section: true,
            academicYear: true,
          },
        },
      },
    });
  }

  static async createTeacher(data: CreateTeacherInput, creatorUserId?: string) {
    // 1. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error(`A user with email "${data.email}" already exists.`);
    }

    // 2. Generate or validate employee ID
    let employeeId = data.employeeId?.trim();
    if (!employeeId) {
      employeeId = generateEmployeeId();
    } else {
      const existingEmp = await prisma.teacher.findUnique({
        where: { employeeId },
      });
      if (existingEmp) {
        throw new Error(`Employee ID "${employeeId}" is already assigned.`);
      }
    }

    // 3. Hash default initial password
    const defaultPassword = "Teacher@123";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // 4. Create user + teacher in a transaction
    const newTeacher = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: Role.TEACHER,
          isActive: true,
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          qualification: data.qualification,
          specialization: data.specialization,
          gender: data.gender,
          address: data.address,
          city: data.city,
          joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
        },
      });

      if (creatorUserId) {
        await tx.auditLog.create({
          data: {
            userId: creatorUserId,
            action: "TEACHER_CREATED",
            entity: "Teacher",
            entityId: teacher.id,
            details: `Faculty member ${teacher.firstName} ${teacher.lastName} (${teacher.employeeId}) registered.`,
          },
        });
      }

      return teacher;
    });

    return newTeacher;
  }

  static async updateTeacher(data: UpdateTeacherInput, updaterUserId?: string) {
    const updated = await prisma.teacher.update({
      where: { id: data.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        qualification: data.qualification,
        specialization: data.specialization,
        gender: data.gender,
        address: data.address,
        city: data.city,
        isActive: data.isActive,
      },
    });

    if (updaterUserId) {
      await prisma.auditLog.create({
        data: {
          userId: updaterUserId,
          action: "TEACHER_UPDATED",
          entity: "Teacher",
          entityId: updated.id,
          details: `Teacher ${updated.firstName} ${updated.lastName} profile updated.`,
        },
      });
    }

    return updated;
  }

  static async toggleStatus(id: string, isActive: boolean, updaterUserId?: string) {
    const teacher = await prisma.teacher.update({
      where: { id },
      data: { isActive },
      include: { user: true },
    });

    // Also update linked user
    if (teacher.userId) {
      await prisma.user.update({
        where: { id: teacher.userId },
        data: { isActive },
      });
    }

    if (updaterUserId) {
      await prisma.auditLog.create({
        data: {
          userId: updaterUserId,
          action: isActive ? "TEACHER_ACTIVATED" : "TEACHER_DEACTIVATED",
          entity: "Teacher",
          entityId: id,
          details: `Teacher ${teacher.firstName} ${teacher.lastName} was ${isActive ? "activated" : "deactivated"}.`,
        },
      });
    }

    return teacher;
  }

  static async deleteTeacher(id: string, deleterUserId?: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { teacherAssignments: true },
    });

    if (!teacher) {
      throw new Error("Teacher not found.");
    }

    if (teacher.teacherAssignments.length > 0) {
      throw new Error(
        `Cannot delete teacher. Please unassign their ${teacher.teacherAssignments.length} course assignment(s) first.`
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.teacher.delete({ where: { id } });
      if (teacher.userId) {
        await tx.user.delete({ where: { id: teacher.userId } });
      }

      if (deleterUserId) {
        await tx.auditLog.create({
          data: {
            userId: deleterUserId,
            action: "TEACHER_DELETED",
            entity: "Teacher",
            entityId: id,
            details: `Teacher ${teacher.firstName} ${teacher.lastName} deleted.`,
          },
        });
      }
    });

    return true;
  }
}
