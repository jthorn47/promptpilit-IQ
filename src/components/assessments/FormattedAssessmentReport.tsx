import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Users, 
  Building, 
  CheckCircle, 
  XCircle, 
  Clock,
  Target,
  Lightbulb,
  ArrowRight,
  Star,
  BarChart3
} from "lucide-react";

interface FormattedAssessmentReportProps {
  assessment: {
    company_name: string;
    company_size: string;
    industry: string;
    risk_score: number;
    risk_level: string;
    created_at: string;
    ai_report?: any;
  };
}

export const FormattedAssessmentReport: React.FC<FormattedAssessmentReportProps> = ({ assessment }) => {
  const parseReportSections = (reportText: string) => {
    const sections = reportText.split('\n\n');
    const parsed = {
      executive_summary: '',
      risk_factors: [] as string[],
      recommendations: [] as string[],
      priority_actions: [] as string[],
      compliance_gaps: [] as string[],
      strengths: [] as string[],
      detailed_analysis: ''
    };

    let currentSection = '';
    
    sections.forEach(section => {
      const trimmed = section.trim();
      if (!trimmed) return;

      // Identify section headers
      if (trimmed.toLowerCase().includes('executive summary') || trimmed.toLowerCase().includes('overview')) {
        currentSection = 'executive_summary';
        parsed.executive_summary = trimmed.replace(/^[^:]*:?\s*/, '');
      } else if (trimmed.toLowerCase().includes('risk') && trimmed.toLowerCase().includes('factor')) {
        currentSection = 'risk_factors';
      } else if (trimmed.toLowerCase().includes('recommendation')) {
        currentSection = 'recommendations';
      } else if (trimmed.toLowerCase().includes('priority') || trimmed.toLowerCase().includes('immediate')) {
        currentSection = 'priority_actions';
      } else if (trimmed.toLowerCase().includes('compliance') || trimmed.toLowerCase().includes('gap')) {
        currentSection = 'compliance_gaps';
      } else if (trimmed.toLowerCase().includes('strength') || trimmed.toLowerCase().includes('positive')) {
        currentSection = 'strengths';
      } else {
        // Parse bullet points and numbered lists
        if (trimmed.includes('\n- ') || trimmed.includes('\n• ') || /\d+\./.test(trimmed)) {
          const items = trimmed.split('\n').filter(line => 
            line.trim().startsWith('-') || 
            line.trim().startsWith('•') || 
            /^\d+\./.test(line.trim())
          );
          
          items.forEach(item => {
            const cleanItem = item.replace(/^[-•\d.]\s*/, '').trim();
            if (cleanItem) {
              if (currentSection === 'risk_factors') {
                parsed.risk_factors.push(cleanItem);
              } else if (currentSection === 'recommendations') {
                parsed.recommendations.push(cleanItem);
              } else if (currentSection === 'priority_actions') {
                parsed.priority_actions.push(cleanItem);
              } else if (currentSection === 'compliance_gaps') {
                parsed.compliance_gaps.push(cleanItem);
              } else if (currentSection === 'strengths') {
                parsed.strengths.push(cleanItem);
              }
            }
          });
        } else {
          // Add to detailed analysis if not categorized
          if (parsed.detailed_analysis) {
            parsed.detailed_analysis += '\n\n' + trimmed;
          } else {
            parsed.detailed_analysis = trimmed;
          }
        }
      }
    });

    return parsed;
  };

  const getRiskIcon = () => {
    switch (assessment.risk_level) {
      case 'Low Risk':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'Moderate Risk':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'High Risk':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Shield className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getRiskColor = () => {
    switch (assessment.risk_level) {
      case 'Low Risk':
        return 'success';
      case 'Moderate Risk':
        return 'warning';
      case 'High Risk':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const reportText = typeof assessment.ai_report === 'string' ? assessment.ai_report : JSON.stringify(assessment.ai_report || '');
  const sections = parseReportSections(reportText);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">{assessment.company_name}</CardTitle>
                <p className="text-muted-foreground">HR Risk Assessment Report</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                {getRiskIcon()}
                <Badge variant={getRiskColor() as any} className="text-sm">
                  {assessment.risk_level}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold">
                <BarChart3 className="w-5 h-5" />
                {assessment.risk_score}%
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Industry:</span>
              <span className="font-medium">{assessment.industry}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Size:</span>
              <span className="font-medium">{assessment.company_size}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Generated:</span>
              <span className="font-medium">{new Date(assessment.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      {sections.executive_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-foreground">{sections.executive_summary}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Factors */}
        {sections.risk_factors.length > 0 && (
          <Card className="border-l-4 border-l-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sections.risk_factors.map((risk, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg">
                  <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm leading-relaxed">{risk}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Strengths */}
        {sections.strengths.length > 0 && (
          <Card className="border-l-4 border-l-success">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <Star className="w-5 h-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sections.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-success/5 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm leading-relaxed">{strength}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Priority Actions */}
      {sections.priority_actions.length > 0 && (
        <Card className="border-l-4 border-l-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <TrendingUp className="w-5 h-5" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sections.priority_actions.map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-warning/5 rounded-lg border border-warning/20">
                <ArrowRight className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed font-medium">{action}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {sections.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sections.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">{index + 1}</span>
                </div>
                <p className="text-sm leading-relaxed">{rec}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Compliance Gaps */}
      {sections.compliance_gaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Compliance Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sections.compliance_gaps.map((gap, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed">{gap}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis */}
      {sections.detailed_analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Detailed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {sections.detailed_analysis.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed text-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};