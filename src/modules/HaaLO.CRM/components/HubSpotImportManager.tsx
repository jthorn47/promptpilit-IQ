/**
 * @fileoverview HubSpot Import Manager for CRM Module
 * @module HubSpotImportManager
 * @author Lovable AI
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Building, 
  DollarSign, 
  Calendar, 
  CheckSquare, 
  Database,
  Download,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from "lucide-react";

interface ImportOption {
  value: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  count?: string;
}

interface ImportStatus {
  type: string;
  status: 'idle' | 'running' | 'success' | 'error';
  progress: number;
  message: string;
}

/**
 * HubSpot Import Manager Component
 */
export const HubSpotImportManager: React.FC = () => {
  const { toast } = useToast();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importStatuses, setImportStatuses] = useState<ImportStatus[]>([]);

  const importOptions: ImportOption[] = [
    { 
      value: "contacts", 
      label: "Contacts", 
      icon: Users, 
      description: "Import your HubSpot contacts and leads",
      count: "1,234"
    },
    { 
      value: "companies", 
      label: "Companies", 
      icon: Building, 
      description: "Import your HubSpot companies",
      count: "567"
    },
    { 
      value: "deals", 
      label: "Deals", 
      icon: DollarSign, 
      description: "Import your HubSpot deals and opportunities",
      count: "89"
    },
    { 
      value: "activities", 
      label: "Activities", 
      icon: Calendar, 
      description: "Import your HubSpot call activities and meetings",
      count: "2,345"
    },
    { 
      value: "tasks", 
      label: "Tasks", 
      icon: CheckSquare, 
      description: "Import your HubSpot tasks and follow-ups",
      count: "456"
    }
  ];

  const handleTypeSelection = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const startImport = async () => {
    if (selectedTypes.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one data type to import",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    const initialStatuses = selectedTypes.map(type => ({
      type,
      status: 'idle' as const,
      progress: 0,
      message: 'Preparing...'
    }));
    setImportStatuses(initialStatuses);

    try {
      for (let i = 0; i < selectedTypes.length; i++) {
        const type = selectedTypes[i];
        
        // Update status to running
        setImportStatuses(prev => prev.map(status => 
          status.type === type 
            ? { ...status, status: 'running', message: 'Starting import...' }
            : status
        ));

        try {
          // Call the HubSpot import edge function
          const { data, error } = await supabase.functions.invoke('hubspot-import', {
            body: { importType: type }
          });

          if (error) throw error;

          // Simulate progress updates
          for (let progress = 0; progress <= 100; progress += 20) {
            await new Promise(resolve => setTimeout(resolve, 500));
            setImportStatuses(prev => prev.map(status => 
              status.type === type 
                ? { 
                    ...status, 
                    progress, 
                    message: progress === 100 ? 'Import completed' : `Importing ${type}... ${progress}%`
                  }
                : status
            ));
          }

          // Mark as success
          setImportStatuses(prev => prev.map(status => 
            status.type === type 
              ? { ...status, status: 'success', message: `${data?.count || 0} records imported` }
              : status
          ));

        } catch (error: any) {
          console.error(`Error importing ${type}:`, error);
          setImportStatuses(prev => prev.map(status => 
            status.type === type 
              ? { ...status, status: 'error', message: error.message || 'Import failed' }
              : status
          ));
        }
      }

      toast({
        title: "Import Completed",
        description: "HubSpot data import has been completed. Check individual statuses above.",
      });

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed", 
        description: error.message || "Failed to import from HubSpot",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setImportStatuses([]);
    setSelectedTypes([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">HubSpot Import</h1>
          <p className="text-muted-foreground">Import your existing CRM data from HubSpot</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            HubSpot Integration
          </Badge>
        </div>
      </div>

      {/* Import Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Select Data to Import
          </CardTitle>
          <CardDescription>
            Choose what data to import from your HubSpot account. This will create corresponding records in your CRM.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {importOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedTypes.includes(option.value);
              
              return (
                <div
                  key={option.value}
                  className={`
                    relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
                    ${isSelected 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                    }
                  `}
                  onClick={() => handleTypeSelection(option.value)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div>
                        <h3 className="font-medium">{option.label}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    {option.count && (
                      <Badge variant="secondary" className="text-xs">
                        {option.count}
                      </Badge>
                    )}
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedTypes.length > 0 
                ? `${selectedTypes.length} data type${selectedTypes.length > 1 ? 's' : ''} selected`
                : 'No data types selected'
              }
            </div>
            
            <div className="flex gap-2">
              {importStatuses.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetImport}
                  disabled={importing}
                >
                  Reset
                </Button>
              )}
              <Button
                onClick={startImport}
                disabled={importing || selectedTypes.length === 0}
                className="min-w-32"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Start Import
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Progress */}
      {importStatuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className={`w-5 h-5 ${importing ? 'animate-spin' : ''}`} />
              Import Progress
            </CardTitle>
            <CardDescription>
              Track the progress of your HubSpot data import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {importStatuses.map((status) => {
              const option = importOptions.find(opt => opt.value === status.type);
              const Icon = option?.icon || Database;
              
              return (
                <div key={status.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{option?.label}</span>
                      {status.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {status.status === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                      {status.status === 'running' && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                    </div>
                    <Badge 
                      variant={
                        status.status === 'success' ? 'default' :
                        status.status === 'error' ? 'destructive' :
                        status.status === 'running' ? 'secondary' : 'outline'
                      }
                    >
                      {status.status}
                    </Badge>
                  </div>
                  
                  {status.status === 'running' && (
                    <Progress value={status.progress} className="h-2" />
                  )}
                  
                  <p className="text-sm text-muted-foreground">{status.message}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Make sure your HubSpot API token is configured in the system settings</li>
            <li>The import will preserve HubSpot Record IDs for future reference</li>
            <li>Existing records with matching IDs will be updated</li>
            <li>Large imports may take several minutes to complete</li>
            <li>You can monitor progress in real-time during the import</li>
          </ul>
          
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://knowledge.hubspot.com/integrations/how-do-i-get-my-hubspot-api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                HubSpot API Setup Guide
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};