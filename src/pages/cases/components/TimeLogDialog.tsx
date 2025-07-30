import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useTimeEntries } from '@/hooks/useCases';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TimeLogDialogProps {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TimeLogDialog = ({ caseId, open, onOpenChange }: TimeLogDialogProps) => {
  const { createTimeEntry } = useTimeEntries(caseId);
  const [loading, setLoading] = useState(false);
  const [defaultRate, setDefaultRate] = useState(75); // Default rate
  
  const [formData, setFormData] = useState({
    duration_hours: '',
    duration_minutes: '',
    billable_rate: defaultRate,
    is_billable: true,
    notes: '',
    entry_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (open) {
      // Fetch user's default billable rate
      fetchDefaultRate();
      
      // Reset form
      setFormData({
        duration_hours: '',
        duration_minutes: '',
        billable_rate: defaultRate,
        is_billable: true,
        notes: '',
        entry_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [open, defaultRate]);

  const fetchDefaultRate = async () => {
    try {
      const { data: userProfile } = await supabase.auth.getUser();
      if (!userProfile.user) return;

      const { data: rateData } = await supabase
        .from('user_billable_rates')
        .select('hourly_rate')
        .eq('user_id', userProfile.user.id)
        .eq('is_active', true)
        .order('effective_date', { ascending: false })
        .limit(1)
        .single();

      if (rateData) {
        setDefaultRate(Number(rateData.hourly_rate));
        setFormData(prev => ({ ...prev, billable_rate: Number(rateData.hourly_rate) }));
      }
    } catch (error) {
      console.error('Error fetching default rate:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hours = parseFloat(formData.duration_hours) || 0;
    const minutes = parseFloat(formData.duration_minutes) || 0;
    const totalMinutes = (hours * 60) + minutes;
    
    if (totalMinutes <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    if (!formData.notes.trim()) {
      toast.error('Please enter notes describing the work performed');
      return;
    }

    setLoading(true);
    
    try {
      const { data: userProfile } = await supabase.auth.getUser();
      if (!userProfile.user) throw new Error('Not authenticated');

      await createTimeEntry({
        case_id: caseId,
        user_id: userProfile.user.id,
        duration_minutes: Math.round(totalMinutes),
        billable_rate: formData.billable_rate,
        is_billable: formData.is_billable,
        notes: formData.notes.trim(),
        entry_date: formData.entry_date,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error logging time:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalHours = ((parseFloat(formData.duration_hours) || 0) + 
                     (parseFloat(formData.duration_minutes) || 0) / 60);
  const totalCost = totalHours * formData.billable_rate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Time Entry</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="entry_date">Date</Label>
            <Input
              id="entry_date"
              type="date"
              value={formData.entry_date}
              onChange={(e) => setFormData(prev => ({ ...prev, entry_date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label>Duration</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: e.target.value }))}
                  placeholder="Hours"
                />
                <div className="text-xs text-muted-foreground mt-1">Hours</div>
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  step="15"
                  min="0"
                  max="59"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                  placeholder="Minutes"
                />
                <div className="text-xs text-muted-foreground mt-1">Minutes</div>
              </div>
            </div>
            {totalHours > 0 && (
              <div className="text-sm text-muted-foreground mt-1">
                Total: {totalHours.toFixed(2)} hours
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="billable_rate">Billable Rate ($/hour)</Label>
            <Input
              id="billable_rate"
              type="number"
              step="0.01"
              min="0"
              value={formData.billable_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, billable_rate: parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_billable"
              checked={formData.is_billable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_billable: checked }))}
            />
            <Label htmlFor="is_billable">Billable</Label>
          </div>

          {totalHours > 0 && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-sm font-medium">
                Total Cost: ${totalCost.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {totalHours.toFixed(2)}h × ${formData.billable_rate}/hr
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Work Description *</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Describe the work performed..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Logging...' : 'Log Time'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};