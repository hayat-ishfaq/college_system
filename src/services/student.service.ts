import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { generateAdmissionNumber } from "@/lib/utils";
import type {
  CreateStudentInput,
  UpdateStudentInput,
} from "@/lib/validations/student.schema";

export interface StudentFilterParams {
  search?: string;
  classId?: string;
  sectionId?: string;
  status?: "all" | "active" | "inactive";
  page?: number;
  pageSize?: number;
}

export class StudentService {
  static async getStudents(params: StudentFilterParams) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize || 10));
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: "insensitive" } },
        { lastName: { contains: params.search, mode: "insensitive" } },
        { admissionNumber: { contains: params.search, mode: "insensitive" } },
        { rollNumber: { contains: params.search, mode: "insensitive" } },
        { guardianName: { contains: params.search, mode: "insensitive" } },
        { user: { email: { contains: params.search, mode: "insensitive" } } },
      ];
    }

    if (params.sectionId) {
      where.sectionId = params.sectionId;
    } else if (params.classId) {
      where.section = { classId: params.classId };
    }

    if (params.status === "active") {
      where.isActive = true;
    } else if (params.status === "inactive") {
      where.isActive = false;
    }

    const [total, data] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ section: { name: "asc" } }, { rollNumber: "asc" }, { createdAt: "desc" }],
        include: {
          user: { select: { email: true, isActive: true } },
          section: {
            include: {
              class: true,
            },
          },
          academicYear: true,
          _count: {
            select: {
              challans: true,
              attendances: true,
              marks: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  static async getStudentById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, isActive: true, createdAt: true } },
        section: {
          include: {
            class: true,
          },
        },
        academicYear: true,
        challans: {
          orderBy: { dueDate: "desc" },
          include: { payment: true, challanItems: true },
        },
        marks: {
          include: {
            examSchedule: {
              include: {
                exam: true,
                subject: true,
              },
            },
          },
        },
        attendances: {
          orderBy: { date: "desc" },
          take: 30,
        },
      },
    });
  }

  static async createStudent(data: CreateStudentInput, creatorUserId?: string) {
    // 1. Check if student email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error(`A user with email "${data.email}" already exists.`);
    }

    // 2. Generate or validate unique admission number
    let admissionNumber = data.admissionNumber?.trim();
    if (!admissionNumber) {
      admissionNumber = generateAdmissionNumber();
    } else {
      const existingAdm = await prisma.student.findUnique({
        where: { admissionNumber },
      });
      if (existingAdm) {
        throw new Error(`Admission number "${admissionNumber}" is already in use.`);
      }
    }

    // 3. Check for current academic year if not provided
    let academicYearId = data.academicYearId;
    if (!academicYearId) {
      const currentYear = await prisma.academicYear.findFirst({
        where: { isCurrent: true },
      });
      if (currentYear) {
        academicYearId = currentYear.id;
      }
    }

    // 4. Validate duplicate roll number in same section and academic year
    if (data.rollNumber?.trim() && data.sectionId && academicYearId) {
      const existingRoll = await prisma.student.findFirst({
        where: {
          rollNumber: data.rollNumber.trim(),
          sectionId: data.sectionId,
          academicYearId,
          isActive: true,
        },
      });

      if (existingRoll) {
        throw new Error(
          `Roll number "${data.rollNumber}" is already assigned to student ${existingRoll.firstName} ${existingRoll.lastName} in this section.`
        );
      }
    }

    // 5. Default initial password
    const defaultPassword = "Student@123";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // 6. Create User + Student in transaction
    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: Role.STUDENT,
          isActive: true,
        },
      });

      const newStudent = await tx.student.create({
        data: {
          userId: user.id,
          admissionNumber: admissionNumber!,
          rollNumber: data.rollNumber?.trim() || null,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender,
          bloodGroup: data.bloodGroup,
          profilePhoto: data.profilePhoto,
          sectionId: data.sectionId,
          academicYearId,
          admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
          previousSchool: data.previousSchool,
          fatherName: data.fatherName,
          motherName: data.motherName,
          guardianName: data.guardianName,
          guardianPhone: data.guardianPhone,
          guardianEmail: data.guardianEmail || null,
          emergencyContact: data.emergencyContact,
          address: data.address,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
        },
      });

      if (creatorUserId) {
        await tx.auditLog.create({
          data: {
            userId: creatorUserId,
            action: "STUDENT_ADMITTED",
            entity: "Student",
            entityId: newStudent.id,
            details: `Student ${newStudent.firstName} ${newStudent.lastName} admitted (Admission #${newStudent.admissionNumber}).`,
          },
        });
      }

      return newStudent;
    });

    return student;
  }

  static async updateStudent(data: UpdateStudentInput, updaterUserId?: string) {
    const updated = await prisma.student.update({
      where: { id: data.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        rollNumber: data.rollNumber?.trim() || null,
        sectionId: data.sectionId,
        previousSchool: data.previousSchool,
        fatherName: data.fatherName,
        motherName: data.motherName,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        guardianEmail: data.guardianEmail || null,
        emergencyContact: data.emergencyContact,
        address: data.address,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        isActive: data.isActive,
      },
    });

    if (updaterUserId) {
      await prisma.auditLog.create({
        data: {
          userId: updaterUserId,
          action: "STUDENT_UPDATED",
          entity: "Student",
          entityId: updated.id,
          details: `Student ${updated.firstName} ${updated.lastName} profile updated.`,
        },
      });
    }

    return updated;
  }

  static async toggleStatus(id: string, isActive: boolean, updaterUserId?: string) {
    const student = await prisma.student.update({
      where: { id },
      data: { isActive },
      include: { user: true },
    });

    if (student.userId) {
      await prisma.user.update({
        where: { id: student.userId },
        data: { isActive },
      });
    }

    if (updaterUserId) {
      await prisma.auditLog.create({
        data: {
          userId: updaterUserId,
          action: isActive ? "STUDENT_ACTIVATED" : "STUDENT_DEACTIVATED",
          entity: "Student",
          entityId: id,
          details: `Student ${student.firstName} ${student.lastName} was ${isActive ? "activated" : "deactivated"}.`,
        },
      });
    }

    return student;
  }

  static async deleteStudent(id: string, deleterUserId?: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        _count: {
          select: { challans: true, marks: true, attendances: true },
        },
      },
    });

    if (!student) throw new Error("Student not found.");

    if (student._count.challans > 0 || student._count.marks > 0) {
      throw new Error(
        "Cannot delete student with existing fee challans or examination marks. You can deactivate the student instead."
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.attendance.deleteMany({ where: { studentId: id } });
      await tx.student.delete({ where: { id } });
      if (student.userId) {
        await tx.user.delete({ where: { id: student.userId } });
      }

      if (deleterUserId) {
        await tx.auditLog.create({
          data: {
            userId: deleterUserId,
            action: "STUDENT_DELETED",
            entity: "Student",
            entityId: id,
            details: `Student record ${student.firstName} ${student.lastName} deleted.`,
          },
        });
      }
    });

    return true;
  }
}
