import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  FileText,
  Calculator,
  Banknote
} from "lucide-react";
import { halobillAPI } from "../../../domains/billing/halobill/api";
import type { RevenueMetric, BillingAlert, Invoice, Commission } from "../../../domains/billing/halobill/types";
import { PricingModelBuilder } from "./PricingModelBuilder";
import { InvoiceManager } from "./InvoiceManager";
import { PaymentProcessor } from "./PaymentProcessor";
import { PartnerDashboard } from "./PartnerDashboard";

interface DashboardStats {
  totalRevenue: number;
  monthlyRecurring: number;
  pendingPayments: number;
  activeClients: number;
  overdueInvoices: number;
  successRate: number;
}

export const HALObillDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    monthlyRecurring: 0,
    pendingPayments: 0,
    activeClients: 0,
    overdueInvoices: 0,
    successRate: 0
  });
  const [alerts, setAlerts] = useState<BillingAlert[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load revenue metrics
      const metricsPromise = halobillAPI.getRevenueMetrics();
      const alertsPromise = halobillAPI.getBillingAlerts(false);
      const invoicesPromise = halobillAPI.getInvoices();

      const [metrics, alertsData, invoicesData] = await Promise.all([
        metricsPromise,
        alertsPromise, 
        invoicesPromise
      ]);

      // Calculate stats from metrics
      const totalRevenue = metrics
        .filter(m => m.metric_type === 'daily_revenue')
        .reduce((sum, m) => sum + m.amount, 0);

      const monthlyRecurring = metrics
        .filter(m => m.metric_type === 'monthly_recurring')
        .slice(0, 1)[0]?.amount || 0;

      const overdueInvoices = invoicesData.filter(i => i.status === 'overdue').length;
      const pendingPayments = invoicesData.filter(i => i.status === 'sent').length;
      const paidInvoices = invoicesData.filter(i => i.status === 'paid').length;
      const successRate = invoicesData.length > 0 ? (paidInvoices / invoicesData.length) * 100 : 0;

      setStats({
        totalRevenue,
        monthlyRecurring,
        pendingPayments,
        activeClients: 0, // Would need client subscription count
        overdueInvoices,
        successRate
      });

      setAlerts(alertsData);
      setRecentInvoices(invoicesData.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await halobillAPI.resolveAlert(alertId, 'current-user-id'); // Replace with actual user ID
      setAlerts(alerts.filter(a => a.id !== alertId));
      
      toast({
        title: "Alert Resolved",
        description: "The billing alert has been resolved successfully.",
      });
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HALObill Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive billing engine for HALOworks
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Models</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  All-time revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.monthlyRecurring.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Current MRR
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting collection
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Payment success rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Billing Alerts ({alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 3).map((alert) => (
                    <Alert key={alert.id} className="relative">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        <span>{alert.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        </div>
                      </AlertTitle>
                      <AlertDescription>
                        {alert.description}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest billing activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(invoice.status)}
                      <div>
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.client?.company_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${invoice.total_amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <PricingModelBuilder />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceManager />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentProcessor />
        </TabsContent>

        <TabsContent value="partners">
          <PartnerDashboard />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Detailed revenue tracking and forecasting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Advanced analytics dashboard coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};