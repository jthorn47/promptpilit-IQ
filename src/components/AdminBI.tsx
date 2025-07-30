import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { usePermissionContext } from "@/contexts/PermissionContext";

import { useBIData } from "./admin-bi/hooks/useBIData";
import { useExportUtils } from "./admin-bi/utils/exportUtils";
import { BIHeader } from "./admin-bi/components/BIHeader";
import { KPICards } from "./admin-bi/components/KPICards";
import { OverviewTab } from "./admin-bi/components/tabs/OverviewTab";
import { DepartmentsTab } from "./admin-bi/components/tabs/DepartmentsTab";
import { TrendsTab } from "./admin-bi/components/tabs/TrendsTab";
import { AlertsTab } from "./admin-bi/components/tabs/AlertsTab";

export function AdminBI() {
  const [dateRange, setDateRange] = useState("30");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const { canViewAnalytics } = usePermissionContext();
  const { exportToPDF, exportToCSV } = useExportUtils();

  const {
    metrics,
    departmentData,
    complianceData,
    trendData,
    employeePerformance,
    moduleStats,
    timeDistribution,
    skillGapData,
    atRiskEmployees,
    loading,
    departments
  } = useBIData(dateRange, departmentFilter);

  if (!canViewAnalytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. This dashboard is only available to Company Administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading BI Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BIHeader 
        dateRange={dateRange}
        setDateRange={setDateRange}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        departments={departments}
        onExportPDF={exportToPDF}
        onExportCSV={() => exportToCSV(departmentData)}
      />

      <KPICards metrics={metrics} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab 
            complianceData={complianceData}
            departmentData={departmentData}
            employeePerformance={employeePerformance}
            moduleStats={moduleStats}
            skillGapData={skillGapData}
            timeDistribution={timeDistribution}
          />
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <DepartmentsTab departmentData={departmentData} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <TrendsTab trendData={trendData} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertsTab atRiskEmployees={atRiskEmployees} />
        </TabsContent>
      </Tabs>
    </div>
  );
}