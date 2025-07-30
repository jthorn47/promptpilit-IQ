import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import WelcomeStep from './steps/WelcomeStep';
import PersonalInfoStep from './steps/PersonalInfoStep';
import I9FormStep from './steps/I9FormStep';
import DirectDepositStep from './steps/DirectDepositStep';
import HandbookStep from './steps/HandbookStep';
import ESignatureStep from './steps/ESignatureStep';
import CompletionStep from './steps/CompletionStep';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface OnboardingCode {
  id: string;
  code: string;
  company_id: string;
  employee_email?: string;
  employee_first_name?: string;
  employee_last_name?: string;
  position_title?: string;
  work_state: string;
  preferred_language?: 'en' | 'es';
  onboarding_companies: {
    id: string;
    company_name: string;
    company_logo_url?: string;
    default_language?: 'en' | 'es';
  };
}

interface OnboardingRecord {
  id: string;
  status?: string;
  current_step?: number;
  total_steps?: number;
  language_preference?: 'en' | 'es';
  personal_info_completed?: boolean;
  i9_section1_completed?: boolean;
  w4_completed?: boolean;
  state_tax_completed?: boolean;
  ca_wage_notice_completed?: boolean;
  direct_deposit_completed?: boolean;
  handbook_acknowledged?: boolean;
  esignature_completed?: boolean;
  personal_info_data?: any;
  i9_data?: any;
  w4_data?: any;
  state_tax_data?: any;
  ca_wage_notice_data?: any;
  direct_deposit_data?: any;
  acknowledgment_data?: any;
  esignature_data?: any;
  completed_at?: string;
  [key: string]: any;
}

