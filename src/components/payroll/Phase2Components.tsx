
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdvancedDeductionCalculator } from './advanced/AdvancedDeductionCalculator';
import { EnhancedAnalyticsDashboard } from './analytics/EnhancedAnalyticsDashboard';
import { ProductionMonitoring } from './monitoring/ProductionMonitoring';
import { AutomatedTestingFramework } from './testing/AutomatedTestingFramework';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  BarChart3, 
  Monitor, 
  TestTube, 
  Rocket 
} from 'lucide-react';

export const Phase2Components: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Phase 2 - Advanced TaxIQ Features</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Enterprise-grade CA/Federal tax optimization and monitoring
        </p>
        <Badge className="bg-green-100 text-green-800">
          <Rocket className="w-4 h-4 mr-1" />
          Production Ready
        </Badge>
      </div>

      <Tabs defaultValue="deductions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deductions" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Advanced Calculator
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deductions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Advanced Deduction Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdvancedDeductionCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Enhanced Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedAnalyticsDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Production Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductionMonitoring />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Automated Testing Framework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AutomatedTestingFramework />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
