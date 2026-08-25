import { z } from "zod";
import { AnnouncementTarget, AnnouncementPriority } from "@prisma/client";

export const createAnnouncementSchema = z.object({
  title: z.string().min(2, "Title is required").max(200),
  content: z.string().min(5, "Content must be at least 5 characters"),
  target: z.nativeEnum(AnnouncementTarget).default(AnnouncementTarget.EVERYONE),
  priority: z.nativeEnum(AnnouncementPriority).default(AnnouncementPriority.NORMAL),
  publishDate: z.string().or(z.date()).optional(),
  expiryDate: z.string().or(z.date()).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateAnnouncementSchema = createAnnouncementSchema.extend({
  id: z.string(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
