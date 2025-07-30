import React from 'react';
import { 
  AssessmentDashboard,
  AdminAssessments,
  AssessmentForm,
  AssessmentReports,
  AssessmentAnalytics
} from '@/domains/assessments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

const AssessmentPage = () => {
  return (
    <StandardPageLayout
      title="Risk Assessment Center"
      subtitle="Comprehensive workplace risk assessments and analysis"
      badge="Critical Service"
    >
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="admin">Manage</TabsTrigger>
          <TabsTrigger value="form">Create</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <AssessmentDashboard />
        </TabsContent>
        
        <TabsContent value="admin" className="mt-6">
          <AdminAssessments />
        </TabsContent>
        
        <TabsContent value="form" className="mt-6">
          <AssessmentForm />
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <AssessmentReports />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <AssessmentAnalytics />
        </TabsContent>
      </Tabs>
    </StandardPageLayout>
  );
};

export default AssessmentPage;