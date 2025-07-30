import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  FileCheck, 
  Plus, 
  Edit, 
  Trash2, 
  User,
  Calendar,
  FileText,
  Percent,
  DollarSign,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaxExemption {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'treaty' | 'totalization' | 'foreign_earned_income';
  treatyName?: string;
  amount?: number;
  percentage?: number;
  validFrom: string;
  validTo?: string;
  documentation: string[];
  description: string;
  status: 'active' | 'pending_review' | 'expired';
  appliedToCountries: string[];
  isActive: boolean;
}

interface TreatyTemplate {
  name: string;
  countries: string[];
  exemptionTypes: string[];
  standardPercentage?: number;
  description: string;
}

// Mock data
const mockExemptions: TaxExemption[] = [
  {
    id: '1',
    employeeId: 'emp-003',
    employeeName: 'Alessandro Rossi',
    type: 'treaty',
    treatyName: 'US-Italy Tax Treaty',
    percentage: 25,
    validFrom: '2024-01-01',
    validTo: '2025-12-31',
    documentation: ['Treaty Certificate', 'Tax Residency Certificate', 'Form 8833'],
    description: 'Income tax exemption under US-Italy bilateral tax treaty',
    status: 'active',
    appliedToCountries: ['US', 'IT'],
    isActive: true
  },
  {
    id: '2',
    employeeId: 'emp-005',
    employeeName: 'Hiroshi Tanaka',
    type: 'totalization',
    treatyName: 'US-Japan Totalization Agreement',
    validFrom: '2024-01-01',
    documentation: ['Certificate of Coverage', 'Social Security Statement'],
    description: 'Social security totalization exemption',
    status: 'pending_review',
    appliedToCountries: ['US', 'JP'],
    isActive: false
  },
  {
    id: '3',
    employeeId: 'emp-004',
    employeeName: 'Sophie Martin',
    type: 'foreign_earned_income',
    amount: 120000,
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    documentation: ['Form 2555', 'Physical Presence Test'],
    description: 'Foreign Earned Income Exclusion for US citizen working abroad',
    status: 'active',
    appliedToCountries: ['CA'],
    isActive: true
  }
];

const TREATY_TEMPLATES: TreatyTemplate[] = [
  {
    name: 'US-Canada Tax Treaty',
    countries: ['US', 'CA'],
    exemptionTypes: ['Income Tax', 'Withholding Tax'],
    standardPercentage: 15,
    description: 'Comprehensive tax treaty covering income and withholding taxes'
  },
  {
    name: 'US-UK Tax Treaty',
    countries: ['US', 'GB'],
    exemptionTypes: ['Income Tax', 'Capital Gains'],
    standardPercentage: 20,
    description: 'Bilateral tax treaty with special provisions for pension income'
  },
  {
    name: 'US-Germany Tax Treaty',
    countries: ['US', 'DE'],
    exemptionTypes: ['Income Tax', 'Business Profits'],
    standardPercentage: 5,
    description: 'Modern tax treaty with anti-avoidance provisions'
  },
  {
    name: 'US-Japan Totalization Agreement',
    countries: ['US', 'JP'],
    exemptionTypes: ['Social Security'],
    description: 'Agreement to avoid double social security taxation'
  }
];

const EXEMPTION_TYPES = [
  { value: 'treaty', label: 'Tax Treaty Exemption' },
  { value: 'totalization', label: 'Totalization Agreement' },
  { value: 'foreign_earned_income', label: 'Foreign Earned Income Exclusion' }
];

