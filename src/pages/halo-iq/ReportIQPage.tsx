import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, PieChart, TrendingUp, FileText } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const ReportIQPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/halo-iq')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Halo IQ
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Report IQ</h1>
              <p className="text-muted-foreground">Analytics and reporting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Advanced Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Powerful data analytics with custom dashboards and real-time insights.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-primary" />
              <CardTitle>Visual Reports</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Interactive charts and visualizations for clear data presentation.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Predictive Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              AI-powered forecasting and trend analysis for strategic planning.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};