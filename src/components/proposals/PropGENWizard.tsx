import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Download, Save, BarChart3, FileText, AlertCircle, Loader2, Shield, Users, BookOpen, TrendingUp, CheckCircle, Building, Globe, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { generatePDFFromHTML } from '@/services/pdfService';
import { EEAdministrationCostCalculator } from '@/components/propgen/EEAdministrationCostCalculator';
import { WorkersCompClassificationManager, type WorkersCompClassification } from '@/components/propgen/WorkersCompClassificationManager';
import { StateTaxSelector } from '@/components/propgen/StateTaxSelector';
import { formatCurrency } from '@/lib/utils';
import { useProGenTaxSettings } from '@/hooks/useProGenTaxSettings';
import { usePropGENWorkflow } from '@/hooks/usePropGENWorkflow';
import '@/styles/mobile.css';

interface BenefitCategory {
  name: string;
  client_annual_cost: number;
  easeworks_annual_cost: number;
  not_applicable: boolean;
}

interface PropGENData {
  // Company Information
  company_name: string;
  wse_count: number;
  annual_payroll: number;
  
  // State Tax Information
  selected_state: string;
  suta_wage_base: number;
  futa_wage_base: number;
  
  // EE Administration Cost (replaces current_hr_burden)
  calculated_ee_admin_cost: number;
  ee_admin_breakdown?: any;
  suta_rate: number;
  
  // Workers' Comp Classifications (replaces single wc_rate)
  workers_comp_classifications: WorkersCompClassification[];
  total_employer_wc_premium: number;
  total_easeworks_wc_premium: number;
  weighted_avg_employer_wc_rate: number;
  weighted_avg_easeworks_wc_rate: number;
  
  // Easeworks Pricing
  pricing_model: '% of Payroll' | 'PEPM';
  easeworks_fee?: number;
  easeworks_pepm?: number;
  setup_fee_per_wse: number;
  
  // Benefits Analysis
  benefits_analysis: BenefitCategory[];
  
  // Metadata
  company_id?: string;
  deal_id?: string;
  notes?: string;
}

interface CalculatedResults {
  fica_cost: number;
  suta_cost: number;
  futa_cost: number;
  wc_cost: number;
  backend_addons: number;
  admin_total: number;
  setup_fee: number;
  total_easeworks_cost: number;
  savings_dollar: number;
  savings_percent: number;
  gp_total: number;
  gp_pepm: number;
  current_total_cost: number;
  easeworks_service_cost: number;
}

const FIXED_BACKEND_FEES = {
  fee_tna: 432,
  fee_pm: 495,
  fee_ats: 264,
  fee_training: 23,
  fee_wpvp: 399,
  fee_drug_test: 65,
  fee_new_hire: 75,
  fee_termination: 50,
};

const STEPS = [
  { id: 'ee_admin_cost', title: 'EE Administration Cost Calculation' },
  { id: 'workers_comp', title: 'Workers Compensation' },
  { id: 'pricing_config', title: 'EaseWorks Pricing Configuration' },
  { id: 'benefits_analysis', title: 'Benefits Analysis' },
  { id: 'business_intelligence', title: 'Business Intelligence Summary' },
  { id: 'results', title: 'Results & Analysis' },
];

