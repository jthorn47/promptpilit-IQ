import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle, Users } from "lucide-react";
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

export const ContactCSVImport = () => {
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
      // Better progress tracking with timeout protection
      let progressInterval: ReturnType<typeof setInterval>;
      let timeoutId: ReturnType<typeof setTimeout>;
      
      // Start progress simulation - more conservative approach
      let currentProgress = 0;
      progressInterval = setInterval(() => {
        if (currentProgress < 85) {
          currentProgress += Math.random() * 8 + 2; // Smaller increments (2-10%)
          setProgress(Math.min(currentProgress, 85));
        }
      }, 1000); // Slower progression

      console.log('Starting HubSpot contact import...');
      
      // Set a timeout to prevent hanging
      timeoutId = setTimeout(() => {
        clearInterval(progressInterval);
        throw new Error('Import timeout - the process is taking longer than expected. Please try again with a smaller file.');
      }, 120000); // 2 minute timeout

      const { data, error } = await supabase.functions.invoke('contact-csv-import', {
        body: { csvData: csvContent }
      });

      // Clear timers and complete progress
      clearInterval(progressInterval);
      clearTimeout(timeoutId);
      setProgress(100);

      console.log('HubSpot contact import completed:', data);

      if (error) {
        console.error('Import error:', error);
        throw error;
      }

      setResult(data);
      
      toast({
        title: "Import Completed",
        description: `Successfully imported ${data.imported} contacts${data.errors > 0 ? ` with ${data.errors} errors` : ''}${data.duplicates > 0 ? ` and ${data.duplicates} duplicates skipped` : ''}`,
      });

    } catch (error) {
      console.error('Import error:', error);
      
      // Show specific error message
      const errorMessage = error.message?.includes('timeout') 
        ? 'The import is taking longer than expected. This might be due to a large file size. Please try breaking your CSV into smaller chunks.'
        : error.message || "Failed to import CSV data";
      
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 2000);
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
          <Users className="h-5 w-5" />
          HubSpot Contact CSV Import
        </CardTitle>
        <CardDescription>
          Import contacts/leads from your HubSpot CSV export. Make sure your CSV includes the columns: 
          Record ID, First Name, Last Name, Email, Phone Number, Contact owner, Primary Associated Company ID, Last Activity Date, Lead Status, Marketing contact status, Create Date, Associated Company.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="csv-file">Select HubSpot Contact CSV File</Label>
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
              <span>Importing contacts from HubSpot...</span>
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
                      {duplicate.email}
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
              <li>Contacts with existing email addresses will be skipped as duplicates</li>
              <li>All imported contacts will have "new" lead status by default</li>
              <li>Make sure your CSV uses the exact column headers shown above</li>
              <li>The import will preserve HubSpot Record IDs for future reference</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};