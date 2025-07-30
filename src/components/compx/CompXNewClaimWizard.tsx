import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  User, 
  MapPin, 
  Calendar, 
  FileText, 
  Shield,
  AlertTriangle,
  Phone,
  Mail,
  Clock,
  HelpCircle
} from 'lucide-react';

interface CompXNewClaimWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (claimData: any) => void;
}

export const CompXNewClaimWizard: React.FC<CompXNewClaimWizardProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    employeeId: '',
    employeeName: '',
    employeePhone: '',
    employeeEmail: '',
    jobTitle: '',
    department: '',
    supervisor: '',
    
    // Step 2: Incident Details
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    workRelated: '',
    incidentDescription: '',
    witnessNames: '',
    
    // Step 3: Injury Details
    injuryType: '',
    bodyPartsAffected: [],
    injuryDescription: '',
    medicalAttentionRequired: '',
    hospitalName: '',
    physicianName: '',
    
    // Step 4: Claim Information
    claimType: '',
    reportedToSupervisor: '',
    reportedToInsurance: '',
    claimNumber: '',
    adjusterName: '',
    adjusterPhone: '',
    
    // Step 5: Documentation
    incidentReport: null,
    medicalReports: [],
    photos: [],
    additionalDocs: []
  });

  const steps = [
    { 
      number: 1, 
      title: 'Employee Information', 
      icon: User,
      description: 'Basic employee details and contact information'
    },
    { 
      number: 2, 
      title: 'Incident Details', 
      icon: MapPin,
      description: 'When, where, and how the incident occurred'
    },
    { 
      number: 3, 
      title: 'Injury Information', 
      icon: Shield,
      description: 'Nature and extent of injuries sustained'
    },
    { 
      number: 4, 
      title: 'Claim Details', 
      icon: FileText,
      description: 'Insurance claim and adjuster information'
    },
    { 
      number: 5, 
      title: 'Documentation', 
      icon: Calendar,
      description: 'Upload supporting documents and photos'
    }
  ];

  const progress = (currentStep / steps.length) * 100;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.employeeName || !formData.employeeId) {
          toast({
            title: "Required Fields Missing",
            description: "Please fill in employee name and ID",
            variant: "destructive"
          });
          return false;
        }
        break;
      case 2:
        if (!formData.incidentDate || !formData.incidentLocation) {
          toast({
            title: "Required Fields Missing", 
            description: "Please specify incident date and location",
            variant: "destructive"
          });
          return false;
        }
        break;
      case 3:
        if (!formData.injuryType || !formData.injuryDescription) {
          toast({
            title: "Required Fields Missing",
            description: "Please describe the injury type and details",
            variant: "destructive"
          });
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      onSubmit(formData);
      toast({
        title: "Claim Created Successfully",
        description: "New workers' compensation claim has been initiated",
      });
      onClose();
      setCurrentStep(1);
      setFormData({} as any);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  placeholder="Enter employee ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeName">Full Name *</Label>
                <Input
                  id="employeeName"
                  value={formData.employeeName}
                  onChange={(e) => handleInputChange('employeeName', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeePhone">Phone Number</Label>
                <Input
                  id="employeePhone"
                  value={formData.employeePhone}
                  onChange={(e) => handleInputChange('employeePhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeEmail">Email Address</Label>
                <Input
                  id="employeeEmail"
                  type="email"
                  value={formData.employeeEmail}
                  onChange={(e) => handleInputChange('employeeEmail', e.target.value)}
                  placeholder="employee@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  placeholder="Enter job title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisor">Direct Supervisor</Label>
              <Input
                id="supervisor"
                value={formData.supervisor}
                onChange={(e) => handleInputChange('supervisor', e.target.value)}
                placeholder="Enter supervisor name"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incidentDate">Date of Incident *</Label>
                <Input
                  id="incidentDate"
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incidentTime">Time of Incident</Label>
                <Input
                  id="incidentTime"
                  type="time"
                  value={formData.incidentTime}
                  onChange={(e) => handleInputChange('incidentTime', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incidentLocation">Location of Incident *</Label>
              <Input
                id="incidentLocation"
                value={formData.incidentLocation}
                onChange={(e) => handleInputChange('incidentLocation', e.target.value)}
                placeholder="Specific location where incident occurred"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workRelated">Work-Related Incident?</Label>
              <Select value={formData.workRelated} onValueChange={(value) => handleInputChange('workRelated', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select yes or no" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes - Occurred during work duties</SelectItem>
                  <SelectItem value="no">No - Not work-related</SelectItem>
                  <SelectItem value="unclear">Unclear - Needs investigation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incidentDescription">Detailed Description of Incident</Label>
              <Textarea
                id="incidentDescription"
                value={formData.incidentDescription}
                onChange={(e) => handleInputChange('incidentDescription', e.target.value)}
                placeholder="Provide a detailed description of how the incident occurred..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="witnessNames">Witnesses (if any)</Label>
              <Textarea
                id="witnessNames"
                value={formData.witnessNames}
                onChange={(e) => handleInputChange('witnessNames', e.target.value)}
                placeholder="List names and contact information of any witnesses..."
                rows={2}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="injuryType">Type of Injury *</Label>
              <Select value={formData.injuryType} onValueChange={(value) => handleInputChange('injuryType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select injury type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cut_laceration">Cut/Laceration</SelectItem>
                  <SelectItem value="bruise_contusion">Bruise/Contusion</SelectItem>
                  <SelectItem value="sprain_strain">Sprain/Strain</SelectItem>
                  <SelectItem value="fracture">Fracture</SelectItem>
                  <SelectItem value="burn">Burn</SelectItem>
                  <SelectItem value="back_injury">Back Injury</SelectItem>
                  <SelectItem value="head_injury">Head Injury</SelectItem>
                  <SelectItem value="eye_injury">Eye Injury</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Body Parts Affected</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Head', 'Neck', 'Back', 'Chest', 'Arms', 'Hands', 'Legs', 'Feet', 'Eyes', 'Other'].map((part) => (
                  <label key={part} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.bodyPartsAffected.includes(part)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('bodyPartsAffected', [...formData.bodyPartsAffected, part]);
                        } else {
                          handleInputChange('bodyPartsAffected', formData.bodyPartsAffected.filter(p => p !== part));
                        }
                      }}
                    />
                    <span className="text-sm">{part}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="injuryDescription">Detailed Injury Description *</Label>
              <Textarea
                id="injuryDescription"
                value={formData.injuryDescription}
                onChange={(e) => handleInputChange('injuryDescription', e.target.value)}
                placeholder="Describe the specific injuries sustained..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalAttentionRequired">Medical Attention Required?</Label>
              <Select value={formData.medicalAttentionRequired} onValueChange={(value) => handleInputChange('medicalAttentionRequired', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select medical attention level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No medical attention needed</SelectItem>
                  <SelectItem value="first_aid">First aid only</SelectItem>
                  <SelectItem value="clinic">Clinic visit</SelectItem>
                  <SelectItem value="hospital">Hospital/ER visit</SelectItem>
                  <SelectItem value="ongoing">Ongoing medical treatment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.medicalAttentionRequired === 'clinic' || formData.medicalAttentionRequired === 'hospital' || formData.medicalAttentionRequired === 'ongoing') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Medical Facility Name</Label>
                  <Input
                    id="hospitalName"
                    value={formData.hospitalName}
                    onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                    placeholder="Name of hospital/clinic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="physicianName">Attending Physician</Label>
                  <Input
                    id="physicianName"
                    value={formData.physicianName}
                    onChange={(e) => handleInputChange('physicianName', e.target.value)}
                    placeholder="Doctor's name"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="claimType">Claim Type</Label>
              <Select value={formData.claimType} onValueChange={(value) => handleInputChange('claimType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select claim type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical_only">Medical Only</SelectItem>
                  <SelectItem value="lost_time">Lost Time</SelectItem>
                  <SelectItem value="modified_duty">Modified Duty</SelectItem>
                  <SelectItem value="fatality">Fatality</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportedToSupervisor">Reported to Supervisor?</Label>
                <Select value={formData.reportedToSupervisor} onValueChange={(value) => handleInputChange('reportedToSupervisor', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes - Immediately</SelectItem>
                    <SelectItem value="delayed">Yes - Delayed</SelectItem>
                    <SelectItem value="no">No - Not yet reported</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportedToInsurance">Reported to Insurance?</Label>
                <Select value={formData.reportedToInsurance} onValueChange={(value) => handleInputChange('reportedToInsurance', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes - Claim filed</SelectItem>
                    <SelectItem value="pending">Pending submission</SelectItem>
                    <SelectItem value="no">No - Not yet reported</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.reportedToInsurance === 'yes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="claimNumber">Insurance Claim Number</Label>
                  <Input
                    id="claimNumber"
                    value={formData.claimNumber}
                    onChange={(e) => handleInputChange('claimNumber', e.target.value)}
                    placeholder="Enter claim number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adjusterName">Adjuster Name</Label>
                  <Input
                    id="adjusterName"
                    value={formData.adjusterName}
                    onChange={(e) => handleInputChange('adjusterName', e.target.value)}
                    placeholder="Adjuster's name"
                  />
                </div>
              </div>
            )}

            {formData.adjusterName && (
              <div className="space-y-2">
                <Label htmlFor="adjusterPhone">Adjuster Phone</Label>
                <Input
                  id="adjusterPhone"
                  value={formData.adjusterPhone}
                  onChange={(e) => handleInputChange('adjusterPhone', e.target.value)}
                  placeholder="Adjuster's phone number"
                />
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Document upload functionality would be implemented here</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload incident reports, medical records, photos, and other supporting documents
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Required Documents Checklist:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="incident-report" />
                  <label htmlFor="incident-report">Incident Report Form</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="first-aid-log" />
                  <label htmlFor="first-aid-log">First Aid Log (if applicable)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="medical-records" />
                  <label htmlFor="medical-records">Medical Records/Reports</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="photos" />
                  <label htmlFor="photos">Photos of incident scene/injuries</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="witness-statements" />
                  <label htmlFor="witness-statements">Witness Statements</label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span>New Workers' Compensation Claim</span>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Step Navigation */}
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            
            return (
              <div key={step.number} className="flex flex-col items-center space-y-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isActive 
                      ? 'bg-primary border-primary text-white' 
                      : 'border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                </div>
                <div className="text-xs text-center">
                  <div className={isActive ? 'font-medium' : 'text-muted-foreground'}>
                    {step.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Step Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{steps[currentStep - 1].title}</h3>
            <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
          </div>
          
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" />
              Submit Claim
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};