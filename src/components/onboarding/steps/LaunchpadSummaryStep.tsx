import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Rocket, CheckCircle, Users, Building } from 'lucide-react';

interface LaunchpadSummaryStepProps {
  data: any;
  onUpdate: (section: string, data: any) => void;
  onCommentaryUpdate: (commentary: string) => void;
}

export const LaunchpadSummaryStep: React.FC<LaunchpadSummaryStepProps> = ({
  data,
  onCommentaryUpdate,
}) => {
  const handleGoLive = () => {
    onCommentaryUpdate('Congratulations! Your payroll system is now active. HALO will continuously monitor for compliance and optimization opportunities.');
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Setup Complete!</h2>
            <p className="text-green-700">
              Your payroll system is configured and ready to launch.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Company Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Company Name:</span>
              <span className="font-medium">{data.companyInfo?.legalCompanyName || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">EIN:</span>
              <span className="font-medium">{data.companyInfo?.ein || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entity Type:</span>
              <span className="font-medium">{data.companyInfo?.entityType || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Industry:</span>
              <span className="font-medium">{data.companyInfo?.industry || 'Not specified'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Service Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Model:</span>
              <Badge>{data.servicePlan?.servicePlanType || 'ASO'}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Add-ons:</span>
              <span className="font-medium">
                {data.servicePlan?.selectedAddons?.length || 0} selected
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Readiness Score:</span>
              <Badge variant={data.readinessScan?.onboardingScore >= 75 ? 'default' : 'secondary'}>
                {data.readinessScan?.onboardingScore || 0}%
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">HALO Coverage:</span>
              <Badge variant="default">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">System Activation</h4>
                <p className="text-sm text-muted-foreground">
                  Your payroll system will be activated and HALO will begin monitoring.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Support Team Notification</h4>
                <p className="text-sm text-muted-foreground">
                  Our support team will be notified and ready to assist with your first payroll.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Schedule First Payroll</h4>
                <p className="text-sm text-muted-foreground">
                  You can now schedule your first payroll run through the dashboard.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Setup Summary
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download HALO Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Launch Button */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary-glow/10">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Ready to Launch Your Payroll System?</h3>
            <p className="text-muted-foreground mb-6">
              Click below to activate your account and begin processing payroll with HALO's intelligent monitoring.
            </p>
            <Button 
              size="lg" 
              onClick={handleGoLive}
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Go Live Now!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};