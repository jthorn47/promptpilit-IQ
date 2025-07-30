import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  User,
  Calendar,
  Percent,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MultiStateTaxConfig {
  employeeId: string;
  employeeName: string;
  workStates: StateWorkLocation[];
  residenceState: string;
  reciprocityAgreements: string[];
  apportionmentMethod: 'convenience' | 'actual_work_days' | 'payroll_period';
}

interface StateWorkLocation {
  id: string;
  state: string;
  percentage: number;
  address: string;
  startDate: string;
  endDate?: string;
  city: string;
  isActive: boolean;
}

// Mock data
const mockEmployeeTaxConfigs: MultiStateTaxConfig[] = [
  {
    employeeId: 'emp-001',
    employeeName: 'John Doe',
    workStates: [
      {
        id: '1',
        state: 'CA',
        percentage: 60,
        address: '123 Main St',
        city: 'San Francisco',
        startDate: '2024-01-01',
        isActive: true
      },
      {
        id: '2',
        state: 'NY',
        percentage: 40,
        address: '456 Broadway',
        city: 'New York',
        startDate: '2024-01-01',
        isActive: true
      }
    ],
    residenceState: 'CA',
    reciprocityAgreements: ['CA-NY'],
    apportionmentMethod: 'actual_work_days'
  },
  {
    employeeId: 'emp-002',
    employeeName: 'Jane Smith',
    workStates: [
      {
        id: '3',
        state: 'TX',
        percentage: 100,
        address: '789 Oak Ave',
        city: 'Austin',
        startDate: '2024-01-01',
        isActive: true
      }
    ],
    residenceState: 'TX',
    reciprocityAgreements: [],
    apportionmentMethod: 'convenience'
  }
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const MultiStateManager: React.FC = () => {
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState<MultiStateTaxConfig | null>(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [configs, setConfigs] = useState<MultiStateTaxConfig[]>(mockEmployeeTaxConfigs);
  const [newLocation, setNewLocation] = useState<Partial<StateWorkLocation>>({
    state: '',
    percentage: 0,
    address: '',
    city: '',
    startDate: new Date().toISOString().split('T')[0],
    isActive: true
  });

  const addWorkLocation = () => {
    if (!selectedEmployee || !newLocation.state || !newLocation.percentage) return;

    const location: StateWorkLocation = {
      ...newLocation as StateWorkLocation,
      id: Date.now().toString()
    };

    const updatedConfigs = configs.map(config => 
      config.employeeId === selectedEmployee.employeeId
        ? { ...config, workStates: [...config.workStates, location] }
        : config
    );

    setConfigs(updatedConfigs);
    setSelectedEmployee(updatedConfigs.find(c => c.employeeId === selectedEmployee.employeeId) || null);
    setNewLocation({
      state: '',
      percentage: 0,
      address: '',
      city: '',
      startDate: new Date().toISOString().split('T')[0],
      isActive: true
    });
    setShowAddLocation(false);

    toast({
      title: "Work Location Added",
      description: "New work location has been added successfully."
    });
  };

  const removeWorkLocation = (locationId: string) => {
    if (!selectedEmployee) return;

    const updatedConfigs = configs.map(config => 
      config.employeeId === selectedEmployee.employeeId
        ? { ...config, workStates: config.workStates.filter(l => l.id !== locationId) }
        : config
    );

    setConfigs(updatedConfigs);
    setSelectedEmployee(updatedConfigs.find(c => c.employeeId === selectedEmployee.employeeId) || null);

    toast({
      title: "Work Location Removed",
      description: "Work location has been removed successfully."
    });
  };

  const getTotalPercentage = (workStates: StateWorkLocation[]) => {
    return workStates.reduce((sum, location) => sum + location.percentage, 0);
  };

  const getApportionmentLabel = (method: string) => {
    const labels = {
      'convenience': 'Convenience Rule',
      'actual_work_days': 'Actual Work Days',
      'payroll_period': 'Payroll Period'
    };
    return labels[method as keyof typeof labels] || method;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Multi-State Employees</p>
                <p className="text-2xl font-bold">{configs.filter(c => c.workStates.length > 1).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Jurisdictions</p>
                <p className="text-2xl font-bold">
                  {new Set(configs.flatMap(c => c.workStates.map(w => w.state))).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Needs Review</p>
                <p className="text-2xl font-bold text-orange-600">
                  {configs.filter(c => getTotalPercentage(c.workStates) !== 100).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {configs.map((config) => (
                <div
                  key={config.employeeId}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedEmployee?.employeeId === config.employeeId
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedEmployee(config)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{config.employeeName}</h3>
                    <Badge variant="outline">
                      {config.workStates.length} state{config.workStates.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Residence: {config.residenceState}
                  </div>
                  {getTotalPercentage(config.workStates) !== 100 && (
                    <div className="flex items-center gap-1 text-orange-600 text-xs mt-1">
                      <AlertTriangle className="h-3 w-3" />
                      Percentage mismatch ({getTotalPercentage(config.workStates)}%)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Employee Details */}
        <div className="lg:col-span-2">
          {selectedEmployee ? (
            <div className="space-y-6">
              {/* Employee Info */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{selectedEmployee.employeeName} - Tax Configuration</CardTitle>
                  <Button 
                    onClick={() => setShowAddLocation(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Location
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm text-muted-foreground">Residence State</Label>
                      <p className="font-medium">{selectedEmployee.residenceState}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Apportionment Method</Label>
                      <p className="font-medium">{getApportionmentLabel(selectedEmployee.apportionmentMethod)}</p>
                    </div>
                  </div>
                  
                  {selectedEmployee.reciprocityAgreements.length > 0 && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Reciprocity Agreements</Label>
                      <div className="flex gap-2 mt-1">
                        {selectedEmployee.reciprocityAgreements.map(agreement => (
                          <Badge key={agreement} variant="secondary">{agreement}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Work Locations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Work Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedEmployee.workStates.map((location) => (
                      <Card key={location.id} className="border-dashed">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium">{location.state}</h4>
                                <Badge variant="outline">
                                  {location.percentage}%
                                </Badge>
                                {location.isActive ? (
                                  <Badge variant="default">Active</Badge>
                                ) : (
                                  <Badge variant="secondary">Inactive</Badge>
                                )}
                              </div>
                              
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>{location.address}, {location.city}</div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Since {location.startDate}</span>
                                  {location.endDate && <span> - {location.endDate}</span>}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeWorkLocation(location.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {selectedEmployee.workStates.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No work locations configured</p>
                        <p className="text-sm">Add a work location to get started</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Percentage Summary */}
                  {selectedEmployee.workStates.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total Allocation:</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${
                            getTotalPercentage(selectedEmployee.workStates) === 100 
                              ? 'text-green-600' 
                              : 'text-orange-600'
                          }`}>
                            {getTotalPercentage(selectedEmployee.workStates)}%
                          </span>
                          {getTotalPercentage(selectedEmployee.workStates) !== 100 && (
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Add Location Form */}
              {showAddLocation && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Work Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Select 
                          value={newLocation.state} 
                          onValueChange={(value) => setNewLocation({...newLocation, state: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="percentage">Work Percentage</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={newLocation.percentage || ''}
                          onChange={(e) => setNewLocation({...newLocation, percentage: parseInt(e.target.value) || 0})}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          value={newLocation.city || ''}
                          onChange={(e) => setNewLocation({...newLocation, city: e.target.value})}
                          placeholder="City"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          type="date"
                          value={newLocation.startDate || ''}
                          onChange={(e) => setNewLocation({...newLocation, startDate: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        value={newLocation.address || ''}
                        onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                        placeholder="Street address"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddLocation(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addWorkLocation}>
                        Add Location
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an employee to view tax configuration</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};