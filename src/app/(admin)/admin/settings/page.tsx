import { requireAdmin } from "@/lib/auth/permissions";
import { SettingService } from "@/services/setting.service";
import { AuditService } from "@/services/audit.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsManagementClient } from "./SettingsManagementClient";
import { serializeData } from "@/lib/utils";

export const metadata = {
  title: "System Settings & Audit Logs",
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  const [settings, academicYears, auditLogsResult] = await Promise.all([
    SettingService.getSettings(),
    SettingService.getAllAcademicYears(),
    AuditService.getAuditLogs({ pageSize: 50 }),
  ]);

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Institution Settings & Audit Trail"
        description="Configure institution identity, bank account coordinates for fee challans, academic sessions, and monitor system activity."
      />
      <SettingsManagementClient
        initialSettings={serializeData(settings)}
        academicYears={serializeData(academicYears)}
        auditLogs={serializeData(auditLogsResult.data)}
      />
    </div>
  );
}
