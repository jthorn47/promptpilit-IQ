import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

export const TaxManagementPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/payroll-iq')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to PayrollIQ
        </Button>
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tax Management</h1>
            <p className="text-muted-foreground">Manage payroll taxes and compliance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tax Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Configure federal, state, and local tax settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Review and manage automated tax calculations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Generate tax reports and filing documents.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};