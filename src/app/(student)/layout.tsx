import { requireStudent } from "@/lib/auth/permissions";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { PortalTopbar } from "@/components/layout/PortalTopbar";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Student Portal",
    template: "%s | EduManage Student",
  },
};

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStudent();

  const notificationCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
    },
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <StudentSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <PortalTopbar
          user={session.user}
          notificationCount={notificationCount}
          accentColor="bg-violet-600"
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
