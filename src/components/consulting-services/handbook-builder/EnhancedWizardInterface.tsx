import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  MapPin, 
  Building,
  Settings,
  Wand2,
  AlertCircle,
  Globe,
  Users,
  Shield
} from 'lucide-react';
import { IndustryTemplateLibrary } from './IndustryTemplateLibrary';
import { ModularContentBlocks } from './ModularContentBlocks';
import { JurisdictionSelector } from './JurisdictionSelector';
import { LocationService } from './LocationService';
import { useDocumentBuilder } from '@/hooks/useDocumentBuilder';
import type { HandbookBuilderConfig } from '@/types/document-builder';

interface EnhancedWizardInterfaceProps {
  onComplete?: (config: HandbookBuilderConfig) => void;
  onCancel?: () => void;
}

export const EnhancedWizardInterface = ({ onComplete, onCancel }: EnhancedWizardInterfaceProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedBlocks, setSelectedBlocks] = useState<any[]>([]);
  const [config, setConfig] = useState<HandbookBuilderConfig>({
    selectedJurisdictions: [],
    documentCategory: 'iipp',
    companyInfo: {
      name: '',
      state: '',
      county: '',
      septic_permit_number: '',
      osha_establishment_id: ''
    },
    includeQuizzes: false,
    includeForms: false,
    language: 'en'
  });

  const { 
    jurisdictions, 
    getStates, 
    getCounties 
  } = useDocumentBuilder();

  const steps = [
    {
      id: 1,
      title: 'Choose Template',
      description: 'Select an industry-specific template',
      icon: <FileText className="h-5 w-5" />,
      isComplete: !!selectedTemplate
    },
    {
      id: 2,
      title: 'Location & Jurisdiction',
      description: 'Set your location and compliance requirements',
      icon: <MapPin className="h-5 w-5" />,
      isComplete: config.selectedJurisdictions.length > 0
    },
    {
      id: 3,
      title: 'Company Information',
      description: 'Enter your company details',
      icon: <Building className="h-5 w-5" />,
      isComplete: !!config.companyInfo.name
    },
    {
      id: 4,
      title: 'Content Blocks',
      description: 'Customize your handbook content',
      icon: <Settings className="h-5 w-5" />,
      isComplete: selectedBlocks.length > 0
    },
    {
      id: 5,
      title: 'Review & Generate',
      description: 'Review and create your handbook',
      icon: <Wand2 className="h-5 w-5" />,
      isComplete: false
    }
  ];

  const currentStepData = steps.find(s => s.id === currentStep);
  const completedSteps = steps.filter(s => s.isComplete).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    // Only allow navigation to previous steps or current step
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const canProceed = () => {
    const step = steps.find(s => s.id === currentStep);
    return step?.isComplete || currentStep === steps.length;
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setConfig(prev => ({ ...prev, documentCategory: template.category }));
  };

  const handleLocationDetected = (detected: any[]) => {
    setConfig(prev => ({ 
      ...prev, 
      selectedJurisdictions: [...prev.selectedJurisdictions, ...detected]
    }));
  };

  const handleJurisdictionChange = (selected: any[]) => {
    setConfig(prev => ({ ...prev, selectedJurisdictions: selected }));
  };

  const handleComplete = () => {
    const finalConfig = {
      ...config,
      selectedTemplate,
      selectedBlocks
    };
    onComplete?.(finalConfig);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Choose Your Template</h2>
              <p className="text-muted-foreground">
                Select a pre-built template that matches your industry and requirements
              </p>
            </div>
            
            <IndustryTemplateLibrary
              onTemplateSelect={handleTemplateSelect}
              selectedCategory={config.documentCategory}
            />
            
            {selectedTemplate && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{selectedTemplate.name}</strong> selected. 
                  This template includes {selectedTemplate.sections.length} sections and 
                  supports {selectedTemplate.languages.join(', ')} languages.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Location & Jurisdiction</h2>
              <p className="text-muted-foreground">
                Set your location to automatically include relevant regulations and compliance requirements
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LocationService
                jurisdictions={jurisdictions}
                onLocationDetected={handleLocationDetected}
              />
              
              <JurisdictionSelector
                jurisdictions={jurisdictions}
                selectedJurisdictions={config.selectedJurisdictions}
                onChange={handleJurisdictionChange}
                getStates={getStates}
                getCounties={getCounties}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Company Information</h2>
              <p className="text-muted-foreground">
                Enter your company details to customize the handbook
              </p>
            </div>
            
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Company Name *</label>
                  <input
                    type="text"
                    value={config.companyInfo.name}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, name: e.target.value }
                    }))}
                    className="w-full p-2 border rounded-md mt-1"
                    placeholder="Enter your company name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">State</label>
                    <input
                      type="text"
                      value={config.companyInfo.state}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        companyInfo: { ...prev.companyInfo, state: e.target.value }
                      }))}
                      className="w-full p-2 border rounded-md mt-1"
                      placeholder="State"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">County</label>
                    <input
                      type="text"
                      value={config.companyInfo.county || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        companyInfo: { ...prev.companyInfo, county: e.target.value }
                      }))}
                      className="w-full p-2 border rounded-md mt-1"
                      placeholder="County (optional)"
                    />
                  </div>
                </div>
                
                {config.documentCategory === 'state' && (
                  <div>
                    <label className="text-sm font-medium">State License Number</label>
                    <input
                      type="text"
                      value={config.companyInfo.septic_permit_number || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        companyInfo: { ...prev.companyInfo, septic_permit_number: e.target.value }
                      }))}
                      className="w-full p-2 border rounded-md mt-1"
                      placeholder="Enter state license number"
                    />
                  </div>
                )}
                
                {config.documentCategory === 'iipp' && (
                  <div>
                    <label className="text-sm font-medium">OSHA Establishment ID</label>
                    <input
                      type="text"
                      value={config.companyInfo.osha_establishment_id || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        companyInfo: { ...prev.companyInfo, osha_establishment_id: e.target.value }
                      }))}
                      className="w-full p-2 border rounded-md mt-1"
                      placeholder="Enter OSHA establishment ID"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Customize Content Blocks</h2>
              <p className="text-muted-foreground">
                Add and customize modular content blocks for your handbook
              </p>
            </div>
            
            <ModularContentBlocks
              selectedBlocks={selectedBlocks}
              onBlocksChange={setSelectedBlocks}
              language={config.language}
              onLanguageChange={(language) => setConfig(prev => ({ ...prev, language }))}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Review & Generate</h2>
              <p className="text-muted-foreground">
                Review your handbook configuration and generate the final document
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Template</label>
                      <p>{selectedTemplate?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <Badge>{config.documentCategory.toUpperCase()}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Company</label>
                      <p>{config.companyInfo.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Language</label>
                      <Badge variant="outline">
                        {config.language === 'en' ? 'English' : 
                         config.language === 'es' ? 'Español' : 'Bilingual'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Jurisdictions</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {config.selectedJurisdictions.map((jurisdiction) => (
                        <Badge key={jurisdiction.id} variant="outline">
                          {jurisdiction.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Content Blocks</label>
                    <p className="text-sm">{selectedBlocks.length} blocks selected</p>
                  </div>
                </CardContent>
              </Card>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your handbook will be generated with the selected template, customized content blocks, 
                  and jurisdiction-specific regulations. This process may take a few minutes.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center">
                <Button size="lg" onClick={handleComplete} className="px-8">
                  <Wand2 className="h-5 w-5 mr-2" />
                  Generate Handbook
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Progress */}
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Handbook Builder</h1>
              <p className="text-muted-foreground">
                Step {currentStep} of {steps.length}: {currentStepData?.title}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {completedSteps} of {steps.length} completed
              </div>
              <div className="w-32">
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          </div>
          
          {/* Step Navigation */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={step.id > currentStep}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    step.id === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.isComplete
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'text-muted-foreground hover:text-foreground'
                  } ${step.id > currentStep ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {step.isComplete ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {renderStepContent()}
      </div>

      {/* Footer Navigation */}
      <div className="border-t bg-muted/30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
            
            {currentStep < steps.length ? (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Generate Handbook
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};