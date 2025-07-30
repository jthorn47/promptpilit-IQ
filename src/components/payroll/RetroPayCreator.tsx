import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Calculator, 
  Eye, 
  Save, 
  Play,
  User,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RetroPayAdjustment {
  id: string;
  employeeId: string;
  employeeName: string;
  payType: string;
  hours?: number;
  amount: number;
  description: string;
}

interface RetroPayCreatorProps {
  onClose: () => void;
}

export const RetroPayCreator: React.FC<RetroPayCreatorProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [runDetails, setRunDetails] = useState({
    name: '',
    reason: '',
    reasonDetails: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    processDate: new Date().toISOString().split('T')[0]
  });
  
  const [adjustments, setAdjustments] = useState<RetroPayAdjustment[]>([]);
  const [showTaxPreview, setShowTaxPreview] = useState(false);
  const [step, setStep] = useState(1);

  const addAdjustment = () => {
    const newAdjustment: RetroPayAdjustment = {
      id: Date.now().toString(),
      employeeId: '',
      employeeName: '',
      payType: '',
      amount: 0,
      description: ''
    };
    setAdjustments([...adjustments, newAdjustment]);
  };

  const removeAdjustment = (id: string) => {
    setAdjustments(adjustments.filter(adj => adj.id !== id));
  };

  const updateAdjustment = (id: string, field: keyof RetroPayAdjustment, value: any) => {
    setAdjustments(adjustments.map(adj => 
      adj.id === id ? { ...adj, [field]: value } : adj
    ));
  };

  const totalAmount = adjustments.reduce((sum, adj) => sum + adj.amount, 0);

  const handlePreview = () => {
    if (adjustments.length === 0) {
      toast({
        title: "No Adjustments",
        description: "Please add at least one adjustment before previewing.",
        variant: "destructive"
      });
      return;
    }
    setShowTaxPreview(true);
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Off-cycle run saved as draft. You can return to complete it later."
    });
    onClose();
  };

  const handleProcessRun = () => {
    toast({
      title: "Processing Off-Cycle Run",
      description: "Tax calculations complete. NACHA file generated successfully."
    });
    onClose();
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onClose} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Off-Cycle Run</h1>
            <p className="text-muted-foreground">
              Set up retroactive payments, bonuses, and corrections
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">Step {step} of 3</Badge>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2 ${step >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
            1
          </div>
          <span className="font-medium">Setup</span>
        </div>
        <div className="flex-1 h-0.5 bg-muted mx-4"></div>
        <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2 ${step >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
            2
          </div>
          <span className="font-medium">Adjustments</span>
        </div>
        <div className="flex-1 h-0.5 bg-muted mx-4"></div>
        <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2 ${step >= 3 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
            3
          </div>
          <span className="font-medium">Review</span>
        </div>
      </div>

      {/* Step 1: Run Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Run Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Run Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Q4 Bonus Run, Overtime Correction"
                  value={runDetails.name}
                  onChange={(e) => setRunDetails({...runDetails, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Select value={runDetails.reason} onValueChange={(value) => setRunDetails({...runDetails, reason: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bonus">Bonus Payment</SelectItem>
                    <SelectItem value="missed_hours">Missed Hours</SelectItem>
                    <SelectItem value="correction">Payroll Correction</SelectItem>
                    <SelectItem value="overtime_adjustment">Overtime Adjustment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reasonDetails">Description</Label>
              <Textarea
                id="reasonDetails"
                placeholder="Provide additional details about this off-cycle run..."
                value={runDetails.reasonDetails}
                onChange={(e) => setRunDetails({...runDetails, reasonDetails: e.target.value})}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="payPeriodStart">Pay Period Start</Label>
                <Input
                  id="payPeriodStart"
                  type="date"
                  value={runDetails.payPeriodStart}
                  onChange={(e) => setRunDetails({...runDetails, payPeriodStart: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payPeriodEnd">Pay Period End</Label>
                <Input
                  id="payPeriodEnd"
                  type="date"
                  value={runDetails.payPeriodEnd}
                  onChange={(e) => setRunDetails({...runDetails, payPeriodEnd: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="processDate">Process Date</Label>
                <Input
                  id="processDate"
                  type="date"
                  value={runDetails.processDate}
                  onChange={(e) => setRunDetails({...runDetails, processDate: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)}
                disabled={!runDetails.name || !runDetails.reason}
              >
                Next: Add Adjustments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Adjustments */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Employee Adjustments</CardTitle>
              <Button onClick={addAdjustment} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Adjustment
              </Button>
            </CardHeader>
            <CardContent>
              {adjustments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No adjustments added yet</p>
                  <p className="text-sm">Click "Add Adjustment" to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adjustments.map((adjustment, index) => (
                    <Card key={adjustment.id} className="border-dashed">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Adjustment #{index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAdjustment(adjustment.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-4">
                          <div className="space-y-2">
                            <Label>Employee</Label>
                            <Select 
                              value={adjustment.employeeId} 
                              onValueChange={(value) => {
                                updateAdjustment(adjustment.id, 'employeeId', value);
                                // In real app, fetch employee name
                                updateAdjustment(adjustment.id, 'employeeName', 'John Doe');
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select employee" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="emp1">John Doe</SelectItem>
                                <SelectItem value="emp2">Jane Smith</SelectItem>
                                <SelectItem value="emp3">Mike Johnson</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Pay Type</Label>
                            <Select 
                              value={adjustment.payType} 
                              onValueChange={(value) => updateAdjustment(adjustment.id, 'payType', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="regular">Regular Hours</SelectItem>
                                <SelectItem value="overtime">Overtime</SelectItem>
                                <SelectItem value="bonus">Bonus</SelectItem>
                                <SelectItem value="commission">Commission</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {adjustment.payType === 'regular' || adjustment.payType === 'overtime' ? (
                            <div className="space-y-2">
                              <Label>Hours</Label>
                              <Input
                                type="number"
                                step="0.25"
                                placeholder="0.00"
                                value={adjustment.hours || ''}
                                onChange={(e) => updateAdjustment(adjustment.id, 'hours', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          ) : null}
                          
                          <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={adjustment.amount || ''}
                              onChange={(e) => updateAdjustment(adjustment.id, 'amount', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <Label>Description</Label>
                          <Input
                            placeholder="Description of this adjustment..."
                            value={adjustment.description}
                            onChange={(e) => updateAdjustment(adjustment.id, 'description', e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {adjustments.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="font-medium">Total Gross Amount:</span>
                  </div>
                  <div className="text-lg font-semibold">
                    ${totalAmount.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button 
              onClick={() => setStep(3)}
              disabled={adjustments.length === 0}
            >
              Next: Review & Process
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Tax Warning */}
          <Card className="border-warning bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-warning-foreground mb-2">
                    Tax Impact Review Required
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    This off-cycle run will affect tax withholdings and year-to-date calculations. 
                    Review the tax preview before processing.
                  </p>
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="taxPreview" 
                      checked={showTaxPreview}
                      onCheckedChange={setShowTaxPreview}
                    />
                    <Label htmlFor="taxPreview">Show tax calculations</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Run Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Run Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm text-muted-foreground">Run Name</Label>
                  <p className="font-medium">{runDetails.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Reason</Label>
                  <p className="font-medium">{runDetails.reason.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Pay Period</Label>
                  <p className="font-medium">
                    {runDetails.payPeriodStart} to {runDetails.payPeriodEnd}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Process Date</Label>
                  <p className="font-medium">{runDetails.processDate}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm text-muted-foreground">Affected Employees</Label>
                <p className="font-medium">{adjustments.length} employees</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Total Gross Amount</Label>
                <p className="text-lg font-semibold text-primary">${totalAmount.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tax Preview */}
          {showTaxPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Tax Impact Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Federal Tax</p>
                    <p className="text-lg font-semibold">$234.56</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">State Tax</p>
                    <p className="text-lg font-semibold">$89.12</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">FICA</p>
                    <p className="text-lg font-semibold">$76.50</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Net Amount:</span>
                  <span className="text-lg font-semibold">${(totalAmount - 400.18).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button onClick={handleProcessRun} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Process Run
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};