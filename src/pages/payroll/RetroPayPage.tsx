import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  RotateCcw, 
  Plus, 
  AlertTriangle, 
  History, 
  DollarSign, 
  FileText, 
  Calculator,
  Home,
  Download,
  Settings,
  Clock,
  TrendingUp
} from 'lucide-react';
import { RetroPayManager } from '@/components/payroll/RetroPayManager';
import { OffCycleHistory } from '@/components/payroll/OffCycleHistory';
import { ConflictDetector } from '@/components/payroll/ConflictDetector';
import { AdjustmentPreview } from '@/components/payroll/AdjustmentPreview';

const RetroPayPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [processingMode, setProcessingMode] = useState<'retro' | 'bonus'>('retro');

  // Mock stats for overview
  const stats = {
    pendingAdjustments: 3,
    monthlyTotal: 15420.50,
    conflictsDetected: 1,
    lastProcessed: '2024-01-15'
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Home className="h-4 w-4" />
        <span>Payroll</span>
        <span>/</span>
        <span className="text-foreground font-medium">Off-Cycle Adjustments</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <RotateCcw className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Retro Pay & Off-Cycle Payroll</h1>
              <p className="text-lg text-muted-foreground">
                Process adjustments, bonuses, and corrections outside regular payroll cycles
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Phase 2 Module
            </Badge>
            <Badge variant="secondary">Scaffolded – Logic In Progress</Badge>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Logs
            </Button>
          </div>
        </div>
        <Separator />
      </div>

      {/* Processing Mode Toggle */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium">Processing Mode:</span>
                <div className="flex bg-muted rounded-lg p-1">
                  <Button
                    variant={processingMode === 'retro' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setProcessingMode('retro')}
                    className="rounded-md"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retro Pay
                  </Button>
                  <Button
                    variant={processingMode === 'bonus' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setProcessingMode('bonus')}
                    className="rounded-md"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Bonus Pay
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {processingMode === 'retro' 
                  ? 'Process corrections and missed payments'
                  : 'Process bonuses and incentives'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Run
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Conflicts
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Adjustments</p>
                    <p className="text-2xl font-bold">{stats.pendingAdjustments}</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Total</p>
                    <p className="text-2xl font-bold">${stats.monthlyTotal.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conflicts Detected</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.conflictsDetected}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Processed</p>
                    <p className="text-xl font-bold">{stats.lastProcessed}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Notice */}
          <Card className="border-warning bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-warning-foreground mb-2">
                    SuperAdmin & PayrollManager Access Only
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Off-cycle payroll runs require elevated permissions due to tax implications, 
                    year-to-date calculations, and compliance requirements. Always review calculations 
                    and check for conflicts with regular payroll runs before processing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Retroactive Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Process retroactive payments with automatic tax recalculations and YTD adjustments.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Missed overtime hours and corrections
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Salary adjustments and back pay
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Commission corrections
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Bonus & Incentive Pay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Handle one-time payments and performance bonuses with proper tax handling.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Quarterly performance bonuses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Holiday and year-end bonuses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Spot bonuses and recognition awards
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Tax Recalculation Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatically recalculate federal, state, and local taxes for off-cycle payments, 
                  ensuring compliance and accurate withholdings based on current tax brackets and YTD earnings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Conflict Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Smart detection of conflicts with regular payroll runs, duplicate payments, 
                  and potential issues with existing payroll batches to prevent processing errors.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Create Run Tab */}
        <TabsContent value="create">
          <RetroPayManager mode={processingMode} />
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <AdjustmentPreview />
        </TabsContent>

        {/* Conflicts Tab */}
        <TabsContent value="conflicts">
          <ConflictDetector />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <OffCycleHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RetroPayPage;