import { requireTeacher } from "@/lib/auth/permissions";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { PortalTopbar } from "@/components/layout/PortalTopbar";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Teacher Portal",
    template: "%s | EduManage Teacher",
  },
};

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireTeacher();

  const notificationCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
    },
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <TeacherSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <PortalTopbar
          user={session.user}
          notificationCount={notificationCount}
          accentColor="bg-emerald-600"
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
