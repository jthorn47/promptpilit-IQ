import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Globe, 
  Building, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit, 
  Trash2,
  Download,
  Upload,
  Settings,
  Shield,
  FileText
} from 'lucide-react';

interface TaxJurisdiction {
  id: string;
  type: 'state' | 'province' | 'country' | 'local';
  code: string;
  name: string;
  parent_code?: string;
  is_active: boolean;
  tax_rules: TaxRule[];
  reciprocity_agreements?: string[];
  compliance_status?: 'compliant' | 'warning' | 'non_compliant';
  last_updated?: string;
}

interface TaxRule {
  id: string;
  jurisdiction_code: string;
  tax_type: 'income' | 'sui' | 'sdi' | 'local' | 'social' | 'vat';
  rate_type: 'flat' | 'progressive' | 'percentage';
  rates: TaxRateSchedule[];
  effective_date: string;
  expiry_date?: string;
  applies_to: 'employee' | 'employer' | 'both';
}

interface TaxRateSchedule {
  min_income: number;
  max_income?: number;
  rate: number;
  flat_amount?: number;
}

export const TaxJurisdictionManager: React.FC = () => {
  const [jurisdictions, setJurisdictions] = useState<TaxJurisdiction[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<TaxJurisdiction | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [complianceIssues, setComplianceIssues] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadJurisdictions();
    loadComplianceIssues();
  }, []);

  const loadJurisdictions = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockJurisdictions: TaxJurisdiction[] = [
        {
          id: 'us-ca',
          type: 'state',
          code: 'CA',
          name: 'California',
          parent_code: 'US',
          is_active: true,
          compliance_status: 'compliant',
          tax_rules: [
            {
              id: 'ca-income',
              jurisdiction_code: 'CA',
              tax_type: 'income',
              rate_type: 'progressive',
              rates: [
                { min_income: 0, max_income: 10275, rate: 1 },
                { min_income: 10275, max_income: 24350, rate: 2 },
                { min_income: 24350, max_income: 38575, rate: 4 }
              ],
              effective_date: '2024-01-01',
              applies_to: 'employee'
            }
          ],
          reciprocity_agreements: [],
          last_updated: '2024-01-15'
        },
        {
          id: 'us-ny',
          type: 'state',
          code: 'NY',
          name: 'New York',
          parent_code: 'US',
          is_active: true,
          compliance_status: 'warning',
          tax_rules: [],
          reciprocity_agreements: ['NJ', 'CT'],
          last_updated: '2024-01-10'
        },
        {
          id: 'ca-on',
          type: 'province',
          code: 'ON',
          name: 'Ontario',
          parent_code: 'CA',
          is_active: true,
          compliance_status: 'non_compliant',
          tax_rules: [],
          reciprocity_agreements: [],
          last_updated: '2023-12-15'
        }
      ];
      
      setJurisdictions(mockJurisdictions);
    } catch (error) {
      console.error('Error loading jurisdictions:', error);
      toast({
        title: "Error",
        description: "Failed to load tax jurisdictions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadComplianceIssues = async () => {
    try {
      // Mock compliance issues
      setComplianceIssues([
        {
          id: '1',
          jurisdiction: 'ON',
          issue: 'Missing provincial tax rules for 2024',
          severity: 'high',
          employee_count: 15,
          last_check: '2024-01-15'
        },
        {
          id: '2',
          jurisdiction: 'NY',
          issue: 'SDI rates may be outdated',
          severity: 'medium',
          employee_count: 8,
          last_check: '2024-01-14'
        }
      ]);
    } catch (error) {
      console.error('Error loading compliance issues:', error);
    }
  };

  const validateTaxJurisdiction = async (jurisdictionData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-tax-jurisdiction', {
        body: {
          employee_id: 'sample-employee',
          primary_work_jurisdiction: jurisdictionData.code,
          residency_jurisdiction: jurisdictionData.code
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error validating jurisdiction:', error);
      toast({
        title: "Validation Error",
        description: "Failed to validate tax jurisdiction",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleAddJurisdiction = async (jurisdictionData: Partial<TaxJurisdiction>) => {
    try {
      // Validate jurisdiction first
      const validation = await validateTaxJurisdiction(jurisdictionData);
      
      const newJurisdiction: TaxJurisdiction = {
        id: `${jurisdictionData.type}-${jurisdictionData.code?.toLowerCase()}`,
        type: jurisdictionData.type!,
        code: jurisdictionData.code!,
        name: jurisdictionData.name!,
        parent_code: jurisdictionData.parent_code,
        is_active: true,
        tax_rules: [],
        reciprocity_agreements: [],
        compliance_status: validation?.compliance_status || 'warning',
        last_updated: new Date().toISOString()
      };

      setJurisdictions(prev => [...prev, newJurisdiction]);
      setShowAddDialog(false);
      
      toast({
        title: "Success",
        description: "Tax jurisdiction added successfully"
      });
    } catch (error) {
      console.error('Error adding jurisdiction:', error);
      toast({
        title: "Error",
        description: "Failed to add tax jurisdiction",
        variant: "destructive"
      });
    }
  };

  const getComplianceIcon = (status?: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'non_compliant':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getJurisdictionTypeIcon = (type: string) => {
    switch (type) {
      case 'country':
        return <Globe className="h-4 w-4" />;
      case 'state':
      case 'province':
        return <MapPin className="h-4 w-4" />;
      case 'local':
        return <Building className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tax Jurisdiction Management</h1>
          <p className="text-muted-foreground">
            Configure multi-state and international tax compliance rules
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Config
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import Rules
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Jurisdiction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Tax Jurisdiction</DialogTitle>
                <DialogDescription>
                  Configure a new tax jurisdiction for payroll processing
                </DialogDescription>
              </DialogHeader>
              <AddJurisdictionForm onSubmit={handleAddJurisdiction} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Compliance Overview */}
      {complianceIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Compliance Issues Detected</AlertTitle>
          <AlertDescription>
            {complianceIssues.length} tax jurisdiction{complianceIssues.length > 1 ? 's have' : ' has'} compliance issues that require attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="jurisdictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jurisdictions">Jurisdictions</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
          <TabsTrigger value="reciprocity">Reciprocity Agreements</TabsTrigger>
          <TabsTrigger value="settings">Engine Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="jurisdictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configured Tax Jurisdictions</CardTitle>
              <CardDescription>
                Manage tax rules and compliance settings for different jurisdictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tax Rules</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jurisdictions.map((jurisdiction) => (
                    <TableRow key={jurisdiction.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getJurisdictionTypeIcon(jurisdiction.type)}
                          <div>
                            <div className="font-semibold">{jurisdiction.name}</div>
                            <div className="text-sm text-muted-foreground">{jurisdiction.code}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {jurisdiction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getComplianceIcon(jurisdiction.compliance_status)}
                          <span className="text-sm">
                            {jurisdiction.compliance_status || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {jurisdiction.tax_rules.length} rules
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {jurisdiction.last_updated ? new Date(jurisdiction.last_updated).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedJurisdiction(jurisdiction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status Overview</CardTitle>
              <CardDescription>
                Monitor tax compliance issues across all jurisdictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complianceIssues.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold">All jurisdictions compliant</h3>
                  <p className="text-muted-foreground">No compliance issues detected</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {complianceIssues.map((issue) => (
                    <Alert key={issue.id} variant={issue.severity === 'high' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{issue.jurisdiction} - {issue.issue}</AlertTitle>
                      <AlertDescription>
                        Affects {issue.employee_count} employees • Last checked: {issue.last_check}
                        <div className="mt-2">
                          <Button size="sm" variant="outline">
                            Resolve Issue
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reciprocity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reciprocity Agreements</CardTitle>
              <CardDescription>
                Manage tax reciprocity agreements between jurisdictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Jurisdiction</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select jurisdiction" />
                      </SelectTrigger>
                      <SelectContent>
                        {jurisdictions.map((j) => (
                          <SelectItem key={j.id} value={j.code}>
                            {j.name} ({j.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reciprocal Jurisdiction</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select jurisdiction" />
                      </SelectTrigger>
                      <SelectContent>
                        {jurisdictions.map((j) => (
                          <SelectItem key={j.id} value={j.code}>
                            {j.name} ({j.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button>Add Reciprocity Agreement</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engine Configuration</CardTitle>
                <CardDescription>
                  Global settings for the multi-region tax engine
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-detect Employee Jurisdictions</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically determine tax jurisdictions based on employee addresses
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Dual Tax Scenarios</Label>
                    <p className="text-sm text-muted-foreground">
                      Support employees subject to multiple tax jurisdictions
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>International Tax Processing</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable tax calculations for international employees
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Third-Party Integrations</CardTitle>
                <CardDescription>
                  Configure external tax filing and compliance partners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ADP Tax Filing Service</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">Not Connected</Badge>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>
                  </div>
                  <div>
                    <Label>Avalara AvaTax</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">Not Connected</Badge>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AddJurisdictionForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    type: '',
    code: '',
    name: '',
    parent_code: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Jurisdiction Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="country">Country</SelectItem>
              <SelectItem value="state">State</SelectItem>
              <SelectItem value="province">Province</SelectItem>
              <SelectItem value="local">Local</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="code">Jurisdiction Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="e.g., CA, NY, ON"
            maxLength={3}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="name">Jurisdiction Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., California, New York, Ontario"
        />
      </div>
      <div>
        <Label htmlFor="parent_code">Parent Jurisdiction (Optional)</Label>
        <Input
          id="parent_code"
          value={formData.parent_code}
          onChange={(e) => setFormData(prev => ({ ...prev, parent_code: e.target.value.toUpperCase() }))}
          placeholder="e.g., US, CA"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Add Jurisdiction</Button>
      </div>
    </form>
  );
};