
import { Routes, Route, Navigate } from "react-router-dom";
import SystemDiagnostics from "@/pages/SystemDiagnostics";
import TagManager from "@/pages/admin/TagManager";
import { SuperAdminLaunchpad } from "@/launchpads/SuperAdminLaunchpad";

export const SuperAdminRoutes = () => (
  <Routes>
    {/* System diagnostics and admin pages */}
    <Route path="/system/diagnostics" element={<SystemDiagnostics />} />
    <Route path="/tags" element={<TagManager />} />
    
    {/* Default redirects to the system launchpad */}
    <Route path="/" element={<Navigate to="/launchpad/system" replace />} />
  </Routes>
);
