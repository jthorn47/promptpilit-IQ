import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetFooter 
} from '@/components/ui/sheet';
import { 
  Building2, 
  User, 
  FileText, 
  Target,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  Package,
  Eye,
  Send,
  Download,
  Link,
  Plus,
  Trash2,
  Wand2,
  RotateCcw,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ProposalCreationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (proposalData: ProposalData) => void;
  emailContext?: {
    sender: string;
    senderEmail: string;
    subject: string;
    companyName?: string;
  };
}

interface ProposalData {
  // Company Information
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyAddress: string;
  industry: string;
  companySize: string;
  
  // SPIN Content
  situation: string;
  problem: string;
  implication: string;
  needPayoff: string;
  
  // Investment Analysis
  proposedSolution: string;
  investmentAmount: number;
  roi: number;
  timeframe: string;
  currency: string;
  
  // Add-ons and Pricing
  selectedAddons: string[];
  customAddons: { name: string; price: number; description: string }[];
  discountPercentage: number;
  
  // Proposal Settings
  proposalTitle: string;
  proposalType: 'propgen' | 'pdf';
  includeRiskAssessment: boolean;
  includePricing: boolean;
  includeTerms: boolean;
}

// Mock add-ons data
const availableAddons = [
  { id: 'lms', name: 'Learning Management System', price: 25000, description: 'Comprehensive training platform' },
  { id: 'payroll', name: 'Advanced Payroll', price: 15000, description: 'Full payroll processing suite' },
  { id: 'benefits', name: 'Benefits Administration', price: 12000, description: 'Employee benefits management' },
  { id: 'time', name: 'Time & Attendance', price: 8000, description: 'Clock-in/out tracking system' },
  { id: 'performance', name: 'Performance Management', price: 18000, description: 'Employee performance tracking' },
  { id: 'compliance', name: 'Compliance Suite', price: 22000, description: 'Regulatory compliance tools' }
];

// Mock data for demonstration
const mockCRMData = {
  companyName: 'Acme Corporation',
  contactName: 'Sarah Chen',
  contactEmail: 'sarah@acme.com',
  contactPhone: '+1 (555) 123-4567',
  companyAddress: '123 Business Park, San Francisco, CA 94105',
  industry: 'Technology',
  companySize: '50-100 employees',
  riskAssessment: {
    situation: 'Acme Corporation is a growing technology company with 75 employees experiencing rapid expansion and increased regulatory compliance requirements.',
    problem: 'Current manual HR processes are creating bottlenecks, compliance gaps, and employee dissatisfaction due to delayed onboarding and inconsistent policy enforcement.',
    implication: 'Without proper HR automation, Acme faces potential compliance violations ($50K+ in fines), increased turnover costs ($150K annually), and operational inefficiencies limiting growth.',
    needPayoff: 'Implementing comprehensive HR automation will reduce compliance risk by 90%, cut onboarding time by 70%, and save $200K annually in operational costs while improving employee satisfaction.'
  }
};

export const ProposalCreationDrawer: React.FC<ProposalCreationDrawerProps> = ({
  isOpen,
  onClose,
  onNext,
  emailContext
}) => {
  const [currentStep, setCurrentStep] = useState<'company' | 'spin' | 'investment' | 'addons' | 'review'>('company');
  const [proposalData, setProposalData] = useState<ProposalData>({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companyAddress: '',
    industry: '',
    companySize: '',
    situation: '',
    problem: '',
    implication: '',
    needPayoff: '',
    proposedSolution: '',
    investmentAmount: 0,
    roi: 0,
    timeframe: '12 months',
    currency: 'USD',
    selectedAddons: [],
    customAddons: [],
    discountPercentage: 0,
    proposalTitle: '',
    proposalType: 'propgen',
    includeRiskAssessment: true,
    includePricing: true,
    includeTerms: true
  });
  
  const [isLoadingCRM, setIsLoadingCRM] = useState(false);
  const [hasCRMData, setHasCRMData] = useState(false);
  
  // AI generation states
  const [aiGenerationStates, setAiGenerationStates] = useState<{
    [key in 'situation' | 'problem' | 'implication' | 'needPayoff']: {
      isGenerating: boolean;
      tone: 'concise' | 'persuasive' | 'consultative';
      originalContent: string;
    }
  }>({
    situation: { isGenerating: false, tone: 'consultative', originalContent: '' },
    problem: { isGenerating: false, tone: 'consultative', originalContent: '' },
    implication: { isGenerating: false, tone: 'consultative', originalContent: '' },
    needPayoff: { isGenerating: false, tone: 'consultative', originalContent: '' }
  });

  // Prefill data when drawer opens
  useEffect(() => {
    if (isOpen && emailContext) {
      // Simulate CRM data loading
      setIsLoadingCRM(true);
      setTimeout(() => {
        setProposalData(prev => ({
          ...prev,
          companyName: emailContext.companyName || mockCRMData.companyName,
          contactName: emailContext.sender || mockCRMData.contactName,
          contactEmail: emailContext.senderEmail || mockCRMData.contactEmail,
          contactPhone: mockCRMData.contactPhone,
          companyAddress: mockCRMData.companyAddress,
          industry: mockCRMData.industry,
          companySize: mockCRMData.companySize,
          proposalTitle: `HR Services Proposal - ${emailContext.companyName || mockCRMData.companyName}`,
          // Prefill SPIN from risk assessment
          situation: mockCRMData.riskAssessment.situation,
          problem: mockCRMData.riskAssessment.problem,
          implication: mockCRMData.riskAssessment.implication,
          needPayoff: mockCRMData.riskAssessment.needPayoff,
          proposedSolution: 'Comprehensive HR automation platform including LMS, payroll processing, compliance management, and employee self-service portal.',
          investmentAmount: 125000,
          roi: 240
        }));
        setHasCRMData(true);
        setIsLoadingCRM(false);
      }, 1000);
    }
  }, [isOpen, emailContext]);

  const updateProposalData = (field: keyof ProposalData, value: any) => {
    setProposalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep === 'company') {
      setCurrentStep('spin');
    } else if (currentStep === 'spin') {
      setCurrentStep('investment');
    } else if (currentStep === 'investment') {
      setCurrentStep('addons');
    } else if (currentStep === 'addons') {
      setCurrentStep('review');
    } else {
      onNext(proposalData);
    }
  };

  const handleBack = () => {
    if (currentStep === 'review') {
      setCurrentStep('addons');
    } else if (currentStep === 'addons') {
      setCurrentStep('investment');
    } else if (currentStep === 'investment') {
      setCurrentStep('spin');
    } else if (currentStep === 'spin') {
      setCurrentStep('company');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'company':
        return proposalData.companyName && proposalData.contactName && proposalData.contactEmail;
      case 'spin':
        return proposalData.situation && proposalData.problem && proposalData.implication && proposalData.needPayoff;
      case 'investment':
        return proposalData.proposedSolution && proposalData.investmentAmount > 0;
      case 'addons':
        return true; // Add-ons are optional
      case 'review':
        return true; // Review step always allows proceed
      default:
        return false;
    }
  };

  const renderCompanyStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Company Information</h3>
        {hasCRMData && (
          <Badge variant="secondary" className="ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            CRM Data Loaded
          </Badge>
        )}
      </div>

      {isLoadingCRM && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading CRM data...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={proposalData.companyName}
            onChange={(e) => updateProposalData('companyName', e.target.value)}
            placeholder="Enter company name"
          />
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Select value={proposalData.industry} onValueChange={(value) => updateProposalData('industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactName">Contact Name *</Label>
          <Input
            id="contactName"
            value={proposalData.contactName}
            onChange={(e) => updateProposalData('contactName', e.target.value)}
            placeholder="Enter contact name"
          />
        </div>
        <div>
          <Label htmlFor="companySize">Company Size</Label>
          <Select value={proposalData.companySize} onValueChange={(value) => updateProposalData('companySize', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-100">51-100 employees</SelectItem>
              <SelectItem value="101-500">101-500 employees</SelectItem>
              <SelectItem value="500+">500+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactEmail">Contact Email *</Label>
          <Input
            id="contactEmail"
            type="email"
            value={proposalData.contactEmail}
            onChange={(e) => updateProposalData('contactEmail', e.target.value)}
            placeholder="Enter email address"
          />
        </div>
        <div>
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input
            id="contactPhone"
            value={proposalData.contactPhone}
            onChange={(e) => updateProposalData('contactPhone', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="companyAddress">Company Address</Label>
        <Textarea
          id="companyAddress"
          value={proposalData.companyAddress}
          onChange={(e) => updateProposalData('companyAddress', e.target.value)}
          placeholder="Enter company address"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="proposalTitle">Proposal Title *</Label>
        <Input
          id="proposalTitle"
          value={proposalData.proposalTitle}
          onChange={(e) => updateProposalData('proposalTitle', e.target.value)}
          placeholder="Enter proposal title"
        />
      </div>
    </div>
  );


  const renderInvestmentStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Investment Analysis</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="proposedSolution">Proposed Solution *</Label>
          <Textarea
            id="proposedSolution"
            value={proposalData.proposedSolution}
            onChange={(e) => updateProposalData('proposedSolution', e.target.value)}
            placeholder="Describe your proposed solution..."
            rows={4}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="investmentAmount">Investment Amount *</Label>
            <div className="flex mt-1">
              <Select value={proposalData.currency} onValueChange={(value) => updateProposalData('currency', value)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="investmentAmount"
                type="number"
                value={proposalData.investmentAmount}
                onChange={(e) => updateProposalData('investmentAmount', Number(e.target.value))}
                placeholder="Enter amount"
                className="ml-2"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="roi">Expected ROI (%)</Label>
            <Input
              id="roi"
              type="number"
              value={proposalData.roi}
              onChange={(e) => updateProposalData('roi', Number(e.target.value))}
              placeholder="Enter ROI percentage"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="timeframe">Implementation Timeframe</Label>
          <Select value={proposalData.timeframe} onValueChange={(value) => updateProposalData('timeframe', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3 months">3 months</SelectItem>
              <SelectItem value="6 months">6 months</SelectItem>
              <SelectItem value="12 months">12 months</SelectItem>
              <SelectItem value="18 months">18 months</SelectItem>
              <SelectItem value="24 months">24 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Proposal Options</h4>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="proposalType">Proposal Type</Label>
              <p className="text-sm text-muted-foreground">Choose between PropGEN or PDF format</p>
            </div>
            <Select value={proposalData.proposalType} onValueChange={(value: 'propgen' | 'pdf') => updateProposalData('proposalType', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="propgen">PropGEN</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="includeRiskAssessment">Include Risk Assessment</Label>
              <p className="text-sm text-muted-foreground">Add detailed risk analysis section</p>
            </div>
            <Switch
              id="includeRiskAssessment"
              checked={proposalData.includeRiskAssessment}
              onCheckedChange={(checked) => updateProposalData('includeRiskAssessment', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="includePricing">Include Pricing Details</Label>
              <p className="text-sm text-muted-foreground">Add detailed pricing breakdown</p>
            </div>
            <Switch
              id="includePricing"
              checked={proposalData.includePricing}
              onCheckedChange={(checked) => updateProposalData('includePricing', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="includeTerms">Include Terms & Conditions</Label>
              <p className="text-sm text-muted-foreground">Add standard terms and conditions</p>
            </div>
            <Switch
              id="includeTerms"
              checked={proposalData.includeTerms}
              onCheckedChange={(checked) => updateProposalData('includeTerms', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const stepTitles = {
    company: 'Company Information',
    spin: 'SPIN Analysis',
    investment: 'Investment Analysis',
    addons: 'Add-ons & Pricing',
    review: 'Review & Generate'
  };

  const handleGenerateProposal = async () => {
    // Simulate proposal generation
    console.log('Generating proposal...', proposalData);
    
    // Calculate total amount including add-ons
    const addonsTotal = proposalData.selectedAddons.reduce((sum, addonId) => {
      const addon = availableAddons.find(a => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0) + proposalData.customAddons.reduce((sum, addon) => sum + addon.price, 0);
    
    const subtotal = proposalData.investmentAmount + addonsTotal;
    const discount = subtotal * (proposalData.discountPercentage / 100);
    const totalAmount = subtotal - discount;
    
    // Generate PDF and PropGEN link (mock)
    const proposalId = Math.random().toString(36).substring(7);
    const propgenLink = `https://propgen.halo.dev/proposal/${proposalId}`;
    
    // Simulate generating proposal
    setTimeout(() => {
      console.log('Proposal generated:', {
        proposalId,
        propgenLink,
        totalAmount,
        pdfAttached: true,
        threadTagged: 'Proposal Sent'
      });
      
      // Close drawer and show next steps modal
      onNext(proposalData);
    }, 2000);
  };

  const toggleAddon = (addonId: string) => {
    const current = proposalData.selectedAddons;
    const updated = current.includes(addonId)
      ? current.filter(id => id !== addonId)
      : [...current, addonId];
    updateProposalData('selectedAddons', updated);
  };

  // AI generation functions
  const generateAIContent = async (spinType: 'situation' | 'problem' | 'implication' | 'needPayoff') => {
    const currentState = aiGenerationStates[spinType];
    
    // Set loading state
    setAiGenerationStates(prev => ({
      ...prev,
      [spinType]: { ...prev[spinType], isGenerating: true }
    }));

    try {
      const { data, error } = await supabase.functions.invoke('generate-spin-content', {
        body: {
          spinType,
          tone: currentState.tone,
          companyName: proposalData.companyName,
          industry: proposalData.industry,
          companySize: proposalData.companySize,
          existingContent: proposalData[spinType],
          contextData: {
            riskAssessment: hasCRMData ? `${mockCRMData.riskAssessment.situation} ${mockCRMData.riskAssessment.problem}` : undefined,
            emailHistory: emailContext?.subject || undefined,
            crmTags: proposalData.industry ? [proposalData.industry] : undefined
          }
        }
      });

      if (error) throw error;

      // Store original content if this is the first generation
      if (!currentState.originalContent && proposalData[spinType]) {
        setAiGenerationStates(prev => ({
          ...prev,
          [spinType]: { ...prev[spinType], originalContent: proposalData[spinType] }
        }));
      }

      // Update the proposal data with generated content
      updateProposalData(spinType, data.content);

    } catch (error) {
      console.error('Error generating AI content:', error);
      // You could add a toast notification here
    } finally {
      // Clear loading state
      setAiGenerationStates(prev => ({
        ...prev,
        [spinType]: { ...prev[spinType], isGenerating: false }
      }));
    }
  };

  const updateTone = (spinType: 'situation' | 'problem' | 'implication' | 'needPayoff', tone: 'concise' | 'persuasive' | 'consultative') => {
    setAiGenerationStates(prev => ({
      ...prev,
      [spinType]: { ...prev[spinType], tone }
    }));
  };

  const resetContent = (spinType: 'situation' | 'problem' | 'implication' | 'needPayoff') => {
    const originalContent = aiGenerationStates[spinType].originalContent;
    updateProposalData(spinType, originalContent);
    
    // Clear the original content since we're resetting
    setAiGenerationStates(prev => ({
      ...prev,
      [spinType]: { ...prev[spinType], originalContent: '' }
    }));
  };

  const renderSpinSection = (
    spinType: 'situation' | 'problem' | 'implication' | 'needPayoff',
    title: string,
    placeholder: string,
    description: string,
    bgColor: string,
    textColor: string,
    letter: string
  ) => {
    const currentState = aiGenerationStates[spinType];
    const hasOriginalContent = currentState.originalContent.length > 0;

    return (
      <div className="space-y-3">
        <Label htmlFor={spinType} className="flex items-center gap-2">
          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium", bgColor, textColor)}>
            {letter}
          </div>
          {title} *
        </Label>
        
        {/* AI Controls */}
        <div className="flex items-center gap-2 mb-2">
          <Select value={currentState.tone} onValueChange={(value: any) => updateTone(spinType, value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="persuasive">Persuasive</SelectItem>
              <SelectItem value="consultative">Consultative</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateAIContent(spinType)}
            disabled={currentState.isGenerating || !proposalData.companyName}
            className="flex items-center gap-1"
          >
            {currentState.isGenerating ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Wand2 className="w-3 h-3" />
            )}
            {currentState.isGenerating ? 'Generating...' : 'Generate with AI'}
          </Button>
          
          {hasOriginalContent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => resetContent(spinType)}
              className="flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </Button>
          )}
        </div>

        <Textarea
          id={spinType}
          value={proposalData[spinType]}
          onChange={(e) => updateProposalData(spinType, e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          {description}
        </p>
      </div>
    );
  };

  const renderSPINStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">SPIN Analysis</h3>
        {hasCRMData && (
          <Badge variant="secondary" className="ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Pre-filled from Risk Assessment
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {renderSpinSection(
          'situation',
          'Situation',
          'Describe the current business situation and context...',
          'What is the current state of the client\'s business relevant to your solution?',
          'bg-blue-100',
          'text-blue-600',
          'S'
        )}

        {renderSpinSection(
          'problem',
          'Problem',
          'Identify the specific challenges and pain points...',
          'What specific problems or challenges is the client facing?',
          'bg-red-100',
          'text-red-600',
          'P'
        )}

        {renderSpinSection(
          'implication',
          'Implication',
          'Explain the consequences of not addressing the problem...',
          'What are the consequences if these problems remain unaddressed?',
          'bg-orange-100',
          'text-orange-600',
          'I'
        )}

        {renderSpinSection(
          'needPayoff',
          'Need-Payoff',
          'Describe the benefits and value of solving the problem...',
          'What benefits would the client gain from solving these problems?',
          'bg-green-100',
          'text-green-600',
          'N'
        )}
      </div>
    </div>
  );

  const addCustomAddon = () => {
    const newAddon = { name: '', price: 0, description: '' };
    updateProposalData('customAddons', [...proposalData.customAddons, newAddon]);
  };

  const updateCustomAddon = (index: number, field: string, value: any) => {
    const updated = [...proposalData.customAddons];
    updated[index] = { ...updated[index], [field]: value };
    updateProposalData('customAddons', updated);
  };

  const removeCustomAddon = (index: number) => {
    const updated = proposalData.customAddons.filter((_, i) => i !== index);
    updateProposalData('customAddons', updated);
  };

  const renderAddonsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Add-ons & Pricing</h3>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-3">Available Add-ons</h4>
          <div className="grid gap-3">
            {availableAddons.map((addon) => (
              <Card key={addon.id} className={cn(
                "p-4 cursor-pointer transition-colors",
                proposalData.selectedAddons.includes(addon.id) ? "ring-2 ring-primary" : ""
              )} onClick={() => toggleAddon(addon.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={proposalData.selectedAddons.includes(addon.id)}
                        readOnly
                        className="rounded"
                      />
                      <h5 className="font-medium">{addon.name}</h5>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{addon.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${addon.price.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Custom Add-ons</h4>
            <Button variant="outline" size="sm" onClick={addCustomAddon}>
              <Plus className="w-4 h-4 mr-1" />
              Add Custom
            </Button>
          </div>
          
          {proposalData.customAddons.map((addon, index) => (
            <Card key={index} className="p-4 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Add-on name"
                  value={addon.name}
                  onChange={(e) => updateCustomAddon(index, 'name', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={addon.price}
                  onChange={(e) => updateCustomAddon(index, 'price', Number(e.target.value))}
                />
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Description"
                    value={addon.description}
                    onChange={(e) => updateCustomAddon(index, 'description', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCustomAddon(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Separator />

        <div>
          <Label htmlFor="discount">Discount Percentage</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              value={proposalData.discountPercentage}
              onChange={(e) => updateProposalData('discountPercentage', Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const addonsTotal = proposalData.selectedAddons.reduce((sum, addonId) => {
      const addon = availableAddons.find(a => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0) + proposalData.customAddons.reduce((sum, addon) => sum + addon.price, 0);
    
    const subtotal = proposalData.investmentAmount + addonsTotal;
    const discount = subtotal * (proposalData.discountPercentage / 100);
    const totalAmount = subtotal - discount;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Review & Generate</h3>
        </div>

        {/* Visual Preview */}
        <Card className="p-6 bg-gradient-to-br from-background to-muted/20">
          <div className="space-y-4">
            <div className="text-center border-b pb-4">
              <h2 className="text-2xl font-bold text-primary">{proposalData.proposalTitle}</h2>
              <p className="text-muted-foreground">Prepared for {proposalData.companyName}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Client Information</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Company:</strong> {proposalData.companyName}</p>
                  <p><strong>Contact:</strong> {proposalData.contactName}</p>
                  <p><strong>Email:</strong> {proposalData.contactEmail}</p>
                  <p><strong>Industry:</strong> {proposalData.industry}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Investment Summary</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Base Investment:</strong> ${proposalData.investmentAmount.toLocaleString()}</p>
                  <p><strong>Add-ons:</strong> ${addonsTotal.toLocaleString()}</p>
                  {proposalData.discountPercentage > 0 && (
                    <p><strong>Discount ({proposalData.discountPercentage}%):</strong> -${discount.toLocaleString()}</p>
                  )}
                  <p className="text-lg font-bold text-primary"><strong>Total:</strong> ${totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">SPIN Analysis Preview</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Situation:</strong></p>
                  <p className="text-muted-foreground line-clamp-2">{proposalData.situation}</p>
                </div>
                <div>
                  <p><strong>Problem:</strong></p>
                  <p className="text-muted-foreground line-clamp-2">{proposalData.problem}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4 border-t">
              <Badge variant="secondary">
                <FileText className="w-3 h-3 mr-1" />
                {proposalData.proposalType.toUpperCase()} Format
              </Badge>
              <Badge variant="secondary">
                <TrendingUp className="w-3 h-3 mr-1" />
                {proposalData.roi}% ROI
              </Badge>
              <Badge variant="secondary">
                <Calendar className="w-3 h-3 mr-1" />
                {proposalData.timeframe}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Generate Options */}
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Generation Options</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              <span className="text-sm">Beautiful PDF proposal will be attached to email</span>
            </div>
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-primary" />
              <span className="text-sm">PropGEN proposal link will be generated and tracked</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-sm">Email thread will be auto-tagged as "Proposal Sent"</span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create Proposal
          </SheetTitle>
          <SheetDescription>
            Generate a comprehensive proposal using SPIN methodology and CRM data
          </SheetDescription>
        </SheetHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between py-4 border-b">
          {['company', 'spin', 'investment', 'addons', 'review'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep === step ? "bg-primary text-primary-foreground" :
                (index < ['company', 'spin', 'investment', 'addons', 'review'].indexOf(currentStep)) ? "bg-green-500 text-white" :
                "bg-muted text-muted-foreground"
              )}>
                {index < ['company', 'spin', 'investment', 'addons', 'review'].indexOf(currentStep) ? '✓' : index + 1}
              </div>
              <span className={cn(
                "ml-2 text-sm font-medium hidden sm:block",
                currentStep === step ? "text-primary" : "text-muted-foreground"
              )}>
                {stepTitles[step as keyof typeof stepTitles]}
              </span>
              {index < 4 && (
                <div className={cn(
                  "w-8 h-px mx-4 hidden sm:block",
                  index < ['company', 'spin', 'investment', 'addons', 'review'].indexOf(currentStep) ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="py-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'company' && renderCompanyStep()}
            {currentStep === 'spin' && renderSPINStep()}
            {currentStep === 'investment' && renderInvestmentStep()}
            {currentStep === 'addons' && renderAddonsStep()}
            {currentStep === 'review' && renderReviewStep()}
          </motion.div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="border-t pt-4">
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={currentStep === 'company' ? onClose : handleBack}
            >
              {currentStep === 'company' ? 'Cancel' : 'Back'}
            </Button>
            <Button
              onClick={currentStep === 'review' ? handleGenerateProposal : handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              {currentStep === 'review' ? (
                <>
                  <Send className="w-4 h-4" />
                  Generate & Attach to Email
                </>
              ) : (
                <>
                  {currentStep === 'investment' ? 'Add-ons & Pricing' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};