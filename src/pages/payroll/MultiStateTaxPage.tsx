import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  MapPin, 
  Users, 
  FileCheck, 
  Settings,
  Building,
  BarChart3,
  Download,
  Home
} from 'lucide-react';
import { TaxEngineOverview } from '@/components/payroll/TaxEngineOverview';
import { JurisdictionSelector } from '@/components/payroll/JurisdictionSelector';
import { EmployeeTaxMapping } from '@/components/payroll/EmployeeTaxMapping';
import { TaxRulesModal } from '@/components/payroll/TaxRulesModal';
import { MultiStateManager } from '@/components/payroll/MultiStateManager';
import { GlobalContractorCompliance } from '@/components/payroll/GlobalContractorCompliance';
import { TreatyExemptions } from '@/components/payroll/TreatyExemptions';

const MultiStateTaxPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Home className="h-4 w-4" />
        <span>Payroll</span>
        <span>/</span>
        <span className="text-foreground font-medium">Tax Engine</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Multi-State & International Tax Engine</h1>
              <p className="text-lg text-muted-foreground">
                Comprehensive tax compliance for multi-jurisdictional payroll
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Phase 2 Module
            </Badge>
            <Badge variant="secondary">SuperAdmin Only</Badge>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Reports
            </Button>
          </div>
        </div>
        <Separator />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="jurisdictions" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Jurisdictions
          </TabsTrigger>
          <TabsTrigger value="employee-mapping" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employee Mapping
          </TabsTrigger>
          <TabsTrigger value="tax-rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Tax Rules
          </TabsTrigger>
          <TabsTrigger value="multi-state" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Multi-State
          </TabsTrigger>
          <TabsTrigger value="international" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            International
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="overview">
          <TaxEngineOverview />
        </TabsContent>

        <TabsContent value="jurisdictions">
          <JurisdictionSelector />
        </TabsContent>

        <TabsContent value="employee-mapping">
          <EmployeeTaxMapping />
        </TabsContent>

        <TabsContent value="tax-rules">
          <TaxRulesModal />
        </TabsContent>

        <TabsContent value="multi-state">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">U.S. Multi-State Tax Management</h2>
                <p className="text-muted-foreground">
                  Configure state-specific tax rules and employee allocations
                </p>
              </div>
            </div>
            <MultiStateManager />
          </div>
        </TabsContent>

        <TabsContent value="international">
          <div className="space-y-6">
            <Tabs defaultValue="contractors" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="contractors" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Global Contractors
                </TabsTrigger>
                <TabsTrigger value="treaties" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Treaty Exemptions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="contractors">
                <GlobalContractorCompliance />
              </TabsContent>

              <TabsContent value="treaties">
                <TreatyExemptions />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiStateTaxPage;