import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Save, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmployeeTaxProfile {
  id?: string;
  employee_id: string;
  employee_name?: string;
  filing_status: string;
  state_code: string;
  w4_dependents_amount: number;
  additional_federal_withholding: number;
  additional_state_withholding: number;
  is_exempt_federal: boolean;
  is_exempt_state: boolean;
}

export const EmployeeTaxProfiles: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [taxProfiles, setTaxProfiles] = useState<EmployeeTaxProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('payroll_employees')
        .select('id, instructor_name')
        .eq('is_active', true);

      if (employeesError) throw employeesError;

      // Fetch existing tax profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('employee_tax_profiles')
        .select('*');

      if (profilesError) throw profilesError;

      setEmployees(employeesData || []);
      
      // Merge employee data with tax profiles
      const mergedProfiles = (employeesData || []).map(emp => {
        const existingProfile = (profilesData || []).find(p => p.employee_id === emp.id);
        return {
          employee_id: emp.id,
          employee_name: emp.instructor_name,
          filing_status: existingProfile?.filing_status || 'single',
          state_code: existingProfile?.state_code || 'CA',
          w4_dependents_amount: existingProfile?.w4_dependents_amount || 0,
          additional_federal_withholding: existingProfile?.additional_federal_withholding || 0,
          additional_state_withholding: existingProfile?.additional_state_withholding || 0,
          is_exempt_federal: existingProfile?.is_exempt_federal || false,
          is_exempt_state: existingProfile?.is_exempt_state || false,
          id: existingProfile?.id,
        };
      });

      setTaxProfiles(mergedProfiles);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load employee data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (employeeId: string, field: string, value: any) => {
    setTaxProfiles(prev => prev.map(profile => 
      profile.employee_id === employeeId 
        ? { ...profile, [field]: value }
        : profile
    ));
  };

  const saveProfile = async (profile: EmployeeTaxProfile) => {
    try {
      setSaving(profile.employee_id);
      
      const profileData = {
        employee_id: profile.employee_id,
        filing_status: profile.filing_status,
        state_code: profile.state_code,
        w4_dependents_amount: profile.w4_dependents_amount,
        additional_federal_withholding: profile.additional_federal_withholding,
        additional_state_withholding: profile.additional_state_withholding,
        is_exempt_federal: profile.is_exempt_federal,
        is_exempt_state: profile.is_exempt_state,
      };

      if (profile.id) {
        // Update existing
        const { error } = await supabase
          .from('employee_tax_profiles')
          .update(profileData)
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('employee_tax_profiles')
          .insert(profileData)
          .select()
          .single();
        if (error) throw error;
        
        // Update local state with new ID
        setTaxProfiles(prev => prev.map(p => 
          p.employee_id === profile.employee_id 
            ? { ...p, id: data.id }
            : p
        ));
      }

      toast({
        title: "Success",
        description: `Tax profile saved for ${profile.employee_name}`,
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save tax profile",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Tax Profiles</h2>
          <p className="text-muted-foreground">Configure tax withholding settings for employees</p>
        </div>
      </div>

      <div className="grid gap-4">
        {taxProfiles.map((profile) => (
          <Card key={profile.employee_id}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <CardTitle className="text-lg">{profile.employee_name}</CardTitle>
                </div>
                <Badge variant={profile.id ? "default" : "secondary"}>
                  {profile.id ? "Configured" : "New"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`filing-${profile.employee_id}`}>Filing Status</Label>
                  <Select
                    value={profile.filing_status}
                    onValueChange={(value) => updateProfile(profile.employee_id, 'filing_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married_jointly">Married Filing Jointly</SelectItem>
                      <SelectItem value="married_separately">Married Filing Separately</SelectItem>
                      <SelectItem value="head_of_household">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor={`state-${profile.employee_id}`}>State</Label>
                  <Select
                    value={profile.state_code}
                    onValueChange={(value) => updateProfile(profile.employee_id, 'state_code', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor={`dependents-${profile.employee_id}`}>W-4 Dependents Amount</Label>
                  <Input
                    id={`dependents-${profile.employee_id}`}
                    type="number"
                    min="0"
                    step="1000"
                    value={profile.w4_dependents_amount}
                    onChange={(e) => updateProfile(profile.employee_id, 'w4_dependents_amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`additional-fed-${profile.employee_id}`}>Additional Federal Withholding</Label>
                  <Input
                    id={`additional-fed-${profile.employee_id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={profile.additional_federal_withholding}
                    onChange={(e) => updateProfile(profile.employee_id, 'additional_federal_withholding', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`additional-state-${profile.employee_id}`}>Additional State Withholding</Label>
                  <Input
                    id={`additional-state-${profile.employee_id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={profile.additional_state_withholding}
                    onChange={(e) => updateProfile(profile.employee_id, 'additional_state_withholding', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => saveProfile(profile)}
                  disabled={saving === profile.employee_id}
                >
                  {saving === profile.employee_id ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {taxProfiles.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Employees Found</h3>
            <p className="text-muted-foreground">Add employees to the payroll system to configure their tax profiles.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};