import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Settings, 
  Percent, 
  Calendar,
  Building,
  AlertTriangle,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaxRule {
  id: string;
  name: string;
  jurisdiction: string;
  ruleType: 'withholding' | 'nexus' | 'reciprocity' | 'exemption';
  isActive: boolean;
  taxRate: number;
  threshold?: number;
  effectiveDate: string;
  expirationDate?: string;
  conditions: TaxRuleCondition[];
  description: string;
}

interface TaxRuleCondition {
  id: string;
  type: 'employee_count' | 'payroll_amount' | 'work_days' | 'revenue';
  operator: 'greater_than' | 'less_than' | 'equal_to' | 'between';
  value: number;
  secondValue?: number;
  description: string;
}

const mockTaxRules: TaxRule[] = [
  {
    id: '1',
    name: 'California State Withholding',
    jurisdiction: 'CA',
    ruleType: 'withholding',
    isActive: true,
    taxRate: 13.3,
    effectiveDate: '2024-01-01',
    conditions: [
      {
        id: '1',
        type: 'payroll_amount',
        operator: 'greater_than',
        value: 1000,
        description: 'Annual payroll exceeds $1,000'
      }
    ],
    description: 'Standard California income tax withholding for resident employees'
  },
  {
    id: '2',
    name: 'New York Nexus Rule',
    jurisdiction: 'NY',
    ruleType: 'nexus',
    isActive: true,
    taxRate: 0,
    threshold: 50000,
    effectiveDate: '2024-01-01',
    conditions: [
      {
        id: '2',
        type: 'employee_count',
        operator: 'greater_than',
        value: 5,
        description: 'More than 5 employees in NY'
      }
    ],
    description: 'Nexus threshold for New York state tax obligations'
  }
];

