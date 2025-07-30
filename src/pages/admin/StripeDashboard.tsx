import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DollarSign, Users, CreditCard, TrendingUp, Wallet, Clock } from "lucide-react";
import { StripeMetricsCard } from "@/components/stripe/StripeMetricsCard";
import { StripeRevenueChart } from "@/components/stripe/StripeRevenueChart";
import { StripeCustomersTable } from "@/components/stripe/StripeCustomersTable";
import { StripeTransactionsTable } from "@/components/stripe/StripeTransactionsTable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StripeDashboardData {
  metrics: {
    totalRevenue: number;
    totalCustomers: number;
    activeSubscriptions: number;
    averageOrderValue: number;
    availableBalance: number;
    pendingBalance: number;
  };
  chartData: Array<{ date: string; amount: number; }>;
  customers: Array<{
    id: string;
    email: string;
    name?: string;
    created: number;
    description?: string;
  }>;
  recentCharges: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: number;
    customer?: string;
    description?: string;
  }>;
}

export default function StripeDashboard() {
  const [data, setData] = useState<StripeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const { toast } = useToast();

  const fetchStripeData = async () => {
    try {
      setLoading(true);
      console.log("Fetching Stripe dashboard data...");
      
      const { data: stripeData, error } = await supabase.functions.invoke('stripe-dashboard', {
        body: { days: parseInt(timeRange) }
      });

      console.log("Stripe function response:", { data: stripeData, error });

      if (error) {
        console.error("Stripe function error:", error);
        throw error;
      }

      if (!stripeData) {
        throw new Error("No data returned from Stripe function");
      }

      setData(stripeData);
      console.log("Stripe data set successfully");
    } catch (error) {
      console.error("Error fetching Stripe data:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch Stripe dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStripeData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load Stripe dashboard data</p>
        <Button onClick={fetchStripeData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stripe Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your payments, customers, and revenue
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchStripeData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StripeMetricsCard
          title="Total Revenue"
          value={`$${data.metrics.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
        />
        <StripeMetricsCard
          title="Total Customers"
          value={data.metrics.totalCustomers.toString()}
          icon={Users}
        />
        <StripeMetricsCard
          title="Active Subscriptions"
          value={data.metrics.activeSubscriptions.toString()}
          icon={CreditCard}
        />
        <StripeMetricsCard
          title="Average Order Value"
          value={`$${data.metrics.averageOrderValue.toFixed(2)}`}
          icon={TrendingUp}
        />
        <StripeMetricsCard
          title="Available Balance"
          value={`$${data.metrics.availableBalance.toFixed(2)}`}
          icon={Wallet}
        />
        <StripeMetricsCard
          title="Pending Balance"
          value={`$${data.metrics.pendingBalance.toFixed(2)}`}
          icon={Clock}
        />
      </div>

      {/* Revenue Chart */}
      <StripeRevenueChart data={data.chartData} />

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StripeCustomersTable customers={data.customers} />
        <StripeTransactionsTable transactions={data.recentCharges} />
      </div>
    </div>
  );
}