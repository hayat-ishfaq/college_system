import { requireAdmin } from "@/lib/auth/permissions";
import { AnnouncementService } from "@/services/announcement.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnnouncementManagementClient } from "./AnnouncementManagementClient";

export const metadata = {
  title: "Campus Announcements",
};

export default async function AdminAnnouncementsPage() {
  await requireAdmin();

  const announcements = await AnnouncementService.getAllAnnouncements();

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Campus Announcements"
        description="Broadcast notices, circulars, and emergency alerts to students, faculty, or the entire campus."
      />
      <AnnouncementManagementClient announcements={announcements} />
    </div>
  );
}
