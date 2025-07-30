import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, DollarSign, BarChart3, Award } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const CompXPage: React.FC = () => {
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
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">CompX</h1>
              <p className="text-muted-foreground">Compensation and wage management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle>Wage Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Comprehensive wage and salary management with automated calculations and adjustments.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle>Performance Incentives</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Design and manage performance-based compensation and bonus structures.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Compensation Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Market analysis and benchmarking tools for competitive compensation planning.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};