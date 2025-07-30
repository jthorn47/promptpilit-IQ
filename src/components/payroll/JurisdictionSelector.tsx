import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  MapPin, 
  Flag, 
  Building,
  Trash2,
  Edit,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Jurisdiction {
  id: string;
  code: string;
  name: string;
  type: 'state' | 'province' | 'country';
  taxRate: number;
  nexusThreshold: number;
  isActive: boolean;
  employeeCount: number;
  withholdingRequired: boolean;
  filingFrequency: 'monthly' | 'quarterly' | 'annually';
  lastFiling?: string;
  nextDue?: string;
}

const US_STATES: Jurisdiction[] = [
  {
    id: '1',
    code: 'CA',
    name: 'California',
    type: 'state',
    taxRate: 13.3,
    nexusThreshold: 50000,
    isActive: true,
    employeeCount: 25,
    withholdingRequired: true,
    filingFrequency: 'quarterly',
    lastFiling: '2024-01-15',
    nextDue: '2024-04-15'
  },
  {
    id: '2',
    code: 'NY',
    name: 'New York',
    type: 'state',
    taxRate: 10.9,
    nexusThreshold: 50000,
    isActive: true,
    employeeCount: 18,
    withholdingRequired: true,
    filingFrequency: 'quarterly'
  },
  {
    id: '3',
    code: 'TX',
    name: 'Texas',
    type: 'state',
    taxRate: 0,
    nexusThreshold: 0,
    isActive: true,
    employeeCount: 12,
    withholdingRequired: false,
    filingFrequency: 'annually'
  }
];

const CANADA_PROVINCES: Jurisdiction[] = [
  {
    id: '4',
    code: 'ON',
    name: 'Ontario',
    type: 'province',
    taxRate: 13.16,
    nexusThreshold: 30000,
    isActive: false,
    employeeCount: 0,
    withholdingRequired: true,
    filingFrequency: 'monthly'
  },
  {
    id: '5',
    code: 'BC',
    name: 'British Columbia',
    type: 'province',
    taxRate: 20.5,
    nexusThreshold: 30000,
    isActive: false,
    employeeCount: 0,
    withholdingRequired: true,
    filingFrequency: 'monthly'
  }
];

const EU_COUNTRIES: Jurisdiction[] = [
  {
    id: '6',
    code: 'DE',
    name: 'Germany',
    type: 'country',
    taxRate: 45,
    nexusThreshold: 0,
    isActive: false,
    employeeCount: 0,
    withholdingRequired: true,
    filingFrequency: 'monthly'
  },
  {
    id: '7',
    code: 'GB',
    name: 'United Kingdom',
    type: 'country',
    taxRate: 45,
    nexusThreshold: 0,
    isActive: false,
    employeeCount: 0,
    withholdingRequired: true,
    filingFrequency: 'monthly'
  }
];

