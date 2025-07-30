import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Building2, User, FileText, Shield, CheckCircle } from 'lucide-react';

interface WelcomeStepProps {
  onboardingCode: any;
  onboardingRecord: any;
  onStepComplete: (data: any) => void;
  language: 'en' | 'es';
  stepData: any;
  saving: boolean;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  onboardingCode,
  onStepComplete,
  saving
}) => {
  const { t } = useTranslation();

  const handleContinue = () => {
    onStepComplete({
      welcomeCompleted: true,
      completedAt: new Date().toISOString()
    });
  };

  const features = [
    {
      icon: User,
      title: t('onboarding.steps.personalInfo.title'),
      description: t('onboarding.steps.personalInfo.description')
    },
    {
      icon: FileText,
      title: 'I-9 & W-4 Forms',
      description: 'Complete required federal forms'
    },
    {
      icon: Building2,
      title: t('onboarding.steps.directDeposit.title'),
      description: t('onboarding.steps.directDeposit.description')
    },
    {
      icon: Shield,
      title: t('onboarding.steps.handbook.title'),
      description: t('onboarding.steps.handbook.description')
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {t('onboarding.welcome')} {(onboardingCode.onboarding_companies as any)?.[0]?.company_name}!
          </CardTitle>
          <p className="text-muted-foreground">
            Welcome {onboardingCode.employee_first_name} {onboardingCode.employee_last_name}
          </p>
          <p className="text-sm text-muted-foreground">
            Position: {onboardingCode.position_title}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg mb-4">
              Let's get you started with a smooth onboarding process
            </p>
            <p className="text-muted-foreground">
              This wizard will guide you through all the necessary steps to complete your employment setup.
              You can save your progress at any time and return later to continue.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h4 className="font-medium">What you'll need:</h4>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-7">
              <li>• Personal information (address, phone, etc.)</li>
              <li>• Social Security Number</li>
              <li>• Bank account information for direct deposit</li>
              <li>• Valid ID documents (for I-9 verification)</li>
            </ul>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleContinue}
              disabled={saving}
              size="lg"
              className="px-8"
            >
              {saving ? 'Starting...' : 'Start Onboarding'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeStep;