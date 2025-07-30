import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Users, TrendingUp } from "lucide-react";

export default function TerritoryManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Territory Management</h1>
        <p className="text-muted-foreground">
          Manage your assigned territory and track regional performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Territory</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Southern California</div>
            <p className="text-xs text-muted-foreground">
              Los Angeles, Orange, Riverside Counties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              3 pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placements YTD</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground">
              +23% vs last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Share</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5%</div>
            <p className="text-xs text-muted-foreground">
              Of regional staffing market
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Territory Coverage</CardTitle>
            <CardDescription>Areas within your exclusive territory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Los Angeles County</p>
                <p className="text-sm text-muted-foreground">Primary market</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Orange County</p>
                <p className="text-sm text-muted-foreground">Growth opportunity</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Developing</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Riverside County</p>
                <p className="text-sm text-muted-foreground">Emerging market</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Exploring</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competitive Analysis</CardTitle>
            <CardDescription>Key competitors in your territory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Express Employment</p>
                <p className="text-sm text-muted-foreground">Market leader</p>
              </div>
              <span className="text-sm font-medium">22% share</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Kelly Services</p>
                <p className="text-sm text-muted-foreground">National player</p>
              </div>
              <span className="text-sm font-medium">18% share</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Local Staffing Plus</p>
                <p className="text-sm text-muted-foreground">Regional competitor</p>
              </div>
              <span className="text-sm font-medium">12% share</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <div>
                <p className="font-medium text-primary">Easeworks (You)</p>
                <p className="text-sm text-muted-foreground">Your market position</p>
              </div>
              <span className="text-sm font-medium text-primary">8.5% share</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Territory Guidelines</CardTitle>
          <CardDescription>Important rules and boundaries for your territory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Exclusive Rights</p>
            <p className="text-sm text-blue-700">You have exclusive rights to develop business within your assigned counties. No other POP can compete in this territory.</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm font-medium text-yellow-900">Non-Compete Agreement</p>
            <p className="text-sm text-yellow-700">You cannot directly compete with Easeworks or solicit clients outside the platform during and after your partnership.</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-900">Territory Transfer</p>
            <p className="text-sm text-green-700">Territory assignments are non-transferable. If you leave the program, all client relationships remain with Easeworks.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}