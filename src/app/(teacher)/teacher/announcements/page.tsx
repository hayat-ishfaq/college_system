import { requireTeacher } from "@/lib/auth/permissions";
import { AnnouncementService } from "@/services/announcement.service";
import { formatDate } from "@/lib/utils";
import {
  Megaphone,
  Bell,
  AlertTriangle,
  Flame,
  Calendar,
  Users,
} from "lucide-react";
import { AnnouncementPriority } from "@prisma/client";

export const metadata = {
  title: "Faculty Announcements & Circulars",
};

const PRIORITY_CONFIG: Record<
  AnnouncementPriority,
  { label: string; colors: string; icon: any }
> = {
  LOW: { label: "Low Priority", colors: "bg-slate-100 text-slate-600 border-slate-200", icon: Bell },
  NORMAL: { label: "Normal Notice", colors: "bg-blue-50 text-blue-700 border-blue-200", icon: Bell },
  HIGH: { label: "High Priority", colors: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle },
  URGENT: { label: "Urgent Alert", colors: "bg-red-50 text-red-700 border-red-200 animate-pulse", icon: Flame },
};

export default async function TeacherAnnouncementsPage() {
  await requireTeacher();

  const announcements = await AnnouncementService.getAnnouncementsForRole("TEACHER");

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Faculty Announcements & Notices
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Official circulars, staff meeting agendas, and institutional directives.
        </p>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <Megaphone className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No new announcements for faculty at this time.</p>
          </div>
        ) : (
          announcements.map((item) => {
            const pConfig = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.NORMAL;
            const Icon = pConfig.icon;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${pConfig.colors}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {pConfig.label}
                  </span>

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(item.publishDate)}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  {item.title}
                </h2>

                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </p>

                {item.expiryDate && (
                  <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100">
                    Notice valid until {formatDate(item.expiryDate)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
