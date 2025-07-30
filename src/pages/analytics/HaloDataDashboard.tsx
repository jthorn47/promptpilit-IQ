import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDateRangePicker } from "@/components/ui/calendar-date-range-picker";
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  DollarSign, 
  Target, 
  Shield, 
  Brain,
  Download,
  Filter,
  Zap
} from "lucide-react";

import { ExecutiveDashboard } from "@/components/analytics/ExecutiveDashboard";
import { ClientHealthDashboard } from "@/components/analytics/ClientHealthDashboard";
import { PredictiveDashboard } from "@/components/analytics/PredictiveDashboard";
import { SalesGrowthDashboard } from "@/components/analytics/SalesGrowthDashboard";
import { ComplianceDashboard } from "@/components/analytics/ComplianceDashboard";
import { ClientFacingDashboard } from "@/components/analytics/ClientFacingDashboard";
import { AlertsPanel } from "@/components/analytics/AlertsPanel";

export function HaloDataDashboard() {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedVertical, setSelectedVertical] = useState("all");
  const [selectedClient, setSelectedClient] = useState("all");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                HaaLOdata
              </h1>
              <p className="text-muted-foreground text-lg">
                Business Intelligence & Predictive Analytics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <AlertsPanel />
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Analytics Filters</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-center gap-4">
                <CalendarDateRangePicker />
                
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="west">West Coast</SelectItem>
                    <SelectItem value="east">East Coast</SelectItem>
                    <SelectItem value="central">Central</SelectItem>
                    <SelectItem value="south">South</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedVertical} onValueChange={setSelectedVertical}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select vertical" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="hospitality">Hospitality</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="enterprise">Enterprise Only</SelectItem>
                    <SelectItem value="mid-market">Mid-Market</SelectItem>
                    <SelectItem value="small-business">Small Business</SelectItem>
                  </SelectContent>
                </Select>

                <Badge variant="secondary" className="ml-auto">
                  <Zap className="h-3 w-3 mr-1" />
                  Real-time
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="executive" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
            <TabsTrigger value="executive" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Executive</span>
            </TabsTrigger>
            <TabsTrigger value="client-health" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Client Health</span>
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Predictive</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Sales</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="client-facing" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Client Portal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-6">
            <ExecutiveDashboard 
              region={selectedRegion}
              vertical={selectedVertical}
              client={selectedClient}
            />
          </TabsContent>

          <TabsContent value="client-health" className="space-y-6">
            <ClientHealthDashboard 
              region={selectedRegion}
              vertical={selectedVertical}
              client={selectedClient}
            />
          </TabsContent>

          <TabsContent value="predictive" className="space-y-6">
            <PredictiveDashboard 
              region={selectedRegion}
              vertical={selectedVertical}
              client={selectedClient}
            />
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <SalesGrowthDashboard 
              region={selectedRegion}
              vertical={selectedVertical}
              client={selectedClient}
            />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <ComplianceDashboard 
              region={selectedRegion}
              vertical={selectedVertical}
              client={selectedClient}
            />
          </TabsContent>

          <TabsContent value="client-facing" className="space-y-6">
            <ClientFacingDashboard 
              region={selectedRegion}
              vertical={selectedVertical}
              client={selectedClient}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}