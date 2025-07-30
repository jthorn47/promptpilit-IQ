import { RolesPermissionsManager } from '@/components/admin/RolesPermissionsManager';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export default function RolesPermissions() {
  return (
    <StandardPageLayout
      title="Roles & Permissions"
      subtitle="Manage user roles, permissions, and access control across the system"
    >
      <RolesPermissionsManager />
    </StandardPageLayout>
  );
}