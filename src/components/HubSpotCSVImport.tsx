import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ImportResult {
  success: boolean;
  imported: number;
  errors: number;
  duplicates: number;
  details: {
    imported: any[];
    errors: any[];
    duplicates: any[];
  };
}

export const HubSpotCSVImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      
      // Show preview of first few lines
      const lines = content.split('\n').slice(0, 3);
      toast({
        title: "CSV File Loaded",
        description: `Ready to import. Preview: ${lines[0]}`,
      });
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvContent) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file first.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke('hubspot-csv-import', {
        body: { csvData: csvContent }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      setResult(data);
      
      toast({
        title: "Import Completed",
        description: `Successfully imported ${data.imported} companies${data.errors > 0 ? ` with ${data.errors} errors` : ''}${data.duplicates > 0 ? ` and ${data.duplicates} duplicates skipped` : ''}`,
      });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import CSV data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const resetImport = () => {
    setCsvContent("");
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          HubSpot CSV Import
        </CardTitle>
        <CardDescription>
          Import companies from your HubSpot CSV export. Make sure your CSV includes the columns: 
          Record ID, Company name, Company owner, Create Date, Phone Number, Last Activity Date, City, Country/Region, Industry.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="csv-file">Select HubSpot CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileSelect}
            disabled={isImporting}
          />
        </div>

        {csvContent && !result && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              CSV file loaded and ready for import. Click "Start Import" to begin.
            </AlertDescription>
          </Alert>
        )}

        {isImporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Importing companies from HubSpot...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            onClick={handleImport} 
            disabled={isImporting || !csvContent}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isImporting ? 'Importing...' : 'Start Import'}
          </Button>
          
          {(csvContent || result) && (
            <Button 
              variant="outline" 
              onClick={resetImport}
              disabled={isImporting}
            >
              Reset
            </Button>
          )}
        </div>

        {result && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Import Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                    <div className="text-sm text-muted-foreground">Imported</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{result.duplicates}</div>
                    <div className="text-sm text-muted-foreground">Duplicates Skipped</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">{result.errors}</div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                </div>
              </Card>
            </div>

            {result.details.errors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Errors ({result.details.errors.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {result.details.errors.slice(0, 10).map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription>
                        Row {error.row}: {error.error}
                      </AlertDescription>
                    </Alert>
                  ))}
                  {result.details.errors.length > 10 && (
                    <div className="text-sm text-muted-foreground">
                      ... and {result.details.errors.length - 10} more errors
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.details.duplicates.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Duplicates Skipped ({result.details.duplicates.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {result.details.duplicates.slice(0, 5).map((duplicate, index) => (
                    <Badge key={index} variant="secondary" className="mr-2">
                      {duplicate.company_name}
                    </Badge>
                  ))}
                  {result.details.duplicates.length > 5 && (
                    <div className="text-sm text-muted-foreground">
                      ... and {result.details.duplicates.length - 5} more duplicates
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important Notes:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Companies with existing names will be skipped as duplicates</li>
              <li>All imported companies will have "trial" subscription status</li>
              <li>Make sure your CSV uses the exact column headers shown above</li>
              <li>The import will preserve HubSpot Record IDs for future reference</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};