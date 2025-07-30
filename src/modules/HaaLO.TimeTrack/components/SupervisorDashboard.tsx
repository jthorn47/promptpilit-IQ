import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RealTimePunchView 
} from "./RealTimePunchView";
import { 
  TimecardReviewPanel 
} from "./TimecardReviewPanel";
import { 
  ApprovalWorkflow 
} from "./ApprovalWorkflow";
import { 
  Calendar, 
  Users, 
  CheckSquare, 
  AlertTriangle,
  BarChart3,
  Settings
} from "lucide-react";

interface SupervisorDashboardProps {
  companyId: string;
  supervisorId: string;
}

export function SupervisorDashboard({ companyId, supervisorId }: SupervisorDashboardProps) {
  const [activeTab, setActiveTab] = useState('live-status');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const handleEmployeeClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setActiveTab('timecards');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Supervisor Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor employee activity, review timecards, and manage approvals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live-status" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Live Status
            </TabsTrigger>
            <TabsTrigger value="timecards" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timecards
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Approvals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live-status" className="mt-6">
            <RealTimePunchView
              companyId={companyId}
              supervisorId={supervisorId}
              onEmployeeClick={handleEmployeeClick}
            />
          </TabsContent>

          <TabsContent value="timecards" className="mt-6">
            <TimecardReviewPanel
              companyId={companyId}
              supervisorId={supervisorId}
              selectedEmployeeId={selectedEmployeeId}
              onEmployeeSelect={setSelectedEmployeeId}
            />
          </TabsContent>

          <TabsContent value="approvals" className="mt-6">
            <ApprovalWorkflow
              companyId={companyId}
              supervisorId={supervisorId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}