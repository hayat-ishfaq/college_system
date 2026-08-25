import { requireAdmin } from "@/lib/auth/permissions";
import { StudentService } from "@/services/student.service";
import { ClassService } from "@/services/class.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { StudentManagementClient } from "./StudentManagementClient";
import { serializeData } from "@/lib/utils";

export const metadata = {
  title: "Student Management & Admissions",
};

export default async function StudentsPage() {
  await requireAdmin();

  const [studentsResult, classes] = await Promise.all([
    StudentService.getStudents({ pageSize: 200 }),
    ClassService.getAllClasses(),
  ]);

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Student Management & Admissions"
        description="Comprehensive student directory, multi-section admission wizard, enrollment records, and portal accounts."
      />
      <StudentManagementClient
        initialStudents={serializeData(studentsResult.data)}
        classes={serializeData(classes)}
      />
    </div>
  );
}
