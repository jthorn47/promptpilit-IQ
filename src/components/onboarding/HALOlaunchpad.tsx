import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Save, Rocket, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Import step components
import { CompanyInfoStep } from './steps/CompanyInfoStep';
import { TaxAccountsStep } from './steps/TaxAccountsStep';
import { BankingStep } from './steps/BankingStep';
import { EmployeeImportStep } from './steps/EmployeeImportStep';
import { ServicePlanStep } from './steps/ServicePlanStep';
import { HALOReadinessStep } from './steps/HALOReadinessStep';
import { LaunchpadSummaryStep } from './steps/LaunchpadSummaryStep';
import { HALOCommentaryPanel } from './HALOCommentaryPanel';

const WIZARD_STEPS = [
  { id: 1, name: 'Company Information', component: CompanyInfoStep },
  { id: 2, name: 'Tax Accounts Setup', component: TaxAccountsStep },
  { id: 3, name: 'Banking Setup', component: BankingStep },
  { id: 4, name: 'Employee Import', component: EmployeeImportStep },
  { id: 5, name: 'Service Plan Selection', component: ServicePlanStep },
  { id: 6, name: 'HALO Readiness Scan', component: HALOReadinessStep },
  { id: 7, name: 'Launchpad Summary & Go-Live', component: LaunchpadSummaryStep },
];

interface OnboardingData {
  id?: string;
  companyInfo: {
    legalCompanyName: string;
    ein: string;
    businessAddress: any;
    entityType: string;
    industry: string;
    naicsCode: string;
  };
  taxAccounts: {
    federalEin: string;
    stateWithholdingAccount: string;
    stateUnemploymentId: string;
    localTaxIds: any[];
    powerOfAttorneyDocs: string[];
  };
  banking: {
    bankAccountHolder: string;
    routingNumber: string;
    accountNumber: string;
    bankVerificationDoc: string;
    achAuthorized: boolean;
  };
  employeeImport: {
    fileUrl: string;
    fileName: string;
    importData: any;
    validationResults: any;
  };
  servicePlan: {
    servicePlanType: string;
    selectedAddons: string[];
    monthlyPricing: any;
  };
  readinessScan: {
    onboardingScore: number;
    haloAlerts: any[];
    recommendations: any[];
  };
}

