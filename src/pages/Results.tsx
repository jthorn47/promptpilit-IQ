import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { type CompanyInfo } from "@/components/CompanyInfoForm";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HeroButton } from "@/components/ui/hero-button";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Download, Calendar, TrendingUp, AlertTriangle, CheckCircle, ArrowLeft, Home } from "lucide-react";
import { assessmentData } from "@/data/assessmentQuestions";
import { Link } from "react-router-dom";

interface Answer {
  questionId: string;
  selectedOption: number;
  score: number;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if we have the required data from the assessment
  if (!location.state || !location.state.answers || !location.state.companyInfo) {
    toast({
      title: "Assessment Required",
      description: "Please complete the assessment first to view results.",
      variant: "destructive",
    });
    navigate('/');
    return null;
  }

  const { answers, companyInfo } = location.state as { 
    answers: Answer[];
    companyInfo: CompanyInfo;
  };
  
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [expertReport, setExpertReport] = useState<string | null>(null);
  const [showExpertReport, setShowExpertReport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate scores
  const maxScore = assessmentData.reduce((sum, section) => 
    sum + section.questions.reduce((sectionSum, question) => 
      sectionSum + Math.max(...question.options.map(opt => opt.score)), 0
    ), 0
  );

  const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
  const scorePercentage = Math.round((totalScore / maxScore) * 100);

  // Calculate section scores
  const sectionScores = assessmentData.map(section => {
    const sectionAnswers = answers.filter(answer => 
      section.questions.some(q => q.id === answer.questionId)
    );
    const sectionTotal = sectionAnswers.reduce((sum, answer) => sum + answer.score, 0);
    const sectionMax = section.questions.reduce((sum, question) => 
      sum + Math.max(...question.options.map(opt => opt.score)), 0
    );
    return {
      title: section.title,
      score: sectionTotal,
      maxScore: sectionMax,
      percentage: Math.round((sectionTotal / sectionMax) * 100)
    };
  });

  // Determine risk level
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Low Risk', color: 'success', icon: CheckCircle };
    if (score >= 50) return { level: 'Moderate Risk', color: 'warning', icon: AlertTriangle };
    return { level: 'High Risk', color: 'danger', icon: AlertTriangle };
  };

  const riskLevel = getRiskLevel(scorePercentage);

