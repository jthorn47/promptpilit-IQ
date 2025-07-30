import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Brain, 
  TrendingDown, 
  AlertTriangle,
  Users,
  CreditCard,
  Shield,
  Zap
} from "lucide-react";

interface PredictiveDashboardProps {
  region?: string;
  vertical?: string;
  client?: string;
}

export function PredictiveDashboard({ region, vertical, client }: PredictiveDashboardProps) {
  const churnPredictions = [
    { month: "Jan", predicted: 2.1, actual: 1.9, confidence: 0.92 },
    { month: "Feb", predicted: 2.3, actual: 2.1, confidence: 0.89 },
    { month: "Mar", predicted: 1.8, actual: 1.7, confidence: 0.94 },
    { month: "Apr", predicted: 2.5, actual: null, confidence: 0.87 },
    { month: "May", predicted: 2.2, actual: null, confidence: 0.91 },
    { month: "Jun", predicted: 1.9, actual: null, confidence: 0.93 }
  ];

  const nsfProbabilities = [
    { name: "Very Low (0-10%)", value: 68, color: "#22C55E" },
    { name: "Low (10-25%)", value: 23, color: "#3B82F6" },
    { name: "Medium (25-50%)", value: 7, color: "#F59E0B" },
    { name: "High (50-75%)", value: 2, color: "#EF4444" },
    { name: "Critical (75%+)", value: 0, color: "#DC2626" }
  ];

  const riskSignals = [
    { signal: "Employee Turnover", trend: "increasing", severity: "high", affected: 23 },
    { signal: "Absenteeism Rate", trend: "stable", severity: "medium", affected: 45 },
    { signal: "Overtime Hours", trend: "decreasing", severity: "low", affected: 67 },
    { signal: "Payroll Errors", trend: "increasing", severity: "critical", affected: 12 },
    { signal: "Late Submissions", trend: "stable", severity: "medium", affected: 34 },
    { signal: "Compliance Drift", trend: "increasing", severity: "high", affected: 18 }
  ];

  const complianceDrift = [
    { week: "W1", california: 95, texas: 98, newYork: 92, florida: 89 },
    { week: "W2", california: 93, texas: 97, newYork: 90, florida: 87 },
    { week: "W3", california: 91, texas: 96, newYork: 89, florida: 85 },
    { week: "W4", california: 89, texas: 95, newYork: 87, florida: 83 },
    { week: "W5", california: 87, texas: 94, newYork: 85, florida: 81 }
  ];

  const topRiskClients = [
    { name: "RetailCorp", churnProb: 0.78, nsfProb: 0.23, complianceRisk: 0.45, revenue: "$156K" },
    { name: "TechStart", churnProb: 0.67, nsfProb: 0.89, complianceRisk: 0.12, revenue: "$89K" },
    { name: "ManufacCo", churnProb: 0.54, nsfProb: 0.34, complianceRisk: 0.67, revenue: "$234K" },
    { name: "ServiceInc", churnProb: 0.49, nsfProb: 0.56, complianceRisk: 0.23, revenue: "$123K" },
    { name: "BuildCorp", churnProb: 0.43, nsfProb: 0.12, complianceRisk: 0.78, revenue: "$178K" }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600";
      case "high": return "text-orange-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return "↗️";
      case "decreasing": return "↘️";
      case "stable": return "→";
      default: return "?";
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Predictions Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Risk</CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3%</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days (89% confidence)
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NSF Probability</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.8%</div>
            <p className="text-xs text-muted-foreground">
              High-risk transactions (94% confidence)
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Drift</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              Clients at risk (87% confidence)
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HR Risk Score</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              High turnover alerts (91% confidence)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Prediction Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Churn Prediction Model
            </CardTitle>
            <CardDescription>Predicted vs actual churn rates with confidence intervals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={churnPredictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}%`, 
                    name === "predicted" ? "Predicted" : "Actual"
                  ]}
                />
                <Line type="monotone" dataKey="predicted" stroke="#EF4444" strokeWidth={3} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="actual" stroke="#22C55E" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* NSF Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-500" />
              NSF Risk Distribution
            </CardTitle>
            <CardDescription>Client distribution by NSF probability</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={nsfProbabilities}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {nsfProbabilities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Clients"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Signals and Compliance Drift */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              HR Risk Signals
            </CardTitle>
            <CardDescription>Predictive indicators for workforce issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskSignals.map((signal, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{signal.signal}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={signal.severity === "critical" ? "destructive" : "secondary"}
                          className={getSeverityColor(signal.severity)}
                        >
                          {signal.severity}
                        </Badge>
                        <span className="text-sm">{getTrendIcon(signal.trend)}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {signal.affected} clients affected
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Compliance Drift Forecast
            </CardTitle>
            <CardDescription>State compliance scores trending downward</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={complianceDrift}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[75, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, ""]} />
                <Area type="monotone" dataKey="california" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="texas" stackId="2" stroke="#22C55E" fill="#22C55E" fillOpacity={0.6} />
                <Area type="monotone" dataKey="newYork" stackId="3" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                <Area type="monotone" dataKey="florida" stackId="4" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Risk Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            High-Risk Client Predictions
          </CardTitle>
          <CardDescription>Clients with elevated risk across multiple models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topRiskClients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-lg">{client.name}</span>
                    <span className="text-sm text-muted-foreground">{client.revenue}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Churn Risk</div>
                      <div className="flex items-center gap-2">
                        <Progress value={client.churnProb * 100} className="h-2" />
                        <span className="text-sm font-medium">{(client.churnProb * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">NSF Risk</div>
                      <div className="flex items-center gap-2">
                        <Progress value={client.nsfProb * 100} className="h-2" />
                        <span className="text-sm font-medium">{(client.nsfProb * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Compliance Risk</div>
                      <div className="flex items-center gap-2">
                        <Progress value={client.complianceRisk * 100} className="h-2" />
                        <span className="text-sm font-medium">{(client.complianceRisk * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="ml-4">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}