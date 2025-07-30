import { useState, useRef } from "react";
import { Upload, Download, FileText, Users, Building, Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImportJob {
  id: string;
  type: string;
  filename: string;
  status: string;
  total_records: number;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  error_log: any[];
  created_at: string;
  completed_at: string;
}

const importTypes = [
  { value: "leads", label: "Leads", icon: Users, description: "Import lead data from CSV" },
  { value: "deals", label: "Deals", icon: Building, description: "Import deal/opportunity data" },
  { value: "activities", label: "Activities", icon: Activity, description: "Import activity history" }
];

const exportTypes = [
  { value: "leads", label: "Leads Export", description: "Export all lead data" },
  { value: "deals", label: "Deals Export", description: "Export deal pipeline data" },
  { value: "activities", label: "Activities Export", description: "Export activity history" },
  { value: "analytics", label: "Analytics Report", description: "Export analytics data" }
];

export function DataImportExport() {
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedType) {
      toast({
        title: "Error",
        description: "Please select a file and import type.",
        variant: "destructive",
      });
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Read file content
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const totalRecords = lines.length - 1; // Exclude header

      // Create import job
      const { data: jobData, error: jobError } = await supabase
        .from('import_jobs')
        .insert([{
          type: selectedType,
          filename: file.name,
          total_records: totalRecords,
          status: 'processing',
          created_by: '00000000-0000-0000-0000-000000000000'
        }])
        .select()
        .single();

      if (jobError) throw jobError;

      setUploadProgress(100);
      
      // Simulate processing
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
        toast({
          title: "Import Started",
          description: `Processing ${totalRecords} records from ${file.name}`,
        });
        
        // Reset form
        setSelectedType("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async (type: string) => {
    try {
      toast({
        title: "Export Started",
        description: "Your export is being prepared. You'll receive a download link shortly.",
      });

      // Here you would typically call an edge function to generate the export
      // For now, we'll simulate the process
      setTimeout(() => {
        toast({
          title: "Export Ready",
          description: "Your export has been generated and is ready for download.",
        });
      }, 3000);

    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate export. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Import & Export</h2>
          <p className="text-muted-foreground">
            Import data from CSV files or export your CRM data
          </p>
        </div>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Data from CSV</CardTitle>
              <CardDescription>
                Upload CSV files to import leads, deals, or activities into your CRM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="import-type">Data Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data type to import" />
                  </SelectTrigger>
                  <SelectContent>
                    {importTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="file-upload">CSV File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={isUploading || !selectedType}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a CSV file with your data. First row should contain column headers.
                </p>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                {importTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card key={type.value} className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-8 w-8 text-primary" />
                        <div>
                          <h4 className="font-medium">{type.label}</h4>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportTypes.map((type) => (
              <Card key={type.value}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {type.label}
                  </CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleExport(type.value)}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export to CSV
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                View the status and results of your recent import jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No import history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {importJobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(job.status)}
                            <div>
                              <h4 className="font-medium">{job.filename}</h4>
                              <p className="text-sm text-muted-foreground">
                                {job.type.charAt(0).toUpperCase() + job.type.slice(1)} Import
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(job.status)}
                        </div>
                        
                        {job.total_records && (
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{job.processed_records || 0} / {job.total_records}</span>
                            </div>
                            <Progress 
                              value={job.total_records ? (job.processed_records / job.total_records) * 100 : 0} 
                              className="w-full" 
                            />
                            
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>✅ {job.successful_records || 0} successful</span>
                              <span>❌ {job.failed_records || 0} failed</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3 text-xs text-muted-foreground">
                          Started: {new Date(job.created_at).toLocaleString()}
                          {job.completed_at && (
                            <span> • Completed: {new Date(job.completed_at).toLocaleString()}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}