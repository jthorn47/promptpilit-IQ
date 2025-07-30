import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Trash2, Plus, Shield, Check, ChevronsUpDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WorkersCompClassification {
  id: string;
  state: string;
  comp_code_id: string;
  comp_code?: string;
  comp_description?: string;
  employer_rate: number;
  easeworks_rate: number;
  employee_count: number;
  gross_wages: number;
  calculated_employer_premium: number;
  calculated_easeworks_premium: number;
}

interface WorkersCompResults {
  total_employer_premium: number;
  total_easeworks_premium: number;
  weighted_avg_employer_rate: number;
  weighted_avg_easeworks_rate: number;
  total_gross_wages: number;
  total_employees: number;
  classifications: WorkersCompClassification[];
}

interface WorkersCompClassificationManagerProps {
  onCalculationChange: (results: WorkersCompResults) => void;
  initialClassifications?: WorkersCompClassification[];
}

interface WorkerCompCode {
  id: string;
  code: string;
  description: string;
  base_rate: number;
  category: string;
  hazard_level: string;
}

export const WorkersCompClassificationManager: React.FC<WorkersCompClassificationManagerProps> = ({
  onCalculationChange,
  initialClassifications = []
}) => {
  const [classifications, setClassifications] = useState<WorkersCompClassification[]>(
    initialClassifications.length > 0 
      ? initialClassifications 
      : [{
          id: '1',
          state: '',
          comp_code_id: '',
          employer_rate: 0,
          easeworks_rate: 0,
          employee_count: 0,
          gross_wages: 0,
          calculated_employer_premium: 0,
          calculated_easeworks_premium: 0,
        }]
  );
  const [workerCompCodes, setWorkerCompCodes] = useState<WorkerCompCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Load workers comp codes on mount
  useEffect(() => {
    loadWorkerCompCodes();
  }, []);

  // Calculate results whenever classifications change
  useEffect(() => {
    const results = calculateResults();
    onCalculationChange(results);
  }, [classifications]);

  const loadWorkerCompCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('worker_comp_codes')
        .select('id, code, description, base_rate, category, hazard_level')
        .eq('is_active', true)
        .order('code');

      if (error) throw error;
      
      // Ensure descriptions are not null/empty
      const processedData = (data || []).map(code => ({
        ...code,
        description: code.description || `Classification ${code.code}`
      }));
      
      setWorkerCompCodes(processedData);
    } catch (error) {
      console.error('Error loading worker comp codes:', error);
      toast({
        title: 'Error loading worker comp codes',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateResults = (): WorkersCompResults => {
    const updatedClassifications = classifications.map(classification => {
      const employer_premium = (classification.gross_wages * classification.employer_rate) / 100;
      const easeworks_premium = (classification.gross_wages * classification.easeworks_rate) / 100;
      
      return {
        ...classification,
        calculated_employer_premium: employer_premium,
        calculated_easeworks_premium: easeworks_premium,
      };
    });

    const total_employer_premium = updatedClassifications.reduce((sum, c) => sum + c.calculated_employer_premium, 0);
    const total_easeworks_premium = updatedClassifications.reduce((sum, c) => sum + c.calculated_easeworks_premium, 0);
    const total_gross_wages = updatedClassifications.reduce((sum, c) => sum + c.gross_wages, 0);
    const total_employees = updatedClassifications.reduce((sum, c) => sum + c.employee_count, 0);

    const weighted_avg_employer_rate = total_gross_wages > 0 ? (total_employer_premium / total_gross_wages) * 100 : 0;
    const weighted_avg_easeworks_rate = total_gross_wages > 0 ? (total_easeworks_premium / total_gross_wages) * 100 : 0;

    return {
      total_employer_premium,
      total_easeworks_premium,
      weighted_avg_employer_rate,
      weighted_avg_easeworks_rate,
      total_gross_wages,
      total_employees,
      classifications: updatedClassifications,
    };
  };

  const addClassification = () => {
    const newClassification: WorkersCompClassification = {
      id: Date.now().toString(),
      state: '',
      comp_code_id: '',
      employer_rate: 0,
      easeworks_rate: 0,
      employee_count: 0,
      gross_wages: 0,
      calculated_employer_premium: 0,
      calculated_easeworks_premium: 0,
    };
    setClassifications(prev => [...prev, newClassification]);
  };

  const removeClassification = (id: string) => {
    if (classifications.length > 1) {
      setClassifications(prev => prev.filter(c => c.id !== id));
    }
  };

  const updateClassification = (id: string, field: keyof WorkersCompClassification, value: any) => {
    setClassifications(prev => prev.map(classification => {
      if (classification.id === id) {
        const updated = { ...classification, [field]: value };
        
        // If changing comp_code_id, update the related fields
        if (field === 'comp_code_id') {
          const selectedCode = workerCompCodes.find(code => code.id === value);
          if (selectedCode) {
            updated.comp_code = selectedCode.code;
            updated.comp_description = selectedCode.description || `Classification ${selectedCode.code}`;
            // Pre-populate Easeworks rate with a competitive rate (typically 10-20% below employer rate)
            if (updated.employer_rate > 0) {
              updated.easeworks_rate = Math.max(0.1, updated.employer_rate * 0.85);
            }
          }
        }
        
        return updated;
      }
      return classification;
    }));
  };

  const getSelectedCode = (compCodeId: string) => {
    return workerCompCodes.find(code => code.id === compCodeId);
  };

  const togglePopover = (classificationId: string, isOpen: boolean) => {
    setOpenPopovers(prev => ({ ...prev, [classificationId]: isOpen }));
  };

  const results = calculateResults();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Workers' Compensation Classifications
          </CardTitle>
          <CardDescription>
            Add multiple Workers' Comp class codes with their respective rates, employee counts, and gross wages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {classifications.map((classification, index) => {
            const selectedCode = getSelectedCode(classification.comp_code_id);
            
            return (
              <div key={classification.id} className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-sm">Classification {index + 1}</h4>
                  {classifications.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeClassification(classification.id)}
                      className="text-destructive hover:text-destructive h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-6 gap-3 items-end">
                  <div className="space-y-1">
                    <Label htmlFor={`state_${classification.id}`} className="text-xs font-medium whitespace-nowrap">State *</Label>
                    <Select
                      value={classification.state}
                      onValueChange={(value) => updateClassification(classification.id, 'state', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select" />
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

                  <div className="space-y-1">
                    <Label htmlFor={`comp_code_${classification.id}`} className="text-xs font-medium whitespace-nowrap">Code *</Label>
                    <div className="relative group">
                      <Popover 
                        open={openPopovers[classification.id] || false} 
                        onOpenChange={(isOpen) => togglePopover(classification.id, isOpen)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openPopovers[classification.id] || false}
                            className="w-full justify-between h-8 px-2 text-xs"
                          >
                            {selectedCode 
                              ? selectedCode.code
                              : "Select"
                            }
                            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Search by code or description..." 
                              className="h-9 text-xs" 
                            />
                            <CommandList>
                              <CommandEmpty>No classification code found.</CommandEmpty>
                              <CommandGroup>
                                {workerCompCodes.map((code) => (
                                  <CommandItem
                                    key={code.id}
                                    value={`${code.code} ${code.description}`}
                                    onSelect={() => {
                                      updateClassification(classification.id, 'comp_code_id', code.id);
                                      togglePopover(classification.id, false);
                                    }}
                                    className="flex items-start gap-3 p-3"
                                  >
                                    <Check
                                      className={`mt-1 h-4 w-4 ${
                                        classification.comp_code_id === code.id ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    <div className="flex flex-col space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-medium text-sm">{code.code}</span>
                                        <span className="text-sm">{code.description}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {code.category} • {code.hazard_level} Risk • Base Rate: {code.base_rate}%
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {selectedCode && (
                        <div className="absolute top-full left-0 z-10 mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-48">
                          <div className="font-medium">{selectedCode.description}</div>
                          <div>Category: {selectedCode.category}</div>
                          <div>Hazard: {selectedCode.hazard_level}</div>
                          <div>Base Rate: {selectedCode.base_rate}%</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`employer_rate_${classification.id}`} className="text-xs font-medium whitespace-nowrap">Current Rate (%)</Label>
                    <Input
                      id={`employer_rate_${classification.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      max="99.99"
                      value={classification.employer_rate || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const clampedValue = Math.min(Math.max(value, 0), 99.99);
                        updateClassification(classification.id, 'employer_rate', clampedValue);
                      }}
                      className="h-8 px-2 w-24 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`easeworks_rate_${classification.id}`} className="text-xs font-medium whitespace-nowrap">Easeworks Rate (%)</Label>
                    <Input
                      id={`easeworks_rate_${classification.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      max="99.99"
                      value={classification.easeworks_rate || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const clampedValue = Math.min(Math.max(value, 0), 99.99);
                        updateClassification(classification.id, 'easeworks_rate', clampedValue);
                      }}
                      className="h-8 px-2 w-24 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`employee_count_${classification.id}`} className="text-xs font-medium whitespace-nowrap"># of Employees</Label>
                    <Input
                      id={`employee_count_${classification.id}`}
                      type="number"
                      min="0"
                      max="9999"
                      value={classification.employee_count || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const clampedValue = Math.min(Math.max(value, 0), 9999);
                        updateClassification(classification.id, 'employee_count', clampedValue);
                      }}
                      className="h-8 px-2 w-20 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`gross_wages_${classification.id}`} className="text-xs font-medium whitespace-nowrap">Gross Wages</Label>
                    <Input
                      id={`gross_wages_${classification.id}`}
                      type="number"
                      value={classification.gross_wages || ''}
                      onChange={(e) => updateClassification(classification.id, 'gross_wages', parseFloat(e.target.value) || 0)}
                      className="h-8 px-2 w-28 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <Button 
            variant="outline" 
            onClick={addClassification}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Class Code
          </Button>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Workers' Compensation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Current vs. Proposed Costs</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Employer WC Premium:</span>
                  <span className="font-medium">{formatCurrency(results.total_employer_premium)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Easeworks WC Premium:</span>
                  <span className="font-medium text-green-600">{formatCurrency(results.total_easeworks_premium)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">WC Premium Savings:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(results.total_employer_premium - results.total_easeworks_premium)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Weighted Average Rates</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Current Weighted Avg Rate:</span>
                  <span className="font-medium">{results.weighted_avg_employer_rate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Easeworks Weighted Avg Rate:</span>
                  <span className="font-medium text-green-600">{results.weighted_avg_easeworks_rate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm">Total Employees:</span>
                  <span className="font-medium">{results.total_employees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Gross Wages:</span>
                  <span className="font-medium">{formatCurrency(results.total_gross_wages)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};