export const JurisdictionSelector: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('us-states');
  const [searchTerm, setSearchTerm] = useState('');
  const [jurisdictions, setJurisdictions] = useState({
    'us-states': US_STATES,
    'canada': CANADA_PROVINCES,
    'eu': EU_COUNTRIES
  });

  const toggleJurisdiction = (jurisdictionId: string, tabKey: string) => {
    setJurisdictions(prev => ({
      ...prev,
      [tabKey]: prev[tabKey as keyof typeof prev].map(j => 
        j.id === jurisdictionId ? { ...j, isActive: !j.isActive } : j
      )
    }));

    const jurisdiction = jurisdictions[tabKey as keyof typeof jurisdictions].find(j => j.id === jurisdictionId);
    toast({
      title: jurisdiction?.isActive ? "Jurisdiction Deactivated" : "Jurisdiction Activated",
      description: `${jurisdiction?.name} has been ${jurisdiction?.isActive ? 'deactivated' : 'activated'} for tax processing.`
    });
  };

  const getStatusColor = (jurisdiction: Jurisdiction) => {
    if (!jurisdiction.isActive) return 'secondary';
    if (jurisdiction.withholdingRequired) return 'default';
    return 'outline';
  };

  const getComplianceStatus = (jurisdiction: Jurisdiction) => {
    if (!jurisdiction.isActive) return null;
    if (jurisdiction.nexusThreshold > 0 && jurisdiction.employeeCount === 0) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const filterJurisdictions = (jurisdictionList: Jurisdiction[]) => {
    if (!searchTerm) return jurisdictionList;
    return jurisdictionList.filter(j => 
      j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderJurisdictionCard = (jurisdiction: Jurisdiction, tabKey: string) => (
    <Card key={jurisdiction.id} className={`border-2 transition-all ${
      jurisdiction.isActive ? 'border-primary bg-primary/5' : 'border-border'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{jurisdiction.name}</h3>
              <Badge variant="outline">{jurisdiction.code}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getComplianceStatus(jurisdiction)}
            <Button
              variant={jurisdiction.isActive ? "destructive" : "default"}
              size="sm"
              onClick={() => toggleJurisdiction(jurisdiction.id, tabKey)}
            >
              {jurisdiction.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax Rate:</span>
              <span className="font-medium">{jurisdiction.taxRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nexus Threshold:</span>
              <span className="font-medium">
                {jurisdiction.nexusThreshold > 0 
                  ? `$${jurisdiction.nexusThreshold.toLocaleString()}`
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Employees:</span>
              <span className="font-medium">{jurisdiction.employeeCount}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Withholding:</span>
              <Badge variant={jurisdiction.withholdingRequired ? 'default' : 'secondary'}>
                {jurisdiction.withholdingRequired ? 'Required' : 'Not Required'}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Filing:</span>
              <span className="font-medium capitalize">{jurisdiction.filingFrequency}</span>
            </div>
            {jurisdiction.nextDue && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next Due:</span>
                <span className="font-medium text-orange-600">{jurisdiction.nextDue}</span>
              </div>
            )}
          </div>
        </div>

        {jurisdiction.isActive && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <Badge variant={getStatusColor(jurisdiction)}>
                {jurisdiction.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Building className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Jurisdiction Management</h2>
          <p className="text-muted-foreground">
            Configure tax jurisdictions for multi-state and international payroll
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Custom Jurisdiction
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jurisdictions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Jurisdiction Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="us-states" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            U.S. States
          </TabsTrigger>
          <TabsTrigger value="canada" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Canada
          </TabsTrigger>
          <TabsTrigger value="eu" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            EU/International
          </TabsTrigger>
        </TabsList>

        <TabsContent value="us-states" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filterJurisdictions(jurisdictions['us-states']).map(jurisdiction => 
              renderJurisdictionCard(jurisdiction, 'us-states')
            )}
          </div>
        </TabsContent>

        <TabsContent value="canada" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filterJurisdictions(jurisdictions.canada).map(jurisdiction => 
              renderJurisdictionCard(jurisdiction, 'canada')
            )}
          </div>
        </TabsContent>

        <TabsContent value="eu" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filterJurisdictions(jurisdictions.eu).map(jurisdiction => 
              renderJurisdictionCard(jurisdiction, 'eu')
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Active Jurisdictions Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {Object.values(jurisdictions).flat().filter(j => j.isActive).length}
              </p>
              <p className="text-sm text-muted-foreground">Total Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Object.values(jurisdictions).flat().filter(j => j.isActive && j.withholdingRequired).length}
              </p>
              <p className="text-sm text-muted-foreground">Withholding Required</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Object.values(jurisdictions).flat().reduce((sum, j) => j.isActive ? sum + j.employeeCount : sum, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {Object.values(jurisdictions).flat().filter(j => j.isActive && j.nextDue).length}
              </p>
              <p className="text-sm text-muted-foreground">Upcoming Filings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};