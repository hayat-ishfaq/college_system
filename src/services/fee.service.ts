import { prisma } from "@/lib/db";
import type {
  CreateFeeStructureInput,
  UpdateFeeStructureInput,
} from "@/lib/validations/fee.schema";

export class FeeService {
  static async getAllFeeStructures(filter?: {
    classId?: string;
    academicYearId?: string;
  }) {
    const where: any = {};
    if (filter?.classId) where.classId = filter.classId;
    if (filter?.academicYearId) where.academicYearId = filter.academicYearId;

    return prisma.feeStructure.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        class: true,
        academicYear: true,
        feeItems: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  static async getFeeStructureById(id: string) {
    return prisma.feeStructure.findUnique({
      where: { id },
      include: {
        class: true,
        academicYear: true,
        feeItems: true,
      },
    });
  }

  static async createFeeStructure(
    data: CreateFeeStructureInput,
    userId?: string
  ) {
    // Check if name already exists for class and academic year
    const existing = await prisma.feeStructure.findUnique({
      where: {
        classId_academicYearId_name: {
          classId: data.classId,
          academicYearId: data.academicYearId,
          name: data.name,
        },
      },
    });

    if (existing) {
      throw new Error(
        `A fee structure named "${data.name}" already exists for this class and academic session.`
      );
    }

    const effectiveDate = data.effectiveDate
      ? new Date(data.effectiveDate)
      : new Date();

    const structure = await prisma.feeStructure.create({
      data: {
        name: data.name,
        classId: data.classId,
        academicYearId: data.academicYearId,
        feeType: data.feeType,
        effectiveDate,
        feeItems: {
          create: data.items.map((item) => ({
            name: item.name,
            amount: item.amount,
            isOptional: item.isOptional,
            description: item.description,
          })),
        },
      },
      include: {
        class: true,
        feeItems: true,
      },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "FEE_STRUCTURE_CREATED",
          entity: "FeeStructure",
          entityId: structure.id,
          details: `Created fee structure "${structure.name}" for ${structure.class.name} (${data.items.length} items).`,
        },
      });
    }

    return structure;
  }

  static async toggleStatus(id: string, isActive: boolean, userId?: string) {
    const updated = await prisma.feeStructure.update({
      where: { id },
      data: { isActive },
      include: { class: true },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: isActive ? "FEE_STRUCTURE_ACTIVATED" : "FEE_STRUCTURE_DEACTIVATED",
          entity: "FeeStructure",
          entityId: id,
          details: `Fee structure "${updated.name}" ${isActive ? "activated" : "deactivated"}.`,
        },
      });
    }

    return updated;
  }

  static async deleteFeeStructure(id: string, userId?: string) {
    const deleted = await prisma.feeStructure.delete({
      where: { id },
      include: { class: true },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "FEE_STRUCTURE_DELETED",
          entity: "FeeStructure",
          entityId: id,
          details: `Fee structure "${deleted.name}" for ${deleted.class.name} deleted.`,
        },
      });
    }

    return deleted;
  }
}
