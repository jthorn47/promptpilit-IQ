import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, CheckCircle, AlertCircle, Users, Building, Building2, DollarSign, Calendar, CheckSquare } from "lucide-react";

interface ImportResult {
  imported: number;
  errors: number;
  details?: {
    imported: any[];
    errors: any[];
  };
}

interface ImportResults {
  contacts?: ImportResult;
  companies?: ImportResult;
  deals?: ImportResult;
  activities?: ImportResult;
  tasks?: ImportResult;
  lists?: ImportResult;
  lists_imported?: number;
  contact_associations?: number;
  message?: string;
  status?: string;
}

export const HubSpotImport = () => {
  const [importType, setImportType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResults | null>(null);
  const { toast } = useToast();

  const importOptions = [
    { value: "contacts", label: "Contacts", icon: Users, description: "Import your HubSpot contacts" },
    { value: "companies", label: "Companies", icon: Building2, description: "Import your HubSpot companies" },
    { value: "deals", label: "Deals", icon: DollarSign, description: "Import your HubSpot deals" },
    { value: "activities", label: "Activities (Calls)", icon: Calendar, description: "Import your HubSpot call activities" },
    { value: "tasks", label: "Tasks", icon: CheckSquare, description: "Import your HubSpot tasks" },
    { value: "lists", label: "Contact Lists", icon: Users, description: "Import your HubSpot contact lists and associations" },
    { value: "all", label: "All Records", icon: Download, description: "Import contacts, companies, deals, activities, tasks, and lists" }
  ];

  const handleImport = async () => {
    if (!importType) {
      toast({
        title: "Selection Required",
        description: "Please select what to import from HubSpot",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProgress(0);
    setResults(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const functionName = importType === 'lists' ? 'hubspot-lists-import' : 'hubspot-import';
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { type: importType }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        throw new Error(error.message || 'Failed to invoke function');
      }

      if (!data.success && data.error) {
        throw new Error(data.error + (data.details ? ': ' + data.details : ''));
      }

      // Handle the new response format
      if (data.status === 'processing') {
        toast({
          title: "Import Started",
          description: "HubSpot import is running in the background. Check the edge function logs for progress.",
        });
        setResults({ message: data.message, status: data.status });
      } else {
        setResults(data);
        
        // Calculate total imported (legacy support)
        let totalImported = 0;
        let totalErrors = 0;

        if (importType === 'all') {
          totalImported = (data.contacts?.imported || 0) + (data.companies?.imported || 0) + (data.deals?.imported || 0) + (data.activities?.imported || 0) + (data.tasks?.imported || 0) + (data.lists?.imported || 0);
          totalErrors = (data.contacts?.errors || 0) + (data.companies?.errors || 0) + (data.deals?.errors || 0) + (data.activities?.errors || 0) + (data.tasks?.errors || 0) + (data.lists?.errors || 0);
        } else if (importType === 'lists') {
          totalImported = data.lists_imported || data.imported || 0;
          totalErrors = data.errors || 0;
        } else {
          totalImported = data.imported || 0;
          totalErrors = data.errors || 0;
        }

        toast({
          title: "Import Completed",
          description: `Successfully imported ${totalImported} records${totalErrors > 0 ? ` with ${totalErrors} errors` : ''}`,
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import from HubSpot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    // Handle processing status
    if (results.status === 'processing') {
      return (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Status:</strong> {results.message}
          </AlertDescription>
        </Alert>
      );
    }

    const resultItems = importType === 'all' 
      ? [
          { type: 'Contacts', data: results.contacts, icon: Users },
          { type: 'Companies', data: results.companies, icon: Building2 },
          { type: 'Deals', data: results.deals, icon: DollarSign },
          { type: 'Activities', data: results.activities, icon: Calendar },
          { type: 'Tasks', data: results.tasks, icon: CheckSquare },
          { type: 'Lists', data: results.lists, icon: Users }
        ]
      : importType === 'lists'
      ? [{ 
          type: 'Contact Lists', 
          data: { imported: results.lists_imported || 0, errors: 0 } as ImportResult, 
          icon: Users,
          details: `${results.contact_associations || 0} contact associations created`
        }]
      : [{ type: importType.charAt(0).toUpperCase() + importType.slice(1), data: results as ImportResult, 
          icon: importOptions.find(opt => opt.value === importType)?.icon || Users }];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Import Results</h3>
        {resultItems.map(({ type, data, icon: Icon, details }) => (
          <Alert key={type}>
            <Icon className="h-4 w-4" />
            <AlertDescription>
              <strong>{type}:</strong> {data?.imported || 0} imported successfully
              {(data?.errors || 0) > 0 && (
                <span className="text-orange-600"> • {data?.errors} errors</span>
              )}
              {details && (
                <div className="text-sm text-muted-foreground mt-1">{details}</div>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HubSpot Import</h1>
        <p className="text-gray-600">Import your existing CRM data from HubSpot into EaseLearn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Import HubSpot Data</span>
          </CardTitle>
          <CardDescription>
            Choose what data to import from your HubSpot account. This will create corresponding records in your EaseLearn CRM.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Import Type</label>
            <Select value={importType} onValueChange={setImportType} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Choose what to import..." />
              </SelectTrigger>
              <SelectContent>
                {importOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <option.icon className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing data from HubSpot...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <div className="flex space-x-4">
            <Button 
              onClick={handleImport} 
              disabled={loading || !importType}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{loading ? 'Importing...' : 'Start Import'}</span>
            </Button>
          </div>

          {results && renderResults()}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important Notes:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>This import will create new records in your EaseLearn CRM</li>
            <li>Existing records won't be duplicated if you run the import again</li>
            <li>Companies will be created with default trial subscription status</li>
            <li>Deals will be assigned to a default stage - you can move them later</li>
            <li>Large imports may take several minutes to complete</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};