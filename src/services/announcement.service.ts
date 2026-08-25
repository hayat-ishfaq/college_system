import { prisma } from "@/lib/db";
import {
  AnnouncementTarget,
  AnnouncementPriority,
  NotificationType,
  Role,
} from "@prisma/client";
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "@/lib/validations/announcement.schema";

export class AnnouncementService {
  static async getAllAnnouncements() {
    return prisma.announcement.findMany({
      orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }],
    });
  }

  static async getAnnouncementsForRole(role: "ADMIN" | "TEACHER" | "STUDENT") {
    const targets: AnnouncementTarget[] = [AnnouncementTarget.EVERYONE];
    if (role === "TEACHER") targets.push(AnnouncementTarget.TEACHERS);
    if (role === "STUDENT") targets.push(AnnouncementTarget.STUDENTS);

    return prisma.announcement.findMany({
      where: {
        isActive: true,
        target: { in: targets },
      },
      orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }],
    });
  }

  static async createAnnouncement(
    data: CreateAnnouncementInput,
    authorId?: string
  ) {
    const publishDate = data.publishDate
      ? new Date(data.publishDate)
      : new Date();
    const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        target: data.target,
        priority: data.priority,
        publishDate,
        expiryDate,
        isActive: data.isActive,
        authorId: authorId || null,
      },
    });

    // Notify targeted users
    const userWhere: any = { isActive: true };
    if (data.target === AnnouncementTarget.TEACHERS) {
      userWhere.role = Role.TEACHER;
    } else if (data.target === AnnouncementTarget.STUDENTS) {
      userWhere.role = Role.STUDENT;
    }

    const targetedUsers = await prisma.user.findMany({
      where: userWhere,
      select: { id: true },
    });

    if (targetedUsers.length > 0) {
      await prisma.notification.createMany({
        data: targetedUsers.map((u) => ({
          userId: u.id,
          type: NotificationType.ANNOUNCEMENT,
          title: data.title,
          message: data.content.slice(0, 150),
          announcementId: announcement.id,
        })),
      });
    }

    if (authorId) {
      await prisma.auditLog.create({
        data: {
          userId: authorId,
          action: "ANNOUNCEMENT_CREATED",
          entity: "Announcement",
          entityId: announcement.id,
          details: `Published announcement "${announcement.title}" targeted to ${announcement.target}.`,
        },
      });
    }

    return announcement;
  }

  static async toggleStatus(id: string, isActive: boolean, userId?: string) {
    const updated = await prisma.announcement.update({
      where: { id },
      data: { isActive },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: isActive ? "ANNOUNCEMENT_ACTIVATED" : "ANNOUNCEMENT_DEACTIVATED",
          entity: "Announcement",
          entityId: id,
          details: `Announcement "${updated.title}" ${isActive ? "activated" : "deactivated"}.`,
        },
      });
    }

    return updated;
  }

  static async deleteAnnouncement(id: string, userId?: string) {
    const deleted = await prisma.announcement.delete({
      where: { id },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "ANNOUNCEMENT_DELETED",
          entity: "Announcement",
          entityId: id,
          details: `Deleted announcement "${deleted.title}".`,
        },
      });
    }

    return deleted;
  }
}
