import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Users, 
  Mail, 
  Award, 
  FileSpreadsheet, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BulkOperation {
  id: string;
  operation_type: 'training_assignment' | 'employee_import' | 'email_campaign' | 'certificate_generation';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  total_items: number;
  processed_items: number;
  successful_items: number;
  failed_items: number;
  operation_data: any;
  results: any;
  error_log: string[];
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export const BulkOperationsManager = () => {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('create');
  const [operationType, setOperationType] = useState<string>('training_assignment');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [operationData, setOperationData] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchOperations();
    setupRealtimeSubscription();
  }, []);

  const fetchOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_operations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setOperations((data || []) as BulkOperation[]);
    } catch (error) {
      console.error('Error fetching operations:', error);
      toast({
        title: "Error",
        description: "Failed to load bulk operations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('bulk-operations-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bulk_operations'
      }, () => {
        fetchOperations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
    }
  };

  const parseCsvFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim());
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          });
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const createBulkOperation = async () => {
    if (!csvFile) {
      toast({
        title: "No file selected",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const csvData = await parseCsvFile(csvFile);
      
      const { data, error } = await supabase
        .from('bulk_operations')
        .insert([{
          operation_type: operationType,
          created_by: user?.id,
          total_items: csvData.length,
          operation_data: {
            ...operationData,
            csv_data: csvData,
            original_filename: csvFile.name
          }
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bulk operation created and will be processed shortly",
      });

      setCsvFile(null);
      setOperationData({});
      setActiveTab('history');
      fetchOperations();
    } catch (error) {
      console.error('Error creating bulk operation:', error);
      toast({
        title: "Error",
        description: "Failed to create bulk operation",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const cancelOperation = async (operationId: string) => {
    try {
      const { error } = await supabase
        .from('bulk_operations')
        .update({ status: 'cancelled' })
        .eq('id', operationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Operation cancelled",
      });
    } catch (error) {
      console.error('Error cancelling operation:', error);
      toast({
        title: "Error",
        description: "Failed to cancel operation",
        variant: "destructive",
      });
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'training_assignment': return <Users className="w-4 h-4" />;
      case 'employee_import': return <Upload className="w-4 h-4" />;
      case 'email_campaign': return <Mail className="w-4 h-4" />;
      case 'certificate_generation': return <Award className="w-4 h-4" />;
      default: return <FileSpreadsheet className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'processing': return <Play className="w-4 h-4 text-blue-600" />;
      case 'cancelled': return <Pause className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const operationTypes = [
    { value: 'training_assignment', label: 'Training Assignment', description: 'Assign training to multiple employees' },
    { value: 'employee_import', label: 'Employee Import', description: 'Import employee data from CSV' },
    { value: 'email_campaign', label: 'Email Campaign', description: 'Send emails to multiple recipients' },
    { value: 'certificate_generation', label: 'Certificate Generation', description: 'Generate certificates in bulk' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading bulk operations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6" />
          <div>
            <h1 className="text-3xl font-bold">Bulk Operations</h1>
            <p className="text-muted-foreground">Process multiple operations efficiently</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Create Operation</TabsTrigger>
          <TabsTrigger value="history">Operation History</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Bulk Operation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="operation-type">Operation Type</Label>
                <Select value={operationType} onValueChange={setOperationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {operationTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="csv-file">CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                />
                {csvFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {csvFile.name}
                  </p>
                )}
              </div>

              {operationType === 'training_assignment' && (
                <div>
                  <Label htmlFor="training-module">Training Module ID</Label>
                  <Input
                    id="training-module"
                    value={operationData.training_module_id || ''}
                    onChange={(e) => setOperationData({...operationData, training_module_id: e.target.value})}
                    placeholder="Enter training module ID"
                  />
                </div>
              )}

              {operationType === 'email_campaign' && (
                <>
                  <div>
                    <Label htmlFor="email-subject">Email Subject</Label>
                    <Input
                      id="email-subject"
                      value={operationData.subject || ''}
                      onChange={(e) => setOperationData({...operationData, subject: e.target.value})}
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-template">Email Template</Label>
                    <Textarea
                      id="email-template"
                      value={operationData.template || ''}
                      onChange={(e) => setOperationData({...operationData, template: e.target.value})}
                      placeholder="Enter email template"
                      rows={4}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={createBulkOperation} 
                  disabled={!csvFile || isCreating}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Create Operation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {operations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No operations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first bulk operation to get started
                </p>
                <Button onClick={() => setActiveTab('create')}>
                  Create Operation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {operations.map((operation) => (
                <Card key={operation.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getOperationIcon(operation.operation_type)}
                        <div>
                          <h3 className="font-semibold">
                            {operationTypes.find(t => t.value === operation.operation_type)?.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {operation.operation_data?.original_filename || 'Unknown file'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(operation.status)}>
                          {getStatusIcon(operation.status)}
                          <span className="ml-1">{operation.status}</span>
                        </Badge>
                        {operation.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelOperation(operation.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{operation.total_items}</p>
                        <p className="text-xs text-muted-foreground">Total Items</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{operation.successful_items}</p>
                        <p className="text-xs text-muted-foreground">Successful</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{operation.failed_items}</p>
                        <p className="text-xs text-muted-foreground">Failed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{operation.processed_items}</p>
                        <p className="text-xs text-muted-foreground">Processed</p>
                      </div>
                    </div>

                    {operation.status === 'processing' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{Math.round((operation.processed_items / operation.total_items) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(operation.processed_items / operation.total_items) * 100} 
                          className="h-2" 
                        />
                      </div>
                    )}

                    {operation.error_log && operation.error_log.length > 0 && (
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Show error details in a modal or expand section
                            console.log('Errors:', operation.error_log);
                          }}
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          View Errors ({operation.error_log.length})
                        </Button>
                      </div>
                    )}

                    <div className="flex justify-between text-xs text-muted-foreground mt-4">
                      <span>Created: {new Date(operation.created_at).toLocaleString()}</span>
                      {operation.completed_at && (
                        <span>Completed: {new Date(operation.completed_at).toLocaleString()}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};