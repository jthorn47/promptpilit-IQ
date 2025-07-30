import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PayrollPeriod {
  id: string;
  start_date: string;
  end_date: string;
  period_type: string;
  status: string;
  created_at: string;
  company_id: string;
}

interface PayrollPeriodManagerProps {
  periods?: PayrollPeriod[];
  selectedPeriod?: PayrollPeriod | null;
  onPeriodSelect?: (period: PayrollPeriod) => void;
  onPeriodsUpdate?: () => void;
  locked?: boolean;
}

export const PayrollPeriodManager: React.FC<PayrollPeriodManagerProps> = ({
  periods = [],
  selectedPeriod = null,
  onPeriodSelect = () => {},
  onPeriodsUpdate = () => {},
  locked = false
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PayrollPeriod | null>(null);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    period_type: 'weekly',
    status: 'draft'
  });
  const [companyId, setCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanyId();
  }, []);

  const fetchCompanyId = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (profile?.company_id) {
        setCompanyId(profile.company_id);
      }
    } catch (error) {
      console.error('Error fetching company ID:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyId) {
      toast({
        title: "Error",
        description: "Company ID not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const periodData = {
        ...formData,
        company_id: companyId,
        created_by: user?.id
      };

      if (editingPeriod) {
        const { error } = await supabase
          .from('payroll_periods')
          .update(periodData)
          .eq('id', editingPeriod.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Payroll period updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('payroll_periods')
          .insert([periodData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Payroll period created successfully",
        });
      }

      setShowCreateDialog(false);
      setEditingPeriod(null);
      resetForm();
      onPeriodsUpdate();
    } catch (error) {
      console.error('Error saving payroll period:', error);
      toast({
        title: "Error",
        description: "Failed to save payroll period",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (period: PayrollPeriod) => {
    setEditingPeriod(period);
    setFormData({
      start_date: period.start_date,
      end_date: period.end_date,
      period_type: period.period_type,
      status: period.status
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (periodId: string) => {
    if (!confirm('Are you sure you want to delete this payroll period?')) return;

    try {
      const { error } = await supabase
        .from('payroll_periods')
        .delete()
        .eq('id', periodId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payroll period deleted successfully",
      });
      
      onPeriodsUpdate();
    } catch (error) {
      console.error('Error deleting payroll period:', error);
      toast({
        title: "Error",
        description: "Failed to delete payroll period",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      start_date: '',
      end_date: '',
      period_type: 'weekly',
      status: 'draft'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'finalized': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateWeeklyPeriods = () => {
    const periods = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week

    for (let i = 0; i < 12; i++) {
      const start = new Date(startOfWeek);
      start.setDate(startOfWeek.getDate() + (i * 7));
      
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      periods.push({
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        period_type: 'weekly',
        status: 'draft'
      });
    }

    return periods;
  };

  const handleBulkCreate = async () => {
    if (!companyId) return;

    const periods = generateWeeklyPeriods();
    
    try {
      setLoading(true);
      
      const periodsData = periods.map(period => ({
        ...period,
        company_id: companyId,
        created_by: user?.id
      }));

      const { error } = await supabase
        .from('payroll_periods')
        .insert(periodsData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Created ${periods.length} weekly payroll periods`,
      });
      
      onPeriodsUpdate();
    } catch (error) {
      console.error('Error creating bulk periods:', error);
      toast({
        title: "Error",
        description: "Failed to create payroll periods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payroll Periods</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBulkCreate}>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Create 12 Weeks
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingPeriod(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                New Period
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPeriod ? 'Edit Payroll Period' : 'Create New Payroll Period'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="period_type">Period Type</Label>
                  <Select 
                    value={formData.period_type} 
                    onValueChange={(value) => setFormData({ ...formData, period_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="finalized">Finalized</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (editingPeriod ? 'Update' : 'Create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {periods.map((period) => (
          <Card 
            key={period.id} 
            className={`cursor-pointer transition-all ${
              selectedPeriod?.id === period.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onPeriodSelect(period)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold">
                      {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {period.period_type} • Created {new Date(period.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(period.status)}>
                    {period.status.charAt(0).toUpperCase() + period.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(period);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(period.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
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