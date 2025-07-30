import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, MapPin, DollarSign, Users, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function JobOrdersManager() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: popData } = useQuery({
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

  const { data: jobOrders, isLoading } = useQuery({
    queryKey: ["pop-job-orders", popData?.id],
    queryFn: async () => {
      if (!popData?.id) return [];

      const { data, error } = await supabase
        .from("pop_job_orders")
        .select(`
          *,
          pop_clients (
            company_name,
            contact_name
          ),
          pop_candidates (
            id,
            status
          )
        `)
        .eq("pop_id", popData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!popData?.id,
  });

  const filteredJobOrders = jobOrders?.filter((job) => {
    return job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           job.location.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "in_progress":
        return "secondary";
      case "filled":
        return "outline";
      case "cancelled":
        return "destructive";
      case "on_hold":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const statusCounts = jobOrders?.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (isLoading) {
    return <div>Loading job orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Orders</h1>
          <p className="text-muted-foreground">
            Manage your active job orders and candidate pipeline
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Job Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Job Order</DialogTitle>
              <DialogDescription>
                Create a job order for an approved client. This will be visible to recruiters.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                Job order creation form will be implemented here
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Job Order Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobOrders?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.open || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statusCounts.in_progress || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filled</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {statusCounts.filled || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.on_hold || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search job orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Job Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Job Orders</CardTitle>
          <CardDescription>
            Track your job orders and their progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Details</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Pay & Bill Rate</TableHead>
                <TableHead>Positions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobOrders.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.job_title}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.shift && `${job.shift} shift`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.pop_clients?.company_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.pop_clients?.contact_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="text-sm">Pay: ${job.pay_rate}/hr</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="text-sm">Bill: ${job.bill_rate}/hr</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {job.markup_percentage}% markup
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="font-medium">
                        {job.positions_filled}/{job.positions_needed}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {job.pop_candidates?.length || 0} candidates
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(job.status)}>
                      {job.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Pipeline
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}