export const TreatyExemptions: React.FC = () => {
  const { toast } = useToast();
  const [exemptions, setExemptions] = useState<TaxExemption[]>(mockExemptions);
  const [selectedExemption, setSelectedExemption] = useState<TaxExemption | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExemption, setNewExemption] = useState<Partial<TaxExemption>>({
    employeeName: '',
    type: 'treaty',
    validFrom: new Date().toISOString().split('T')[0],
    documentation: [],
    description: '',
    status: 'pending_review',
    appliedToCountries: [],
    isActive: false
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'treaty': return 'bg-blue-100 text-blue-800';
      case 'totalization': return 'bg-purple-100 text-purple-800';
      case 'foreign_earned_income': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveExemption = () => {
    const exemption: TaxExemption = {
      ...newExemption as TaxExemption,
      id: Date.now().toString(),
      employeeId: `emp-${Date.now()}`
    };

    setExemptions([...exemptions, exemption]);
    setNewExemption({
      employeeName: '',
      type: 'treaty',
      validFrom: new Date().toISOString().split('T')[0],
      documentation: [],
      description: '',
      status: 'pending_review',
      appliedToCountries: [],
      isActive: false
    });
    setShowAddForm(false);

    toast({
      title: "Exemption Created",
      description: "New tax exemption has been created and is pending review."
    });
  };

  const handleDeleteExemption = (id: string) => {
    setExemptions(exemptions.filter(e => e.id !== id));
    if (selectedExemption?.id === id) {
      setSelectedExemption(null);
    }
    
    toast({
      title: "Exemption Deleted",
      description: "Tax exemption has been deleted successfully."
    });
  };

  const toggleExemptionStatus = (id: string) => {
    setExemptions(exemptions.map(exemption => 
      exemption.id === id ? { ...exemption, isActive: !exemption.isActive } : exemption
    ));
  };

  const activeCount = exemptions.filter(e => e.status === 'active').length;
  const pendingCount = exemptions.filter(e => e.status === 'pending_review').length;
  const totalSavings = exemptions
    .filter(e => e.status === 'active')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Exemptions</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Treaty Types</p>
                <p className="text-2xl font-bold">
                  {new Set(exemptions.map(e => e.type)).size}
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
                <p className="text-sm text-muted-foreground">Annual Savings</p>
                <p className="text-2xl font-bold">${totalSavings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Tax Treaty & Exemption Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Treaties
            </Button>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Exemption
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Treaty Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Treaty Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {TREATY_TEMPLATES.map((template, index) => (
              <Card key={index} className="border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Countries: {template.countries.join(', ')}</span>
                    {template.standardPercentage && (
                      <span className="font-medium">{template.standardPercentage}% standard rate</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Exemption Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Tax Exemption</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employeeName">Employee Name</Label>
                <Input
                  value={newExemption.employeeName || ''}
                  onChange={(e) => setNewExemption({...newExemption, employeeName: e.target.value})}
                  placeholder="Full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Exemption Type</Label>
                <Select 
                  value={newExemption.type} 
                  onValueChange={(value: any) => setNewExemption({...newExemption, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXEMPTION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newExemption.type === 'treaty' && (
              <div className="space-y-2">
                <Label htmlFor="treatyName">Treaty Name</Label>
                <Select 
                  value={newExemption.treatyName || ''} 
                  onValueChange={(value) => setNewExemption({...newExemption, treatyName: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select treaty" />
                  </SelectTrigger>
                  <SelectContent>
                    {TREATY_TEMPLATES.map(template => (
                      <SelectItem key={template.name} value={template.name}>{template.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  type="date"
                  value={newExemption.validFrom || ''}
                  onChange={(e) => setNewExemption({...newExemption, validFrom: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="validTo">Valid To (Optional)</Label>
                <Input
                  type="date"
                  value={newExemption.validTo || ''}
                  onChange={(e) => setNewExemption({...newExemption, validTo: e.target.value})}
                />
              </div>
              
              {newExemption.type !== 'totalization' && (
                <div className="space-y-2">
                  <Label htmlFor="exemptionValue">
                    {newExemption.type === 'foreign_earned_income' ? 'Amount ($)' : 'Percentage (%)'}
                  </Label>
                  <Input
                    type="number"
                    value={newExemption.type === 'foreign_earned_income' ? newExemption.amount || '' : newExemption.percentage || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (newExemption.type === 'foreign_earned_income') {
                        setNewExemption({...newExemption, amount: value});
                      } else {
                        setNewExemption({...newExemption, percentage: value});
                      }
                    }}
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={newExemption.description || ''}
                onChange={(e) => setNewExemption({...newExemption, description: e.target.value})}
                placeholder="Describe the exemption and its terms..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appliedToCountries">Applied to Countries</Label>
              <Input
                value={newExemption.appliedToCountries?.join(', ') || ''}
                onChange={(e) => setNewExemption({
                  ...newExemption, 
                  appliedToCountries: e.target.value.split(',').map(c => c.trim().toUpperCase()).filter(c => c)
                })}
                placeholder="US, CA, GB (country codes)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentation">Documentation Required</Label>
              <Textarea
                value={newExemption.documentation?.join(', ') || ''}
                onChange={(e) => setNewExemption({
                  ...newExemption, 
                  documentation: e.target.value.split(',').map(d => d.trim()).filter(d => d)
                })}
                placeholder="Enter required documents separated by commas"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveExemption}>
                Create Exemption
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exemptions List */}
      <div className="space-y-4">
        {exemptions.map((exemption) => (
          <Card 
            key={exemption.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedExemption?.id === exemption.id ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setSelectedExemption(exemption)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{exemption.employeeName}</h3>
                    <Badge className={getStatusColor(exemption.status)}>
                      {exemption.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={getTypeColor(exemption.type)}>
                      {EXEMPTION_TYPES.find(t => t.value === exemption.type)?.label}
                    </Badge>
                    {exemption.treatyName && (
                      <Badge variant="outline">{exemption.treatyName}</Badge>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3">{exemption.description}</p>
                  
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>From {exemption.validFrom}</span>
                    </div>
                    {exemption.validTo && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>To {exemption.validTo}</span>
                      </div>
                    )}
                    {exemption.percentage && (
                      <div className="flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        <span>{exemption.percentage}%</span>
                      </div>
                    )}
                    {exemption.amount && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${exemption.amount.toLocaleString()}</span>
                      </div>
                    )}
                    <div>
                      Countries: {exemption.appliedToCountries.join(', ')}
                    </div>
                  </div>
                  
                  {exemption.documentation.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm text-muted-foreground">Required Documentation:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exemption.documentation.map((doc, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{doc}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={exemption.isActive}
                    onCheckedChange={() => toggleExemptionStatus(exemption.id)}
                  />
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteExemption(exemption.id);
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
        
        {exemptions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tax exemptions configured</p>
              <p className="text-sm">Add your first treaty exemption or tax exclusion</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Exemption Details */}
      {selectedExemption && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Exemption Details: {selectedExemption.employeeName}</CardTitle>
            <Button variant="outline" onClick={() => setSelectedExemption(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Exemption Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Type:</span> {EXEMPTION_TYPES.find(t => t.value === selectedExemption.type)?.label}</div>
                  {selectedExemption.treatyName && (
                    <div><span className="text-muted-foreground">Treaty:</span> {selectedExemption.treatyName}</div>
                  )}
                  <div><span className="text-muted-foreground">Status:</span> {selectedExemption.status}</div>
                  <div><span className="text-muted-foreground">Active:</span> {selectedExemption.isActive ? 'Yes' : 'No'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Validity & Value</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Valid From:</span> {selectedExemption.validFrom}</div>
                  {selectedExemption.validTo && (
                    <div><span className="text-muted-foreground">Valid To:</span> {selectedExemption.validTo}</div>
                  )}
                  {selectedExemption.percentage && (
                    <div><span className="text-muted-foreground">Percentage:</span> {selectedExemption.percentage}%</div>
                  )}
                  {selectedExemption.amount && (
                    <div><span className="text-muted-foreground">Amount:</span> ${selectedExemption.amount.toLocaleString()}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{selectedExemption.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Applied Countries</h4>
              <div className="flex flex-wrap gap-2">
                {selectedExemption.appliedToCountries.map((country, index) => (
                  <Badge key={index} variant="outline">{country}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Required Documentation</h4>
              <div className="flex flex-wrap gap-2">
                {selectedExemption.documentation.map((doc, index) => (
                  <Badge key={index} variant="outline">{doc}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};