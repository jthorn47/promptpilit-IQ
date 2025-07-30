import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Download, AlertTriangle, Clock } from 'lucide-react';
import { AuditTrailFilters } from '@/components/payroll/AuditTrailFilters';
import { AuditDiffViewer } from '@/components/payroll/AuditDiffViewer';
import { AuditTimeline } from '@/components/payroll/AuditTimeline';
import { SuspiciousActivityMonitor } from '@/components/payroll/SuspiciousActivityMonitor';

const AuditTrailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('audit');
  const [filters, setFilters] = useState({
    employee: 'all',
    payPeriod: 'all',
    changeType: 'all',
    dateRange: { start: '', end: '' },
    user: 'all',
    impact: 'all'
  });

  const handleExportCSV = () => {
    // Export logic would go here
    console.log('Exporting audit trail to CSV...');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Payroll Audit Trail Explorer</h1>
              <p className="text-lg text-muted-foreground">
                Visual history tracking of payroll changes with impact analysis
              </p>
            </div>
          </div>
          <Button 
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline View
          </TabsTrigger>
          <TabsTrigger value="suspicious" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Suspicious Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <AuditTrailFilters 
                filters={filters} 
                onFiltersChange={setFilters} 
              />
            </div>
            <div className="lg:col-span-3">
              <AuditDiffViewer filters={filters} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <AuditTimeline filters={filters} />
        </TabsContent>

        <TabsContent value="suspicious">
          <SuspiciousActivityMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditTrailPage;