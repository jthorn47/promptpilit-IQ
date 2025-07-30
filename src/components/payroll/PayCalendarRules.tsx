import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayRule {
  id: string;
  name: string;
  frequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
  payDay: number; // Day of week (0-6) for weekly/bi-weekly, day of month for others
  cutoffDays: number;
  startDate: string;
  isActive: boolean;
  holidayHandling: 'before' | 'after' | 'skip';
  weekendHandling: 'before' | 'after';
}

const mockPayRules: PayRule[] = [
  {
    id: '1',
    name: 'Semi-Monthly Standard',
    frequency: 'semi-monthly',
    payDay: 15, // 15th and last day of month
    cutoffDays: 3,
    startDate: '2024-01-01',
    isActive: true,
    holidayHandling: 'before',
    weekendHandling: 'before'
  },
  {
    id: '2',
    name: 'Bi-Weekly Contract Workers',
    frequency: 'bi-weekly',
    payDay: 5, // Friday
    cutoffDays: 2,
    startDate: '2024-01-05',
    isActive: true,
    holidayHandling: 'after',
    weekendHandling: 'before'
  }
];

export const PayCalendarRules: React.FC = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<PayRule[]>(mockPayRules);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRule, setEditingRule] = useState<PayRule | null>(null);
  const [newRule, setNewRule] = useState<Partial<PayRule>>({
    name: '',
    frequency: 'semi-monthly',
    payDay: 15,
    cutoffDays: 3,
    startDate: new Date().toISOString().split('T')[0],
    isActive: true,
    holidayHandling: 'before',
    weekendHandling: 'before'
  });

  const handleSaveRule = () => {
    if (editingRule) {
      setRules(rules.map(rule => 
        rule.id === editingRule.id ? { ...editingRule } : rule
      ));
      setEditingRule(null);
      toast({
        title: "Rule Updated",
        description: "Pay rule has been updated successfully."
      });
    } else {
      const rule: PayRule = {
        ...newRule as PayRule,
        id: Date.now().toString()
      };
      setRules([...rules, rule]);
      setNewRule({
        name: '',
        frequency: 'semi-monthly',
        payDay: 15,
        cutoffDays: 3,
        startDate: new Date().toISOString().split('T')[0],
        isActive: true,
        holidayHandling: 'before',
        weekendHandling: 'before'
      });
      setShowAddForm(false);
      toast({
        title: "Rule Created",
        description: "New pay rule has been created successfully."
      });
    }
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast({
      title: "Rule Deleted",
      description: "Pay rule has been deleted successfully."
    });
  };

  const toggleRuleStatus = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      'weekly': 'Weekly',
      'bi-weekly': 'Bi-Weekly',
      'semi-monthly': 'Semi-Monthly',
      'monthly': 'Monthly'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const RuleForm = ({ rule, onChange }: { rule: Partial<PayRule>, onChange: (updates: Partial<PayRule>) => void }) => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Rule Name</Label>
          <Input
            id="name"
            value={rule.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g., Standard Bi-Weekly"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="frequency">Pay Frequency</Label>
          <Select 
            value={rule.frequency} 
            onValueChange={(value: any) => onChange({ frequency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
              <SelectItem value="semi-monthly">Semi-Monthly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="payDay">
            {rule.frequency === 'weekly' || rule.frequency === 'bi-weekly' 
              ? 'Pay Day (Week)' 
              : 'Pay Day (Month)'
            }
          </Label>
          {rule.frequency === 'weekly' || rule.frequency === 'bi-weekly' ? (
            <Select 
              value={rule.payDay?.toString()} 
              onValueChange={(value) => onChange({ payDay: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sunday</SelectItem>
                <SelectItem value="1">Monday</SelectItem>
                <SelectItem value="2">Tuesday</SelectItem>
                <SelectItem value="3">Wednesday</SelectItem>
                <SelectItem value="4">Thursday</SelectItem>
                <SelectItem value="5">Friday</SelectItem>
                <SelectItem value="6">Saturday</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              type="number"
              min="1"
              max={rule.frequency === 'semi-monthly' ? '15' : '31'}
              value={rule.payDay || ''}
              onChange={(e) => onChange({ payDay: parseInt(e.target.value) })}
            />
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cutoffDays">Cutoff Days Before</Label>
          <Input
            type="number"
            min="0"
            max="10"
            value={rule.cutoffDays || ''}
            onChange={(e) => onChange({ cutoffDays: parseInt(e.target.value) })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            type="date"
            value={rule.startDate || ''}
            onChange={(e) => onChange({ startDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="holidayHandling">Holiday Handling</Label>
          <Select 
            value={rule.holidayHandling} 
            onValueChange={(value: any) => onChange({ holidayHandling: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="before">Pay Before Holiday</SelectItem>
              <SelectItem value="after">Pay After Holiday</SelectItem>
              <SelectItem value="skip">Skip Holiday Pay</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="weekendHandling">Weekend Handling</Label>
          <Select 
            value={rule.weekendHandling} 
            onValueChange={(value: any) => onChange({ weekendHandling: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="before">Pay Before Weekend</SelectItem>
              <SelectItem value="after">Pay After Weekend</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={rule.isActive || false}
          onCheckedChange={(checked) => onChange({ isActive: checked })}
        />
        <Label htmlFor="isActive">Active Rule</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Pay Schedule Rules
          </CardTitle>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Rule
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configure how pay periods are calculated and when payments are processed.
          </p>
        </CardContent>
      </Card>

      {/* Add New Rule Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Pay Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <RuleForm 
              rule={newRule} 
              onChange={(updates) => setNewRule({ ...newRule, ...updates })}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRule}>
                Create Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Rule Form */}
      {editingRule && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Pay Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <RuleForm 
              rule={editingRule} 
              onChange={(updates) => setEditingRule({ ...editingRule, ...updates })}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingRule(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRule}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Rules */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{rule.name}</h3>
                    {rule.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{getFrequencyLabel(rule.frequency)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{rule.cutoffDays} days cutoff</span>
                    </div>
                    <div>
                      Holiday: {rule.holidayHandling}
                    </div>
                    <div>
                      Weekend: {rule.weekendHandling}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => toggleRuleStatus(rule.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRule(rule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rule Impact Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Rule Impact Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Preview how these rules will affect upcoming pay periods:
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Next Pay Date:</span>
              <span className="font-medium">February 29, 2024 (moved from 28th due to weekend)</span>
            </div>
            <div className="flex justify-between">
              <span>Next Cutoff:</span>
              <span className="font-medium">February 26, 2024</span>
            </div>
            <div className="flex justify-between">
              <span>Holiday Conflicts:</span>
              <span className="font-medium text-warning">1 detected (Presidents' Day)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
