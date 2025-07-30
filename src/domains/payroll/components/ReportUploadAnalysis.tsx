import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Download,
  Brain
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PayrollPeriod {
  id: string;
  start_date: string;
  end_date: string;
  period_type: string;
  status: string;
}

interface ReportUpload {
  id: string;
  filename: string;
  file_url: string;
  upload_date: string;
  status: 'uploaded' | 'analyzing' | 'analyzed' | 'processed' | 'error';
  analysis_result?: any;
}

interface ReportUploadAnalysisProps {
  selectedPeriod: PayrollPeriod | null;
  onDataUpdate: () => void;
}

export const ReportUploadAnalysis: React.FC<ReportUploadAnalysisProps> = ({
  selectedPeriod,
  onDataUpdate
}) => {
  const [uploads, setUploads] = useState<ReportUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedPeriod) {
      toast({
        title: "No Period Selected",
        description: "Please select a payroll period first",
        variant: "destructive",
      });
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Get user's company ID (null for super admins is ok)
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      const companyId = profile?.company_id || null;

      // Upload file to Supabase Storage
      const fileName = `payroll-reports/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Create record in database
      const { data: reportData, error: dbError } = await supabase
        .from('payroll_report_uploads')
        .insert({
          filename: file.name,
          file_url: uploadData.path,
          uploaded_by: user?.id,
          company_id: companyId,
          payroll_period_id: selectedPeriod.id,
          status: 'uploaded'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(100);
      
      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded successfully`,
      });

      // Add to local state
      setUploads(prev => [{
        id: reportData.id,
        filename: reportData.filename,
        file_url: reportData.file_url,
        upload_date: reportData.upload_date || reportData.created_at,
        status: reportData.status as 'uploaded' | 'analyzing' | 'analyzed' | 'processed' | 'error',
        analysis_result: reportData.analysis_result
      }, ...prev]);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [selectedPeriod, user, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const analyzeReport = async (reportId: string) => {
    setAnalyzing(true);
    
    try {
      // Update status to analyzing
      await supabase
        .from('payroll_report_uploads')
        .update({ status: 'analyzing' })
        .eq('id', reportId);

      // Call edge function for AI analysis
      const { data, error } = await supabase.functions.invoke('analyze-payroll-report', {
        body: { reportId }
      });

      if (error) throw error;

      // Update local state
      setUploads(prev => prev.map(upload => 
        upload.id === reportId 
          ? { ...upload, status: 'analyzed', analysis_result: data.analysis }
          : upload
      ));

      toast({
        title: "Analysis Complete",
        description: "The payroll report has been analyzed successfully",
      });

    } catch (error) {
      console.error('Analysis error:', error);
      
      // Update status to error
      await supabase
        .from('payroll_report_uploads')
        .update({ status: 'error' })
        .eq('id', reportId);

      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'analyzing': return <Brain className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'analyzed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'bg-yellow-100 text-yellow-800';
      case 'analyzing': return 'bg-blue-100 text-blue-800';
      case 'analyzed': return 'bg-green-100 text-green-800';
      case 'processed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Payroll Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedPeriod ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <p className="text-muted-foreground">Please select a payroll period first</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-primary">Drop the file here...</p>
                ) : (
                  <div>
                    <p className="text-foreground font-medium mb-2">
                      Drag & drop your payroll report here, or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF, Excel, CSV files
                    </p>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Reports */}
      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploads.map((upload) => (
                <div key={upload.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{upload.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded {new Date(upload.upload_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(upload.status)}
                      <Badge className={getStatusColor(upload.status)}>
                        {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {upload.status === 'uploaded' && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => analyzeReport(upload.id)}
                        disabled={analyzing}
                        size="sm"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        {analyzing ? 'Analyzing...' : 'Analyze with AI'}
                      </Button>
                    </div>
                  )}

                  {upload.status === 'analyzed' && upload.analysis_result && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">AI Analysis Results</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Total Employees:</strong> {upload.analysis_result.total_employees || 'Not detected'}</p>
                        <p><strong>Total Hours:</strong> {upload.analysis_result.total_hours || 'Not detected'}</p>
                        <p><strong>Total Classes:</strong> {upload.analysis_result.total_classes || 'Not detected'}</p>
                        <p><strong>Estimated Gross Pay:</strong> ${upload.analysis_result.estimated_gross_pay || 'Not calculated'}</p>
                        
                        {upload.analysis_result.recommendations && (
                          <div className="mt-3">
                            <p className="font-medium">Recommendations:</p>
                            <ul className="list-disc list-inside text-muted-foreground">
                              {upload.analysis_result.recommendations.map((rec: string, index: number) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Apply to Payroll
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {upload.status === 'error' && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">
                        Analysis failed. Please check the file format and try again.
                      </p>
                      <Button 
                        onClick={() => analyzeReport(upload.id)}
                        size="sm"
                        variant="outline"
                        className="mt-2"
                      >
                        Retry Analysis
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};