export const OnboardingWizard: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  
  const [onboardingCode, setOnboardingCode] = useState<OnboardingCode | null>(null);
  const [onboardingRecord, setOnboardingRecord] = useState<OnboardingRecord | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const totalSteps = 7;

  const steps = [
    { id: 1, key: 'welcome', component: WelcomeStep },
    { id: 2, key: 'personalInfo', component: PersonalInfoStep },
    { id: 3, key: 'directDeposit', component: DirectDepositStep },
    { id: 4, key: 'i9', component: I9FormStep },
    { id: 5, key: 'handbook', component: HandbookStep },
    { id: 6, key: 'signature', component: ESignatureStep },
    { id: 7, key: 'completion', component: CompletionStep }
  ];

  useEffect(() => {
    if (code) {
      fetchOnboardingData();
    }
  }, [code]);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const fetchOnboardingData = async () => {
    try {
      // Fetch onboarding code and company info
      const { data: codeData, error: codeError } = await supabase
        .from('onboarding_codes')
        .select(`
          *,
          onboarding_companies (
            id,
            company_name,
            company_logo_url,
            default_language
          )
        `)
        .eq('code', code)
        .single();

      if (codeError || !codeData) {
        toast({
          title: t('common.error'),
          description: 'Invalid onboarding code',
          variant: 'destructive'
        });
        navigate('/');
        return;
      }

      setOnboardingCode(codeData as any);
      setLanguage((codeData as any).preferred_language || codeData.onboarding_companies?.[0]?.default_language || 'en');

      // Check for existing onboarding record
      const { data: recordData, error: recordError } = await supabase
        .from('employee_onboarding')
        .select('*')
        .eq('onboarding_code_id', codeData.id)
        .maybeSingle();

      if (!recordError && recordData) {
        setOnboardingRecord(recordData as OnboardingRecord);
        setCurrentStep(recordData.current_step || 1);
        setLanguage(recordData.language_preference || language);
      } else {
        // Create new onboarding record
        const { data: newRecord, error: createError } = await supabase
          .from('employee_onboarding')
          .insert({
            onboarding_code_id: codeData.id,
            language_preference: language,
            status: 'in_progress',
            current_step: 1,
            total_steps: totalSteps
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating onboarding record:', createError);
          toast({
            title: t('common.error'),
            description: 'Failed to start onboarding process',
            variant: 'destructive'
          });
          return;
        }

        setOnboardingRecord(newRecord as OnboardingRecord);
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load onboarding data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (stepData: any, stepKey: string) => {
    if (!onboardingRecord) return;

    setSaving(true);
    try {
      const updateData: any = {
        [`${stepKey}_data`]: stepData,
        [`${stepKey}_completed`]: true,
        current_step: Math.max(currentStep + 1, onboardingRecord.current_step),
        language_preference: language,
        updated_at: new Date().toISOString()
      };

      // If this is the last step, mark as completed
      if (currentStep === totalSteps) {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('employee_onboarding')
        .update(updateData)
        .eq('id', onboardingRecord.id);

      if (error) throw error;

      // Update local state
      setOnboardingRecord(prev => prev ? { ...prev, ...updateData } : null);

      toast({
        title: t('common.success'),
        description: 'Progress saved successfully'
      });

      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to save progress',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleStepComplete = async (stepData: any) => {
    const stepKey = steps[currentStep - 1]?.key;
    if (!stepKey) return;

    const success = await saveProgress(stepData, stepKey);
    if (success && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleLanguageChange = async (newLanguage: 'en' | 'es') => {
    setLanguage(newLanguage);
    
    if (onboardingRecord) {
      try {
        await supabase
          .from('employee_onboarding')
          .update({ language_preference: newLanguage })
          .eq('id', onboardingRecord.id);
      } catch (error) {
        console.error('Error updating language preference:', error);
      }
    }
  };

  const getProgressPercentage = () => {
    if (!onboardingRecord) return 0;
    
    const completedSteps = [
      onboardingRecord.personal_info_completed,
      onboardingRecord.i9_section1_completed,
      onboardingRecord.w4_completed,
      onboardingRecord.state_tax_completed,
      onboardingRecord.ca_wage_notice_completed,
      onboardingRecord.direct_deposit_completed,
      onboardingRecord.handbook_acknowledged,
      onboardingRecord.esignature_completed
    ].filter(Boolean).length;
    
    return Math.round((completedSteps / 8) * 100);
  };

  const getStatusBadge = () => {
    if (!onboardingRecord) {
      return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{t('common.loading')}</Badge>;
    }

    switch (onboardingRecord.status) {
      case 'completed':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Complete</Badge>;
      case 'in_progress':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Not Started</Badge>;
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!onboardingCode || !onboardingRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Onboarding Code</h1>
          <p className="text-muted-foreground">
            The onboarding code you provided is invalid or has expired.
          </p>
        </Card>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep - 1]?.component;
  const stepKey = steps[currentStep - 1]?.key;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {(onboardingCode.onboarding_companies as any)?.[0]?.company_logo_url && (
                <img 
                  src={(onboardingCode.onboarding_companies as any)[0].company_logo_url} 
                  alt="Company Logo"
                  className="h-8 w-auto"
                />
              )}
              <div>
                <h1 className="text-xl font-semibold">{t('onboarding.title')}</h1>
                <p className="text-sm text-muted-foreground">
                  {(onboardingCode.onboarding_companies as any)?.[0]?.company_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge()}
              <LanguageSelector 
                language={language}
                onLanguageChange={handleLanguageChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {t('onboarding.step', { number: currentStep })} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {getProgressPercentage()}% Complete
            </span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {CurrentStepComponent && (
            <CurrentStepComponent
              onboardingCode={onboardingCode}
              onboardingRecord={onboardingRecord}
              onStepComplete={handleStepComplete}
              language={language}
              stepData={onboardingRecord[`${stepKey}_data` as keyof OnboardingRecord] || {}}
              saving={saving}
            />
          )}
        </div>

        {/* Navigation */}
        {currentStep > 1 && currentStep < totalSteps && (
          <div className="max-w-4xl mx-auto mt-8 flex justify-between">
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              disabled={saving}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.previous')}
            </Button>
            <Button 
              onClick={goToNextStep}
              disabled={saving}
            >
              {t('common.next')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;