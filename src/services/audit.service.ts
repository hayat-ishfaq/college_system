import { prisma } from "@/lib/db";

export interface AuditFilterParams {
  search?: string;
  action?: string;
  entity?: string;
  page?: number;
  pageSize?: number;
}

export class AuditService {
  static async getAuditLogs(params: AuditFilterParams) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { action: { contains: params.search, mode: "insensitive" } },
        { entity: { contains: params.search, mode: "insensitive" } },
        { details: { contains: params.search, mode: "insensitive" } },
        { user: { email: { contains: params.search, mode: "insensitive" } } },
      ];
    }

    if (params.action) where.action = params.action;
    if (params.entity) where.entity = params.entity;

    const [total, data] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { email: true, role: true },
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
}
