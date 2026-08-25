import { requireAdmin } from "@/lib/auth/permissions";
import { ClassService } from "@/services/class.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClassManagementClient } from "./ClassManagementClient";

export const metadata = {
  title: "Class & Section Management",
};

export default async function ClassesPage() {
  await requireAdmin();
  const classes = await ClassService.getAllClasses();

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Class & Section Management"
        description="Configure academic classes, section rooms, student capacities, and program streams."
      />
      <ClassManagementClient classes={classes} />
    </div>
  );
}
