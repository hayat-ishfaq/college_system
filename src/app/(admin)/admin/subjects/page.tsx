import { requireAdmin } from "@/lib/auth/permissions";
import { SubjectService } from "@/services/subject.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubjectManagementClient } from "./SubjectManagementClient";

export const metadata = {
  title: "Subject Catalog",
};

export default async function SubjectsPage() {
  await requireAdmin();
  const subjects = await SubjectService.getAllSubjects();

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Subject & Course Management"
        description="Manage the institutional course catalog, subject codes, credit hours, and curriculum guidelines."
      />
      <SubjectManagementClient subjects={subjects} />
    </div>
  );
}
