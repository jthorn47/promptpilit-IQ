import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GenerateReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export const GenerateReportModal: React.FC<GenerateReportModalProps> = ({
  open,
  onOpenChange,
  companyId
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedSections, setSelectedSections] = useState({
    planDetails: true,
    contributions: true,
    enrollmentData: true,
    costAnalysis: true,
    compliance: false
  });
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate report generation progress
      const intervals = [20, 40, 60, 80, 100];
      for (const targetProgress of intervals) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(targetProgress);
      }

      // Mock data for report generation
      const reportData = {
        companyId,
        sections: selectedSections,
        format,
        generatedAt: new Date().toISOString(),
        plans: [
          {
            name: 'Medical Plan - Premium',
            type: 'Medical',
            employeePremium: 485,
            familyPremium: 1450,
            employerContribution: 85,
            enrolledEmployees: 125
          },
          {
            name: 'Dental Plan - Standard',
            type: 'Dental',
            employeePremium: 45,
            familyPremium: 135,
            employerContribution: 75,
            enrolledEmployees: 98
          }
        ]
      };

      // In a real app, this would call an API to generate the actual report
      console.log('Generating report with data:', reportData);

      // Simulate file download
      const fileName = `Benefits_Report_${new Date().toISOString().split('T')[0]}.${format}`;
      
      toast({
        title: "Report Generated Successfully",
        description: `${fileName} has been downloaded to your device.`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleSectionChange = (section: string, checked: boolean) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: checked
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Benefits Report
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive report of your current benefit plans and enrollment data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Sections */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Report Sections</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="planDetails"
                  checked={selectedSections.planDetails}
                  onCheckedChange={(checked) => handleSectionChange('planDetails', checked as boolean)}
                />
                <Label htmlFor="planDetails" className="text-sm font-normal">
                  Plan Details & Pricing
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contributions"
                  checked={selectedSections.contributions}
                  onCheckedChange={(checked) => handleSectionChange('contributions', checked as boolean)}
                />
                <Label htmlFor="contributions" className="text-sm font-normal">
                  Employer Contribution Strategy
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enrollmentData"
                  checked={selectedSections.enrollmentData}
                  onCheckedChange={(checked) => handleSectionChange('enrollmentData', checked as boolean)}
                />
                <Label htmlFor="enrollmentData" className="text-sm font-normal">
                  Enrollment Statistics
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="costAnalysis"
                  checked={selectedSections.costAnalysis}
                  onCheckedChange={(checked) => handleSectionChange('costAnalysis', checked as boolean)}
                />
                <Label htmlFor="costAnalysis" className="text-sm font-normal">
                  Cost Analysis & Projections
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="compliance"
                  checked={selectedSections.compliance}
                  onCheckedChange={(checked) => handleSectionChange('compliance', checked as boolean)}
                />
                <Label htmlFor="compliance" className="text-sm font-normal">
                  Compliance Status (ACA, ERISA)
                </Label>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Export Format</Label>
            <Select value={format} onValueChange={(value: 'pdf' | 'csv') => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="csv">CSV Data Export</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Progress Bar (shown during generation) */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating report...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating || Object.values(selectedSections).every(v => !v)}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};