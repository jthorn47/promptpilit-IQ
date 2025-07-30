import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database, Zap, RefreshCw, BarChart3 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const DataBridgePage: React.FC = () => {
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
              <Database className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">DataBridge</h1>
              <p className="text-muted-foreground">Data integrations and ETL functions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Data Integration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Connect and sync data across multiple systems with real-time integration capabilities.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              <CardTitle>ETL Processing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Extract, transform, and load data with automated pipelines and validation.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Data Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Powerful analytics and reporting tools for data-driven business insights.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};