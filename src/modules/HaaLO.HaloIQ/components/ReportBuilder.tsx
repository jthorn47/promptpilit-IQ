import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Send, Save, Download, Share2, BarChart3, Table, FileText, Calendar, Mail } from 'lucide-react';
import { ReportVisualization } from './ReportVisualization';
import { SaveReportDialog } from './SaveReportDialog';
import { ScheduleReportDialog } from './ScheduleReportDialog';

export const ReportBuilder = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const handleGenerateReport = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('generate-ai-report', {
        body: { prompt: prompt.trim() }
      });

      if (error) {
        console.error('Error generating report:', error);
        setReportData({
          title: 'Error',
          content: 'Failed to generate report. Please try again.',
          error: true
        });
      } else if (data?.report) {
        setReportData({
          title: `AI Generated Report: ${prompt}`,
          content: data.report,
          raw: data.report,
          type: 'text'
        });
      }
    } catch (error) {
      console.error('Error calling AI service:', error);
      setReportData({
        title: 'Error',
        content: 'Failed to connect to AI service. Please try again.',
        error: true
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (format: 'excel' | 'pdf' | 'print') => {
    // TODO: Implement export functionality
    console.log(`Exporting report as ${format}`);
  };

  return (
    <div className="space-y-6">
      {/* Prompt Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            AI Report Builder
          </CardTitle>
          <CardDescription>
            Ask Halo IQ what you'd like to see. Use natural language to generate reports instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="What would you like to see? (e.g., 'Show me sales data by month' or 'Employee count by department')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerateReport()}
              className="flex-1"
            />
            <Button 
              onClick={handleGenerateReport} 
              disabled={!prompt.trim() || isGenerating}
              className="px-6"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
          
          {/* Quick prompts */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-accent"
              onClick={() => setPrompt('Show me payroll costs by department this year')}
            >
              Payroll by Department
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-accent"
              onClick={() => setPrompt('Employee headcount trends over the last 6 months')}
            >
              Headcount Trends
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-accent"
              onClick={() => setPrompt('Overtime hours by location this quarter')}
            >
              Overtime Analysis
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated Report</CardTitle>
              <CardDescription>Based on: "{prompt}"</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowScheduleDialog(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
              <Select onValueChange={handleExport}>
                <SelectTrigger className="w-32">
                  <Download className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="print">Print</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {reportData.error ? (
              <div className="text-destructive p-4 bg-destructive/10 rounded-lg">
                {reportData.content}
              </div>
            ) : reportData.type === 'text' ? (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{reportData.content}</pre>
              </div>
            ) : (
              <ReportVisualization data={reportData} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Save Report Dialog */}
      <SaveReportDialog 
        open={showSaveDialog} 
        onOpenChange={setShowSaveDialog}
        reportData={reportData}
        prompt={prompt}
      />

      {/* Schedule Report Dialog */}
      <ScheduleReportDialog 
        open={showScheduleDialog} 
        onOpenChange={setShowScheduleDialog}
        reportData={reportData}
        prompt={prompt}
      />
    </div>
  );
};