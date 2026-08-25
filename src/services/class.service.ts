import { prisma } from "@/lib/db";
import type {
  CreateClassInput,
  UpdateClassInput,
  CreateSectionInput,
  UpdateSectionInput,
} from "@/lib/validations/class.schema";

export class ClassService {
  static async getAllClasses() {
    return prisma.class.findMany({
      orderBy: { name: "asc" },
      include: {
        sections: {
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: {
                students: { where: { isActive: true } },
                teacherAssignments: { where: { isActive: true } },
              },
            },
          },
        },
        _count: {
          select: {
            feeStructures: true,
          },
        },
      },
    });
  }

  static async getClassById(id: string) {
    return prisma.class.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            students: {
              where: { isActive: true },
              orderBy: { rollNumber: "asc" },
            },
            teacherAssignments: {
              include: {
                teacher: true,
                subject: true,
              },
            },
          },
        },
      },
    });
  }

  static async createClass(data: CreateClassInput, userId?: string) {
    const existing = await prisma.class.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error(`A class named "${data.name}" already exists.`);
    }

    const newClass = await prisma.class.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "CLASS_CREATED",
          entity: "Class",
          entityId: newClass.id,
          details: `Class "${newClass.name}" created.`,
        },
      });
    }

    return newClass;
  }

  static async updateClass(data: UpdateClassInput, userId?: string) {
    const updated = await prisma.class.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "CLASS_UPDATED",
          entity: "Class",
          entityId: updated.id,
          details: `Class "${updated.name}" updated.`,
        },
      });
    }

    return updated;
  }

  static async deleteClass(id: string, userId?: string) {
    // Check if class has active students
    const studentCount = await prisma.student.count({
      where: {
        section: { classId: id },
      },
    });

    if (studentCount > 0) {
      throw new Error(
        `Cannot delete class. It contains ${studentCount} student records.`
      );
    }

    const deleted = await prisma.class.delete({
      where: { id },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "CLASS_DELETED",
          entity: "Class",
          entityId: id,
          details: `Class "${deleted.name}" deleted.`,
        },
      });
    }

    return deleted;
  }

  // Section Methods
  static async createSection(data: CreateSectionInput, userId?: string) {
    const existing = await prisma.section.findUnique({
      where: {
        classId_name: {
          classId: data.classId,
          name: data.name,
        },
      },
    });

    if (existing) {
      throw new Error(
        `Section "${data.name}" already exists for this class.`
      );
    }

    const section = await prisma.section.create({
      data: {
        name: data.name,
        classId: data.classId,
        capacity: data.capacity,
        room: data.room,
      },
      include: { class: true },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "SECTION_CREATED",
          entity: "Section",
          entityId: section.id,
          details: `Section "${section.name}" created for class "${section.class.name}".`,
        },
      });
    }

    return section;
  }

  static async updateSection(data: UpdateSectionInput, userId?: string) {
    const updated = await prisma.section.update({
      where: { id: data.id },
      data: {
        name: data.name,
        capacity: data.capacity,
        room: data.room,
        isActive: data.isActive,
      },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "SECTION_UPDATED",
          entity: "Section",
          entityId: updated.id,
          details: `Section "${updated.name}" updated.`,
        },
      });
    }

    return updated;
  }

  static async deleteSection(id: string, userId?: string) {
    const studentCount = await prisma.student.count({
      where: { sectionId: id },
    });

    if (studentCount > 0) {
      throw new Error(
        `Cannot delete section with ${studentCount} assigned students.`
      );
    }

    const deleted = await prisma.section.delete({
      where: { id },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "SECTION_DELETED",
          entity: "Section",
          entityId: id,
          details: `Section "${deleted.name}" deleted.`,
        },
      });
    }

    return deleted;
  }
}
