import { CompanyClientAnalytics } from "@/components/analytics/CompanyClientAnalytics";
import { ConversionManager } from "@/components/companies/ConversionManager";
import { WorkflowTestRunner } from "@/components/workflow/WorkflowTestRunner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConversionDashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Conversion Dashboard</h1>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="manager">Conversion Manager</TabsTrigger>
          <TabsTrigger value="testing">Workflow Testing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <CompanyClientAnalytics />
        </TabsContent>
        
        <TabsContent value="manager" className="space-y-6">
          <ConversionManager />
        </TabsContent>
        
        <TabsContent value="testing" className="space-y-6">
          <WorkflowTestRunner />
        </TabsContent>
      </Tabs>
    </div>
  );
}