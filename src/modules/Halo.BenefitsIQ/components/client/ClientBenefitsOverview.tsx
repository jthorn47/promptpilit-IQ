// Client Benefits Overview - Key metrics and quick actions
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  DollarSign, 
  TrendingUp,
  Heart,
  Eye,
  Stethoscope,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClientBenefitsOverviewProps {
  companyId: string;
}

interface BenefitsMetrics {
  totalPlans: number;
  totalEmployees: number;
  monthlyCost: number;
  enrollmentRate: number;
  activeCarriers: number;
  upcomingRenewals: number;
}

export const ClientBenefitsOverview: React.FC<ClientBenefitsOverviewProps> = ({ 
  companyId 
}) => {
  const [metrics, setMetrics] = useState<BenefitsMetrics>({
    totalPlans: 0,
    totalEmployees: 0,
    monthlyCost: 0,
    enrollmentRate: 0,
    activeCarriers: 0,
    upcomingRenewals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const loadMetrics = async () => {
      // Mock data for now
      setTimeout(() => {
        setMetrics({
          totalPlans: 12,
          totalEmployees: 45,
          monthlyCost: 28500,
          enrollmentRate: 92,
          activeCarriers: 4,
          upcomingRenewals: 2
        });
        setLoading(false);
      }, 1000);
    };

    loadMetrics();
  }, [companyId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-3"></div>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold">{metrics.totalPlans}</p>
                <p className="text-xs text-muted-foreground">Across all benefit types</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enrolled Employees</p>
                <p className="text-2xl font-bold">{metrics.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">{metrics.enrollmentRate}% enrollment rate</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
                <p className="text-2xl font-bold">${metrics.monthlyCost.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">All benefit premiums</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Carriers</p>
                <p className="text-2xl font-bold">{metrics.activeCarriers}</p>
                <p className="text-xs text-muted-foreground">Insurance providers</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost Trend</p>
                <p className="text-2xl font-bold text-green-600">-2.3%</p>
                <p className="text-xs text-muted-foreground">vs. last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Renewals</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.upcomingRenewals}</p>
                <p className="text-xs text-muted-foreground">Next 90 days</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Plan Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Medical Plans</p>
                  <p className="text-sm text-muted-foreground">3 active plans</p>
                </div>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Dental Plans</p>
                  <p className="text-sm text-muted-foreground">2 active plans</p>
                </div>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Vision Plans</p>
                  <p className="text-sm text-muted-foreground">1 active plan</p>
                </div>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New employee enrolled</p>
                  <p className="text-xs text-muted-foreground">John Smith added to medical plan</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Premium payment processed</p>
                  <p className="text-xs text-muted-foreground">Monthly premium for all plans</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Renewal notice received</p>
                  <p className="text-xs text-muted-foreground">Blue Cross Blue Shield renewal terms</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};