import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MapPin, 
  FileText, 
  Settings, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Globe,
  Building,
  Scale,
  HardHat,
  Users
} from 'lucide-react';
import { useDocumentBuilder } from '@/hooks/useDocumentBuilder';
import { DocumentBuilder } from './DocumentBuilder';
import { JurisdictionSelector } from './JurisdictionSelector';
import { LocationService } from './LocationService';
import type { HandbookBuilderConfig, DocumentType } from '@/types/document-builder';

interface HandbookBuilderProps {
  onComplete?: (documentId: string) => void;
  onCancel?: () => void;
}

export const HandbookBuilder = ({ onComplete, onCancel }: HandbookBuilderProps) => {
  const {
    documentTypes,
    jurisdictions,
    regulationRules,
    loadRegulationRules,
    getStates,
    getCounties
  } = useDocumentBuilder();

  const [currentStep, setCurrentStep] = useState(1);
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
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [createdDocumentId, setCreatedDocumentId] = useState<string | null>(null);

  // Load regulation rules when jurisdictions or category changes
  useEffect(() => {
    if (config.selectedJurisdictions.length > 0) {
      config.selectedJurisdictions.forEach(jurisdiction => {
        loadRegulationRules(jurisdiction.id, config.documentCategory);
      });
    }
  }, [config.selectedJurisdictions, config.documentCategory, loadRegulationRules]);

  const steps = [
    {
      id: 1,
      title: 'Document Type',
      description: 'Select the type of handbook to create',
      icon: FileText
    },
    {
      id: 2,
      title: 'Jurisdiction',
      description: 'Choose your location for compliance requirements',
      icon: MapPin
    },
    {
      id: 3,
      title: 'Company Info',
      description: 'Enter your company details',
      icon: Building
    },
    {
      id: 4,
      title: 'Options',
      description: 'Configure handbook features',
      icon: Settings
    },
    {
      id: 5,
      title: 'Build Document',
      description: 'Create and customize your handbook',
      icon: CheckCircle
    }
  ];

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

  const handleDocumentTypeSelect = (category: 'iipp' | 'state' | 'handbook') => {
    setConfig(prev => ({ ...prev, documentCategory: category }));
    
    // Find and set the corresponding document type
    const docType = documentTypes.find(dt => {
      switch (category) {
        case 'iipp':
          return dt.name.includes('IIPP');
        case 'state':
          return dt.name.includes('State Specific');
        case 'handbook':
          return dt.name.includes('Employee Handbook');
        default:
          return false;
      }
    });
    
    if (docType) {
      setSelectedDocumentType(docType);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Choose Document Type</h2>
              <p className="text-muted-foreground">Select the type of handbook you want to create</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  config.documentCategory === 'iipp' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleDocumentTypeSelect('iipp')}
              >
                <CardHeader className="text-center">
                  <HardHat className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle>IIPP Program</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    OSHA-required Injury & Illness Prevention Program for workplace safety
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">OSHA Compliant</Badge>
                    <Badge variant="outline">Safety Training</Badge>
                    <Badge variant="outline">Hazard Assessment</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  config.documentCategory === 'state' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleDocumentTypeSelect('state')}
              >
                <CardHeader className="text-center">
                  <Scale className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle>State Specific Manual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Customized compliance manual based on state regulations
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">State Regulations</Badge>
                    <Badge variant="outline">Local Requirements</Badge>
                    <Badge variant="outline">Compliance SOPs</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  config.documentCategory === 'handbook' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleDocumentTypeSelect('handbook')}
              >
                <CardHeader className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle>Employee Handbook</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete employee handbook for septic industry companies
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">HR Policies</Badge>
                    <Badge variant="outline">Labor Law</Badge>
                    <Badge variant="outline">Industry Specific</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Select Jurisdiction</h2>
              <p className="text-muted-foreground">Choose your location for compliance requirements</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LocationService
                jurisdictions={jurisdictions}
                onLocationDetected={(detected) => {
                  setConfig(prev => ({ 
                    ...prev, 
                    selectedJurisdictions: [...prev.selectedJurisdictions, ...detected]
                  }));
                }}
              />
              
              <JurisdictionSelector
                jurisdictions={jurisdictions}
                selectedJurisdictions={config.selectedJurisdictions}
                onChange={(selected) => setConfig(prev => ({ ...prev, selectedJurisdictions: selected }))}
                getStates={getStates}
                getCounties={getCounties}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Company Information</h2>
              <p className="text-muted-foreground">Enter your company details for document customization</p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={config.companyInfo.name}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    companyInfo: { ...prev.companyInfo, name: e.target.value }
                  }))}
                  placeholder="Enter your company name"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={config.companyInfo.state}
                    onValueChange={(value) => setConfig(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, state: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {getStates().map(state => (
                        <SelectItem key={state.id} value={state.abbreviation || state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="county">County (Optional)</Label>
                  <Input
                    id="county"
                    value={config.companyInfo.county}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, county: e.target.value }
                    }))}
                    placeholder="Enter county"
                  />
                </div>
              </div>
              
              {config.documentCategory === 'state' && (
                <div>
                  <Label htmlFor="state-license">State License Number</Label>
                  <Input
                    id="state-license"
                    value={config.companyInfo.septic_permit_number}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, septic_permit_number: e.target.value }
                    }))}
                    placeholder="Enter state license number"
                  />
                </div>
              )}
              
              {config.documentCategory === 'iipp' && (
                <div>
                  <Label htmlFor="osha-id">OSHA Establishment ID</Label>
                  <Input
                    id="osha-id"
                    value={config.companyInfo.osha_establishment_id}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, osha_establishment_id: e.target.value }
                    }))}
                    placeholder="Enter OSHA establishment ID"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Handbook Options</h2>
              <p className="text-muted-foreground">Configure additional features for your handbook</p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Language Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={config.language}
                    onValueChange={(value: 'en' | 'es' | 'bilingual') => 
                      setConfig(prev => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English Only</SelectItem>
                      <SelectItem value="es">Spanish Only</SelectItem>
                      <SelectItem value="bilingual">Bilingual (English/Spanish)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-quizzes"
                      checked={config.includeQuizzes}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, includeQuizzes: checked as boolean }))
                      }
                    />
                    <Label htmlFor="include-quizzes">Include section-based quizzes</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-forms"
                      checked={config.includeForms}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, includeForms: checked as boolean }))
                      }
                    />
                    <Label htmlFor="include-forms">Include compliance forms and checklists</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {!createdDocumentId ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Ready to Build</h2>
                <p className="text-muted-foreground mb-8">Your handbook will be created with the following settings:</p>
                
                <div className="max-w-2xl mx-auto space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="font-medium">Document Type:</span>
                          <Badge>{selectedDocumentType?.name}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Jurisdictions:</span>
                          <div className="flex gap-2">
                            {config.selectedJurisdictions.map(j => (
                              <Badge key={j.id} variant="outline">{j.name}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Company:</span>
                          <span>{config.companyInfo.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Language:</span>
                          <Badge variant="outline">
                            {config.language === 'en' ? 'English' : 
                             config.language === 'es' ? 'Spanish' : 'Bilingual'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Button 
                    onClick={() => setCreatedDocumentId('temp-id')} 
                    className="w-full"
                    size="lg"
                  >
                    Create Handbook
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-screen">
                <DocumentBuilder
                  documentTypeId={selectedDocumentType?.id}
                  onSave={(document) => {
                    setCreatedDocumentId(document.id);
                    onComplete?.(document.id);
                  }}
                  onClose={onCancel}
                />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (currentStep === 5 && createdDocumentId) {
    return renderStepContent();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Steps */}
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 mx-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="border-t bg-muted/30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
            
            {currentStep < steps.length && (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !config.documentCategory) ||
                  (currentStep === 2 && config.selectedJurisdictions.length === 0) ||
                  (currentStep === 3 && !config.companyInfo.name)
                }
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};