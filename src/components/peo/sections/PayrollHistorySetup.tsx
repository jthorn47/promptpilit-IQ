import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccessibleSelectField } from '@/components/AccessibleForm';
import { Upload, FileText, Download, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayrollHistorySetupProps {
  sessionId: string;
  sectionId: string;
  sectionData: any;
  userRole: 'client_admin' | 'onboarding_manager';
  onProgressUpdate: (progress: number, data?: any) => void;
}

export const PayrollHistorySetup: React.FC<PayrollHistorySetupProps> = ({
  sessionId,
  sectionId,
  sectionData,
  userRole,
  onProgressUpdate
}) => {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState<'pending' | 'processing' | 'completed'>('pending');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  const periodOptions = [
    { value: 'q1', label: 'Q1 (January - March)' },
    { value: 'q2', label: 'Q2 (April - June)' },
    { value: 'q3', label: 'Q3 (July - September)' },
    { value: 'ytd', label: 'Year to Date' }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Simulate file upload process
    toast({
      title: "Uploading Files",
      description: "Processing your payroll history files..."
    });

    // In a real implementation, you would upload to Supabase Storage
    setTimeout(() => {
      const newFiles = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }));

      setUploadedFiles([...uploadedFiles, ...newFiles]);
      
      toast({
        title: "Files Uploaded",
        description: `${files.length} file(s) uploaded successfully.`
      });

      // Update progress
      const progress = calculateProgress();
      onProgressUpdate(progress);
    }, 2000);
  };

  const calculateProgress = () => {
    let progress = 0;
    
    // Files uploaded: 40%
    if (uploadedFiles.length > 0) progress += 40;
    
    // Period selected: 20%
    if (selectedPeriod) progress += 20;
    
    // Import completed: 40%
    if (importStatus === 'completed') progress += 40;
    
    return progress;
  };

  const startImportProcess = () => {
    setImportStatus('processing');
    
    // Simulate import process
    setTimeout(() => {
      setImportStatus('completed');
      toast({
        title: "Import Completed",
        description: "Payroll data has been successfully imported and mapped."
      });
      
      const progress = calculateProgress();
      onProgressUpdate(progress);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Payroll Period</CardTitle>
        </CardHeader>
        <CardContent>
          <AccessibleSelectField
            label="Historical Payroll Period"
            name="period"
            value={selectedPeriod}
            onChange={(value) => {
              setSelectedPeriod(value);
              onProgressUpdate(calculateProgress());
            }}
            options={periodOptions}
            placeholder="Select the period for historical data"
            description="Choose the payroll period you want to import historical data for"
          />
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Prior Payroll Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Payroll Files</h3>
            <p className="text-muted-foreground mb-4">
              Upload your prior payroll reports, registers, or employee YTD summaries
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="payroll-upload"
            />
            <Button asChild>
              <label htmlFor="payroll-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </label>
            </Button>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Uploaded Files</h4>
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">
                    <Check className="h-3 w-3 mr-1" />
                    Uploaded
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Import and Mapping */}
      <Card>
        <CardHeader>
          <CardTitle>Import and Map Employee YTD Values</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p>Upload payroll files first to begin the import process</p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground">
                Start the import process to extract and map employee year-to-date values from your uploaded files.
              </p>
              
              {importStatus === 'pending' && (
                <Button onClick={startImportProcess} className="w-full">
                  Start Import Process
                </Button>
              )}
              
              {importStatus === 'processing' && (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Processing and mapping payroll data...</p>
                </div>
              )}
              
              {importStatus === 'completed' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Import completed successfully</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-muted-foreground">Employees Processed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">$245,680</p>
                      <p className="text-sm text-muted-foreground">Total YTD Gross</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">$52,340</p>
                      <p className="text-sm text-muted-foreground">Total YTD Taxes</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Mapping Report
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Deductions Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Deductions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Health Insurance</li>
                  <li>• Dental Insurance</li>
                  <li>• Vision Insurance</li>
                  <li>• 401(k) Contributions</li>
                </ul>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Configure
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Garnishments</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Child Support</li>
                  <li>• Wage Garnishments</li>
                  <li>• Tax Levies</li>
                  <li>• Student Loans</li>
                </ul>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Configure
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">ACA Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Coverage Tracking</li>
                  <li>• Affordability Safe Harbor</li>
                  <li>• 1095-C Forms</li>
                  <li>• Reporting Calendar</li>
                </ul>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Configure
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Approval Section */}
      {userRole === 'client_admin' && (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Client Review Required</h4>
              <p className="text-sm text-amber-700 mt-1">
                Please review all imported data for accuracy. Your onboarding manager will then approve this section before proceeding.
              </p>
            </div>
          </div>
        </div>
      )}

      {userRole === 'onboarding_manager' && importStatus === 'completed' && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-800">Ready for Approval</h4>
              <p className="text-sm text-blue-700 mt-1">
                Historical payroll data has been imported and is ready for your approval.
              </p>
            </div>
            <Button>
              Approve Section
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};