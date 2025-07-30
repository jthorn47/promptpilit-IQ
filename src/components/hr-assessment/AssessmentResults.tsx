import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  Eye, 
  Calendar,
  FileText,
  Upload,
  ExternalLink
} from "lucide-react";
import { format } from 'date-fns';

interface AssessmentData {
  id: string;
  risk_score: number;
  risk_level: string;
  input_method: string;
  assessment_date: string;
  status: string;
  industry?: string;
  company_size?: string;
  responses?: Record<string, any>;
  source_data?: Record<string, any>;
  created_at: string;
  pdf_file_url?: string;
  external_completed_at?: string;
}

interface AssessmentResultsProps {
  assessment: AssessmentData;
  onStartNew: () => void;
  onViewDetails: () => void;
  companyName: string;
}

export const AssessmentResults = ({ 
  assessment, 
  onStartNew, 
  onViewDetails,
  companyName 
}: AssessmentResultsProps) => {
  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'moderate':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'high':
        return <Shield className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'moderate':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getInputMethodDisplay = (method: string) => {
    switch (method) {
      case 'manual':
        return { label: 'Manual Entry', icon: <FileText className="h-4 w-4" /> };
      case 'import':
        return { label: 'External Import', icon: <ExternalLink className="h-4 w-4" /> };
      case 'pdf_upload':
        return { label: 'PDF Upload', icon: <Upload className="h-4 w-4" /> };
      default:
        return { label: 'Unknown', icon: <FileText className="h-4 w-4" /> };
    }
  };

  const inputMethod = getInputMethodDisplay(assessment.input_method);
  const assessmentDate = assessment.external_completed_at 
    ? new Date(assessment.external_completed_at)
    : new Date(assessment.assessment_date);

  return (
    <div className="space-y-6">
      {/* Main Risk Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getRiskIcon(assessment.risk_level)}
              HR Risk Assessment Results
            </CardTitle>
            <Badge 
              variant="outline" 
              className={getRiskColor(assessment.risk_level)}
            >
              {assessment.risk_level.toUpperCase()} RISK
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">
              {assessment.risk_score}/100
            </div>
            <Progress 
              value={assessment.risk_score} 
              className="w-full h-3"
            />
            <p className="text-sm text-muted-foreground">
              Overall Risk Assessment Score
            </p>
          </div>

          {/* Assessment Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Assessment Date</div>
              <div className="font-medium">
                {format(assessmentDate, 'MMM dd, yyyy')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Input Method</div>
              <div className="flex items-center justify-center gap-1 font-medium">
                {inputMethod.icon}
                <span className="text-xs">{inputMethod.label}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Industry</div>
              <div className="font-medium capitalize">
                {assessment.industry || 'Not specified'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Company Size</div>
              <div className="font-medium">
                {assessment.company_size || 'Not specified'}
              </div>
            </div>
          </div>

          {/* Import/Upload Source Info */}
          {assessment.input_method === 'import' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                <ExternalLink className="h-4 w-4" />
                Imported from Public Assessment
              </div>
              <p className="text-sm text-blue-600">
                Completed on {format(assessmentDate, 'MMMM dd, yyyy')} via score.easeworks.com
              </p>
            </div>
          )}

          {assessment.input_method === 'pdf_upload' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-purple-700 font-medium mb-2">
                    <Upload className="h-4 w-4" />
                    Uploaded via PDF
                  </div>
                  <p className="text-sm text-purple-600">
                    Assessment data extracted from uploaded PDF document
                  </p>
                </div>
                {assessment.pdf_file_url && (
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    View Original
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Assessment Response Details */}
          {assessment.responses && Object.keys(assessment.responses).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Assessment Response Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(assessment.responses).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {typeof value === 'string' ? value.replace(/_/g, ' ') : String(value)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Level Explanation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Risk Level Interpretation</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              {assessment.risk_level === 'low' && (
                <p>Your organization demonstrates strong workplace violence prevention measures with comprehensive policies and procedures in place.</p>
              )}
              {assessment.risk_level === 'moderate' && (
                <p>Your organization has basic workplace violence prevention measures but there are areas for improvement to enhance safety and compliance.</p>
              )}
              {assessment.risk_level === 'high' && (
                <p>Your organization may need significant improvements to workplace violence prevention measures to ensure employee safety and regulatory compliance.</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={onViewDetails}
              variant="outline"
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button 
              onClick={onStartNew}
              variant="outline"
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <div className="font-medium">Review Investment Analysis</div>
                <div className="text-sm text-muted-foreground">
                  Use this risk score in your investment analysis calculations
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <div className="font-medium">Generate SPIN Selling Points</div>
                <div className="text-sm text-muted-foreground">
                  Create targeted sales messaging based on identified risks
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <div className="font-medium">Prepare Proposal Draft</div>
                <div className="text-sm text-muted-foreground">
                  Generate customized proposal using assessment insights
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};