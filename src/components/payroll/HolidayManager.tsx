import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'federal' | 'state' | 'company';
  affectsPay: boolean;
  affectsProcessing: boolean;
  states: string[];
  description?: string;
  isRecurring: boolean;
  isActive: boolean;
}

const mockHolidays: Holiday[] = [
  {
    id: '1',
    name: "New Year's Day",
    date: '2024-01-01',
    type: 'federal',
    affectsPay: true,
    affectsProcessing: true,
    states: ['ALL'],
    description: 'Federal holiday observed nationwide',
    isRecurring: true,
    isActive: true
  },
  {
    id: '2',
    name: "Martin Luther King Jr. Day",
    date: '2024-01-15',
    type: 'federal',
    affectsPay: false,
    affectsProcessing: true,
    states: ['ALL'],
    description: 'Federal holiday - third Monday in January',
    isRecurring: true,
    isActive: true
  },
  {
    id: '3',
    name: "Presidents' Day",
    date: '2024-02-19',
    type: 'federal',
    affectsPay: true,
    affectsProcessing: true,
    states: ['ALL'],
    description: 'Federal holiday - third Monday in February',
    isRecurring: true,
    isActive: true
  },
  {
    id: '4',
    name: 'Company Foundation Day',
    date: '2024-03-15',
    type: 'company',
    affectsPay: true,
    affectsProcessing: false,
    states: ['CA', 'NY'],
    description: 'Company-specific holiday',
    isRecurring: true,
    isActive: true
  }
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

interface HolidayManagerProps {
  locked?: boolean;
}

export const HolidayManager: React.FC<HolidayManagerProps> = ({ locked = false }) => {
  const { toast } = useToast();
  const [holidays, setHolidays] = useState<Holiday[]>(mockHolidays);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [filter, setFilter] = useState<'all' | 'federal' | 'state' | 'company'>('all');
  const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({
    name: '',
    date: '',
    type: 'company',
    affectsPay: false,
    affectsProcessing: false,
    states: [],
    description: '',
    isRecurring: false,
    isActive: true
  });

  const handleSaveHoliday = () => {
    if (editingHoliday) {
      setHolidays(holidays.map(holiday => 
        holiday.id === editingHoliday.id ? { ...editingHoliday } : holiday
      ));
      setEditingHoliday(null);
      toast({
        title: "Holiday Updated",
        description: "Holiday has been updated successfully."
      });
    } else {
      const holiday: Holiday = {
        ...newHoliday as Holiday,
        id: Date.now().toString()
      };
      setHolidays([...holidays, holiday]);
      setNewHoliday({
        name: '',
        date: '',
        type: 'company',
        affectsPay: false,
        affectsProcessing: false,
        states: [],
        description: '',
        isRecurring: false,
        isActive: true
      });
      setShowAddForm(false);
      toast({
        title: "Holiday Created",
        description: "New holiday has been created successfully."
      });
    }
  };

  const handleDeleteHoliday = (id: string) => {
    setHolidays(holidays.filter(holiday => holiday.id !== id));
    toast({
      title: "Holiday Deleted",
      description: "Holiday has been deleted successfully."
    });
  };

  const toggleHolidayStatus = (id: string) => {
    setHolidays(holidays.map(holiday => 
      holiday.id === id ? { ...holiday, isActive: !holiday.isActive } : holiday
    ));
  };

  const filteredHolidays = holidays.filter(holiday => 
    filter === 'all' || holiday.type === filter
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'federal': return 'bg-blue-100 text-blue-800';
      case 'state': return 'bg-green-100 text-green-800';
      case 'company': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImportHolidays = () => {
    toast({
      title: "Import Started",
      description: "Importing federal holidays for 2024..."
    });
  };

  const handleExportHolidays = () => {
    toast({
      title: "Export Complete",
      description: "Holiday calendar exported successfully."
    });
  };

  const HolidayForm = ({ holiday, onChange }: { holiday: Partial<Holiday>, onChange: (updates: Partial<Holiday>) => void }) => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Holiday Name</Label>
          <Input
            id="name"
            value={holiday.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g., Independence Day"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={holiday.date || ''}
            onChange={(e) => onChange({ date: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Holiday Type</Label>
          <Select 
            value={holiday.type} 
            onValueChange={(value: any) => onChange({ type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="federal">Federal</SelectItem>
              <SelectItem value="state">State</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="states">Applicable States</Label>
          <Select 
            value={holiday.states?.join(',') || ''} 
            onValueChange={(value) => onChange({ states: value ? value.split(',') : [] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All States</SelectItem>
              {US_STATES.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={holiday.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Additional details about this holiday..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="affectsPay"
            checked={holiday.affectsPay || false}
            onCheckedChange={(checked) => onChange({ affectsPay: checked })}
          />
          <Label htmlFor="affectsPay">Affects Pay Schedule</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="affectsProcessing"
            checked={holiday.affectsProcessing || false}
            onCheckedChange={(checked) => onChange({ affectsProcessing: checked })}
          />
          <Label htmlFor="affectsProcessing">Affects Processing</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="isRecurring"
            checked={holiday.isRecurring || false}
            onCheckedChange={(checked) => onChange({ isRecurring: checked })}
          />
          <Label htmlFor="isRecurring">Recurring Holiday</Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Holiday Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleImportHolidays} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Federal
            </Button>
            <Button variant="outline" onClick={handleExportHolidays} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Holiday
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Configure holidays that affect payroll processing and pay schedules.
            </p>
            
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="federal">Federal</SelectItem>
                <SelectItem value="state">State</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add New Holiday Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Holiday</CardTitle>
          </CardHeader>
          <CardContent>
            <HolidayForm 
              holiday={newHoliday} 
              onChange={(updates) => setNewHoliday({ ...newHoliday, ...updates })}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveHoliday}>
                Create Holiday
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Holiday Form */}
      {editingHoliday && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Holiday</CardTitle>
          </CardHeader>
          <CardContent>
            <HolidayForm 
              holiday={editingHoliday} 
              onChange={(updates) => setEditingHoliday({ ...editingHoliday, ...updates })}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingHoliday(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveHoliday}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holiday List */}
      <div className="space-y-4">
        {filteredHolidays.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No holidays found for the selected filter</p>
            </CardContent>
          </Card>
        ) : (
          filteredHolidays.map((holiday) => (
            <Card key={holiday.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{holiday.name}</h3>
                      <Badge className={getTypeColor(holiday.type)}>
                        {holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1)}
                      </Badge>
                      {holiday.isRecurring && (
                        <Badge variant="outline">Recurring</Badge>
                      )}
                      {!holiday.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(holiday.date).toLocaleDateString()}
                        </span>
                        <span>States: {holiday.states.includes('ALL') ? 'All' : holiday.states.join(', ')}</span>
                      </div>
                      
                      {holiday.description && (
                        <p className="text-xs">{holiday.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs">
                        {holiday.affectsPay && (
                          <span className="flex items-center gap-1 text-orange-600">
                            <AlertTriangle className="h-3 w-3" />
                            Affects Pay
                          </span>
                        )}
                        {holiday.affectsProcessing && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <AlertTriangle className="h-3 w-3" />
                            Affects Processing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={holiday.isActive}
                      onCheckedChange={() => toggleHolidayStatus(holiday.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingHoliday(holiday)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteHoliday(holiday.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Holiday Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Upcoming Pay Schedule Changes</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Presidents' Day (Feb 19): Pay moved to Feb 20</p>
                <p>• Memorial Day (May 27): Processing delayed 1 day</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Processing Warnings</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• 2 holidays affect payroll cutoff dates</p>
                <p>• 1 holiday requires manual processing override</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};