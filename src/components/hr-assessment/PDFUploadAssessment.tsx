import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface PDFUploadAssessmentProps {
  companyId: string;
  companyName: string;
  onComplete: (assessment: any) => void;
  onCancel: () => void;
}

export const PDFUploadAssessment = ({ 
  companyId, 
  companyName, 
  onComplete, 
  onCancel 
}: PDFUploadAssessmentProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file only.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const uploadFile = async (file: File) => {
    const fileExt = 'pdf';
    const fileName = `${companyId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from('hr-assessment-pdfs')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('hr-assessment-pdfs')
      .getPublicUrl(filePath);

    return { filePath, publicUrl };
  };

  const parseAssessmentFromPDF = async (fileUrl: string) => {
    // This would integrate with an AI/OCR service
    // For now, we'll simulate the parsing with mock data
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock parsed assessment data
    return {
      responses: {
        "workplace_violence_policy": "basic",
        "incident_reporting": "single_channel",
        "employee_training": "annual_basic",
        "risk_assessment_frequency": "annual",
        "security_measures": "moderate",
        "employee_support": "basic_eap",
        "threat_assessment_team": "designated_staff",
        "incident_investigation": "basic_procedure"
      },
      risk_score: 65,
      risk_level: "moderate",
      industry: "manufacturing",
      company_size: "101-500",
      parsed_sections: [
        "Policy Documentation",
        "Training Records", 
        "Incident Reports",
        "Security Measures"
      ]
    };
  };

  const handleUploadAndProcess = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(10);

      // Upload file
      const { filePath, publicUrl } = await uploadFile(file);
      setUploadProgress(40);
      
      setUploading(false);
      setProcessing(true);
      setUploadProgress(50);

      // Parse PDF content (mock implementation)
      const parsedData = await parseAssessmentFromPDF(publicUrl);
      setUploadProgress(90);

      const today = new Date().toISOString().split('T')[0];

      // Save assessment using upsert to handle duplicates
      const assessmentData = {
        company_id: companyId,
        assessment_date: today,
        responses: parsedData.responses,
        risk_score: parsedData.risk_score,
        risk_level: parsedData.risk_level,
        input_method: 'pdf_upload',
        industry: parsedData.industry,
        company_size: parsedData.company_size,
        status: 'parsed',
        pdf_file_url: publicUrl,
        pdf_parsed_data: parsedData,
        source_data: {
          original_filename: file.name,
          file_size: file.size,
          upload_date: new Date().toISOString(),
          parsed_sections: parsedData.parsed_sections
        }
      };

      // Use upsert to handle duplicate constraint
      const { data, error } = await supabase
        .from('company_hr_assessments')
        .upsert(assessmentData, {
          onConflict: 'company_id,assessment_date'
        })
        .select()
        .single();

      if (error) throw error;

      setUploadProgress(100);

      toast({
        title: "PDF Processed Successfully",
        description: `Risk score: ${parsedData.risk_score}/100 (${parsedData.risk_level.toUpperCase()} risk)`,
      });

      onComplete(data);
    } catch (error: any) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setProcessing(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  const isProcessing = uploading || processing;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload PDF Assessment for {companyName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              Upload HR Risk Assessment PDF
            </h3>
            <p className="text-muted-foreground mb-4">
              {isDragActive
                ? "Drop the PDF file here..."
                : "Drag and drop a PDF file here, or click to select"}
            </p>
            <p className="text-sm text-muted-foreground">
              Maximum file size: 10MB • PDF files only
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-red-600" />
                <div>
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              {!isProcessing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {isProcessing && (
              <div className="space-y-3">
                <Progress value={uploadProgress} className="w-full" />
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  {uploading && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading PDF...
                    </>
                  )}
                  {processing && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing and extracting assessment data...
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-amber-800 mb-1">
                    AI Processing Notice
                  </div>
                  <div className="text-amber-700">
                    Our AI will extract assessment data from your PDF. Please review 
                    the results for accuracy before finalizing.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleUploadAndProcess}
            disabled={!file || isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploading ? 'Uploading...' : 'Processing...'}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Process
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};