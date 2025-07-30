import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, Save, Brain, Zap, Layout, Sparkles } from 'lucide-react';
import { ReportBuilderCanvas, ReportBuilderTourLauncher } from './ReportBuilder/index';

export const HaloIQDashboard = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-report', {
        body: { prompt: prompt.trim() }
      });

      if (error) throw error;
      if (data.success) {
        setReport(data.report);
      } else {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (err: any) {
      console.error('Error generating report:', err);
      setError(err.message || 'Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const handleSaveReport = async () => {
    if (!report) return;
    
    try {
      const { error } = await supabase.from('saved_reports').insert({
        name: prompt.slice(0, 100) || 'Generated Report',
        description: 'AI Generated Report',
        data_source: 'ai_generated',
        report_config: { content: report },
        created_by: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;
      
      toast('Report saved successfully!');
    } catch (error) {
      console.error('Error saving report:', error);
      toast('Failed to save report');
    }
  };

  const handleDownload = () => {
    if (!report) return;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'halo-iq-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
            <Brain className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            ReportIQ
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Next-generation AI-powered report builder with natural language processing and visual design
        </p>
      </div>

      {/* Main Interface */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Chat Interface
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Visual Report Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-8 mt-8">
          {/* Chat Interface */}
          <Card className="border-cyan-400/20 bg-gradient-to-br from-cyan-900/10 to-purple-900/10">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Report Generator
              </CardTitle>
              <CardDescription>
                Describe what you want to analyze and I'll generate a comprehensive report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleGenerateReport} className="space-y-4">
                <Textarea
                  placeholder="Describe the report you need... (e.g., 'Create a monthly payroll summary report')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none border-cyan-400/20 focus:border-cyan-400/40"
                  disabled={isGenerating}
                />
                <Button 
                  type="submit" 
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </form>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {/* Generated Report */}
              {report && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-cyan-400">Generated Report</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleSaveReport}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted/20 border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-foreground">
                      {report}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="mt-8">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Visual Report Builder
              </CardTitle>
              <CardDescription>
                Drag-and-drop interface with AI assistance from Sarah
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 relative">
              <div className="h-[800px] border border-border rounded-lg overflow-hidden relative">
                <ReportBuilderCanvas 
                  onSave={(data) => {
                    toast('Report structure saved successfully!')
                    console.log('Report saved:', data)
                  }}
                  onPreview={() => {
                    toast('Preview feature coming soon!')
                  }}
                  onShare={() => {
                    toast('Share feature coming soon!')
                  }}
                />
                {/* Tour Launcher positioned inside the builder container */}
                <ReportBuilderTourLauncher />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};