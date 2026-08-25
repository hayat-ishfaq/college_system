import { prisma } from "@/lib/db";
import type {
  InstitutionSettingsInput,
  CreateAcademicYearInput,
} from "@/lib/validations/setting.schema";

export class SettingService {
  /**
   * Get all institution configuration key-values as a flat map with defaults.
   */
  static async getSettings(): Promise<InstitutionSettingsInput> {
    const rawSettings = await prisma.institutionSetting.findMany();
    const map: Record<string, string> = {};
    rawSettings.forEach((s) => {
      map[s.key] = s.value;
    });

    return {
      institution_name: map["institution_name"] || "Bright Future College",
      tagline: map["tagline"] || "Excellence in Education & Character Building",
      email: map["email"] || "info@brightfuture.edu.pk",
      phone: map["phone"] || "+92 51 9283741",
      address:
        map["address"] ||
        "Plot 42, Education Boulevard, Sector H-8/4, Islamabad",
      website: map["website"] || "https://brightfuture.edu.pk",
      bank_name: map["bank_name"] || "Habib Bank Limited (HBL)",
      bank_account_title:
        map["bank_account_title"] || "Bright Future College Islamabad",
      bank_account_no: map["bank_account_no"] || "0142-79012345-03",
      bank_branch_code: map["bank_branch_code"] || "0142",
      currency_symbol: map["currency_symbol"] || "PKR",
      min_attendance_percentage: Number(
        map["min_attendance_percentage"] || "75"
      ),
      passing_percentage: Number(map["passing_percentage"] || "40"),
    };
  }

  /**
   * Bulk upsert settings keys.
   */
  static async saveSettings(data: InstitutionSettingsInput, userId?: string) {
    const entries = Object.entries(data);

    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.institutionSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "SETTINGS_UPDATED",
          entity: "InstitutionSetting",
          details: `Updated ${entries.length} institution configuration parameters.`,
        },
      });
    }

    return this.getSettings();
  }

  /**
   * Academic Sessions CRUD
   */
  static async getAllAcademicYears() {
    return prisma.academicYear.findMany({
      orderBy: { startDate: "desc" },
      include: {
        _count: {
          select: {
            students: true,
            feeStructures: true,
            challans: true,
            exams: true,
          },
        },
      },
    });
  }

  static async createAcademicYear(
    data: CreateAcademicYearInput,
    userId?: string
  ) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    const year = await prisma.$transaction(async (tx) => {
      if (data.isCurrent) {
        await tx.academicYear.updateMany({
          data: { isCurrent: false },
        });
      }

      return tx.academicYear.create({
        data: {
          name: data.name,
          startDate: start,
          endDate: end,
          isCurrent: data.isCurrent,
        },
      });
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "ACADEMIC_YEAR_CREATED",
          entity: "AcademicYear",
          entityId: year.id,
          details: `Created academic session "${year.name}" (${year.isCurrent ? "Active" : "Inactive"}).`,
        },
      });
    }

    return year;
  }

  static async setActiveAcademicYear(id: string, userId?: string) {
    await prisma.$transaction([
      prisma.academicYear.updateMany({ data: { isCurrent: false } }),
      prisma.academicYear.update({
        where: { id },
        data: { isCurrent: true },
      }),
    ]);

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "ACADEMIC_YEAR_ACTIVATED",
          entity: "AcademicYear",
          entityId: id,
          details: `Switched active academic session.`,
        },
      });
    }

    return { success: true };
  }
}
