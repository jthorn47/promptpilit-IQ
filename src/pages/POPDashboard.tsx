import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Briefcase, DollarSign, FileText, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function POPDashboard() {
  const { data: popData, isLoading } = useQuery({
    queryKey: ["pop-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("pops")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["pop-dashboard-stats", popData?.id],
    queryFn: async () => {
      if (!popData?.id) return null;

      const [clientsResult, jobOrdersResult, candidatesResult, commissionsResult] = await Promise.all([
        supabase.from("pop_clients").select("*").eq("pop_id", popData.id),
        supabase.from("pop_job_orders").select("*").eq("pop_id", popData.id),
        supabase.from("pop_candidates").select("*, pop_job_orders!inner(pop_id)").eq("pop_job_orders.pop_id", popData.id),
        supabase.from("pop_commissions").select("*").eq("pop_id", popData.id),
      ]);

      return {
        clients: clientsResult.data || [],
        jobOrders: jobOrdersResult.data || [],
        candidates: candidatesResult.data || [],
        commissions: commissionsResult.data || [],
      };
    },
    enabled: !!popData?.id,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!popData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to POP Platform</h2>
          <p className="text-muted-foreground mb-4">Complete your Partner Office Program application to get started.</p>
          <Button>Complete Application</Button>
        </div>
      </div>
    );
  }

  const totalEarnings = dashboardStats?.commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
  const activeJobs = dashboardStats?.jobOrders.filter(j => j.status === 'open').length || 0;
  const pendingClients = dashboardStats?.clients.filter(c => c.status === 'pending_approval').length || 0;
  const hiredCandidates = dashboardStats?.candidates.filter(c => c.status === 'hired').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {popData.first_name}!
          </h1>
          <p className="text-muted-foreground">
            {popData.business_name} • {popData.tier.replace('_', ' ').toUpperCase()} Tier
          </p>
        </div>
        <Badge variant={popData.status === 'active' ? 'default' : 'secondary'}>
          {popData.status.toUpperCase()}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Commission rate: {popData.commission_rate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Job Orders</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.jobOrders.length || 0} total jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingClients}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.clients.length || 0} total clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hiredCandidates}</div>
            <p className="text-xs text-muted-foreground">
              Total successful hires
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="jobs">Job Orders</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest business activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardStats?.jobOrders.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{job.job_title}</p>
                        <p className="text-sm text-muted-foreground">{job.location}</p>
                      </div>
                      <Badge variant="outline">{job.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Territory Coverage</CardTitle>
                <CardDescription>Your exclusive territory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">State:</span>
                    <span className="font-medium">{popData.territory_state || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">City:</span>
                    <span className="font-medium">{popData.territory_city || 'Not assigned'}</span>
                  </div>
                  {popData.territory_zip_codes && (
                    <div className="flex justify-between">
                      <span className="text-sm">ZIP Codes:</span>
                      <span className="font-medium">{popData.territory_zip_codes.length} assigned</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Client Management</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Client
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Client management interface will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Job Orders</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Job Order
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Job order management interface will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <h3 className="text-lg font-medium">Candidate Pipeline</h3>
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Candidate tracking interface will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <h3 className="text-lg font-medium">Earnings & Commissions</h3>
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Earnings dashboard will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}