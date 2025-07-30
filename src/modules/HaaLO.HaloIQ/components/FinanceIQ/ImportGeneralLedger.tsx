import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ImportResult {
  success: boolean;
  message: string;
  inserted_count?: number;
  processed_count?: number;
  error_count?: number;
  skipped_count?: number;
  total_rows?: number;
  errors?: string[];
  error_details?: any;
}

interface ImportGeneralLedgerProps {
  companyId: string;
}

export const ImportGeneralLedger: React.FC<ImportGeneralLedgerProps> = ({ companyId }) => {
  const { user } = useAuth();
  const [fileUrl, setFileUrl] = useState('https://40048518.fs1.hubspotusercontent-na1.net/hubfs/40048518/Easeworks%2BLLC_General%2BLedger.xlsx');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleImport = async () => {
    if (!fileUrl || !companyId) {
      toast.error('Please provide both file URL and company ID');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('import-general-ledger', {
        body: {
          company_id: companyId,
          file_url: fileUrl
        }
      });

      if (error) {
        throw error;
      }

      setImportResult(data);
      
      if (data.success) {
        toast.success(`Successfully imported ${data.inserted_count} records`);
      } else {
        toast.error(data.message || 'Import failed');
      }

    } catch (error: any) {
      console.error('Import error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to import general ledger data';
      let errorDetails = null;
      
      // Handle detailed error responses from the edge function
      if (error.message) {
        try {
          const parsedError = JSON.parse(error.message);
          errorMessage = parsedError.error || errorMessage;
          errorDetails = parsedError.details || parsedError.debug;
        } catch {
          errorMessage = error.message;
        }
      }
      
      setImportResult({
        success: false,
        message: errorMessage,
        error_details: errorDetails
      });
      
      toast.error(`Import failed: ${errorMessage}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Import General Ledger</CardTitle>
              <CardDescription>
                Import general ledger entries from an Excel file to populate your P&L and Balance Sheet reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="file-url">Excel File URL</Label>
              <Input
                id="file-url"
                type="url"
                placeholder="https://example.com/general-ledger.xlsx"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-id">Company ID</Label>
              <Input
                id="company-id"
                placeholder="Company UUID"
                value={companyId}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Using your current company ID
              </p>
            </div>
          </div>

          <Button 
            onClick={handleImport} 
            disabled={isImporting || !fileUrl || !companyId}
            className="w-full"
          >
            {isImporting ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import General Ledger
              </>
            )}
          </Button>

          {importResult && (
            <Alert className={importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {importResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={importResult.success ? 'text-green-800' : 'text-red-800'}>
                <div className="font-medium mb-2">{importResult.message}</div>
                
                {importResult.total_rows && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                    <div>
                      <span className="font-medium">Total Rows:</span>
                      <div className="text-lg">{importResult.total_rows}</div>
                    </div>
                    {importResult.inserted_count !== undefined && (
                      <div>
                        <span className="font-medium">Inserted:</span>
                        <div className="text-lg text-green-600">{importResult.inserted_count}</div>
                      </div>
                    )}
                    {importResult.skipped_count !== undefined && (
                      <div>
                        <span className="font-medium">Skipped:</span>
                        <div className="text-lg text-yellow-600">{importResult.skipped_count}</div>
                      </div>
                    )}
                    {importResult.error_count !== undefined && (
                      <div>
                        <span className="font-medium">Errors:</span>
                        <div className="text-lg text-red-600">{importResult.error_count}</div>
                      </div>
                    )}
                  </div>
                )}
                
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-3">
                    <div className="font-medium mb-2">Sample Issues:</div>
                    <div className="text-sm space-y-1 max-h-32 overflow-y-auto bg-white/50 p-2 rounded">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="text-red-700">• {error}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {!importResult.success && importResult.error_details && (
                  <div className="mt-3 p-3 bg-red-100 rounded border">
                    <div className="font-medium text-red-800 mb-2">Technical Details:</div>
                    <div className="text-sm text-red-700">
                      <div><strong>Error Type:</strong> {importResult.error_details.name}</div>
                      <div><strong>Timestamp:</strong> {importResult.error_details.timestamp}</div>
                      {importResult.error_details.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer font-medium">Stack Trace</summary>
                          <pre className="mt-1 text-xs overflow-auto max-h-32 bg-red-50 p-2 rounded">
                            {importResult.error_details.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <div className="font-medium">Expected Excel columns:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Date - Transaction date</li>
              <li>Account / Account Name - Account name</li>
              <li>Name - Transaction name (optional)</li>
              <li>Type - Transaction type</li>
              <li>Split - Split account</li>
              <li>Amount / Debit / Credit - Transaction amount</li>
              <li>Balance - Running balance (optional)</li>
              <li>Description / Memo - Transaction description (optional)</li>
              <li>Reference / Ref - Reference number (optional)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};