  // Save assessment to database
  const saveAssessment = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // Insert the assessment with completed status to trigger notifications
      const { data: insertedAssessment, error } = await supabase
        .from('assessments')
        .insert({
          company_name: companyInfo.company_name,
          company_email: companyInfo.company_email,
          company_size: companyInfo.company_size,
          industry: companyInfo.industry,
          responses: JSON.parse(JSON.stringify(answers)),
          risk_score: scorePercentage,
          risk_level: riskLevel.level,
          status: 'completed',
          completion_metadata: {
            total_time: location.state?.totalTime || 0,
            achievements: location.state?.achievements || [],
            best_streak: location.state?.bestStreak || 0,
            completed_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving assessment:', error);
        toast({
          title: "Warning",
          description: "Assessment results may not have been saved properly.",
          variant: "destructive",
        });
        return;
      }

      // Show completion notification toast
      toast({
        title: "🎉 Assessment Completed!",
        description: "Your HR Risk Assessment will be emailed to you shortly",
      });

      // Send assessment results email in background
      try {
        const { error: emailError } = await supabase.functions.invoke('send-assessment-results', {
          body: { assessmentId: insertedAssessment.id }
        });

        if (emailError) {
          console.error('Error sending assessment email:', emailError);
          // Don't show error to user since assessment was saved successfully
        } else {
          console.log('Assessment results email triggered successfully');
        }
      } catch (emailError) {
        console.error('Failed to trigger assessment email:', emailError);
        // Silent failure - assessment is still saved
      }

      console.log('Assessment saved successfully:', insertedAssessment);
      
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save assessment when component mounts
  useEffect(() => {
    saveAssessment();
  }, []);

  // Dynamic messaging
  const getMessage = (score: number) => {
    if (score < 50) return "You're at high risk of HR violations. Let's fix it.";
    if (score < 80) return "You've got a solid foundation, but there's room to tighten things up.";
    return "You're in great shape — let's future-proof your compliance.";
  };

  const getRecommendation = (score: number) => {
    if (score < 50) return "Immediate action needed to reduce compliance risks and protect your business.";
    if (score < 80) return "Good progress! A few strategic improvements will strengthen your HR foundation.";
    return "Excellent work! Consider our advanced strategies to stay ahead of evolving regulations.";
  };

  const generateExpertReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      const assessmentDataForReport = {
        companyInfo,
        answers,
        sectionScores,
        totalScore,
        scorePercentage,
        riskLevel: riskLevel.level
      };

      console.log('Calling expert report generation...');
      
      const { data, error } = await supabase.functions.invoke('generate-ai-report', {
        body: assessmentDataForReport
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate expert report');
      }

      if (!data.success) {
        throw new Error(data.error || 'Expert report generation failed');
      }

      console.log('Expert report generated successfully');
      setExpertReport(data.report);
      setShowExpertReport(true);

      // Save the expert report to the database
      const { error: updateError } = await supabase
        .from('assessments')
        .update({ ai_report: data.report })
        .eq('company_email', companyInfo.company_email)
        .eq('company_name', companyInfo.company_name)
        .order('created_at', { ascending: false })
        .limit(1);

      if (updateError) {
        console.error('Error saving expert report to database:', updateError);
        // Don't throw here, report was generated successfully
      }

    } catch (error) {
      console.error('Error generating expert report:', error);
      toast({
        title: "Error",
        description: "Failed to generate expert report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary-muted/20">
      {/* Header */}
      <header className="px-6 py-6 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/8fe37e66-d41f-4e29-9f60-6cc6b334903d.png" 
              alt="ease.learn" 
              className="h-12 w-auto"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Start Over</span>
          </Button>
        </div>
      </header>

      {/* Breadcrumbs */}
      <BreadcrumbNav items={[
        { label: "Assessment", href: "/assessment" },
        { label: "Results" }
      ]} className="max-w-6xl mx-auto" />

      <main className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Score Card */}
          <Card className="p-8 md:p-12 shadow-strong bg-gradient-card mb-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Your HR Risk Assessment Results
              </h1>
              <p className="text-xl text-muted-foreground">
                {getMessage(scorePercentage)}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Score Display */}
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-48 h-48 mx-auto mb-6">
                  <svg className="w-48 h-48 -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={`hsl(var(--${riskLevel.color}))`}
                      strokeWidth="2"
                      strokeDasharray={`${scorePercentage}, 100`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-5xl font-bold text-${riskLevel.color} mb-2`}>
                      {scorePercentage}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      out of 100
                    </div>
                  </div>
                </div>

                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-${riskLevel.color}-muted mb-4`}>
                  <riskLevel.icon className={`w-5 h-5 text-${riskLevel.color}`} />
                  <span className={`font-semibold text-${riskLevel.color}`}>
                    {riskLevel.level}
                  </span>
                </div>

                <p className="text-muted-foreground">
                  {getRecommendation(scorePercentage)}
                </p>
              </div>

              {/* Action Items */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Next Steps
                </h3>
                
                <div className="space-y-3">
                  <HeroButton 
                    size="lg" 
                    className="w-full justify-center"
                    onClick={generateExpertReport}
                    disabled={isGeneratingReport}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {isGeneratingReport ? 'Generating Expert Report...' : 'Generate Personalized Expert Report'}
                  </HeroButton>
                  
                  <HeroButton 
                    variant="outline" 
                    size="lg" 
                    className="w-full justify-center"
                    onClick={() => window.open('https://meetings.hubspot.com/jeffrey-thorn?uuid=9addbf01-5b8f-4a1f-ac02-50e96bf8653b', '_blank')}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule Free HR Consultation
                  </HeroButton>
                  
                  <HeroButton 
                    variant="ghost" 
                    size="lg" 
                    className="w-full justify-center"
                    onClick={() => window.open('https://easeworks.com/labor-cost-calculator', '_blank')}
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Compare Labor Cost Savings
                  </HeroButton>
                </div>
              </div>
            </div>
          </Card>

          {/* Section Breakdown */}
          <Card className="p-8 shadow-medium">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Risk Breakdown by Area
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sectionScores.map((section, index) => (
                <Card key={index} className="p-6 border border-border">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-foreground">{section.title}</h3>
                    <span className={`text-sm font-medium ${
                      section.percentage >= 80 ? 'text-success' :
                      section.percentage >= 50 ? 'text-warning' : 'text-danger'
                    }`}>
                      {section.percentage}%
                    </span>
                  </div>
                  
                  <Progress 
                    value={section.percentage} 
                    className="h-2 mb-2"
                  />
                  
                  <div className="text-sm text-muted-foreground">
                    {section.score} out of {section.maxScore} points
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Improve Your HR Risk Score?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Our HR experts can help you address these risk areas and protect your business 
              from costly compliance violations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <HeroButton size="xl">
                Get Your Custom HR Blueprint
              </HeroButton>
              <HeroButton 
                variant="outline" 
                size="xl"
                onClick={() => window.open('https://meetings.hubspot.com/jeffrey-thorn?uuid=9addbf01-5b8f-4a1f-ac02-50e96bf8653b', '_blank')}
              >
                Schedule Free Consultation
              </HeroButton>
            </div>
          </div>

          {/* AI Report Generation Loading Screen */}
          {isGeneratingReport && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <Card className="max-w-md w-full bg-white text-center p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Hang Tight! 🤖
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Our experts are analyzing your assessment results and creating a personalized HR risk report just for you.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>✨ Identifying compliance gaps</p>
                    <p>📋 Generating custom recommendations</p>
                    <p>🎯 Creating your action plan</p>
                  </div>
                </div>
                <div className="bg-primary/5 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">
                    This usually takes 30-60 seconds. Please don't close this window.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Expert Generated Report Modal */}
          {showExpertReport && expertReport && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <Card className="max-w-4xl max-h-[90vh] overflow-auto bg-white">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-foreground">
                    📊 Expert HR Risk Report
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExpertReport(false)}
                  >
                    ✕ Close
                  </Button>
                </div>
                
                <div className="p-6">
                  <div className="prose prose-sm max-w-none">
                    {expertReport.split('\n\n').map((paragraph, index) => {
                      // Handle section headers (lines that end with a colon and are relatively short)
                      if (paragraph.length < 100 && paragraph.endsWith(':')) {
                        return <h2 key={index} className="text-xl font-semibold mt-6 mb-3 text-primary border-b border-border pb-2">{paragraph}</h2>;
                      }
                      
                      // Handle numbered or bullet lists
                      if (paragraph.includes('\n- ') || paragraph.includes('\n1. ') || paragraph.includes('\n2. ')) {
                        const lines = paragraph.split('\n');
                        return (
                          <div key={index} className="mb-4">
                            {lines.map((line, lineIndex) => {
                              if (line.startsWith('- ')) {
                                return <p key={lineIndex} className="ml-4 mb-2 text-foreground">• {line.substring(2)}</p>;
                              }
                              if (line.match(/^\d+\./)) {
                                return <p key={lineIndex} className="ml-4 mb-2 text-foreground">{line}</p>;
                              }
                              return <p key={lineIndex} className="mb-2 text-foreground font-medium">{line}</p>;
                            })}
                          </div>
                        );
                      }
                      
                      // Handle regular paragraphs
                      if (paragraph.trim() === '') {
                        return null;
                      }
                      
                      return <p key={index} className="mb-4 text-muted-foreground leading-relaxed">{paragraph}</p>;
                    })}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-4">
                    <HeroButton 
                      size="lg"
                      onClick={() => {
                        // Create downloadable PDF functionality here
                        const element = document.createElement('a');
                        const file = new Blob([expertReport], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = `HR-Risk-Report-${new Date().toISOString().split('T')[0]}.txt`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                    >
                      <Download className="w-5 h-5" />
                      Download Report
                    </HeroButton>
                    
                    <HeroButton 
                      variant="outline"
                      size="lg"
                      onClick={() => window.open('https://meetings.hubspot.com/jeffrey-thorn?uuid=9addbf01-5b8f-4a1f-ac02-50e96bf8653b', '_blank')}
                    >
                      <Calendar className="w-5 h-5" />
                      Schedule HR Blueprint Consultation
                    </HeroButton>
                  </div>
                  
                  <div className="mt-6 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-foreground font-bold text-lg">E</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-primary mb-2">Ready to Transform Your HR Risks into Competitive Advantages?</h4>
                        <p className="text-muted-foreground mb-4">
                          This assessment has identified specific areas where <strong>Easeworks</strong> can help reduce your HR risks and ensure compliance. 
                          Our HR Business Consultants specialize in creating customized <strong>HR Blueprints</strong> that transform these findings into actionable, profitable results.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-white/50 rounded-lg">
                            <h5 className="font-semibold text-primary">✓ Reduce Legal Risks</h5>
                            <p className="text-sm text-muted-foreground">Up to 85% reduction in HR-related legal exposure</p>
                          </div>
                          <div className="p-3 bg-white/50 rounded-lg">
                            <h5 className="font-semibold text-primary">✓ Save on Costs</h5>
                            <p className="text-sm text-muted-foreground">15-30% savings on operational expenses</p>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
                          <h5 className="font-bold text-primary mb-1">Next Step: Complimentary HR Blueprint Consultation</h5>
                          <p className="text-sm text-muted-foreground mb-2">
                            Schedule a 45-minute consultation where our HR Business Consultant will:
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Review your assessment results in detail</li>
                            <li>• Identify immediate risk mitigation opportunities</li>
                            <li>• Create a customized HR Blueprint proposal</li>
                            <li>• Develop your implementation roadmap</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Results;