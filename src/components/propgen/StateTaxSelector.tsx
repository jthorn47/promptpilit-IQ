import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Plus, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface StateTaxSetting {
  id: string;
  state_code: string;
  state_name: string;
  suta_wage_base: number;
  futa_wage_base: number;
  suta_rate_min: number;
  suta_rate_max: number;
}

interface StateTaxSelectorProps {
  onStateChange: (stateCode: string, sutaWageBase: number, futaWageBase: number) => void;
  initialState?: string;
  sutaRate: number;
  onSutaRateChange: (rate: number) => void;
}

export const StateTaxSelector: React.FC<StateTaxSelectorProps> = ({
  onStateChange,
  initialState = '',
  sutaRate,
  onSutaRateChange,
}) => {
  const [states, setStates] = useState<StateTaxSetting[]>([]);
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [loading, setLoading] = useState(false);
  const [showAddStateDialog, setShowAddStateDialog] = useState(false);
  const [newStateCode, setNewStateCode] = useState('');
  const [newStateName, setNewStateName] = useState('');
  const [newSutaWageBase, setNewSutaWageBase] = useState(7000);
  const [newFutaWageBase, setNewFutaWageBase] = useState(7000);
  const [attemptedState, setAttemptedState] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('state_tax_settings')
        .select('*')
        .eq('is_active', true)
        .order('state_name');

      if (error) throw error;
      setStates(data || []);
    } catch (error) {
      console.error('Error loading states:', error);
      toast({
        title: 'Error loading states',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStateSelect = (stateCode: string) => {
    const state = states.find(s => s.state_code === stateCode);
    if (state) {
      setSelectedState(stateCode);
      onStateChange(stateCode, state.suta_wage_base, state.futa_wage_base);
    } else {
      // State not found in database
      setAttemptedState(stateCode);
      setShowAddStateDialog(true);
    }
  };

  const handleAddState = async () => {
    if (!newStateCode || !newStateName) {
      toast({
        title: 'Missing information',
        description: 'Please provide both state code and name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('state_tax_settings')
        .insert({
          state_code: newStateCode.toUpperCase(),
          state_name: newStateName,
          suta_wage_base: newSutaWageBase,
          futa_wage_base: newFutaWageBase,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setStates(prev => [...prev, data].sort((a, b) => a.state_name.localeCompare(b.state_name)));
      
      // Select the new state
      setSelectedState(data.state_code);
      onStateChange(data.state_code, data.suta_wage_base, data.futa_wage_base);
      
      // Reset form
      setNewStateCode('');
      setNewStateName('');
      setNewSutaWageBase(7000);
      setNewFutaWageBase(7000);
      setShowAddStateDialog(false);
      
      toast({
        title: 'State added successfully',
        description: `${data.state_name} has been added to the database.`,
      });
    } catch (error) {
      console.error('Error adding state:', error);
      toast({
        title: 'Error adding state',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedStateData = states.find(s => s.state_code === selectedState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          State Tax Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="state_selection">Select State *</Label>
            <Select value={selectedState} onValueChange={handleStateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a state..." />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-background border border-border shadow-lg z-50">
                {states.map((state) => (
                  <SelectItem key={state.state_code} value={state.state_code}>
                    {state.state_name} ({state.state_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="suta_rate">SUTA Rate (%) *</Label>
            <Input
              id="suta_rate"
              type="number"
              step="0.01"
              value={sutaRate}
              onChange={(e) => onSutaRateChange(parseFloat(e.target.value) || 0)}
              placeholder="4.2"
              min={selectedStateData?.suta_rate_min || 0.1}
              max={selectedStateData?.suta_rate_max || 10.0}
            />
            {selectedStateData && (
              <div className="text-xs text-muted-foreground mt-1">
                Range: {selectedStateData.suta_rate_min}% - {selectedStateData.suta_rate_max}%
              </div>
            )}
          </div>
        </div>

        {selectedStateData && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-2">
              {selectedStateData.state_name} Tax Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
              <div>SUTA Wage Base: {formatCurrency(selectedStateData.suta_wage_base)}</div>
              <div>FUTA Wage Base: {formatCurrency(selectedStateData.futa_wage_base)}</div>
            </div>
          </div>
        )}

        <Dialog open={showAddStateDialog} onOpenChange={setShowAddStateDialog}>
          <DialogContent className="bg-background border border-border shadow-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                State Not Found
              </DialogTitle>
              <DialogDescription>
                You're attempting to add a state that is not currently in the database. 
                Would you like to add it with the wage caps for SUTA and FUTA?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new_state_code">State Code</Label>
                  <Input
                    id="new_state_code"
                    value={newStateCode}
                    onChange={(e) => setNewStateCode(e.target.value.toUpperCase())}
                    placeholder="CA"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="new_state_name">State Name</Label>
                  <Input
                    id="new_state_name"
                    value={newStateName}
                    onChange={(e) => setNewStateName(e.target.value)}
                    placeholder="California"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new_suta_wage_base">SUTA Wage Base</Label>
                  <Input
                    id="new_suta_wage_base"
                    type="number"
                    value={newSutaWageBase}
                    onChange={(e) => setNewSutaWageBase(parseFloat(e.target.value) || 7000)}
                    placeholder="7000"
                  />
                </div>
                <div>
                  <Label htmlFor="new_futa_wage_base">FUTA Wage Base</Label>
                  <Input
                    id="new_futa_wage_base"
                    type="number"
                    value={newFutaWageBase}
                    onChange={(e) => setNewFutaWageBase(parseFloat(e.target.value) || 7000)}
                    placeholder="7000"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddStateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddState}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? 'Adding...' : 'Add State'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};