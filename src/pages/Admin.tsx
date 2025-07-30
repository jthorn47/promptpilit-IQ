import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { AdminRoutes } from "@/routes/adminRoutes";

const Admin = () => {
  return (
    <UnifiedLayout>
      <AdminRoutes />
    </UnifiedLayout>
  );
};

export default Admin;