export const PropGENWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PropGENData>({
    company_name: '',
    wse_count: 0,
    annual_payroll: 0,
    selected_state: '',
    suta_wage_base: 7000,
    futa_wage_base: 7000,
    calculated_ee_admin_cost: 0,
    suta_rate: 4.2,
    workers_comp_classifications: [],
    total_employer_wc_premium: 0,
    total_easeworks_wc_premium: 0,
    weighted_avg_employer_wc_rate: 0,
    weighted_avg_easeworks_wc_rate: 0,
    pricing_model: '% of Payroll',
    setup_fee_per_wse: 50.00,
    benefits_analysis: [
      { name: 'Health Insurance', client_annual_cost: 0, easeworks_annual_cost: 0, not_applicable: false },
      { name: 'Dental Insurance', client_annual_cost: 0, easeworks_annual_cost: 0, not_applicable: false },
      { name: 'Vision Insurance', client_annual_cost: 0, easeworks_annual_cost: 0, not_applicable: false },
      { name: '401(k) or Retirement Plan', client_annual_cost: 0, easeworks_annual_cost: 0, not_applicable: false },
    ],
  });
  const [calculatedResults, setCalculatedResults] = useState<CalculatedResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  
  // Company state
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Get company ID from URL params
  const params = new URLSearchParams(location.search);
  const companyId = params.get('company_id');
  
  // Initialize PropGEN workflow hook
  const { saveInvestmentAnalysis, isProcessing } = usePropGENWorkflow(companyId || '');
  
  // Load tax settings from admin configuration
  const { taxSettings, loading: taxSettingsLoading, error: taxSettingsError } = useProGenTaxSettings();

  // Load company data if URL has company context
  useEffect(() => {
    const dealId = params.get('deal_id');
    const companyName = params.get('company_name');
    
    if (companyId) {
      loadCompanyById(companyId);
    } else if (companyName) {
      loadCompanyByName(companyName);
    }
    
    if (dealId) {
      setFormData(prev => ({
        ...prev,
        deal_id: dealId,
      }));
    }
  }, [location.search, companyId]);

  const loadCompanyById = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', companyId)
        .single();
      
      if (error) throw error;
      handleCompanySelect(data);
    } catch (error) {
      console.error('Error loading company:', error);
      toast({
        title: 'Error loading company data',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const loadCompanyByName = async (companyName: string) => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_name', companyName)
        .single();
      
      if (error) throw error;
      handleCompanySelect(data);
    } catch (error) {
      console.error('Error loading company:', error);
      toast({
        title: 'Error loading company data',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company);
    setFormData(prev => ({
      ...prev,
      company_id: company.id,
      company_name: company.company_name,
      // Pre-populate with estimated values based on company data
      wse_count: company.max_employees || 50,
      annual_payroll: company.max_employees ? company.max_employees * 50000 : 2500000,
    }));
  };

  const handleInputChange = (field: keyof PropGENData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveAnalysis = async () => {
    if (!calculatedResults || !companyId) return;

    setLoading(true);
    try {
      const analysisData = {
        ...formData,
        ...calculatedResults,
        current_hr_burden: formData.calculated_ee_admin_cost || 0,
        workers_comp_classifications: formData.workers_comp_classifications,
        benefits_analysis: formData.benefits_analysis,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      };

      await saveInvestmentAnalysis(analysisData);
      setAnalysisId(companyId); // Use company ID as analysis ID for now
      
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: 'Error saving analysis',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!calculatedResults) return;

    setLoading(true);
    try {
      const pdfBlob = await generatePDFFromHTML('propgen-results', `propgen-analysis-${formData.company_name}.pdf`);
      if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `propgen-analysis-${formData.company_name}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error generating PDF',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateResults = () => {
    // Basic calculations
    const fica_cost = formData.annual_payroll * 0.0765; // 7.65% FICA
    const suta_cost = Math.min(formData.annual_payroll, formData.suta_wage_base * formData.wse_count) * (formData.suta_rate / 100);
    const futa_cost = Math.min(formData.annual_payroll, formData.futa_wage_base * formData.wse_count) * 0.006; // 0.6% FUTA
    const wc_cost = formData.total_employer_wc_premium;
    
    // Backend addons (fixed fees)
    const backend_addons = Object.values(FIXED_BACKEND_FEES).reduce((sum, fee) => sum + fee, 0);
    
    // Admin total (EE Administration Cost)
    const admin_total = formData.calculated_ee_admin_cost;
    
    // Setup fee
    const setup_fee = formData.setup_fee_per_wse * formData.wse_count;
    
    // Total EaseWorks cost
    let easeworks_service_cost = 0;
    if (formData.pricing_model === '% of Payroll' && formData.easeworks_fee) {
      easeworks_service_cost = formData.annual_payroll * (formData.easeworks_fee / 100);
    } else if (formData.pricing_model === 'PEPM' && formData.easeworks_pepm) {
      easeworks_service_cost = formData.easeworks_pepm * formData.wse_count * 12;
    }
    
    const total_easeworks_cost = easeworks_service_cost + backend_addons + formData.total_easeworks_wc_premium + fica_cost + suta_cost + futa_cost;
    
    // Current costs (what client pays now)
    const current_total_cost = fica_cost + suta_cost + futa_cost + wc_cost + admin_total;
    
    // Savings calculation
    const savings_dollar = current_total_cost - total_easeworks_cost;
    const savings_percent = current_total_cost > 0 ? (savings_dollar / current_total_cost) * 100 : 0;
    
    // Gross profit calculation
    const gp_total = easeworks_service_cost - (backend_addons + formData.total_easeworks_wc_premium);
    const gp_pepm = formData.wse_count > 0 ? gp_total / (formData.wse_count * 12) : 0;

    return {
      fica_cost,
      suta_cost,
      futa_cost,
      wc_cost,
      backend_addons,
      admin_total,
      setup_fee,
      total_easeworks_cost,
      savings_dollar,
      savings_percent,
      gp_total,
      gp_pepm,
      current_total_cost,
      easeworks_service_cost,
    };
  };

  const nextStep = async () => {
    if (currentStep < STEPS.length - 1) {
      // Auto-save progress
      await saveProgress();
      
      if (currentStep === 3) {
        // Moving to business intelligence step - calculate results
        const results = calculateResults();
        setCalculatedResults(results);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const saveProgress = async () => {
    if (!companyId) return;

    try {
      const { data: existingWorkflow } = await supabase
        .from('propgen_workflows')
        .select('*')
        .eq('company_id', companyId)
        .single();

      const workflowData = {
        company_id: companyId,
        workflow_data: formData,
        current_step: currentStep,
        updated_at: new Date().toISOString()
      };

      if (existingWorkflow) {
        await supabase
          .from('propgen_workflows')
          .update(workflowData)
          .eq('company_id', companyId);
      } else {
        await supabase
          .from('propgen_workflows')
          .insert(workflowData);
      }

      toast({
        title: "Progress Saved",
        description: "Your PropGEN progress has been saved automatically.",
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Save Warning",
        description: "Unable to auto-save progress. Your data is preserved in this session.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (STEPS[currentStep].id) {
      case 'ee_admin_cost':
        return (
          <EEAdministrationCostCalculator
            onCalculationChange={(results) => {
              handleInputChange('calculated_ee_admin_cost', results.calculated_ee_admin_cost);
              handleInputChange('ee_admin_breakdown', results.breakdown);
            }}
            initialData={formData.ee_admin_breakdown}
          />
        );
      case 'workers_comp':
        return (
          <WorkersCompClassificationManager
            onCalculationChange={(results) => {
              handleInputChange('workers_comp_classifications', results.classifications);
              handleInputChange('total_employer_wc_premium', results.total_employer_premium);
              handleInputChange('total_easeworks_wc_premium', results.total_easeworks_premium);
              handleInputChange('weighted_avg_employer_wc_rate', results.weighted_avg_employer_rate);
              handleInputChange('weighted_avg_easeworks_wc_rate', results.weighted_avg_easeworks_rate);
            }}
            initialClassifications={formData.workers_comp_classifications}
          />
        );
      case 'pricing_config':
        return (
          <Card className={isMobile ? 'propgen-mobile-card' : ''}>
            <CardHeader>
              <CardTitle>EaseWorks Pricing Configuration</CardTitle>
              <CardDescription>
                Configure the pricing model for this proposal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`space-y-4 ${isMobile ? 'propgen-mobile-section' : ''}`}>
                <div>
                  <Label htmlFor="pricing_model">Pricing Model</Label>
                  <Select 
                    value={formData.pricing_model} 
                    onValueChange={(value) => handleInputChange('pricing_model', value as '% of Payroll' | 'PEPM')}
                  >
                    <SelectTrigger className={isMobile ? 'propgen-mobile-select' : ''}>
                      <SelectValue placeholder="Select pricing model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="% of Payroll">Percentage of Payroll</SelectItem>
                      <SelectItem value="PEPM">Per Employee Per Month (PEPM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.pricing_model === '% of Payroll' && (
                  <div>
                    <Label htmlFor="easeworks_fee">Service Fee (% of Payroll)</Label>
                    <Input
                      id="easeworks_fee"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.easeworks_fee || ''}
                      onChange={(e) => handleInputChange('easeworks_fee', parseFloat(e.target.value) || 0)}
                      placeholder="e.g., 2.75"
                      className={isMobile ? 'propgen-mobile-input' : ''}
                    />
                    <p className={`text-sm text-muted-foreground mt-1 ${isMobile ? 'mobile-text-medium' : ''}`}>
                      This will result in {formatCurrency(formData.annual_payroll * ((formData.easeworks_fee || 0) / 100))} annually
                    </p>
                  </div>
                )}

                {formData.pricing_model === 'PEPM' && (
                  <div>
                    <Label htmlFor="easeworks_pepm">Service Fee (Per Employee Per Month)</Label>
                    <Input
                      id="easeworks_pepm"
                      type="number"
                      step="1"
                      min="0"
                      value={formData.easeworks_pepm || ''}
                      onChange={(e) => handleInputChange('easeworks_pepm', parseFloat(e.target.value) || 0)}
                      placeholder="e.g., 120"
                      className={isMobile ? 'propgen-mobile-input' : ''}
                    />
                    <p className={`text-sm text-muted-foreground mt-1 ${isMobile ? 'mobile-text-medium' : ''}`}>
                      This will result in {formatCurrency((formData.easeworks_pepm || 0) * formData.wse_count * 12)} annually
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="setup_fee_per_wse">Setup Fee (Per Employee)</Label>
                  <Input
                    id="setup_fee_per_wse"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.setup_fee_per_wse}
                    onChange={(e) => handleInputChange('setup_fee_per_wse', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 50.00"
                    className={isMobile ? 'propgen-mobile-input' : ''}
                  />
                  <p className={`text-sm text-muted-foreground mt-1 ${isMobile ? 'mobile-text-medium' : ''}`}>
                    Total setup fee: {formatCurrency(formData.setup_fee_per_wse * formData.wse_count)}
                  </p>
                </div>
              </div>

              {/* Pricing Preview */}
              <div className={`bg-muted p-4 rounded-lg ${isMobile ? 'propgen-summary-mobile' : ''}`}>
                <h3 className={`font-semibold mb-2 ${isMobile ? 'mobile-text-medium' : ''}`}>Pricing Preview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={isMobile ? 'mobile-text-medium' : ''}>
                      Service Fee ({formData.pricing_model === '% of Payroll' ? 
                        `${formData.easeworks_fee || 0}% of Payroll` : 
                        `$${formData.easeworks_pepm || 0} PEPM`}):
                    </span>
                    <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>
                      {formatCurrency(
                        formData.pricing_model === '% of Payroll' ? 
                          formData.annual_payroll * ((formData.easeworks_fee || 0) / 100) :
                          (formData.easeworks_pepm || 0) * formData.wse_count * 12
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isMobile ? 'mobile-text-medium' : ''}>Setup Fee:</span>
                    <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(formData.setup_fee_per_wse * formData.wse_count)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isMobile ? 'mobile-text-medium' : ''}>Backend Services:</span>
                    <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(Object.values(FIXED_BACKEND_FEES).reduce((sum, fee) => sum + fee, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isMobile ? 'mobile-text-medium' : ''}>Workers' Comp:</span>
                    <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(formData.total_easeworks_wc_premium)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className={isMobile ? 'mobile-text-medium' : ''}>Total Annual Cost:</span>
                      <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>
                        {formatCurrency(
                          (formData.pricing_model === '% of Payroll' ? 
                            formData.annual_payroll * ((formData.easeworks_fee || 0) / 100) :
                            (formData.easeworks_pepm || 0) * formData.wse_count * 12) +
                          formData.setup_fee_per_wse * formData.wse_count +
                          Object.values(FIXED_BACKEND_FEES).reduce((sum, fee) => sum + fee, 0) +
                          formData.total_easeworks_wc_premium
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'benefits_analysis':
        const updateBenefitCategory = (index: number, field: keyof BenefitCategory, value: any) => {
          const updatedBenefits = [...formData.benefits_analysis];
          updatedBenefits[index] = { ...updatedBenefits[index], [field]: value };
          handleInputChange('benefits_analysis', updatedBenefits);
        };

        const calculateBenefitTotals = () => {
          const applicableBenefits = formData.benefits_analysis.filter(b => !b.not_applicable);
          const clientTotal = applicableBenefits.reduce((sum, b) => sum + b.client_annual_cost, 0);
          const easeworksTotal = applicableBenefits.reduce((sum, b) => sum + b.easeworks_annual_cost, 0);
          const savings = clientTotal - easeworksTotal;
          const percentDiff = clientTotal > 0 ? (savings / clientTotal) * 100 : 0;
          
          return { clientTotal, easeworksTotal, savings, percentDiff };
        };

        const benefitTotals = calculateBenefitTotals();
        const hasApplicableBenefits = formData.benefits_analysis.some(b => !b.not_applicable);

        return (
          <Card className={isMobile ? 'propgen-mobile-card' : ''}>
            <CardHeader>
              <CardTitle>Benefits Analysis</CardTitle>
              <CardDescription>
                Compare current employer-paid benefit costs with EaseWorks benefit offerings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {formData.benefits_analysis.map((benefit, index) => (
                  <div key={benefit.name} className={`${isMobile ? 'propgen-benefits-mobile' : 'grid grid-cols-1 md:grid-cols-4 gap-4'} p-4 border rounded-lg`}>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={benefit.not_applicable}
                        onChange={(e) => updateBenefitCategory(index, 'not_applicable', e.target.checked)}
                        className={`h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 ${isMobile ? 'mobile-touch-target' : ''}`}
                      />
                      <Label className={`font-medium ${isMobile ? 'mobile-text-medium' : ''}`}>{benefit.name}</Label>
                      {benefit.not_applicable && (
                        <span className={`text-sm text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>(Not Applicable)</span>
                      )}
                    </div>
                    
                    {!benefit.not_applicable && (
                      <>
                        <div>
                          <Label htmlFor={`client_cost_${index}`} className={`text-sm ${isMobile ? 'mobile-text-medium' : ''}`}>Client Annual Cost</Label>
                          <Input
                            id={`client_cost_${index}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={benefit.client_annual_cost}
                            onChange={(e) => updateBenefitCategory(index, 'client_annual_cost', parseFloat(e.target.value) || 0)}
                            placeholder="$0"
                            className={isMobile ? 'propgen-mobile-input' : ''}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`easeworks_cost_${index}`} className={`text-sm ${isMobile ? 'mobile-text-medium' : ''}`}>EaseWorks Annual Cost</Label>
                          <Input
                            id={`easeworks_cost_${index}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={benefit.easeworks_annual_cost}
                            onChange={(e) => updateBenefitCategory(index, 'easeworks_annual_cost', parseFloat(e.target.value) || 0)}
                            placeholder="$0"
                            className={isMobile ? 'propgen-mobile-input' : ''}
                          />
                        </div>
                        
                        <div className={`flex items-center ${isMobile ? 'justify-center mt-2' : 'justify-end'}`}>
                          <div className={`text-sm ${isMobile ? 'text-center' : 'text-right'}`}>
                            <div className={`font-medium ${isMobile ? 'mobile-text-medium' : ''}`}>
                              Difference: {formatCurrency(benefit.client_annual_cost - benefit.easeworks_annual_cost)}
                            </div>
                            <div className={`${benefit.client_annual_cost - benefit.easeworks_annual_cost > 0 ? 'text-green-600' : 'text-red-600'} ${isMobile ? 'mobile-text-medium' : ''}`}>
                              {benefit.client_annual_cost - benefit.easeworks_annual_cost > 0 ? 'Savings' : 'Increase'}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {hasApplicableBenefits && (
                <Card className={`bg-muted ${isMobile ? 'propgen-mobile-card' : ''}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg ${isMobile ? 'mobile-text-medium' : ''}`}>Benefits Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isMobile ? 'propgen-mobile-grid' : ''}`}>
                      <div>
                        <div className={`text-sm text-muted-foreground mb-2 ${isMobile ? 'mobile-text-medium' : ''}`}>Total Client Benefit Cost</div>
                        <div className={`text-2xl font-bold text-red-600 ${isMobile ? 'mobile-text-large' : ''}`}>
                          {formatCurrency(benefitTotals.clientTotal)}
                        </div>
                      </div>
                      <div>
                        <div className={`text-sm text-muted-foreground mb-2 ${isMobile ? 'mobile-text-medium' : ''}`}>Total EaseWorks Benefit Cost</div>
                        <div className={`text-2xl font-bold text-blue-600 ${isMobile ? 'mobile-text-large' : ''}`}>
                          {formatCurrency(benefitTotals.easeworksTotal)}
                        </div>
                      </div>
                      <div>
                        <div className={`text-sm text-muted-foreground mb-2 ${isMobile ? 'mobile-text-medium' : ''}`}>Annual Difference</div>
                        <div className={`text-2xl font-bold ${benefitTotals.savings >= 0 ? 'text-green-600' : 'text-red-600'} ${isMobile ? 'mobile-text-large' : ''}`}>
                          {formatCurrency(benefitTotals.savings)}
                        </div>
                        <div className={`text-sm text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>
                          {benefitTotals.savings >= 0 ? 'Savings' : 'Increase'}
                        </div>
                      </div>
                      <div>
                        <div className={`text-sm text-muted-foreground mb-2 ${isMobile ? 'mobile-text-medium' : ''}`}>Percentage Difference</div>
                        <div className={`text-2xl font-bold ${benefitTotals.percentDiff >= 0 ? 'text-green-600' : 'text-red-600'} ${isMobile ? 'mobile-text-large' : ''}`}>
                          {benefitTotals.percentDiff.toFixed(1)}%
                        </div>
                        <div className={`text-sm text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>
                          {benefitTotals.percentDiff >= 0 ? 'Cost Reduction' : 'Cost Increase'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        );
      case 'business_intelligence':
        return (
          <div className={`space-y-8 ${isMobile ? 'propgen-mobile-section' : ''}`} id="business-intelligence-summary">
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${isMobile ? 'mobile-text-large' : ''}`}>Business Intelligence Summary</h2>
              <p className={`text-lg text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>
                Strategic HR Partnership Analysis for {formData.company_name}
              </p>
            </div>

            {calculatedResults ? (
              <div className="space-y-8">
                {/* Client Snapshot */}
                <Card className={`bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 ${isMobile ? 'propgen-mobile-card' : ''}`}>
                  <CardHeader>
                    <CardTitle className={`text-blue-700 flex items-center gap-2 ${isMobile ? 'mobile-text-medium' : ''}`}>
                      <Building className="h-5 w-5" />
                      Client Snapshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${isMobile ? 'propgen-snapshot-mobile' : ''}`}>
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-blue-600 mb-1 ${isMobile ? 'mobile-text-large' : ''}`}>
                          {formData.wse_count}
                        </div>
                        <div className={`text-sm text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Employees</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-blue-600 mb-1 ${isMobile ? 'mobile-text-large' : ''}`}>
                          {formatCurrency(formData.annual_payroll)}
                        </div>
                        <div className={`text-sm text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Annual Payroll</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-orange-600 mb-1 ${isMobile ? 'mobile-text-large' : ''}`}>
                          {(calculatedResults.admin_total / formData.annual_payroll * 100).toFixed(1)}%
                        </div>
                        <div className={`text-sm text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Admin Burden</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-green-600 mb-1 ${isMobile ? 'mobile-text-large' : ''}`}>
                          {calculatedResults.savings_percent.toFixed(1)}%
                        </div>
                        <div className={`text-sm text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Savings Opportunity</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top-Level Metrics */}
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${isMobile ? 'propgen-bi-mobile' : ''}`}>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-red-600" />
                        Total Internal Admin Cost
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {formatCurrency(calculatedResults.admin_total)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Current annual HR administrative burden
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Projected Annual Savings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {formatCurrency(calculatedResults.savings_dollar)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        EaseWorks vs. Current Model
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        EaseWorks Cost as % of Payroll
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {((calculatedResults.total_easeworks_cost / formData.annual_payroll) * 100).toFixed(2)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total cost as percentage of payroll
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Strategic Benefits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Shield className="h-6 w-6 text-blue-600" />
                      Strategic Benefits of Partnering with EaseWorks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-green-800">Reduced Compliance Risk</div>
                          <div className="text-sm text-green-600">Stay current with regulations</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Shield className="h-6 w-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-blue-800">WC Deposit Elimination</div>
                          <div className="text-sm text-blue-600">No more cash flow impact</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <Globe className="h-6 w-6 text-purple-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-purple-800">Consolidated Platform</div>
                          <div className="text-sm text-purple-600">Single payroll & benefits system</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <BookOpen className="h-6 w-6 text-orange-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-orange-800">Modern LMS</div>
                          <div className="text-sm text-orange-600">Real-time training tracking</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                        <FileText className="h-6 w-6 text-red-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-red-800">Turnkey Safety Support</div>
                          <div className="text-sm text-red-600">Policies & procedures included</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-lg border border-teal-200">
                        <Heart className="h-6 w-6 text-teal-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-teal-800">Better Employee Experience</div>
                          <div className="text-sm text-teal-600">Streamlined HR processes</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* EaseWorks Quote */}
                <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-700 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      The EaseWorks Advantage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-lg italic text-slate-700 mb-4">
                      "At EaseWorks, we understand that your business success depends on focusing on what you do best. 
                      That's why we've designed our comprehensive HR solution to eliminate administrative burden, 
                      reduce compliance risk, and provide cost savings that directly impact your bottom line. 
                      Our integrated platform doesn't just manage your HR—it transforms it into a strategic advantage."
                    </blockquote>
                    <div className="text-sm text-slate-600">
                      — The EaseWorks Team
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Financial Summary */}
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-700 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Financial Impact Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Current Annual Costs</div>
                        <div className="text-2xl font-bold text-red-600 mb-1">
                          {formatCurrency(calculatedResults.current_total_cost)}
                        </div>
                        <div className="text-sm text-red-600">
                          Including {formatCurrency(calculatedResults.admin_total)} admin burden
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">EaseWorks Total Cost</div>
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {formatCurrency(calculatedResults.total_easeworks_cost)}
                        </div>
                        <div className="text-sm text-green-600">
                          {((calculatedResults.admin_total / formData.annual_payroll) * 100).toFixed(1)}% of admin burden eliminated
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Calculating business intelligence metrics...</p>
              </div>
            )}
          </div>
        );
      case 'results':
        return (
          <div className={`space-y-6 ${isMobile ? 'propgen-mobile-section' : ''}`} id="propgen-results">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold mb-2 ${isMobile ? 'mobile-text-large' : ''}`}>Investment Analysis Results</h2>
              <p className={`text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>
                Analysis for {formData.company_name} - {formData.wse_count} employees, {formatCurrency(formData.annual_payroll)} annual payroll
              </p>
            </div>
            
            {calculatedResults ? (
              <div className="space-y-8">
                {/* Current vs EaseWorks Comparison */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isMobile ? 'propgen-mobile-grid' : ''}`}>
                  <Card className={isMobile ? 'propgen-mobile-card' : ''}>
                    <CardHeader>
                      <CardTitle className={`text-red-600 ${isMobile ? 'mobile-text-medium' : ''}`}>Current Costs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className={isMobile ? 'mobile-text-medium' : ''}>FICA (7.65%)</span>
                        <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.fica_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isMobile ? 'mobile-text-medium' : ''}>SUTA ({formData.suta_rate}%)</span>
                        <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.suta_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isMobile ? 'mobile-text-medium' : ''}>FUTA (0.6%)</span>
                        <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.futa_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isMobile ? 'mobile-text-medium' : ''}>Workers' Comp</span>
                        <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.wc_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isMobile ? 'mobile-text-medium' : ''}>Administration</span>
                        <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.admin_total)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span className={isMobile ? 'mobile-text-medium' : ''}>Total Current Cost</span>
                          <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.current_total_cost)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={isMobile ? 'propgen-mobile-card' : ''}>
                    <CardHeader>
                      <CardTitle className={`text-green-600 ${isMobile ? 'mobile-text-medium' : ''}`}>EaseWorks Solution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className={isMobile ? 'mobile-text-medium' : ''}>FICA (7.65%)</span>
                        <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.fica_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isMobile ? 'mobile-text-medium' : ''}>SUTA ({formData.suta_rate}%)</span>
                        <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.suta_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isMobile ? 'mobile-text-medium' : ''}>FUTA (0.6%)</span>
                        <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.futa_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isMobile ? 'mobile-text-medium' : ''}>
                          Service Fee ({formData.pricing_model === '% of Payroll' ? 
                            `${formData.easeworks_fee || 0}% of Payroll` : 
                            `$${formData.easeworks_pepm || 0} PEPM`})
                        </span>
                        <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.easeworks_service_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isMobile ? 'mobile-text-medium' : ''}>Backend Services</span>
                        <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.backend_addons)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isMobile ? 'mobile-text-medium' : ''}>Workers' Comp</span>
                        <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(formData.total_easeworks_wc_premium)}</span>
                </div>

                {/* Additional One-Time Fees */}
                <Card className={`bg-blue-50 border-blue-200 ${isMobile ? 'propgen-mobile-card' : ''}`}>
                  <CardHeader>
                    <CardTitle className={`text-blue-600 ${isMobile ? 'mobile-text-medium' : ''}`}>Additional One-Time Fees</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className={isMobile ? 'mobile-text-medium' : ''}>Setup Fee (${formData.setup_fee_per_wse} × {formData.wse_count} employees)</span>
                      <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.setup_fee)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span className={isMobile ? 'mobile-text-medium' : ''}>Total One-Time Fees</span>
                        <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.setup_fee)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span className={isMobile ? 'mobile-text-medium' : ''}>Total EaseWorks Cost</span>
                          <span className={`font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.total_easeworks_cost)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Projected Savings Summary */}
                <Card className={`bg-gradient-to-r from-green-50 to-blue-50 border-green-200 ${isMobile ? 'propgen-mobile-card' : ''}`}>
                  <CardHeader>
                    <CardTitle className={`text-green-700 flex items-center gap-2 ${isMobile ? 'mobile-text-medium' : ''}`}>
                      <BarChart3 className="h-5 w-5" />
                      Total Projected Savings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isMobile ? 'propgen-metrics-mobile' : ''}`}>
                      <div className="text-center">
                        <div className={`text-4xl font-bold text-green-600 mb-2 ${isMobile ? 'mobile-text-large' : ''}`}>
                          {formatCurrency(calculatedResults.savings_dollar)}
                        </div>
                        <div className={`text-sm text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Annual Savings</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-4xl font-bold text-green-600 mb-2 ${isMobile ? 'mobile-text-large' : ''}`}>
                          {calculatedResults.savings_percent.toFixed(1)}%
                        </div>
                        <div className={`text-sm text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Percentage Savings</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-4xl font-bold text-green-600 mb-2 ${isMobile ? 'mobile-text-large' : ''}`}>
                          {formatCurrency(calculatedResults.savings_dollar / 12)}
                        </div>
                        <div className={`text-sm text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Monthly Savings</div>
                      </div>
                    </div>
                    <div className={`mt-4 p-3 bg-white rounded-lg border ${isMobile ? 'propgen-summary-mobile' : ''}`}>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className={isMobile ? 'mobile-text-medium' : ''}>Total Current Cost:</span>
                          <span className={`font-mono text-red-600 ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.current_total_cost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isMobile ? 'mobile-text-medium' : ''}>Total EaseWorks Cost:</span>
                          <span className={`font-mono text-green-600 ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.total_easeworks_cost)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-1">
                          <span className={isMobile ? 'mobile-text-medium' : ''}>Projected Savings:</span>
                          <span className={`font-mono text-green-600 ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(calculatedResults.savings_dollar)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gross Profit Analysis */}
                <Card className={isMobile ? 'propgen-mobile-card' : ''}>
                  <CardHeader>
                    <CardTitle className={`text-purple-600 ${isMobile ? 'mobile-text-medium' : ''}`}>Gross Profit Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${isMobile ? 'propgen-mobile-grid' : ''}`}>
                      <div>
                        <div className={`text-2xl font-bold text-purple-600 mb-2 ${isMobile ? 'mobile-text-large' : ''}`}>
                          {formatCurrency(calculatedResults.gp_total)}
                        </div>
                        <div className={`text-sm text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Annual Gross Profit</div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold text-purple-600 mb-2 ${isMobile ? 'mobile-text-large' : ''}`}>
                          {formatCurrency(calculatedResults.gp_pepm)}
                        </div>
                        <div className={`text-sm text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Gross Profit Per Employee Per Month</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Workers' Comp Details */}
                {formData.workers_comp_classifications.length > 0 && (
                  <Card className={isMobile ? 'propgen-mobile-card' : ''}>
                    <CardHeader>
                      <CardTitle className={isMobile ? 'mobile-text-medium' : ''}>Workers' Compensation Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`overflow-x-auto ${isMobile ? 'propgen-wc-mobile' : ''}`}>
                        <table className={`w-full text-sm ${isMobile ? 'mobile-text-medium' : ''}`}>
                          <thead>
                            <tr className="border-b">
                              <th className={`text-left p-2 ${isMobile ? 'mobile-text-medium' : ''}`}>Classification</th>
                              <th className={`text-right p-2 ${isMobile ? 'mobile-text-medium' : ''}`}>Employees</th>
                              <th className={`text-right p-2 ${isMobile ? 'mobile-text-medium' : ''}`}>Payroll</th>
                              <th className={`text-right p-2 ${isMobile ? 'mobile-text-medium' : ''}`}>Current Rate</th>
                              <th className={`text-right p-2 ${isMobile ? 'mobile-text-medium' : ''}`}>EaseWorks Rate</th>
                              <th className={`text-right p-2 ${isMobile ? 'mobile-text-medium' : ''}`}>Savings</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.workers_comp_classifications.map((wc, index) => (
                              <tr key={index} className="border-b">
                                <td className={`p-2 ${isMobile ? 'mobile-text-medium' : ''}`}>{wc.comp_code} - {wc.comp_description || 'Classification'}</td>
                                <td className={`text-right p-2 ${isMobile ? 'mobile-text-medium' : ''}`}>{wc.employee_count}</td>
                                <td className={`text-right p-2 font-mono ${isMobile ? 'mobile-text-medium' : ''}`}>{formatCurrency(wc.gross_wages)}</td>
                                <td className={`text-right p-2 ${isMobile ? 'mobile-text-medium' : ''}`}>{wc.employer_rate.toFixed(2)}%</td>
                                <td className={`text-right p-2 ${isMobile ? 'mobile-text-medium' : ''}`}>{wc.easeworks_rate.toFixed(2)}%</td>
                                <td className={`text-right p-2 font-mono text-green-600 ${isMobile ? 'mobile-text-medium' : ''}`}>
                                  {formatCurrency(wc.calculated_employer_premium - wc.calculated_easeworks_premium)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className={`text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>Complete the previous steps to see results</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`max-w-6xl mx-auto ${isMobile ? 'propgen-mobile-container' : 'p-6'}`}>
      <div className={`mb-6 ${isMobile ? 'propgen-mobile-section' : ''}`}>
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/proposals')}
          className={`mb-4 ${isMobile ? 'mobile-button' : ''}`}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Proposals
        </Button>
        
        <div className={`flex items-center gap-2 mb-4 ${isMobile ? 'mobile-stack' : ''}`}>
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className={`text-3xl font-bold ${isMobile ? 'mobile-text-large' : ''}`}>PropGEN – Investment Analysis</h1>
        </div>

        {/* Progress indicator */}
        <div className={`mb-8 ${isMobile ? 'propgen-mobile-progress' : ''}`}>
          <div className={`flex items-center justify-between mb-2 ${isMobile ? 'mobile-stack' : ''}`}>
            <span className={`text-sm font-medium ${isMobile ? 'mobile-text-medium' : ''}`}>Step {currentStep + 1} of {STEPS.length}</span>
            <span className={`text-sm text-muted-foreground ${isMobile ? 'mobile-text-medium' : ''}`}>{Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete</span>
          </div>
          <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2" />
          
          {/* Mobile step indicator */}
          {isMobile && (
            <div className="mt-4 text-center">
              <h2 className="text-lg font-semibold mobile-text-medium">{STEPS[currentStep].title}</h2>
            </div>
          )}
        </div>
      </div>

      {/* Current step content */}
      <div className={`mb-8 ${isMobile ? 'propgen-mobile-section' : ''}`}>
        {renderCurrentStep()}
      </div>

      {/* Navigation buttons */}
      <div className={`${isMobile ? 'propgen-mobile-nav' : 'flex justify-between items-center'}`}>
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 ${isMobile ? 'mobile-button' : ''}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className={`flex items-center gap-2 ${isMobile ? 'mobile-stack' : ''}`}>
          {currentStep === STEPS.length - 1 ? (
            <div className={`flex gap-2 ${isMobile ? 'mobile-stack' : ''}`}>
              <Button
                onClick={saveAnalysis}
                disabled={loading || isProcessing}
                className={`flex items-center gap-2 ${isMobile ? 'mobile-button' : ''}`}
              >
                {(loading || isProcessing) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Analysis
              </Button>
              <Button
                onClick={exportToPDF}
                disabled={loading}
                variant="outline"
                className={`flex items-center gap-2 ${isMobile ? 'mobile-button' : ''}`}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Export PDF
              </Button>
            </div>
          ) : (
            <Button
              onClick={nextStep}
              className={`flex items-center gap-2 ${isMobile ? 'mobile-button' : ''}`}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};