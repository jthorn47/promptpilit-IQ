import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText, 
  Award, 
  Star,
  Plus,
  Download,
  Bell
} from "lucide-react";
import { BrokerMetricsCard } from "@/components/broker/BrokerMetricsCard";
import { BrokerLeadRegistration } from "@/components/broker/BrokerLeadRegistration";
import { BrokerCommissionDashboard } from "@/components/broker/BrokerCommissionDashboard";
import { BrokerComplianceCenter } from "@/components/broker/BrokerComplianceCenter";
import { BrokerTrainingCenter } from "@/components/broker/BrokerTrainingCenter";
import { BrokerMarketingToolkit } from "@/components/broker/BrokerMarketingToolkit";
import { BrokerNotifications } from "@/components/broker/BrokerNotifications";

export const BrokerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - would come from API
  const partnerStats = {
    totalLeads: 156,
    convertedLeads: 42,
    totalRevenue: 285750,
    commissionsPaid: 21431.25,
    thisMonthCommissions: 3250.00,
    tierLevel: "Gold",
    certificationStatus: "HALO Certified"
  };

  const conversionRate = ((partnerStats.convertedLeads / partnerStats.totalLeads) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome to HALObroker
            </h1>
            <p className="text-muted-foreground text-lg">
              Elite Partner Portal - Empowering Success Through Innovation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              {partnerStats.tierLevel} Partner
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              <Award className="w-4 h-4 mr-2 text-blue-500" />
              {partnerStats.certificationStatus}
            </Badge>
            <BrokerNotifications />
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BrokerMetricsCard
            title="Total Leads"
            value={partnerStats.totalLeads.toString()}
            subtitle="Lifetime referrals"
            icon={Users}
            trend="+12% this month"
            color="blue"
          />
          <BrokerMetricsCard
            title="Conversion Rate"
            value={`${conversionRate}%`}
            subtitle="Leads to clients"
            icon={TrendingUp}
            trend="+2.1% vs last month"
            color="green"
          />
          <BrokerMetricsCard
            title="Total Revenue"
            value={`$${partnerStats.totalRevenue.toLocaleString()}`}
            subtitle="Generated for HALO"
            icon={DollarSign}
            trend="+18% this quarter"
            color="purple"
          />
          <BrokerMetricsCard
            title="Commissions Paid"
            value={`$${partnerStats.commissionsPaid.toLocaleString()}`}
            subtitle="Lifetime earnings"
            icon={FileText}
            trend={`$${partnerStats.thisMonthCommissions.toLocaleString()} this month`}
            color="orange"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="toolkit">Toolkit</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest lead and commission updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New commission payment</p>
                      <p className="text-xs text-muted-foreground">$1,250 for TechCorp conversion</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Lead stage update</p>
                      <p className="text-xs text-muted-foreground">Manufacturing Plus moved to proposal</p>
                    </div>
                    <span className="text-xs text-muted-foreground">1d ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Training completed</p>
                      <p className="text-xs text-muted-foreground">Advanced Payroll Specialist certification</p>
                    </div>
                    <span className="text-xs text-muted-foreground">3d ago</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Register New Lead
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Latest Materials
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Commission Statement
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Award className="w-4 h-4 mr-2" />
                    Continue Training
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leads">
            <BrokerLeadRegistration />
          </TabsContent>

          <TabsContent value="commissions">
            <BrokerCommissionDashboard />
          </TabsContent>

          <TabsContent value="compliance">
            <BrokerComplianceCenter />
          </TabsContent>

          <TabsContent value="training">
            <BrokerTrainingCenter />
          </TabsContent>

          <TabsContent value="toolkit">
            <BrokerMarketingToolkit />
          </TabsContent>

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Referral Widgets</CardTitle>
                <CardDescription>
                  Embed these widgets on your website to capture leads directly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Referral widget management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};