export const TaxRulesModal: React.FC = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [rules, setRules] = useState<TaxRule[]>(mockTaxRules);
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null);
  const [newRule, setNewRule] = useState<Partial<TaxRule>>({
    name: '',
    jurisdiction: '',
    ruleType: 'withholding',
    isActive: true,
    taxRate: 0,
    effectiveDate: new Date().toISOString().split('T')[0],
    conditions: [],
    description: ''
  });

  const addCondition = () => {
    const condition: TaxRuleCondition = {
      id: Date.now().toString(),
      type: 'employee_count',
      operator: 'greater_than',
      value: 0,
      description: ''
    };
    
    setNewRule(prev => ({
      ...prev,
      conditions: [...(prev.conditions || []), condition]
    }));
  };

  const updateCondition = (conditionId: string, updates: Partial<TaxRuleCondition>) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions?.map(condition =>
        condition.id === conditionId ? { ...condition, ...updates } : condition
      ) || []
    }));
  };

  const removeCondition = (conditionId: string) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions?.filter(condition => condition.id !== conditionId) || []
    }));
  };

  const saveRule = () => {
    if (!newRule.name || !newRule.jurisdiction) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const rule: TaxRule = {
      id: editingRule?.id || Date.now().toString(),
      ...newRule as TaxRule
    };

    if (editingRule) {
      setRules(prev => prev.map(r => r.id === editingRule.id ? rule : r));
      toast({
        title: "Rule Updated",
        description: `Tax rule "${rule.name}" has been updated successfully.`
      });
    } else {
      setRules(prev => [...prev, rule]);
      toast({
        title: "Rule Created",
        description: `Tax rule "${rule.name}" has been created successfully.`
      });
    }

    setIsOpen(false);
    setEditingRule(null);
    setNewRule({
      name: '',
      jurisdiction: '',
      ruleType: 'withholding',
      isActive: true,
      taxRate: 0,
      effectiveDate: new Date().toISOString().split('T')[0],
      conditions: [],
      description: ''
    });
  };

  const editRule = (rule: TaxRule) => {
    setEditingRule(rule);
    setNewRule(rule);
    setIsOpen(true);
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'withholding': return 'default';
      case 'nexus': return 'secondary';
      case 'reciprocity': return 'outline';
      case 'exemption': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tax Rules Management</h2>
          <p className="text-muted-foreground">
            Configure automated tax calculation rules and thresholds
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Tax Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {editingRule ? 'Edit Tax Rule' : 'Create New Tax Rule'}
              </DialogTitle>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="conditions">Conditions</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ruleName">Rule Name *</Label>
                    <Input
                      id="ruleName"
                      value={newRule.name || ''}
                      onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                      placeholder="e.g., California State Withholding"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                    <Select 
                      value={newRule.jurisdiction} 
                      onValueChange={(value) => setNewRule({...newRule, jurisdiction: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select jurisdiction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="WA">Washington</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ruleType">Rule Type</Label>
                    <Select 
                      value={newRule.ruleType} 
                      onValueChange={(value) => setNewRule({...newRule, ruleType: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="withholding">Withholding</SelectItem>
                        <SelectItem value="nexus">Nexus</SelectItem>
                        <SelectItem value="reciprocity">Reciprocity</SelectItem>
                        <SelectItem value="exemption">Exemption</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={newRule.taxRate || ''}
                      onChange={(e) => setNewRule({...newRule, taxRate: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="effectiveDate">Effective Date</Label>
                    <Input
                      id="effectiveDate"
                      type="date"
                      value={newRule.effectiveDate || ''}
                      onChange={(e) => setNewRule({...newRule, effectiveDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={newRule.expirationDate || ''}
                      onChange={(e) => setNewRule({...newRule, expirationDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newRule.description || ''}
                    onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                    placeholder="Describe when and how this rule applies..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={newRule.isActive || false}
                    onCheckedChange={(checked) => setNewRule({...newRule, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Rule is active</Label>
                </div>
              </TabsContent>

              <TabsContent value="conditions" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Rule Conditions</h3>
                  <Button onClick={addCondition} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </div>

                {newRule.conditions?.map((condition, index) => (
                  <Card key={condition.id} className="border-dashed">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Condition {index + 1}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(condition.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Condition Type</Label>
                          <Select 
                            value={condition.type} 
                            onValueChange={(value) => updateCondition(condition.id, { type: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="employee_count">Employee Count</SelectItem>
                              <SelectItem value="payroll_amount">Payroll Amount</SelectItem>
                              <SelectItem value="work_days">Work Days</SelectItem>
                              <SelectItem value="revenue">Revenue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Operator</Label>
                          <Select 
                            value={condition.operator} 
                            onValueChange={(value) => updateCondition(condition.id, { operator: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="greater_than">Greater Than</SelectItem>
                              <SelectItem value="less_than">Less Than</SelectItem>
                              <SelectItem value="equal_to">Equal To</SelectItem>
                              <SelectItem value="between">Between</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Value</Label>
                          <Input
                            type="number"
                            value={condition.value}
                            onChange={(e) => updateCondition(condition.id, { value: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      {condition.operator === 'between' && (
                        <div className="space-y-2">
                          <Label>Second Value</Label>
                          <Input
                            type="number"
                            value={condition.secondValue || ''}
                            onChange={(e) => updateCondition(condition.id, { secondValue: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={condition.description}
                          onChange={(e) => updateCondition(condition.id, { description: e.target.value })}
                          placeholder="Describe this condition..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!newRule.conditions || newRule.conditions.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No conditions defined</p>
                    <p className="text-sm">Add conditions to control when this rule applies</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Advanced Settings</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Nexus Threshold ($)</Label>
                    <Input
                      id="threshold"
                      type="number"
                      min="0"
                      value={newRule.threshold || ''}
                      onChange={(e) => setNewRule({...newRule, threshold: parseFloat(e.target.value) || undefined})}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Integration Settings</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="autoApply" defaultChecked />
                        <Label htmlFor="autoApply">Auto-apply to new employees</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="notifyChanges" defaultChecked />
                        <Label htmlFor="notifyChanges">Notify on threshold changes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="auditTrail" defaultChecked />
                        <Label htmlFor="auditTrail">Include in audit trail</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveRule} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id} className={`border-l-4 ${
            rule.isActive ? 'border-l-green-500' : 'border-l-gray-300'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{rule.name}</h3>
                    <Badge variant={getRuleTypeColor(rule.ruleType)}>
                      {rule.ruleType}
                    </Badge>
                    <Badge variant="outline">{rule.jurisdiction}</Badge>
                    {!rule.isActive && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground mb-3">{rule.description}</p>
                  
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Percent className="h-4 w-4 text-primary" />
                      <span>Tax Rate: {rule.taxRate}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>Effective: {rule.effectiveDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-primary" />
                      <span>{rule.conditions.length} condition(s)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => editRule(rule)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