export const HALOlaunchpad: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    companyInfo: {
      legalCompanyName: '',
      ein: '',
      businessAddress: {},
      entityType: '',
      industry: '',
      naicsCode: '',
    },
    taxAccounts: {
      federalEin: '',
      stateWithholdingAccount: '',
      stateUnemploymentId: '',
      localTaxIds: [],
      powerOfAttorneyDocs: [],
    },
    banking: {
      bankAccountHolder: '',
      routingNumber: '',
      accountNumber: '',
      bankVerificationDoc: '',
      achAuthorized: false,
    },
    employeeImport: {
      fileUrl: '',
      fileName: '',
      importData: {},
      validationResults: {},
    },
    servicePlan: {
      servicePlanType: 'ASO',
      selectedAddons: [],
      monthlyPricing: {},
    },
    readinessScan: {
      onboardingScore: 0,
      haloAlerts: [],
      recommendations: [],
    },
  });
  const [haloCommentary, setHaloCommentary] = useState('Welcome to HALOlaunchpad! I\'m here to guide you through setting up your payroll system.');
  const [isLoading, setIsLoading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const { toast } = useToast();

  const progress = (currentStep / WIZARD_STEPS.length) * 100;
  const CurrentStepComponent = WIZARD_STEPS[currentStep - 1].component;

  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('onboarding_profiles')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const profile = data[0];
        setProfileId(profile.id);
        setCurrentStep(profile.current_step || 1);
        
        // Load existing data
        setOnboardingData({
          companyInfo: {
            legalCompanyName: profile.legal_company_name || '',
            ein: profile.ein || '',
            businessAddress: profile.business_address || {},
            entityType: profile.entity_type || '',
            industry: profile.industry || '',
            naicsCode: profile.naics_code || '',
          },
          taxAccounts: {
            federalEin: profile.federal_ein || '',
            stateWithholdingAccount: profile.state_withholding_account || '',
            stateUnemploymentId: profile.state_unemployment_id || '',
            localTaxIds: Array.isArray(profile.local_tax_ids) ? profile.local_tax_ids : [],
            powerOfAttorneyDocs: Array.isArray(profile.power_of_attorney_docs) ? profile.power_of_attorney_docs : [],
          },
          banking: {
            bankAccountHolder: profile.bank_account_holder || '',
            routingNumber: profile.routing_number || '',
            accountNumber: profile.account_number || '',
            bankVerificationDoc: profile.bank_verification_doc || '',
            achAuthorized: profile.ach_authorized || false,
          },
          employeeImport: {
            fileUrl: '',
            fileName: '',
            importData: {},
            validationResults: {},
          },
          servicePlan: {
            servicePlanType: profile.service_plan_type || 'ASO',
            selectedAddons: Array.isArray(profile.selected_addons) ? profile.selected_addons : [],
            monthlyPricing: profile.monthly_pricing || {},
          },
          readinessScan: {
            onboardingScore: profile.onboarding_score || 0,
            haloAlerts: [],
            recommendations: [],
          },
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProgress = async () => {
    setIsLoading(true);
    try {
      const profileData = {
        legal_company_name: onboardingData.companyInfo.legalCompanyName,
        ein: onboardingData.companyInfo.ein,
        business_address: onboardingData.companyInfo.businessAddress,
        entity_type: onboardingData.companyInfo.entityType,
        industry: onboardingData.companyInfo.industry,
        naics_code: onboardingData.companyInfo.naicsCode,
        federal_ein: onboardingData.taxAccounts.federalEin,
        state_withholding_account: onboardingData.taxAccounts.stateWithholdingAccount,
        state_unemployment_id: onboardingData.taxAccounts.stateUnemploymentId,
        local_tax_ids: onboardingData.taxAccounts.localTaxIds,
        power_of_attorney_docs: onboardingData.taxAccounts.powerOfAttorneyDocs,
        bank_account_holder: onboardingData.banking.bankAccountHolder,
        routing_number: onboardingData.banking.routingNumber,
        account_number: onboardingData.banking.accountNumber,
        bank_verification_doc: onboardingData.banking.bankVerificationDoc,
        ach_authorized: onboardingData.banking.achAuthorized,
        service_plan_type: onboardingData.servicePlan.servicePlanType,
        selected_addons: onboardingData.servicePlan.selectedAddons,
        monthly_pricing: onboardingData.servicePlan.monthlyPricing,
        current_step: currentStep,
        onboarding_score: onboardingData.readinessScan.onboardingScore,
        status: 'draft',
      };

      if (profileId) {
        const { error } = await supabase
          .from('onboarding_profiles')
          .update(profileData)
          .eq('id', profileId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('onboarding_profiles')
          .insert([profileData])
          .select()
          .single();

        if (error) throw error;
        setProfileId(data.id);
      }

      toast({
        title: "Progress Saved",
        description: "Your onboarding progress has been saved.",
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    await saveProgress();
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
      updateHALOCommentary(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      updateHALOCommentary(currentStep - 1);
    }
  };

  const updateHALOCommentary = (step: number) => {
    const commentaries = {
      1: "Let's start with your company information. I'll validate your EIN and suggest any industry-specific requirements.",
      2: "Now let's set up your tax accounts. I'll check formatting and flag any missing registrations.",
      3: "Time to configure your banking details. I'll validate your routing number and check account compatibility.",
      4: "Upload your employee data and I'll check for any formatting issues or missing information.",
      5: "Choose your service plan. I'll help you understand the differences between ASO and PEO models.",
      6: "Let me run a comprehensive readiness scan to ensure everything is properly configured.",
      7: "Excellent! Your setup is complete. Ready to launch your payroll system?",
    };
    setHaloCommentary(commentaries[step as keyof typeof commentaries] || '');
  };

  const updateOnboardingData = (section: keyof OnboardingData, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null 
        ? { ...prev[section], ...data }
        : data
    }));
  };

  const canProceed = () => {
    // Add validation logic based on current step
    switch (currentStep) {
      case 1:
        return onboardingData.companyInfo.legalCompanyName && onboardingData.companyInfo.ein;
      case 2:
        return onboardingData.taxAccounts.federalEin;
      case 3:
        return onboardingData.banking.routingNumber && onboardingData.banking.accountNumber;
      case 6:
        return onboardingData.readinessScan.onboardingScore >= 75;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-halo-bg relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-ambient-1 rounded-full animate-ambient opacity-30"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-gradient-ambient-2 rounded-full animate-ambient delay-1000 opacity-20"></div>
        <div className="absolute bottom-32 left-1/2 w-56 h-56 bg-gradient-ambient-3 rounded-full animate-ambient delay-2000 opacity-25"></div>
        
        {/* Neural network lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 1000">
          <defs>
            <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(258 86% 60%)" />
              <stop offset="100%" stopColor="hsl(268 86% 65%)" />
            </linearGradient>
          </defs>
          <path d="M100,200 Q400,150 600,300 T900,250" stroke="url(#neural-gradient)" strokeWidth="2" fill="none" className="animate-pulse" />
          <path d="M150,600 Q350,550 550,700 T850,650" stroke="url(#neural-gradient)" strokeWidth="2" fill="none" className="animate-pulse delay-500" />
        </svg>
      </div>

      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Ultra-Modern Header */}
          <div className="text-center mb-12">
            <div className="relative">
              <h1 className="text-5xl md:text-6xl font-light text-foreground mb-4 tracking-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent font-medium">
                  HALO
                </span>
                <span className="text-foreground">launchpad</span>
              </h1>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-primary rounded-full animate-progress-glow"></div>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              Experience intelligent, white-glove onboarding that feels{' '}
              <span className="text-halo-violet font-medium">smarter than traditional payroll</span>
            </p>
            
            {/* AI confidence indicator */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-halo-violet rounded-full animate-neural-pulse"></div>
              <span className="text-sm text-muted-foreground">AI-guided setup in progress</span>
            </div>
          </div>

          {/* Floating Progress Card */}
          <div className="mb-12 glass-card hover-magnetic">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-halo-violet rounded-full animate-neural-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-halo-violet rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Step {currentStep} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep - 1].name}
                  </span>
                </div>
                <Badge variant="secondary" className="glass-card border-halo-violet/20">
                  {Math.round(progress)}% Complete
                </Badge>
              </div>
              
              <div className="relative mb-6">
                <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-primary h-full rounded-full transition-all duration-700 ease-out animate-progress-glow relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-glow rounded-full opacity-50"></div>
                  </div>
                </div>
              </div>
              
              {/* Ultra-modern step indicators */}
              <div className="flex justify-between">
                {WIZARD_STEPS.map((step) => (
                  <div key={step.id} className="flex flex-col items-center group cursor-pointer">
                    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                      step.id < currentStep 
                        ? 'bg-gradient-primary text-white shadow-neural' 
                        : step.id === currentStep 
                          ? 'glass-card border-2 border-halo-violet text-halo-violet animate-neural-pulse' 
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}>
                      {step.id < currentStep ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="font-bold">{step.id}</span>
                      )}
                      {step.id === currentStep && (
                        <div className="absolute inset-0 rounded-full border-2 border-halo-violet animate-ping"></div>
                      )}
                    </div>
                    <span className="text-xs mt-2 text-center max-w-[100px] leading-tight text-muted-foreground group-hover:text-foreground transition-colors">
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content - Ultra-Modern Glassmorphic Card */}
            <div className="lg:col-span-3">
              <div className="glass-card hover-magnetic relative overflow-hidden">
                {/* Neural network pattern overlay */}
                <div className="absolute inset-0 bg-gradient-neural opacity-30 pointer-events-none"></div>
                
                <div className="relative z-10 p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {currentStep}
                      </div>
                      {WIZARD_STEPS[currentStep - 1].name}
                    </h2>
                  </div>
                  
                  <CurrentStepComponent
                    data={onboardingData}
                    onUpdate={updateOnboardingData}
                    onCommentaryUpdate={setHaloCommentary}
                  />
                </div>
              </div>

              {/* Ultra-Modern Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="group glass-card border-muted/30 hover:border-halo-violet/50 hover:shadow-neural transition-all duration-300 px-6 py-3"
                >
                  <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                  Previous
                </Button>

                <div className="flex gap-4">
                  <Button
                    variant="secondary"
                    onClick={saveProgress}
                    disabled={isLoading}
                    className="glass-card border-muted/30 hover:border-halo-violet/30 hover:shadow-neural transition-all duration-300 px-6 py-3"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-halo-violet border-t-transparent mr-2"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Draft
                  </Button>

                  {currentStep === WIZARD_STEPS.length ? (
                    <Button
                      onClick={nextStep}
                      disabled={!canProceed() || isLoading}
                      className="group bg-gradient-to-r from-success to-halo-violet hover:shadow-magnetic border-0 px-8 py-3 transition-all duration-300"
                    >
                      <Rocket className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                      Go Live!
                    </Button>
                  ) : (
                    <Button
                      onClick={nextStep}
                      disabled={!canProceed() || isLoading}
                      className="group bg-gradient-primary hover:shadow-magnetic border-0 px-8 py-3 transition-all duration-300"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* HALO Commentary Panel */}
            <div className="lg:col-span-1">
              <HALOCommentaryPanel
                commentary={haloCommentary}
                currentStep={currentStep}
                onboardingScore={onboardingData.readinessScan.onboardingScore}
                alerts={onboardingData.readinessScan.haloAlerts}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};