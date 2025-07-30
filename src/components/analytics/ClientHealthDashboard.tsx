import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { 
  Heart, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  Clock,
  Target
} from "lucide-react";

interface ClientHealthDashboardProps {
  region?: string;
  vertical?: string;
  client?: string;
}

export function ClientHealthDashboard({ region, vertical, client }: ClientHealthDashboardProps) {
  const healthScoreData = [
    { name: "Excellent (90-100)", count: 234, color: "#22C55E" },
    { name: "Good (75-89)", count: 567, color: "#3B82F6" },
    { name: "Fair (60-74)", count: 421, color: "#F59E0B" },
    { name: "Poor (40-59)", count: 156, color: "#EF4444" },
    { name: "Critical (0-39)", count: 23, color: "#DC2626" }
  ];

  const profitabilityData = [
    { client: "TechCorp", healthScore: 95, profitability: 42, revenue: 125000, riskLevel: "low" },
    { client: "RetailMax", healthScore: 87, profitability: 38, revenue: 89000, riskLevel: "low" },
    { client: "MedGroup", healthScore: 72, profitability: 31, revenue: 156000, riskLevel: "medium" },
    { client: "BuildCo", healthScore: 68, profitability: 28, revenue: 67000, riskLevel: "medium" },
    { client: "FoodChain", healthScore: 45, profitability: 18, revenue: 234000, riskLevel: "high" },
    { client: "StartupX", healthScore: 34, profitability: 12, revenue: 45000, riskLevel: "critical" }
  ];

  const riskFactorsData = [
    { factor: "Late Submissions", count: 45, severity: "high" },
    { factor: "Payment Delays", count: 23, severity: "critical" },
    { factor: "High Error Rate", count: 67, severity: "medium" },
    { factor: "Payroll Volatility", count: 89, severity: "medium" },
    { factor: "Compliance Issues", count: 12, severity: "critical" },
    { factor: "Low Engagement", count: 134, severity: "low" }
  ];

  const topAtRiskClients = [
    { name: "FoodChain Corp", score: 34, trend: "down", revenue: "$234K", issues: 5 },
    { name: "StartupX Inc", score: 45, trend: "down", revenue: "$45K", issues: 3 },
    { name: "OldCorp LLC", score: 52, trend: "stable", revenue: "$178K", issues: 4 },
    { name: "TechDown Co", score: 58, trend: "down", revenue: "$92K", issues: 2 },
    { name: "RetailBad", score: 61, trend: "down", revenue: "$134K", issues: 6 }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "high": return "bg-orange-500";
      case "critical": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive">Critical</Badge>;
      case "high": return <Badge variant="secondary">High</Badge>;
      case "medium": return <Badge variant="outline">Medium</Badge>;
      case "low": return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Client Health Distribution
            </CardTitle>
            <CardDescription>Overall health score breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {healthScoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profitability vs Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Health vs Profitability Matrix
            </CardTitle>
            <CardDescription>Client positioning and risk assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={profitabilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="healthScore" name="Health Score" />
                <YAxis dataKey="profitability" name="Profitability %" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name, props) => [
                    name === "healthScore" ? value : `${value}%`,
                    name === "healthScore" ? "Health Score" : "Profitability"
                  ]}
                  labelFormatter={(value, payload) => 
                    payload?.[0]?.payload?.client || "Client"
                  }
                />
                <Scatter dataKey="profitability" fill="#655DC6">
                  {profitabilityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.riskLevel === "critical" ? "#DC2626" :
                        entry.riskLevel === "high" ? "#EF4444" :
                        entry.riskLevel === "medium" ? "#F59E0B" :
                        "#22C55E"
                      } 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Factors and At-Risk Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Risk Factors Analysis
            </CardTitle>
            <CardDescription>Common issues across client base</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskFactorsData.map((factor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{factor.factor}</span>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(factor.severity)}
                        <span className="text-sm text-muted-foreground">{factor.count}</span>
                      </div>
                    </div>
                    <Progress 
                      value={(factor.count / 300) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Top At-Risk Clients
            </CardTitle>
            <CardDescription>Clients requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topAtRiskClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{client.name}</span>
                      <Badge variant={client.score < 50 ? "destructive" : "secondary"}>
                        Score: {client.score}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {client.revenue}
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {client.issues} issues
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Health Metrics</CardTitle>
          <CardDescription>Key performance indicators by client health tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">94.2%</div>
              <div className="text-sm text-muted-foreground">Avg Health Score (Top Tier)</div>
              <Progress value={94} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">$185K</div>
              <div className="text-sm text-muted-foreground">Avg Revenue (Healthy)</div>
              <Progress value={75} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">2.1%</div>
              <div className="text-sm text-muted-foreground">Error Rate (At Risk)</div>
              <Progress value={21} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">15</div>
              <div className="text-sm text-muted-foreground">Critical Clients</div>
              <Progress value={5} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}