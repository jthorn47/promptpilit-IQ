import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  FileText, 
  CreditCard, 
  Building, 
  PenTool, 
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import PersonalInfoStep from './steps/PersonalInfoStep';
import W4FormStep from './steps/W4FormStep';
import I9FormStep from './steps/I9FormStep';
import StateTaxFormStep from './steps/StateTaxFormStep';
import DirectDepositStep from './steps/DirectDepositStep';
import HandbookStep from './steps/HandbookStep';
import ESignatureStep from './steps/ESignatureStep';

interface OnboardingRecord {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  current_step: number;
  total_steps: number;
  language_preference: 'en' | 'es';
  personal_info_completed: boolean;
  w4_completed: boolean;
  i9_section1_completed: boolean;
  state_tax_completed: boolean;
  direct_deposit_completed: boolean;
  handbook_acknowledged: boolean;
  esignature_completed: boolean;
}

interface OnboardingCode {
  id: string;
  code: string;
  company_id: string;
  work_state: string;
  onboarding_companies: {
    company_name: string;
    company_logo_url: string | null;
    default_language: 'en' | 'es';
  };
}

interface OnboardingStepsProps {
  onboardingRecord: OnboardingRecord;
  onboardingCode: OnboardingCode;
  language: 'en' | 'es';
  onLanguageChange: (language: 'en' | 'es') => void;
}

const OnboardingSteps: React.FC<OnboardingStepsProps> = ({
  onboardingRecord,
  onboardingCode,
  language,
  onLanguageChange
}) => {
  const [currentStep, setCurrentStep] = useState(onboardingRecord.current_step);
  const [record, setRecord] = useState(onboardingRecord);

  const translations = {
    en: {
      title: 'Employee Onboarding',
      step: 'Step',
      of: 'of',
      next: 'Next',
      previous: 'Previous',
      complete: 'Complete Onboarding',
      completed: 'Completed',
      pending: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected'
    },
    es: {
      title: 'Incorporación de Empleado',
      step: 'Paso',
      of: 'de',
      next: 'Siguiente',
      previous: 'Anterior',
      complete: 'Completar Incorporación',
      completed: 'Completado',
      pending: 'Revisión Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado'
    }
  };

  const t = translations[language];

  const steps = [
    {
      id: 1,
      title: language === 'en' ? 'Personal Information' : 'Información Personal',
      icon: User,
      completed: record.personal_info_completed,
      component: PersonalInfoStep
    },
    {
      id: 2,
      title: language === 'en' ? 'W-4 Tax Form' : 'Formulario W-4 de Impuestos',
      icon: FileText,
      completed: record.w4_completed,
      component: W4FormStep
    },
    {
      id: 3,
      title: language === 'en' ? 'I-9 Employment Eligibility' : 'Elegibilidad de Empleo I-9',
      icon: Building,
      completed: record.i9_section1_completed,
      component: I9FormStep
    },
    {
      id: 4,
      title: language === 'en' ? 'State Tax Form' : 'Formulario de Impuestos Estatales',
      icon: FileText,
      completed: record.state_tax_completed,
      component: StateTaxFormStep
    },
    {
      id: 5,
      title: language === 'en' ? 'Direct Deposit' : 'Depósito Directo',
      icon: CreditCard,
      completed: record.direct_deposit_completed,
      component: DirectDepositStep
    },
    {
      id: 6,
      title: language === 'en' ? 'Employee Handbook' : 'Manual del Empleado',
      icon: FileText,
      completed: record.handbook_acknowledged,
      component: HandbookStep
    },
    {
      id: 7,
      title: language === 'en' ? 'Electronic Signature' : 'Firma Electrónica',
      icon: PenTool,
      completed: record.esignature_completed,
      component: ESignatureStep
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;

  const progressPercentage = (steps.filter(step => step.completed).length / steps.length) * 100;

  const handleStepComplete = async (stepData: any) => {
    // Update the record with the completed step
    const updatedRecord = { ...record };
    
    // Mark the current step as completed based on step ID
    switch (currentStep) {
      case 1:
        updatedRecord.personal_info_completed = true;
        break;
      case 2:
        updatedRecord.w4_completed = true;
        break;
      case 3:
        updatedRecord.i9_section1_completed = true;
        break;
      case 4:
        updatedRecord.state_tax_completed = true;
        break;
      case 5:
        updatedRecord.direct_deposit_completed = true;
        break;
      case 6:
        updatedRecord.handbook_acknowledged = true;
        break;
      case 7:
        updatedRecord.esignature_completed = true;
        break;
    }

    // Update in database
    const { error } = await supabase
      .from('employee_onboarding')
      .update({
        ...updatedRecord,
        current_step: currentStep < steps.length ? currentStep + 1 : currentStep,
        status: currentStep === steps.length ? 'completed' : 'in_progress'
      })
      .eq('id', record.id);

    if (error) {
      console.error('Error updating record:', error);
      return;
    }

    setRecord(updatedRecord);

    // Move to next step if not the last step
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const getStatusBadge = () => {
    switch (record.status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">{t.completed}</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">{t.approved}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t.rejected}</Badge>;
      default:
        return <Badge variant="outline">{t.pending}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {(onboardingCode.onboarding_companies as any)?.[0]?.company_logo_url && (
                <img 
                  src={(onboardingCode.onboarding_companies as any)[0].company_logo_url}
                  alt="Company Logo"
                  className="h-10 w-auto"
                />
              )}
              <div>
                <h1 className="text-xl font-semibold">{t.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {(onboardingCode.onboarding_companies as any)?.[0]?.company_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge()}
              <LanguageSelector 
                language={language}
                onLanguageChange={onLanguageChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {t.step} {currentStep} {t.of} {steps.length}
              </h2>
              <span className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            
            {/* Step indicators */}
            <div className="flex justify-between mt-4">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.completed;
                
                return (
                  <div 
                    key={step.id}
                    className={`flex flex-col items-center gap-2 ${
                      isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    <div className={`p-2 rounded-full border-2 ${
                      isActive ? 'border-primary bg-primary/10' : 
                      isCompleted ? 'border-green-600 bg-green-100' : 
                      'border-muted'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-xs text-center max-w-20 leading-tight">
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Current Step Content */}
          <Card className="p-6">
            {CurrentStepComponent && (
              <CurrentStepComponent
                onboardingRecord={record}
                onboardingCode={onboardingCode}
                language={language}
                onStepComplete={handleStepComplete}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.previous}
              </Button>

              <Button
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                disabled={currentStep === steps.length || !currentStepData?.completed}
              >
                {currentStep === steps.length ? t.complete : t.next}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSteps;