import { requireAdmin } from "@/lib/auth/permissions";
import { TeacherService } from "@/services/teacher.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { TeacherManagementClient } from "./TeacherManagementClient";

export const metadata = {
  title: "Faculty & Teacher Management",
};

export default async function TeachersPage() {
  await requireAdmin();
  const teachers = await TeacherService.getAllTeachers();

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Faculty & Teacher Management"
        description="Manage faculty profiles, employee IDs, department assignments, qualifications, and portal access."
      />
      <TeacherManagementClient teachers={teachers} />
    </div>
  );
}
