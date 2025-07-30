import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertCircle, Clock, TrendingUp, FileText, Users, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePulseCases } from '../hooks/usePulseCases';
import { useNavigate } from 'react-router-dom';
import { PulseCasesTable } from '@/components/sms/PulseCasesTable';

export const PulseDashboard = () => {
  const navigate = useNavigate();
  const { cases, loading, statistics, refetch } = usePulseCases();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const openCases = statistics?.open || 0;
  const inProgressCases = statistics?.inProgress || 0;
  const closedCases = statistics?.closed || 0;
  const totalHours = statistics?.totalHours || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pulse Dashboard</h1>
          <p className="text-muted-foreground">Overview of cases, metrics, and recent activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refetch}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            size="sm" 
            className="gap-2"
            onClick={() => navigate('/pulse/new')}
          >
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              All cases in system
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{openCases}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressCases}</div>
            <p className="text-xs text-muted-foreground">
              Being worked on
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Time logged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cases.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No cases found. Create your first case to get started.
                </p>
              ) : (
                cases.slice(0, 5).map((case_) => (
                  <div key={case_.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-3 h-3 rounded-full ${
                      case_.status === 'open' ? 'bg-red-500' : 
                      case_.status === 'in_progress' ? 'bg-blue-500' : 
                      'bg-green-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{case_.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {case_.status.replace('_', ' ').toUpperCase()} • Priority: {case_.priority}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {case_.created_at ? new Date(case_.created_at).toLocaleDateString() : 'No date'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Case Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Open</span>
                </div>
                <span className="text-sm font-medium">{openCases}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">In Progress</span>
                </div>
                <span className="text-sm font-medium">{inProgressCases}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Closed</span>
                </div>
                <span className="text-sm font-medium">{closedCases}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-sm">Total</span>
                  <span className="text-sm">{statistics?.total || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SMS Pulse Cases Section */}
      <PulseCasesTable />
    </div>
  );
};