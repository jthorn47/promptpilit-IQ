import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter
} from "lucide-react";

export const CompXAnalyticsModule = () => {
  // Mock analytics data
  const analyticsData = {
    yearToDate: {
      totalClaims: 24,
      totalCosts: 125000,
      avgCostPerClaim: 5208,
      incidentRate: 2.3,
      lostTimeRate: 1.1,
      experienceModifier: 0.95
    },
    monthlyTrends: [
      { month: "Jan", claims: 3, costs: 15000 },
      { month: "Feb", claims: 2, costs: 8500 },
      { month: "Mar", claims: 4, costs: 22000 },
      { month: "Apr", claims: 1, costs: 5000 },
      { month: "May", claims: 3, costs: 18000 },
      { month: "Jun", claims: 2, costs: 12000 }
    ],
    claimsByType: [
      { type: "Medical Only", count: 15, percentage: 62.5 },
      { type: "Lost Time", count: 6, percentage: 25.0 },
      { type: "Permanent Partial", count: 2, percentage: 8.3 },
      { type: "Fatality", count: 1, percentage: 4.2 }
    ],
    topCauses: [
      { cause: "Slip and Fall", count: 8, trend: "up" },
      { cause: "Lifting/Strain", count: 6, trend: "down" },
      { cause: "Equipment Injury", count: 4, trend: "stable" },
      { cause: "Cut/Laceration", count: 3, trend: "up" },
      { cause: "Chemical Exposure", count: 3, trend: "stable" }
    ]
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics & Reporting</h2>
          <p className="text-muted-foreground">
            Comprehensive workers' compensation analytics and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.yearToDate.totalClaims}</div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.yearToDate.totalCosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Claim</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.yearToDate.avgCostPerClaim.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -8% vs last year
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incident Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.yearToDate.incidentRate}</div>
            <p className="text-xs text-muted-foreground">Per 100 employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lost Time Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.yearToDate.lostTimeRate}</div>
            <p className="text-xs text-muted-foreground">Per 100 employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience Mod</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analyticsData.yearToDate.experienceModifier}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              5% credit
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Trends
            </CardTitle>
            <CardDescription>
              Claims and costs over the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.monthlyTrends.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-center font-medium">{month.month}</div>
                    <div>
                      <div className="text-sm font-medium">{month.claims} Claims</div>
                      <div className="text-xs text-muted-foreground">${month.costs.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(month.claims / 4) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Claims by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Claims by Type
            </CardTitle>
            <CardDescription>
              Distribution of claim types this year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.claimsByType.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium">{type.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{type.count}</div>
                    <div className="text-xs text-muted-foreground">{type.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Injury Causes */}
        <Card>
          <CardHeader>
            <CardTitle>Top Injury Causes</CardTitle>
            <CardDescription>
              Most common causes of workplace injuries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topCauses.map((cause, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{cause.cause}</div>
                      <div className="text-sm text-muted-foreground">{cause.count} incidents</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(cause.trend)}
                    <Badge variant="outline">{cause.trend}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benchmarking */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Benchmarking</CardTitle>
            <CardDescription>
              How your metrics compare to industry standards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Incident Rate</span>
                  <span>2.3 vs 3.2 (Industry Avg)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }} />
                </div>
                <div className="text-xs text-green-600 mt-1">28% below industry average</div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Average Cost per Claim</span>
                  <span>$5,208 vs $6,800 (Industry Avg)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '77%' }} />
                </div>
                <div className="text-xs text-green-600 mt-1">23% below industry average</div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Lost Time Rate</span>
                  <span>1.1 vs 1.8 (Industry Avg)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '61%' }} />
                </div>
                <div className="text-xs text-green-600 mt-1">39% below industry average</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
          <CardDescription>
            Generate common workers' compensation reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Monthly Summary
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              Claims Analysis
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              Cost Report
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              Trend Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};