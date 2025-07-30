import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Download, User, FileText, CreditCard, Shield, PenTool, Calendar } from 'lucide-react';

interface CompletionStepProps {
  onboardingCode: any;
  onboardingRecord: any;
  onStepComplete: (data: any) => void;
  language: 'en' | 'es';
  stepData: any;
  saving: boolean;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({
  onboardingCode,
  onboardingRecord
}) => {
  const { t } = useTranslation();

  const completedSteps = [
    {
      icon: User,
      title: t('onboarding.steps.personalInfo.title'),
      completed: onboardingRecord.personal_info_completed,
      completedAt: onboardingRecord.personal_info_data?.completedAt
    },
    {
      icon: FileText,
      title: t('onboarding.steps.i9.title'),
      completed: onboardingRecord.i9_section1_completed,
      completedAt: onboardingRecord.i9_data?.completedAt
    },
    {
      icon: FileText,
      title: t('onboarding.steps.w4.title'),
      completed: onboardingRecord.w4_completed,
      completedAt: onboardingRecord.w4_data?.completedAt
    },
    {
      icon: CreditCard,
      title: t('onboarding.steps.directDeposit.title'),
      completed: onboardingRecord.direct_deposit_completed,
      completedAt: onboardingRecord.direct_deposit_data?.completedAt
    },
    {
      icon: Shield,
      title: t('onboarding.steps.handbook.title'),
      completed: onboardingRecord.handbook_acknowledged,
      completedAt: onboardingRecord.acknowledgment_data?.acknowledgedAt
    },
    {
      icon: PenTool,
      title: t('onboarding.steps.signature.title'),
      completed: onboardingRecord.esignature_completed,
      completedAt: onboardingRecord.esignature_data?.signedAt
    }
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="text-center bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl text-green-800">
            {t('onboarding.steps.completion.title')}
          </CardTitle>
          <p className="text-green-700">
            {t('onboarding.steps.completion.description')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-white/70 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-2">
              Welcome to {(onboardingCode.onboarding_companies as any)?.[0]?.company_name}!
            </h3>
            <p className="text-muted-foreground">
              {t('onboarding.steps.completion.welcomeTeam')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/70 rounded-lg p-4">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium">Completed On</h4>
              <p className="text-sm text-muted-foreground">
                {formatDate(onboardingRecord.completed_at)}
              </p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium">Steps Completed</h4>
              <p className="text-sm text-muted-foreground">
                {completedSteps.filter(step => step.completed).length} of {completedSteps.length}
              </p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium">Employee ID</h4>
              <p className="text-sm text-muted-foreground">
                {onboardingRecord.id.slice(0, 8)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('onboarding.steps.completion.summary')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('onboarding.steps.completion.allStepsCompleted')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedSteps.map((step, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {step.completed 
                        ? `Completed on ${formatDate(step.completedAt)} at ${formatTime(step.completedAt)}`
                        : 'Not completed'
                      }
                    </p>
                  </div>
                </div>
                <Badge variant={step.completed ? 'default' : 'secondary'}>
                  {step.completed ? 'Complete' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>{t('onboarding.steps.completion.nextSteps')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">HR Review</h4>
              <p className="text-sm text-blue-700">
                {t('onboarding.steps.completion.contactHr')}
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2">Access Your Portal</h4>
              <p className="text-sm text-purple-700">
                You can view your onboarding summary and other employment information in your employee portal at any time.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Start Date Information</h4>
              <p className="text-sm text-green-700">
                Your manager will contact you with your start date, orientation schedule, and first-day instructions.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button size="lg" className="px-8">
              <Download className="w-4 h-4 mr-2" />
              {t('onboarding.steps.completion.exportPdf')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompletionStep;