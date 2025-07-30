import { EmailDashboard } from "@/components/crm/email/EmailDashboard";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";

export default function CRMEmailPage() {
  return (
    <StandardPageLayout
      title="Email Management"
      subtitle="Manage email campaigns, templates, and communication workflows"
    >
      <EmailDashboard />
    </StandardPageLayout>
  );
}