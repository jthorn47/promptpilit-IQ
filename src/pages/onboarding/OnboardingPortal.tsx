import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Languages, FileText, Shield, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import OnboardingSteps from '@/components/onboarding/OnboardingSteps';
import LanguageSelector from '@/components/onboarding/LanguageSelector';

interface OnboardingCode {
  id: string;
  code: string;
  company_id: string;
  employee_email: string;
  employee_first_name: string;
  employee_last_name: string;
  position_title: string;
  department: string;
  work_state: string;
  expires_at: string | null;
  onboarding_companies: {
    company_name: string;
    company_logo_url: string | null;
    default_language: 'en' | 'es';
  };
}

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

const OnboardingPortal: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const [onboardingCode, setOnboardingCode] = useState<OnboardingCode | null>(null);
  const [onboardingRecord, setOnboardingRecord] = useState<OnboardingRecord | null>(null);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const translations = {
    en: {
      title: 'Employee Onboarding Portal',
      welcome: 'Welcome to',
      invalidCode: 'Invalid or expired onboarding code',
      codeExpired: 'This onboarding code has expired',
      alreadyUsed: 'This onboarding code has already been used',
      loading: 'Loading your onboarding information...',
      position: 'Position',
      department: 'Department',
      workState: 'Work State',
      progress: 'Onboarding Progress',
      step: 'Step',
      of: 'of',
      startOnboarding: 'Start Onboarding Process',
      continueOnboarding: 'Continue Onboarding',
      pendingReview: 'Pending Employer Review',
      approved: 'Onboarding Approved',
      rejected: 'Onboarding Rejected',
      secureProcess: 'Secure Process',
      secureDescription: 'Your information is encrypted and secure',
      complianceReady: 'Compliance Ready',
      complianceDescription: 'Federal and state compliant forms',
      quickProcess: 'Quick Process',
      quickDescription: 'Complete in 15-20 minutes'
    },
    es: {
      title: 'Portal de Incorporación de Empleados',
      welcome: 'Bienvenido a',
      invalidCode: 'Código de incorporación inválido o expirado',
      codeExpired: 'Este código de incorporación ha expirado',
      alreadyUsed: 'Este código de incorporación ya ha sido utilizado',
      loading: 'Cargando su información de incorporación...',
      position: 'Posición',
      department: 'Departamento',
      workState: 'Estado de Trabajo',
      progress: 'Progreso de Incorporación',
      step: 'Paso',
      of: 'de',
      startOnboarding: 'Iniciar Proceso de Incorporación',
      continueOnboarding: 'Continuar Incorporación',
      pendingReview: 'Pendiente de Revisión del Empleador',
      approved: 'Incorporación Aprobada',
      rejected: 'Incorporación Rechazada',
      secureProcess: 'Proceso Seguro',
      secureDescription: 'Su información está cifrada y segura',
      complianceReady: 'Listo para Cumplimiento',
      complianceDescription: 'Formularios compatibles federales y estatales',
      quickProcess: 'Proceso Rápido',
      quickDescription: 'Complete en 15-20 minutos'
    }
  };

  const t = translations[language];

  useEffect(() => {
    console.log('OnboardingPortal: Component mounted with code:', code);
    console.log('OnboardingPortal: Current URL params:', window.location.pathname, window.location.search);
    
    const loadOnboardingData = async () => {
      if (!code) {
        console.log('OnboardingPortal: No code provided in URL');
        setError(t.invalidCode);
        setLoading(false);
        return;
      }

      try {
        console.log('OnboardingPortal: Loading onboarding code:', code);
        // Load onboarding code details
        const { data: codeData, error: codeError } = await supabase
          .from('onboarding_codes')
          .select(`
            *,
            onboarding_companies (
              company_name,
              company_logo_url,
              default_language
            )
          `)
          .eq('code', code)
          .single();

        console.log('OnboardingPortal: Onboarding code query result:', { codeData, codeError });

        if (codeError || !codeData) {
          console.log('OnboardingPortal: Invalid onboarding code');
          setError(t.invalidCode);
          setLoading(false);
          return;
        }

        if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
          console.log('OnboardingPortal: Onboarding code expired');
          setError(t.codeExpired);
          setLoading(false);
          return;
        }

        console.log('OnboardingPortal: Valid onboarding code found:', codeData);
        setOnboardingCode(codeData as any);
        setLanguage(codeData.onboarding_companies?.[0]?.default_language || 'en');

        // Check for existing onboarding record
        console.log('OnboardingPortal: Checking for existing onboarding record');
        const { data: recordData } = await supabase
          .from('employee_onboarding')
          .select('*')
          .eq('onboarding_code_id', codeData.id)
          .single();

        console.log('OnboardingPortal: Existing onboarding record:', recordData);

        if (recordData) {
          setOnboardingRecord(recordData);
          setLanguage(recordData.language_preference || codeData.onboarding_companies?.[0]?.default_language || 'en');
        }

      } catch (err) {
        console.error('OnboardingPortal: Error loading onboarding data:', err);
        setError(t.invalidCode);
      } finally {
        console.log('OnboardingPortal: Loading complete');
        setLoading(false);
      }
    };

    loadOnboardingData();
  }, [code, t.invalidCode, t.codeExpired]);

  const handleStartOnboarding = async () => {
    if (!onboardingCode) return;

    try {
      const { data, error } = await supabase
        .from('employee_onboarding')
        .insert({
          onboarding_code_id: onboardingCode.id,
          company_id: onboardingCode.company_id,
          first_name: onboardingCode.employee_first_name,
          last_name: onboardingCode.employee_last_name,
          email: onboardingCode.employee_email,
          position_title: onboardingCode.position_title,
          department: onboardingCode.department,
          status: 'in_progress',
          language_preference: language,
          current_step: 1
        })
        .select()
        .single();

      if (error) throw error;

      // Mark code as used
      await supabase
        .from('onboarding_codes')
        .update({ is_used: true })
        .eq('id', onboardingCode.id);

      setOnboardingRecord(data);
      
      toast({
        title: language === 'en' ? 'Onboarding Started' : 'Incorporación Iniciada',
        description: language === 'en' ? 'Your onboarding process has begun' : 'Su proceso de incorporación ha comenzado'
      });

    } catch (err) {
      console.error('Error starting onboarding:', err);
      toast({
        title: language === 'en' ? 'Error' : 'Error',
        description: language === 'en' ? 'Failed to start onboarding process' : 'No se pudo iniciar el proceso de incorporación',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 p-6 text-center">
          <div className="text-red-500 mb-4">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  if (!onboardingCode) return null;

  // If we have an onboarding record, show the steps
  if (onboardingRecord) {
    return (
      <OnboardingSteps 
        onboardingRecord={onboardingRecord}
        onboardingCode={onboardingCode}
        language={language}
        onLanguageChange={setLanguage}
      />
    );
  }

  // Show welcome screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {(onboardingCode.onboarding_companies as any)?.[0]?.company_logo_url && (
              <img 
                src={(onboardingCode.onboarding_companies as any)[0].company_logo_url}
                alt="Company Logo"
                className="h-12 w-auto"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <p className="text-muted-foreground">
                {t.welcome} {(onboardingCode.onboarding_companies as any)?.[0]?.company_name}
              </p>
            </div>
          </div>
          <LanguageSelector 
            language={language}
            onLanguageChange={setLanguage}
          />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Welcome Card */}
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {t.welcome} {onboardingCode.employee_first_name}!
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.position}:</span>
                    <span className="font-medium">{onboardingCode.position_title}</span>
                  </div>
                  {onboardingCode.department && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.department}:</span>
                      <span className="font-medium">{onboardingCode.department}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.workState}:</span>
                    <Badge variant="secondary">{onboardingCode.work_state}</Badge>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleStartOnboarding}
                className="w-full"
                size="lg"
              >
                {t.startOnboarding}
              </Button>
            </Card>

            {/* Features Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">What to Expect</h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">{t.secureProcess}</h4>
                    <p className="text-sm text-muted-foreground">{t.secureDescription}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">{t.complianceReady}</h4>
                    <p className="text-sm text-muted-foreground">{t.complianceDescription}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">{t.quickProcess}</h4>
                    <p className="text-sm text-muted-foreground">{t.quickDescription}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPortal;