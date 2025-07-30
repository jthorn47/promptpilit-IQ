import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  CalendarDays, 
  Edit, 
  Trash2, 
  Check, 
  Clock,
  AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
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
  periods: PayrollPeriod[];
  selectedPeriod: PayrollPeriod | null;
  onPeriodSelect: (period: PayrollPeriod | null) => void;
  onPeriodsUpdate: () => void;
}

export const PayrollPeriodManager: React.FC<PayrollPeriodManagerProps> = ({
  periods,
  selectedPeriod,
  onPeriodSelect,
  onPeriodsUpdate
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    start_date: new Date(),
    end_date: new Date(),
    period_type: 'bi-weekly'
  });
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'finalized': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreatePeriod = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get user's company ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) {
        throw new Error('No company ID found');
      }

      const { error } = await supabase
        .from('payroll_periods')
        .insert({
          start_date: format(newPeriod.start_date, 'yyyy-MM-dd'),
          end_date: format(newPeriod.end_date, 'yyyy-MM-dd'),
          period_type: newPeriod.period_type,
          status: 'draft',
          company_id: profile.company_id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payroll period created successfully",
      });

      setIsCreateDialogOpen(false);
      onPeriodsUpdate();
      
      // Reset form
      setNewPeriod({
        start_date: new Date(),
        end_date: new Date(),
        period_type: 'bi-weekly'
      });
      
    } catch (error) {
      console.error('Error creating payroll period:', error);
      toast({
        title: "Error",
        description: "Failed to create payroll period",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizePeriod = async (periodId: string) => {
    try {
      const { error } = await supabase
        .from('payroll_periods')
        .update({ status: 'finalized' })
        .eq('id', periodId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payroll period finalized",
      });

      onPeriodsUpdate();
    } catch (error) {
      console.error('Error finalizing period:', error);
      toast({
        title: "Error",
        description: "Failed to finalize period",
        variant: "destructive",
      });
    }
  };

  const handleDeletePeriod = async (periodId: string) => {
    try {
      const { error } = await supabase
        .from('payroll_periods')
        .delete()
        .eq('id', periodId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payroll period deleted",
      });

      if (selectedPeriod?.id === periodId) {
        onPeriodSelect(null);
      }
      onPeriodsUpdate();
    } catch (error) {
      console.error('Error deleting period:', error);
      toast({
        title: "Error",
        description: "Failed to delete period",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payroll Periods</h2>
          <p className="text-muted-foreground">Manage pay periods for your F45 studio</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Period
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Payroll Period</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Period Type</Label>
                <Select 
                  value={newPeriod.period_type} 
                  onValueChange={(value) => setNewPeriod(prev => ({ ...prev, period_type: value }))}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        {format(newPeriod.start_date, 'MM/dd/yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newPeriod.start_date}
                        onSelect={(date) => date && setNewPeriod(prev => ({ ...prev, start_date: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        {format(newPeriod.end_date, 'MM/dd/yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newPeriod.end_date}
                        onSelect={(date) => date && setNewPeriod(prev => ({ ...prev, end_date: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button 
                onClick={handleCreatePeriod} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Period'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Period Selection */}
      {selectedPeriod && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Selected Period</span>
              <Badge className={getStatusColor(selectedPeriod.status)}>
                {selectedPeriod.status.charAt(0).toUpperCase() + selectedPeriod.status.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="font-semibold">
                  {format(new Date(selectedPeriod.start_date), 'MMM dd, yyyy')} - {format(new Date(selectedPeriod.end_date), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedPeriod.period_type} period
                </p>
              </div>
              <div className="flex gap-2">
                {selectedPeriod.status === 'draft' && (
                  <Button 
                    size="sm" 
                    onClick={() => handleFinalizePeriod(selectedPeriod.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Finalize
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onPeriodSelect(null)}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Periods List */}
      <Card>
        <CardHeader>
          <CardTitle>All Payroll Periods</CardTitle>
        </CardHeader>
        <CardContent>
          {periods.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payroll periods created yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first payroll period to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {periods.map((period) => (
                <div 
                  key={period.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPeriod?.id === period.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onPeriodSelect(period)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {format(new Date(period.start_date), 'MMM dd')} - {format(new Date(period.end_date), 'MMM dd, yyyy')}
                        </p>
                        <Badge className={getStatusColor(period.status)}>
                          {period.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {period.period_type} period • Created {format(new Date(period.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {period.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePeriod(period.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!selectedPeriod && periods.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">Select a Pay Period</h3>
                <p className="text-sm text-yellow-700">
                  Please select a pay period above to enter classes, time, and calculate payroll.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};