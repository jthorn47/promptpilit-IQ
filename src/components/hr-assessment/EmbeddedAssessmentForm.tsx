import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmbeddedAssessmentFormProps {
  companyId: string;
  companyName: string;
  initialIndustry?: string;
  initialCompanySize?: string;
  onComplete: (assessment: any) => void;
  onCancel: () => void;
}

interface Question {
  id: string;
  category: string;
  question: string;
  options: { value: string; label: string; score: number }[];
  weight: number;
}

const assessmentQuestions: Question[] = [
  {
    id: "workplace_violence_policy",
    category: "Policies & Procedures",
    question: "Does your company have a written workplace violence prevention policy?",
    options: [
      { value: "comprehensive", label: "Yes, comprehensive policy in place", score: 10 },
      { value: "basic", label: "Yes, basic policy exists", score: 6 },
      { value: "developing", label: "Currently developing", score: 3 },
      { value: "none", label: "No policy in place", score: 0 }
    ],
    weight: 1.2
  },
  {
    id: "incident_reporting",
    category: "Reporting Systems",
    question: "How are workplace violence incidents reported?",
    options: [
      { value: "multiple_channels", label: "Multiple reporting channels available", score: 10 },
      { value: "single_channel", label: "Single formal reporting system", score: 7 },
      { value: "informal", label: "Informal reporting only", score: 3 },
      { value: "no_system", label: "No formal reporting system", score: 0 }
    ],
    weight: 1.1
  },
  {
    id: "employee_training",
    category: "Training & Education",
    question: "What type of workplace violence prevention training is provided?",
    options: [
      { value: "regular_comprehensive", label: "Regular, comprehensive training for all staff", score: 10 },
      { value: "annual_basic", label: "Annual basic training", score: 7 },
      { value: "new_employee_only", label: "New employee orientation only", score: 4 },
      { value: "no_training", label: "No formal training provided", score: 0 }
    ],
    weight: 1.3
  },
  {
    id: "risk_assessment_frequency",
    category: "Risk Management",
    question: "How often are workplace violence risk assessments conducted?",
    options: [
      { value: "ongoing", label: "Ongoing/continuous assessment", score: 10 },
      { value: "annual", label: "Annual assessments", score: 8 },
      { value: "incident_based", label: "Only after incidents", score: 4 },
      { value: "never", label: "Never conducted", score: 0 }
    ],
    weight: 1.0
  },
  {
    id: "security_measures",
    category: "Physical Security",
    question: "What physical security measures are in place?",
    options: [
      { value: "comprehensive", label: "Comprehensive security (cameras, access control, alarms)", score: 10 },
      { value: "moderate", label: "Moderate security measures", score: 7 },
      { value: "basic", label: "Basic security only", score: 4 },
      { value: "minimal", label: "Minimal to no security", score: 0 }
    ],
    weight: 0.9
  },
  {
    id: "employee_support",
    category: "Support Services",
    question: "What employee support services are available?",
    options: [
      { value: "comprehensive", label: "EAP, counseling, and crisis support", score: 10 },
      { value: "basic_eap", label: "Basic Employee Assistance Program", score: 7 },
      { value: "informal", label: "Informal support systems", score: 3 },
      { value: "none", label: "No formal support services", score: 0 }
    ],
    weight: 1.0
  },
  {
    id: "threat_assessment_team",
    category: "Response Team",
    question: "Is there a dedicated threat assessment team?",
    options: [
      { value: "dedicated_trained", label: "Yes, dedicated and trained team", score: 10 },
      { value: "designated_staff", label: "Designated staff members", score: 6 },
      { value: "informal_group", label: "Informal response group", score: 3 },
      { value: "none", label: "No designated team", score: 0 }
    ],
    weight: 1.1
  },
  {
    id: "incident_investigation",
    category: "Investigation Process",
    question: "How are workplace violence incidents investigated?",
    options: [
      { value: "formal_trained", label: "Formal process with trained investigators", score: 10 },
      { value: "basic_procedure", label: "Basic investigation procedure", score: 6 },
      { value: "ad_hoc", label: "Ad-hoc investigations", score: 3 },
      { value: "no_process", label: "No formal investigation process", score: 0 }
    ],
    weight: 1.0
  }
];

export const EmbeddedAssessmentForm = ({ 
  companyId, 
  companyName, 
  initialIndustry,
  initialCompanySize,
  onComplete, 
  onCancel 
}: EmbeddedAssessmentFormProps) => {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [companySize, setCompanySize] = useState<string>(initialCompanySize || "");
  const [industry, setIndustry] = useState<string>(initialIndustry || "");
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const progress = (Object.keys(responses).length / assessmentQuestions.length) * 100;
  const canAdvance = currentStep === 0 ? (companySize && industry) : responses[assessmentQuestions[currentStep - 1]?.id];

  const calculateRiskScore = () => {
    let totalScore = 0;
    let totalWeight = 0;

    assessmentQuestions.forEach((question) => {
      const response = responses[question.id];
      if (response) {
        const option = question.options.find(opt => opt.value === response);
        if (option) {
          totalScore += option.score * question.weight;
          totalWeight += 10 * question.weight; // Max possible score per question is 10
        }
      }
    });

    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
  };

  const getRiskLevel = (score: number): string => {
    if (score >= 80) return 'low';
    if (score >= 60) return 'moderate';
    return 'high';
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const score = calculateRiskScore();
      const riskLevel = getRiskLevel(score);

      const assessmentData = {
        company_id: companyId,
        responses: responses,
        risk_score: score,
        risk_level: riskLevel,
        input_method: 'manual',
        industry,
        company_size: companySize,
        status: 'completed',
        source_data: {
          completed_by: 'internal_user',
          completion_method: 'embedded_form',
          session_id: crypto.randomUUID()
        }
      };

      const { data, error } = await supabase
        .from('company_hr_assessments')
        .insert(assessmentData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Assessment Completed",
        description: `Risk score: ${score}/100 (${riskLevel.toUpperCase()} risk)`,
      });

      onComplete(data);
    } catch (error: any) {
      console.error('Error submitting assessment:', error);
      toast({
        title: "Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStep === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            HR Risk Assessment for {companyName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="finance">Finance & Banking</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="nonprofit">Non-profit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="company-size">Company Size</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-100">51-100 employees</SelectItem>
                  <SelectItem value="101-500">101-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => setCurrentStep(1)} 
              disabled={!canAdvance}
              className="flex-1"
            >
              Begin Assessment
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = assessmentQuestions[currentStep - 1];
  const isLastQuestion = currentStep === assessmentQuestions.length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Question {currentStep} of {assessmentQuestions.length}
          </CardTitle>
          <Badge variant="outline">
            {currentQuestion.category}
          </Badge>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">
            {currentQuestion.question}
          </h3>
          
          <RadioGroup
            value={responses[currentQuestion.id] || ""}
            onValueChange={(value) => 
              setResponses(prev => ({ ...prev, [currentQuestion.id]: value }))
            }
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label 
                  htmlFor={option.value} 
                  className="flex-1 cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex gap-2 pt-4">
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </Button>
          )}
          
          {!isLastQuestion ? (
            <Button 
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!responses[currentQuestion.id]}
              className="flex-1"
            >
              Next Question
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!responses[currentQuestion.id] || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Complete Assessment'
              )}
            </Button>
          )}
          
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};