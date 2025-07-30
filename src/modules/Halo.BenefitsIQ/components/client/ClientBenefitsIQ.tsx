// Client-level Benefits IQ Dashboard for company self-service
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  DollarSign, 
  TrendingUp,
  Heart,
  Eye,
  Stethoscope,
  FileText,
  Plus,
  ArrowRight
} from "lucide-react";
import { ClientPlanLibrary } from './ClientPlanLibrary';
import { ClientBenefitsOverview } from './ClientBenefitsOverview';
import { ClientCostModeling } from './ClientCostModeling';
import { ClientBenchmarking } from './ClientBenchmarking';
import { ClientComplianceChecker } from './ClientComplianceChecker';
import { ClientRecommendations } from './ClientRecommendations';
import { ClientAnalytics } from './ClientAnalytics';

interface ClientBenefitsIQProps {
  companyId: string;
  companyName: string;
}

export const ClientBenefitsIQ: React.FC<ClientBenefitsIQProps> = ({ 
  companyId, 
  companyName 
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benefits Management</h1>
          <p className="text-muted-foreground">{companyName} • Benefits IQ</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Benefit Plan
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-9">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="modeling">Modeling</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="recommendations">Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ClientBenefitsOverview companyId={companyId} />
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <ClientPlanLibrary companyId={companyId} />
        </TabsContent>

        <TabsContent value="modeling" className="space-y-6">
          <ClientCostModeling companyId={companyId} />
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <ClientBenchmarking companyId={companyId} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ClientComplianceChecker companyId={companyId} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <ClientRecommendations companyId={companyId} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ClientAnalytics companyId={companyId} />
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Summary Builder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Summary Builder Coming Soon</h3>
                <p className="text-muted-foreground">
                  Generate branded employee benefit summaries and enrollment materials.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Benefits Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <ArrowRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
                <p className="text-muted-foreground">
                  Configure benefit defaults, branding, and module preferences.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};