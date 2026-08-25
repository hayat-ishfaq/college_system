import { prisma } from "@/lib/db";
import { ChallanStatus, PaymentMethod } from "@prisma/client";
import { generateChallanNumber } from "@/lib/utils";
import type {
  GenerateBulkChallanInput,
  RecordPaymentInput,
} from "@/lib/validations/challan.schema";

export interface ChallanFilterParams {
  search?: string;
  classId?: string;
  sectionId?: string;
  studentId?: string;
  month?: number;
  year?: number;
  status?: ChallanStatus | "ALL";
  page?: number;
  pageSize?: number;
}

export class ChallanService {
  static async getChallans(params: ChallanFilterParams) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize || 15));
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { challanNumber: { contains: params.search, mode: "insensitive" } },
        {
          student: {
            OR: [
              { firstName: { contains: params.search, mode: "insensitive" } },
              { lastName: { contains: params.search, mode: "insensitive" } },
              { admissionNumber: { contains: params.search, mode: "insensitive" } },
              { rollNumber: { contains: params.search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    if (params.studentId) where.studentId = params.studentId;
    if (params.sectionId) where.sectionId = params.sectionId;
    else if (params.classId) where.student = { section: { classId: params.classId } };

    if (params.month) where.month = Number(params.month);
    if (params.year) where.year = Number(params.year);

    if (params.status && params.status !== "ALL") {
      where.status = params.status;
    }

    const [total, data] = await Promise.all([
      prisma.challan.count({ where }),
      prisma.challan.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
        include: {
          student: {
            include: {
              section: {
                include: { class: true },
              },
            },
          },
          academicYear: true,
          challanItems: true,
          payment: true,
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

  static async getChallanById(id: string) {
    return prisma.challan.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            section: { include: { class: true } },
            user: { select: { email: true } },
          },
        },
        section: { include: { class: true } },
        academicYear: true,
        challanItems: true,
        payment: true,
      },
    });
  }

  static async generateBulkChallans(
    data: GenerateBulkChallanInput,
    userId?: string
  ) {
    // 1. Find applicable fee structure for the class
    const feeStructure = await prisma.feeStructure.findFirst({
      where: {
        classId: data.classId,
        academicYearId: data.academicYearId,
        isActive: true,
      },
      include: {
        feeItems: true,
      },
    });

    if (!feeStructure || feeStructure.feeItems.length === 0) {
      throw new Error(
        "No active fee structure found for this class. Please define fee items in Fee Structures first."
      );
    }

    // 2. Calculate base total from mandatory fee heads
    const mandatoryItems = feeStructure.feeItems.filter((i) => !i.isOptional);
    const baseTotal = mandatoryItems.reduce(
      (acc, item) => acc + Number(item.amount),
      0
    );

    const netPayable = Math.max(
      0,
      baseTotal - Number(data.discount || 0) + Number(data.fine || 0)
    );

    // 3. Find active students in class/section
    const studentWhere: any = {
      isActive: true,
      section: {
        classId: data.classId,
      },
    };
    if (data.sectionId) {
      studentWhere.sectionId = data.sectionId;
    }

    const students = await prisma.student.findMany({
      where: studentWhere,
      select: { id: true, sectionId: true, firstName: true, lastName: true },
    });

    if (students.length === 0) {
      throw new Error("No active students found in the selected class/section.");
    }

    // 4. Batch generate challans with duplicate detection
    let generatedCount = 0;
    let alreadyExistedCount = 0;
    const errors: string[] = [];

    const issueDate = data.issueDate ? new Date(data.issueDate) : new Date();
    const dueDate = new Date(data.dueDate);

    for (const student of students) {
      // Check duplicate
      const existingChallan = await prisma.challan.findUnique({
        where: {
          studentId_month_year_academicYearId: {
            studentId: student.id,
            month: data.month,
            year: data.year,
            academicYearId: data.academicYearId,
          },
        },
      });

      if (existingChallan) {
        alreadyExistedCount++;
        continue;
      }

      try {
        const challanNumber = generateChallanNumber();

        await prisma.challan.create({
          data: {
            challanNumber,
            studentId: student.id,
            sectionId: student.sectionId,
            academicYearId: data.academicYearId,
            month: data.month,
            year: data.year,
            issueDate,
            dueDate,
            status: ChallanStatus.UNPAID,
            totalAmount: netPayable,
            discount: data.discount || 0,
            fine: data.fine || 0,
            remarks: data.remarks || null,
            challanItems: {
              create: mandatoryItems.map((item) => ({
                feeItemId: item.id,
                name: item.name,
                amount: item.amount,
              })),
            },
          },
        });

        generatedCount++;
      } catch (err: any) {
        errors.push(
          `Failed for student ${student.firstName} ${student.lastName}: ${err.message}`
        );
      }
    }

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "CHALLAN_BATCH_GENERATED",
          entity: "Challan",
          details: `Generated ${generatedCount} challans for Month ${data.month}/${data.year} (${alreadyExistedCount} already existed).`,
        },
      });
    }

    return {
      totalStudents: students.length,
      generated: generatedCount,
      alreadyExisted: alreadyExistedCount,
      failed: errors.length,
      errors,
    };
  }

  static async recordPayment(data: RecordPaymentInput, userId?: string) {
    const challan = await prisma.challan.findUnique({
      where: { id: data.challanId },
      include: { student: true },
    });

    if (!challan) throw new Error("Challan not found.");
    if (challan.status === ChallanStatus.PAID) {
      throw new Error("This challan has already been marked as PAID.");
    }

    const paymentDate = new Date(data.paymentDate);

    const payment = await prisma.$transaction(async (tx) => {
      // 1. Create Payment
      const p = await tx.payment.create({
        data: {
          challanId: challan.id,
          paymentDate,
          amountReceived: data.amountReceived,
          paymentMethod: data.paymentMethod,
          transactionRef: data.transactionRef || null,
          remarks: data.remarks || null,
          collectedBy: userId || null,
        },
      });

      // 2. Mark Challan as PAID
      await tx.challan.update({
        where: { id: challan.id },
        data: { status: ChallanStatus.PAID },
      });

      // 3. Log Audit Record
      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "PAYMENT_RECORDED",
            entity: "Payment",
            entityId: p.id,
            details: `Received PKR ${data.amountReceived} (${data.paymentMethod}) for Challan #${challan.challanNumber} (${challan.student.firstName} ${challan.student.lastName}).`,
          },
        });
      }

      return p;
    });

    return payment;
  }

  static async cancelChallan(id: string, userId?: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!challan) throw new Error("Challan not found.");
    if (challan.payment) {
      throw new Error("Cannot cancel a challan that already has payment recorded.");
    }

    const updated = await prisma.challan.update({
      where: { id },
      data: { status: ChallanStatus.CANCELLED },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "CHALLAN_CANCELLED",
          entity: "Challan",
          entityId: id,
          details: `Cancelled Challan #${challan.challanNumber}.`,
        },
      });
    }

    return updated;
  }
}
