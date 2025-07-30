import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Globe, 
  Plus, 
  Edit, 
  Trash2, 
  User,
  CreditCard,
  FileText,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InternationalPayrollConfig {
  id: string;
  employeeId: string;
  employeeName: string;
  payrollCountry: string;
  contractorType: 'employee' | 'contractor' | 'freelancer';
  taxTreaty?: string;
  currency: string;
  exchangeRateSource: string;
  complianceRequirements: string[];
  status: 'active' | 'pending_setup' | 'suspended';
  monthlyGross: number;
  exemptions: TaxExemption[];
}

interface TaxExemption {
  id: string;
  type: 'treaty' | 'totalization' | 'foreign_earned_income';
  amount?: number;
  percentage?: number;
  validFrom: string;
  validTo?: string;
  documentation: string[];
  description: string;
}

// Mock data
const mockInternationalConfigs: InternationalPayrollConfig[] = [
  {
    id: '1',
    employeeId: 'emp-003',
    employeeName: 'Alessandro Rossi',
    payrollCountry: 'IT',
    contractorType: 'contractor',
    taxTreaty: 'US-Italy',
    currency: 'EUR',
    exchangeRateSource: 'ECB',
    complianceRequirements: ['VAT Registration', 'INPS Reporting', 'GDPR Compliance'],
    status: 'active',
    monthlyGross: 5000,
    exemptions: [
      {
        id: '1',
        type: 'treaty',
        percentage: 25,
        validFrom: '2024-01-01',
        documentation: ['Treaty Certificate', 'Tax Residency'],
        description: 'US-Italy tax treaty exemption'
      }
    ]
  },
  {
    id: '2',
    employeeId: 'emp-004',
    employeeName: 'Sophie Martin',
    payrollCountry: 'CA',
    contractorType: 'employee',
    currency: 'CAD',
    exchangeRateSource: 'Bank of Canada',
    complianceRequirements: ['CRA Reporting', 'EI Contributions', 'CPP Contributions'],
    status: 'active',
    monthlyGross: 6500,
    exemptions: []
  },
  {
    id: '3',
    employeeId: 'emp-005',
    employeeName: 'Hiroshi Tanaka',
    payrollCountry: 'JP',
    contractorType: 'freelancer',
    taxTreaty: 'US-Japan',
    currency: 'JPY',
    exchangeRateSource: 'BOJ',
    complianceRequirements: ['NTA Registration', 'Social Insurance', 'Income Tax Withholding'],
    status: 'pending_setup',
    monthlyGross: 480000,
    exemptions: []
  }
];

const COUNTRIES = [
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'IT', name: 'Italy', currency: 'EUR' },
  { code: 'ES', name: 'Spain', currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'HK', name: 'Hong Kong', currency: 'HKD' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'MX', name: 'Mexico', currency: 'MXN' },
  { code: 'BR', name: 'Brazil', currency: 'BRL' }
];

const TAX_TREATIES = [
  'US-Canada', 'US-UK', 'US-Germany', 'US-France', 'US-Italy', 'US-Spain',
  'US-Netherlands', 'US-Australia', 'US-Japan', 'US-Singapore', 'US-India', 'US-Mexico'
];

export const GlobalContractorCompliance: React.FC = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<InternationalPayrollConfig[]>(mockInternationalConfigs);
  const [selectedConfig, setSelectedConfig] = useState<InternationalPayrollConfig | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConfig, setNewConfig] = useState<Partial<InternationalPayrollConfig>>({
    employeeName: '',
    payrollCountry: '',
    contractorType: 'contractor',
    currency: '',
    exchangeRateSource: '',
    complianceRequirements: [],
    status: 'pending_setup',
    monthlyGross: 0,
    exemptions: []
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending_setup': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContractorTypeColor = (type: string) => {
    switch (type) {
      case 'employee': return 'bg-blue-100 text-blue-800';
      case 'contractor': return 'bg-purple-100 text-purple-800';
      case 'freelancer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCountryName = (code: string) => {
    return COUNTRIES.find(c => c.code === code)?.name || code;
  };

  const getCurrencyForCountry = (countryCode: string) => {
    return COUNTRIES.find(c => c.code === countryCode)?.currency || 'USD';
  };

  const handleSaveConfig = () => {
    const config: InternationalPayrollConfig = {
      ...newConfig as InternationalPayrollConfig,
      id: Date.now().toString(),
      employeeId: `emp-${Date.now()}`,
      exemptions: []
    };

    setConfigs([...configs, config]);
    setNewConfig({
      employeeName: '',
      payrollCountry: '',
      contractorType: 'contractor',
      currency: '',
      exchangeRateSource: '',
      complianceRequirements: [],
      status: 'pending_setup',
      monthlyGross: 0,
      exemptions: []
    });
    setShowAddForm(false);

    toast({
      title: "Configuration Created",
      description: "New international payroll configuration has been created."
    });
  };

  const handleDeleteConfig = (id: string) => {
    setConfigs(configs.filter(c => c.id !== id));
    if (selectedConfig?.id === id) {
      setSelectedConfig(null);
    }
    
    toast({
      title: "Configuration Deleted",
      description: "International payroll configuration has been deleted."
    });
  };

  const activeCount = configs.filter(c => c.status === 'active').length;
  const pendingCount = configs.filter(c => c.status === 'pending_setup').length;
  const totalGross = configs.reduce((sum, c) => sum + c.monthlyGross, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Global Workers</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Setup</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Countries</p>
                <p className="text-2xl font-bold">
                  {new Set(configs.map(c => c.payrollCountry)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Gross</p>
                <p className="text-2xl font-bold">${totalGross.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Contractor Management
          </CardTitle>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Global Worker
          </Button>
        </CardHeader>
      </Card>

      {/* Add New Configuration Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Global Worker Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employeeName">Worker Name</Label>
                <Input
                  value={newConfig.employeeName || ''}
                  onChange={(e) => setNewConfig({...newConfig, employeeName: e.target.value})}
                  placeholder="Full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contractorType">Worker Type</Label>
                <Select 
                  value={newConfig.contractorType} 
                  onValueChange={(value: any) => setNewConfig({...newConfig, contractorType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="payrollCountry">Country</Label>
                <Select 
                  value={newConfig.payrollCountry} 
                  onValueChange={(value) => {
                    const currency = getCurrencyForCountry(value);
                    setNewConfig({...newConfig, payrollCountry: value, currency});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  value={newConfig.currency || ''}
                  onChange={(e) => setNewConfig({...newConfig, currency: e.target.value})}
                  placeholder="USD"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthlyGross">Monthly Gross</Label>
                <Input
                  type="number"
                  value={newConfig.monthlyGross || ''}
                  onChange={(e) => setNewConfig({...newConfig, monthlyGross: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxTreaty">Tax Treaty (Optional)</Label>
                <Select 
                  value={newConfig.taxTreaty || ''} 
                  onValueChange={(value) => setNewConfig({...newConfig, taxTreaty: value === 'none' ? undefined : value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select treaty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No treaty</SelectItem>
                    {TAX_TREATIES.map(treaty => (
                      <SelectItem key={treaty} value={treaty}>{treaty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exchangeRateSource">Exchange Rate Source</Label>
                <Input
                  value={newConfig.exchangeRateSource || ''}
                  onChange={(e) => setNewConfig({...newConfig, exchangeRateSource: e.target.value})}
                  placeholder="e.g., ECB, Bank of Canada"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complianceRequirements">Compliance Requirements</Label>
              <Textarea
                placeholder="Enter compliance requirements separated by commas"
                value={newConfig.complianceRequirements?.join(', ') || ''}
                onChange={(e) => setNewConfig({
                  ...newConfig, 
                  complianceRequirements: e.target.value.split(',').map(r => r.trim()).filter(r => r)
                })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveConfig}>
                Create Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configurations List */}
      <div className="grid gap-4">
        {configs.map((config) => (
          <Card 
            key={config.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedConfig?.id === config.id ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setSelectedConfig(config)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{config.employeeName}</h3>
                    <Badge className={getStatusColor(config.status)}>
                      {config.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={getContractorTypeColor(config.contractorType)}>
                      {config.contractorType.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{getCountryName(config.payrollCountry)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      <span>{config.currency} {config.monthlyGross.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{config.complianceRequirements.length} requirements</span>
                    </div>
                    {config.taxTreaty && (
                      <div>
                        Treaty: {config.taxTreaty}
                      </div>
                    )}
                  </div>
                  
                  {config.exemptions.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm text-muted-foreground">Tax Exemptions:</div>
                      <div className="flex gap-2 mt-1">
                        {config.exemptions.map(exemption => (
                          <Badge key={exemption.id} variant="outline">
                            {exemption.type} {exemption.percentage && `(${exemption.percentage}%)`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConfig(config.id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {configs.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No global workers configured</p>
              <p className="text-sm">Add your first international employee or contractor</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Configuration Details */}
      {selectedConfig && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Configuration Details: {selectedConfig.employeeName}</CardTitle>
            <Button variant="outline" onClick={() => setSelectedConfig(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Worker Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Type:</span> {selectedConfig.contractorType}</div>
                  <div><span className="text-muted-foreground">Country:</span> {getCountryName(selectedConfig.payrollCountry)}</div>
                  <div><span className="text-muted-foreground">Currency:</span> {selectedConfig.currency}</div>
                  <div><span className="text-muted-foreground">Monthly Gross:</span> {selectedConfig.currency} {selectedConfig.monthlyGross.toLocaleString()}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Compliance & Tax</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Status:</span> {selectedConfig.status}</div>
                  {selectedConfig.taxTreaty && (
                    <div><span className="text-muted-foreground">Tax Treaty:</span> {selectedConfig.taxTreaty}</div>
                  )}
                  <div><span className="text-muted-foreground">Exchange Rate:</span> {selectedConfig.exchangeRateSource}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Compliance Requirements</h4>
              <div className="flex flex-wrap gap-2">
                {selectedConfig.complianceRequirements.map((requirement, index) => (
                  <Badge key={index} variant="outline">{requirement}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};