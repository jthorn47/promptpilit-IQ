import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const ComplyIQPage: React.FC = () => {
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
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">ComplyIQ</h1>
              <p className="text-muted-foreground">Compliance and policy management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Policy Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Centralized policy creation, distribution, and tracking with automated updates.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <CardTitle>Risk Assessment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Identify and assess compliance risks with automated monitoring and alerts.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <CardTitle>Compliance Tracking</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Monitor compliance status across all departments with real-time dashboards.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};