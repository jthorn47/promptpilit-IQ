import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Plus, Eye, FileText, Calendar, Building2, Users, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface OnboardingCode {
  id: string;
  code: string;
  company_id: string | null;
  work_state: string;
  created_at: string | null;
  expires_at: string | null;
  is_used: boolean | null;
  clients: {
    company_name: string;
  };
}

interface OnboardingRecord {
  id: string;
  onboarding_code_id: string | null;
  status: string | null;
  current_step: number | null;
  total_steps: number | null;
  language_preference: 'en' | 'es' | null;
  personal_info_completed: boolean | null;
  w4_completed: boolean | null;
  i9_section1_completed: boolean | null;
  state_tax_completed: boolean | null;
  direct_deposit_completed: boolean | null;
  handbook_acknowledged: boolean | null;
  esignature_completed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  onboarding_codes: {
    code: string;
    clients: {
      company_name: string;
    };
  };
}

interface Company {
  id: string;
  company_name: string;
  source?: 'company_settings' | 'clients';
}

export const AdminOnboarding: React.FC = () => {
  console.log('🔍 AdminOnboarding component is mounting...');
  
  const [codes, setCodes] = useState<OnboardingCode[]>([]);
  const [records, setRecords] = useState<OnboardingRecord[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState<string>('');
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [newCode, setNewCode] = useState({
    code: '',
    company_id: '',
    work_state: '',
    expires_at: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  // Search companies as user types
  useEffect(() => {
    if (companySearch.length > 0) {
      searchCompanies(companySearch);
    } else {
      setCompanies([]);
      setShowCompanySuggestions(false);
    }
  }, [companySearch]);

  const fetchData = async () => {
    try {
      // Fetch onboarding codes with client information
      const { data: codesData, error: codesError } = await supabase
        .from('onboarding_codes')
        .select(`
          *,
          clients (
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (codesError) throw codesError;

      // Fetch onboarding records
      const { data: recordsData, error: recordsError } = await supabase
        .from('employee_onboarding')
        .select(`
          *,
          onboarding_codes (
            code,
            clients (
              company_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;

      setCodes(codesData || []);
      setRecords(recordsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load onboarding data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchCompanies = async (searchTerm: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company_name')
        .ilike('company_name', `%${searchTerm}%`)
        .eq('status', 'active')
        .order('company_name')
        .limit(10);

      if (error) {
        console.error('Error searching clients:', error);
        return;
      }

      setCompanies(data || []);
      setShowCompanySuggestions(true);
    } catch (error) {
      console.error('Error searching clients:', error);
      toast({
        title: "Error",
        description: "Failed to search companies",
        variant: "destructive"
      });
    }
  };

  const generateOnboardingCode = async () => {
    if (!newCode.company_id || !newCode.work_state) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use provided code or generate random 6-digit code
      const codeToUse = newCode.code || Math.floor(100000 + Math.random() * 900000).toString();
      
      // Since we're using client IDs, we need to create the onboarding code differently
      // The onboarding_codes table should reference the client directly, not through onboarding_companies
      const { data, error } = await supabase
        .from('onboarding_codes')
        .insert({
          code: codeToUse,
          company_id: newCode.company_id, // This should be the client ID from the clients table
          work_state: newCode.work_state,
          expires_at: newCode.expires_at || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating onboarding code:', error);
        toast({
          title: "Error",
          description: `Failed to generate onboarding code: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Onboarding code generated successfully"
      });

      setIsCreateDialogOpen(false);
      setNewCode({ code: '', company_id: '', work_state: '', expires_at: '' });
      setCompanySearch('');
      fetchData();
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: "Error",
        description: "Failed to generate onboarding code",
        variant: "destructive"
      });
    }
  };

  const copyCodeToClipboard = (code: string) => {
    const url = `${window.location.origin}/onboarding/${code}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied",
      description: "Onboarding link copied to clipboard"
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'outline',
      in_progress: 'secondary',
      completed: 'default',
      approved: 'default',
      rejected: 'destructive'
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const getProgressPercentage = (record: OnboardingRecord) => {
    const completedSteps = [
      record.personal_info_completed,
      record.w4_completed,
      record.i9_section1_completed,
      record.state_tax_completed,
      record.direct_deposit_completed,
      record.handbook_acknowledged,
      record.esignature_completed
    ].filter(Boolean).length;
    
    return Math.round((completedSteps / 7) * 100);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Onboarding Management</h1>
          <p className="text-muted-foreground">Manage onboarding codes and track employee progress</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Onboarding Code</DialogTitle>
              <DialogDescription>
                Create a new onboarding code for a company
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Code (6 digits)</Label>
                <Input
                  id="code"
                  placeholder="Leave empty to auto-generate"
                  value={newCode.code}
                  maxLength={6}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                    setNewCode(prev => ({ ...prev, code: value }));
                  }}
                />
              </div>
              <div className="relative">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  placeholder="Start typing company name..."
                  value={companySearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCompanySearch(value);
                    // Clear selected company when typing
                    if (newCode.company_id) {
                      setNewCode(prev => ({ ...prev, company_id: '' }));
                    }
                  }}
                  onFocus={() => setShowCompanySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCompanySuggestions(false), 200)}
                  className={!newCode.company_id && companySearch ? "border-orange-500" : ""}
                />
                {!newCode.company_id && companySearch && (
                  <p className="text-sm text-orange-600 mt-1">Please select a company from the dropdown</p>
                )}
                {showCompanySuggestions && companies.length > 0 && (
                  <div className="absolute z-[9999] w-full mt-1 bg-background border rounded-md shadow-xl max-h-60 overflow-auto backdrop-blur-sm">
                    {companies.map((company) => (
                      <div
                        key={company.id}
                        className="px-3 py-3 cursor-pointer hover:bg-muted transition-colors touch-manipulation min-h-[44px] flex items-center text-sm md:text-base"
                        onClick={() => {
                          setCompanySearch(company.company_name);
                          setNewCode(prev => ({ ...prev, company_id: company.id }));
                          setShowCompanySuggestions(false);
                        }}
                        onTouchStart={() => {
                          // Prevent iOS safari from highlighting the element
                        }}
                        style={{
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none',
                          touchAction: 'manipulation'
                        }}
                      >
                        {company.company_name}
                      </div>
                    ))}
                  </div>
                )}
                {newCode.company_id && (
                  <p className="text-sm text-green-600 mt-1">✓ Company selected</p>
                )}
              </div>
              <div>
                <Label htmlFor="work_state">Work State</Label>
                <Select
                  value={newCode.work_state}
                  onValueChange={(value) => setNewCode(prev => ({ ...prev, work_state: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AL">Alabama</SelectItem>
                    <SelectItem value="AK">Alaska</SelectItem>
                    <SelectItem value="AZ">Arizona</SelectItem>
                    <SelectItem value="AR">Arkansas</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="CO">Colorado</SelectItem>
                    <SelectItem value="CT">Connecticut</SelectItem>
                    <SelectItem value="DE">Delaware</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="GA">Georgia</SelectItem>
                    <SelectItem value="HI">Hawaii</SelectItem>
                    <SelectItem value="ID">Idaho</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    <SelectItem value="IN">Indiana</SelectItem>
                    <SelectItem value="IA">Iowa</SelectItem>
                    <SelectItem value="KS">Kansas</SelectItem>
                    <SelectItem value="KY">Kentucky</SelectItem>
                    <SelectItem value="LA">Louisiana</SelectItem>
                    <SelectItem value="ME">Maine</SelectItem>
                    <SelectItem value="MD">Maryland</SelectItem>
                    <SelectItem value="MA">Massachusetts</SelectItem>
                    <SelectItem value="MI">Michigan</SelectItem>
                    <SelectItem value="MN">Minnesota</SelectItem>
                    <SelectItem value="MS">Mississippi</SelectItem>
                    <SelectItem value="MO">Missouri</SelectItem>
                    <SelectItem value="MT">Montana</SelectItem>
                    <SelectItem value="NE">Nebraska</SelectItem>
                    <SelectItem value="NV">Nevada</SelectItem>
                    <SelectItem value="NH">New Hampshire</SelectItem>
                    <SelectItem value="NJ">New Jersey</SelectItem>
                    <SelectItem value="NM">New Mexico</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="NC">North Carolina</SelectItem>
                    <SelectItem value="ND">North Dakota</SelectItem>
                    <SelectItem value="OH">Ohio</SelectItem>
                    <SelectItem value="OK">Oklahoma</SelectItem>
                    <SelectItem value="OR">Oregon</SelectItem>
                    <SelectItem value="PA">Pennsylvania</SelectItem>
                    <SelectItem value="RI">Rhode Island</SelectItem>
                    <SelectItem value="SC">South Carolina</SelectItem>
                    <SelectItem value="SD">South Dakota</SelectItem>
                    <SelectItem value="TN">Tennessee</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="UT">Utah</SelectItem>
                    <SelectItem value="VT">Vermont</SelectItem>
                    <SelectItem value="VA">Virginia</SelectItem>
                    <SelectItem value="WA">Washington</SelectItem>
                    <SelectItem value="WV">West Virginia</SelectItem>
                    <SelectItem value="WI">Wisconsin</SelectItem>
                    <SelectItem value="WY">Wyoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={newCode.expires_at}
                  onChange={(e) => setNewCode(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
              <Button onClick={generateOnboardingCode} className="w-full">
                Generate Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{codes.filter(c => !c.is_used).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.filter(r => r.status === 'completed').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.filter(r => r.status === 'in_progress').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Codes</CardTitle>
          <CardDescription>
            Generated codes that employees can use to start their onboarding process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Work State</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono">{code.code}</TableCell>
                  <TableCell>{code.clients.company_name}</TableCell>
                  <TableCell>{code.work_state}</TableCell>
                  <TableCell>{code.created_at ? format(new Date(code.created_at), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                  <TableCell>
                    {code.expires_at ? format(new Date(code.expires_at), 'MMM dd, yyyy') : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={!code.is_used ? 'default' : 'outline'}>
                      {!code.is_used ? 'Active' : 'Used'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyCodeToClipboard(code.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Onboarding Records */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Records</CardTitle>
          <CardDescription>
            Track the progress of employees going through the onboarding process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {record.first_name && record.last_name 
                          ? `${record.first_name} ${record.last_name}`
                          : record.email || 'No name provided'
                        }
                      </div>
                      {record.onboarding_codes?.clients?.company_name && (
                        <div className="text-sm text-muted-foreground">
                          {record.onboarding_codes.clients.company_name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {record.onboarding_codes?.code || 'N/A'}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status || 'pending')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 text-sm">{getProgressPercentage(record)}%</div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${getProgressPercentage(record)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {record.language_preference?.toUpperCase() || 'EN'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.created_at ? format(new Date(record.created_at), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {record.updated_at ? format(new Date(record.updated_at), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOnboarding;