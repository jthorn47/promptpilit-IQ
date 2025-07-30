import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Shield, BarChart3, Receipt } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const VaultPayPage: React.FC = () => {
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
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">VaultPay</h1>
              <p className="text-muted-foreground">Payment processing module</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Payment Processing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Secure payment processing with multiple gateway integrations and fraud protection.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Security & Compliance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              PCI DSS compliant payment processing with end-to-end encryption.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Payment Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Comprehensive reporting and analytics for payment transactions and trends.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};