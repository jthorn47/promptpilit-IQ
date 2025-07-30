import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, CheckCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmployeeSurveyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

interface SurveyData {
  satisfaction: string;
  importantPlans: string[];
  additionalBenefits: string[];
  overallRating: string;
  suggestions: string;
}

export const EmployeeSurveyModal: React.FC<EmployeeSurveyModalProps> = ({
  open,
  onOpenChange,
  companyId
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    satisfaction: '',
    importantPlans: [],
    additionalBenefits: [],
    overallRating: '',
    suggestions: ''
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handlePlanImportanceChange = (plan: string, checked: boolean) => {
    setSurveyData(prev => ({
      ...prev,
      importantPlans: checked 
        ? [...prev.importantPlans, plan]
        : prev.importantPlans.filter(p => p !== plan)
    }));
  };

  const handleAdditionalBenefitsChange = (benefit: string, checked: boolean) => {
    setSurveyData(prev => ({
      ...prev,
      additionalBenefits: checked 
        ? [...prev.additionalBenefits, benefit]
        : prev.additionalBenefits.filter(b => b !== benefit)
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would save to the benefit_surveys table
      const surveyResponse = {
        companyId,
        responses: surveyData,
        submittedAt: new Date().toISOString(),
        responseId: `survey_${Date.now()}`
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Survey submitted:', surveyResponse);

      toast({
        title: "Survey Submitted Successfully",
        description: "Thank you for your feedback! Your responses will help us improve our benefits program.",
      });

      onOpenChange(false);
      setCurrentStep(1); // Reset for next use
      setSurveyData({
        satisfaction: '',
        importantPlans: [],
        additionalBenefits: [],
        overallRating: '',
        suggestions: ''
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return surveyData.satisfaction !== '';
      case 2: return surveyData.importantPlans.length > 0;
      case 3: return surveyData.additionalBenefits.length > 0;
      case 4: return surveyData.overallRating !== '';
      default: return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Employee Benefits Survey
          </DialogTitle>
          <DialogDescription>
            Help us understand your benefit needs and preferences. This survey takes about 3 minutes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <Card>
            <CardContent className="pt-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">How satisfied are you with your current benefits?</h3>
                  <RadioGroup
                    value={surveyData.satisfaction}
                    onValueChange={(value) => setSurveyData(prev => ({ ...prev, satisfaction: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very-satisfied" id="very-satisfied" />
                      <Label htmlFor="very-satisfied">Very Satisfied</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="satisfied" id="satisfied" />
                      <Label htmlFor="satisfied">Satisfied</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="neutral" id="neutral" />
                      <Label htmlFor="neutral">Neutral</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dissatisfied" id="dissatisfied" />
                      <Label htmlFor="dissatisfied">Dissatisfied</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very-dissatisfied" id="very-dissatisfied" />
                      <Label htmlFor="very-dissatisfied">Very Dissatisfied</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Which benefit plans are most important to you?</h3>
                  <p className="text-sm text-muted-foreground">Select all that apply</p>
                  <div className="space-y-3">
                    {[
                      'Medical/Health Insurance',
                      'Dental Insurance',
                      'Vision Insurance',
                      'Life Insurance',
                      'Disability Insurance',
                      'Retirement/401(k)',
                      'Flexible Spending Account (FSA)',
                      'Health Savings Account (HSA)'
                    ].map((plan) => (
                      <div key={plan} className="flex items-center space-x-2">
                        <Checkbox
                          id={plan}
                          checked={surveyData.importantPlans.includes(plan)}
                          onCheckedChange={(checked) => handlePlanImportanceChange(plan, checked as boolean)}
                        />
                        <Label htmlFor={plan} className="font-normal">{plan}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">What additional benefits would you like to see offered?</h3>
                  <p className="text-sm text-muted-foreground">Select all that interest you</p>
                  <div className="space-y-3">
                    {[
                      'Mental Health Resources',
                      'Wellness Programs',
                      'Gym/Fitness Memberships',
                      'Childcare Assistance',
                      'Student Loan Assistance',
                      'Transportation Benefits',
                      'Remote Work Stipend',
                      'Professional Development Budget',
                      'Pet Insurance',
                      'Legal Services'
                    ].map((benefit) => (
                      <div key={benefit} className="flex items-center space-x-2">
                        <Checkbox
                          id={benefit}
                          checked={surveyData.additionalBenefits.includes(benefit)}
                          onCheckedChange={(checked) => handleAdditionalBenefitsChange(benefit, checked as boolean)}
                        />
                        <Label htmlFor={benefit} className="font-normal">{benefit}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Overall, how would you rate our benefits package?</h3>
                  <RadioGroup
                    value={surveyData.overallRating}
                    onValueChange={(value) => setSurveyData(prev => ({ ...prev, overallRating: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="excellent" id="excellent" />
                      <Label htmlFor="excellent">Excellent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="good" id="good" />
                      <Label htmlFor="good">Good</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="average" id="average" />
                      <Label htmlFor="average">Average</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="below-average" id="below-average" />
                      <Label htmlFor="below-average">Below Average</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="poor" id="poor" />
                      <Label htmlFor="poor">Poor</Label>
                    </div>
                  </RadioGroup>

                  <div className="space-y-2">
                    <Label htmlFor="suggestions">Additional suggestions or comments (optional)</Label>
                    <Textarea
                      id="suggestions"
                      placeholder="Please share any additional feedback or suggestions..."
                      value={surveyData.suggestions}
                      onChange={(e) => setSurveyData(prev => ({ ...prev, suggestions: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? () => onOpenChange(false) : handlePrevious}
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Users className="h-4 w-4 mr-2 animate-pulse" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Survey
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};