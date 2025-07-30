import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calculator, FileText, TrendingUp, Shield } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { ComingSoonModal } from '@/components/ui/coming-soon-modal';

export const TaxIQPage: React.FC = () => {
  const navigate = useNavigate();
  const [comingSoonModal, setComingSoonModal] = useState<{ isOpen: boolean; featureName: string }>({
    isOpen: false,
    featureName: ''
  });

  // Feature flags
  const taxCalculationsEnabled = useFeatureFlag('taxCalculations');
  const taxReportingEnabled = useFeatureFlag('taxReporting');
  const taxComplianceEnabled = useFeatureFlag('taxCompliance');

  const handleFeatureClick = (featureName: string, featureKey: string, enabled: boolean) => {
    if (enabled) {
      // Handle enabled features with actual functionality
      switch (featureKey) {
        case 'taxCalculations':
          console.log('Opening Tax Calculation engine...');
          // TODO: Open tax calculation interface
          break;
        case 'taxReporting':
          console.log('Opening Tax Reporting dashboard...');
          // TODO: Open tax reporting interface
          break;
        case 'taxCompliance':
          console.log('Opening Tax Compliance manager...');
          // TODO: Open compliance management interface
          break;
        default:
          console.log(`Opening ${featureName}...`);
      }
    } else {
      // This should not happen since all features are now enabled
      setComingSoonModal({ isOpen: true, featureName });
    }
  };

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
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">TaxIQ</h1>
              <p className="text-muted-foreground">Internal tax engine for payroll and finance calculations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          className="border-border cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleFeatureClick('Tax Calculations', 'taxCalculations', taxCalculationsEnabled)}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-primary" />
              <CardTitle>Tax Calculations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Automated tax calculations for payroll, sales, and business transactions.
            </CardDescription>
          </CardContent>
        </Card>

        <Card 
          className="border-border cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleFeatureClick('Tax Reporting', 'taxReporting', taxReportingEnabled)}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Tax Reporting</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Generate accurate tax reports and filings with automated compliance checking.
            </CardDescription>
          </CardContent>
        </Card>

        <Card 
          className="border-border cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleFeatureClick('Compliance Management', 'taxCompliance', taxComplianceEnabled)}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Compliance Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Stay compliant with changing tax regulations and automated updates.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={comingSoonModal.isOpen}
        onClose={() => setComingSoonModal({ isOpen: false, featureName: '' })}
        featureName={comingSoonModal.featureName}
      />
    </div>
  );
};