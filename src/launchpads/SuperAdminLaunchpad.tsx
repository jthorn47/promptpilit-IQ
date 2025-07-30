
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { LaunchpadCard } from './components/LaunchpadCard';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Building2, 
  DollarSign, 
  CreditCard, 
  GraduationCap, 
  UserMinus,
  Users,
  FileText,
  Download,
  Shield,
  UserPlus,
  TrendingUp,
  BarChart3,
  Calculator,
  RefreshCw,
  Mail,
  Send
} from 'lucide-react';


export const SuperAdminLaunchpad: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Control Center Refreshed",
        description: "All business metrics and data have been updated.",
      });
    }, 1000);
  };

  // SECTION 1: KPI METRICS
  const kpiMetrics = [
    {
      title: "Total Active Clients",
      value: 128,
      icon: Building2,
      trend: { direction: 'up' as const, percentage: 8 },
      description: "Active business clients"
    },
    {
      title: "Monthly Recurring Revenue",
      value: "$152,400",
      icon: DollarSign,
      trend: { direction: 'up' as const, percentage: 15 },
      description: "MRR this month"
    },
    {
      title: "Outstanding AR Balance",
      value: "$64,900",
      icon: CreditCard,
      trend: { direction: 'down' as const, percentage: 5 },
      description: "Accounts receivable"
    },
    {
      title: "Training Compliance %",
      value: "87%",
      icon: GraduationCap,
      trend: { direction: 'up' as const, percentage: 3 },
      description: "Training completion rate"
    },
    {
      title: "Clients Lost (Last 30 Days)",
      value: 2,
      icon: UserMinus,
      description: "Client churn this month"
    }
  ];

  // Mock data for operational metrics
  const onboardingData = [
    { client: "TechCorp Inc", progress: 85, owner: "Sarah Johnson" },
    { client: "Manufacturing Plus", progress: 60, owner: "Mike Chen" },
    { client: "Retail Solutions", progress: 40, owner: "Emily Davis" },
    { client: "Service Partners", progress: 95, owner: "David Wilson" },
    { client: "Global Enterprises", progress: 25, owner: "Lisa Brown" }
  ];

  const supportTickets = [
    { id: "TK-001", subject: "Integration Setup Issue", assignedTo: "Tech Team", status: "In Progress" },
    { id: "TK-002", subject: "Billing Discrepancy", assignedTo: "Finance Team", status: "Open" },
    { id: "TK-003", subject: "User Access Request", assignedTo: "Support Team", status: "Resolved" },
    { id: "TK-004", subject: "Training Module Error", assignedTo: "Product Team", status: "Open" },
    { id: "TK-005", subject: "Compliance Report Issue", assignedTo: "Compliance Team", status: "In Progress" },
    { id: "TK-006", subject: "Performance Optimization", assignedTo: "Tech Team", status: "Open" }
  ];

  const revenueData = [
    { product: "HR Services", revenue: 85000, color: "#3b82f6" },
    { product: "Training", revenue: 42000, color: "#10b981" },
    { product: "Compliance Plans", revenue: 25400, color: "#f59e0b" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'destructive';
      case 'In Progress': return 'default';
      case 'Resolved': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <StandardPageLayout
      title="Launchpad 🚀"
      subtitle="Master business intelligence and operational command center"
      badge="Super Admin"
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      headerActions={
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
        <div className="space-y-8">
          {/* SECTION 1: TOP ROW - KPI METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {kpiMetrics.map((metric, index) => (
              <div key={index} className="bg-card rounded-lg border p-4">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">{metric.title}</h3>
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.trend && (
                  <p className={`text-xs flex items-center gap-1 ${
                    metric.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend.direction === 'up' ? '↗' : '↘'} {metric.trend.percentage}%
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              </div>
            ))}
          </div>

          {/* SECTION 2: MIDDLE - OPERATIONAL METRICS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Onboarding Progress */}
            <LaunchpadCard
              title="Client Onboarding Progress"
              description="Track new client implementation status"
              icon={Users}
            >
              <div className="space-y-4">
                {onboardingData.map((client, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{client.client}</span>
                      <span className="text-muted-foreground">{client.progress}%</span>
                    </div>
                    <Progress value={client.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground">Owner: {client.owner}</div>
                  </div>
                ))}
              </div>
            </LaunchpadCard>

            {/* Open Support Tickets */}
            <LaunchpadCard
              title="Open Support Tickets"
              description="Current support queue overview"
              icon={FileText}
            >
              <div className="space-y-3">
                {supportTickets.slice(0, 5).map((ticket, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{ticket.id}</div>
                      <div className="text-xs text-muted-foreground">{ticket.subject}</div>
                      <div className="text-xs">{ticket.assignedTo}</div>
                    </div>
                    <Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                  </div>
                ))}
              </div>
            </LaunchpadCard>

            {/* Revenue by Product */}
            <LaunchpadCard
              title="Revenue by Product"
              description="Monthly revenue breakdown"
              icon={TrendingUp}
            >
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenueData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="product" type="category" width={80} fontSize={12} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </LaunchpadCard>
          </div>

        </div>
    </StandardPageLayout>
  );
};
