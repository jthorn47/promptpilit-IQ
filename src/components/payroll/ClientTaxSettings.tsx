import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, FileText, CheckCircle, AlertTriangle, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const taxSettingsSchema = z.object({
  fein: z.string().min(9, 'FEIN must be at least 9 characters').max(10, 'FEIN cannot exceed 10 characters'),
  futa_number: z.string().optional(),
  federal_deposit_frequency: z.enum(['monthly', 'semi_weekly', 'quarterly']).default('monthly'),
  efiling_enabled: z.boolean().default(false),
  efiling_provider: z.string().optional(),
});

const stateIdSchema = z.object({
  state_code: z.string().min(2, 'State code is required').max(2, 'State code must be 2 characters'),
  withholding_id: z.string().optional(),
  unemployment_id: z.string().optional(),
  deposit_frequency: z.enum(['monthly', 'semi_weekly', 'quarterly']).default('monthly'),
});

const localJurisdictionSchema = z.object({
  jurisdiction_name: z.string().min(1, 'Jurisdiction name is required'),
  jurisdiction_code: z.string().min(1, 'Jurisdiction code is required'),
  tax_id: z.string().min(1, 'Tax ID is required'),
  tax_type: z.enum(['city', 'county', 'school_district', 'special_district']).default('city'),
});

type TaxSettingsForm = z.infer<typeof taxSettingsSchema>;
type StateIdForm = z.infer<typeof stateIdSchema>;
type LocalJurisdictionForm = z.infer<typeof localJurisdictionSchema>;

interface TaxProfile {
  id: string;
  company_id: string;
  fein: string;
  state_tax_ids: any;
  local_jurisdictions: any;
  futa_number?: string;
  suta_numbers: any;
  federal_deposit_frequency: string;
  state_deposit_frequencies: any;
  efiling_enabled: boolean;
  efiling_provider?: string;
  efiling_config: any;
  is_active: boolean;
  setup_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface ClientTaxSettingsProps {
  clientId: string;
}

export const ClientTaxSettings: React.FC<ClientTaxSettingsProps> = ({ clientId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingState, setEditingState] = useState<string | null>(null);
  const [editingLocal, setEditingLocal] = useState<string | null>(null);
  const [showAddState, setShowAddState] = useState(false);
  const [showAddLocal, setShowAddLocal] = useState(false);

  // Get company_settings_id from clientId
  const { data: clientData } = useQuery({
    queryKey: ['client-company-id', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('company_settings_id')
        .eq('id', clientId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  });

  // Fetch tax profile
  const { data: taxProfile, isLoading, error } = useQuery({
    queryKey: ['tax-profile', clientData?.company_settings_id],
    queryFn: async () => {
      if (!clientData?.company_settings_id) return null;
      
      const { data, error } = await supabase
        .from('tax_profiles')
        .select('*')
        .eq('company_id', clientData.company_settings_id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientData?.company_settings_id
  });

  // Main form
  const form = useForm<TaxSettingsForm>({
    resolver: zodResolver(taxSettingsSchema),
    defaultValues: {
      fein: '',
      futa_number: '',
      federal_deposit_frequency: 'monthly',
      efiling_enabled: false,
      efiling_provider: '',
    }
  });

  // State form
  const stateForm = useForm<StateIdForm>({
    resolver: zodResolver(stateIdSchema),
    defaultValues: {
      state_code: '',
      withholding_id: '',
      unemployment_id: '',
      deposit_frequency: 'monthly',
    }
  });

  // Local form
  const localForm = useForm<LocalJurisdictionForm>({
    resolver: zodResolver(localJurisdictionSchema),
    defaultValues: {
      jurisdiction_name: '',
      jurisdiction_code: '',
      tax_id: '',
      tax_type: 'city',
    }
  });

  // Populate form when data loads
  useEffect(() => {
    if (taxProfile) {
      form.reset({
        fein: taxProfile.fein || '',
        futa_number: taxProfile.futa_number || '',
        federal_deposit_frequency: taxProfile.federal_deposit_frequency as any || 'monthly',
        efiling_enabled: taxProfile.efiling_enabled || false,
        efiling_provider: taxProfile.efiling_provider || '',
      });
    }
  }, [taxProfile, form]);

  // Save tax profile mutation
  const saveTaxProfile = useMutation({
    mutationFn: async (data: TaxSettingsForm) => {
      if (!clientData?.company_settings_id) throw new Error('Company ID not found');
      
      const { data: user } = await supabase.auth.getUser();
      
      const profileData = {
        company_id: clientData.company_settings_id,
        fein: data.fein,
        futa_number: data.futa_number,
        federal_deposit_frequency: data.federal_deposit_frequency,
        efiling_enabled: data.efiling_enabled,
        efiling_provider: data.efiling_provider,
        state_tax_ids: taxProfile?.state_tax_ids || {},
        local_jurisdictions: taxProfile?.local_jurisdictions || [],
        suta_numbers: taxProfile?.suta_numbers || {},
        state_deposit_frequencies: taxProfile?.state_deposit_frequencies || {},
        efiling_config: taxProfile?.efiling_config || {},
        is_active: true,
        setup_completed: true,
        updated_by: user.user?.id,
      };

      if (taxProfile?.id) {
        const { data: result, error } = await supabase
          .from('tax_profiles')
          .update(profileData)
          .eq('id', taxProfile.id)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('tax_profiles')
          .insert({
            ...profileData,
            created_by: user.user?.id,
          })
          .select()
          .single();
        
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-profile'] });
      toast({
        title: "Tax Settings Saved",
        description: "Federal tax settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save tax settings.",
        variant: "destructive",
      });
    }
  });

  // Add/Update state tax ID
  const saveStateId = useMutation({
    mutationFn: async (data: StateIdForm) => {
      if (!taxProfile) throw new Error('Tax profile not found');
      
      const currentStateIds = (taxProfile.state_tax_ids as Record<string, string>) || {};
      const currentSutaNumbers = (taxProfile.suta_numbers as Record<string, string>) || {};
      const currentDepositFreqs = (taxProfile.state_deposit_frequencies as Record<string, string>) || {};
      
      const updatedStateIds = {
        ...currentStateIds,
        [data.state_code]: data.withholding_id || ''
      };
      
      const updatedSutaNumbers = {
        ...currentSutaNumbers,
        [data.state_code]: data.unemployment_id || ''
      };
      
      const updatedDepositFreqs = {
        ...currentDepositFreqs,
        [data.state_code]: data.deposit_frequency
      };

      const { data: result, error } = await supabase
        .from('tax_profiles')
        .update({
          state_tax_ids: updatedStateIds,
          suta_numbers: updatedSutaNumbers,
          state_deposit_frequencies: updatedDepositFreqs,
        })
        .eq('id', taxProfile.id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-profile'] });
      setEditingState(null);
      setShowAddState(false);
      stateForm.reset();
      toast({
        title: "State Tax ID Saved",
        description: "State tax configuration has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save state tax ID.",
        variant: "destructive",
      });
    }
  });

  // Add local jurisdiction
  const saveLocalJurisdiction = useMutation({
    mutationFn: async (data: LocalJurisdictionForm) => {
      if (!taxProfile) throw new Error('Tax profile not found');
      
      const currentJurisdictions = Array.isArray(taxProfile.local_jurisdictions) 
        ? taxProfile.local_jurisdictions 
        : [];
      const updatedJurisdictions = [...currentJurisdictions, {
        id: Date.now().toString(),
        ...data
      }];

      const { data: result, error } = await supabase
        .from('tax_profiles')
        .update({
          local_jurisdictions: updatedJurisdictions,
        })
        .eq('id', taxProfile.id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-profile'] });
      setShowAddLocal(false);
      localForm.reset();
      toast({
        title: "Local Jurisdiction Added",
        description: "Local tax jurisdiction has been added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add local jurisdiction.",
        variant: "destructive",
      });
    }
  });

  // Delete state tax ID
  const deleteStateId = (stateCode: string) => {
    if (!taxProfile) return;
    
    const currentStateIds = { ...(taxProfile.state_tax_ids as Record<string, string>) || {} };
    const currentSutaNumbers = { ...(taxProfile.suta_numbers as Record<string, string>) || {} };
    const currentDepositFreqs = { ...(taxProfile.state_deposit_frequencies as Record<string, string>) || {} };
    
    delete currentStateIds[stateCode];
    delete currentSutaNumbers[stateCode];
    delete currentDepositFreqs[stateCode];
    
    // Use mutation to update - implement similar to saveStateId but with deletion
  };

  // Delete local jurisdiction
  const deleteLocalJurisdiction = (jurisdictionId: string) => {
    if (!taxProfile) return;
    
    const currentJurisdictions = Array.isArray(taxProfile.local_jurisdictions) 
      ? taxProfile.local_jurisdictions 
      : [];
    const updatedJurisdictions = currentJurisdictions.filter((j: any) => j.id !== jurisdictionId);
    
    // Use mutation to update
    // Similar implementation as saveLocalJurisdiction but for deletion
  };

  const getSetupProgress = () => {
    if (!taxProfile) return 0;
    
    let completed = 0;
    let total = 4;
    
    if (taxProfile.fein) completed++;
    if (taxProfile.state_tax_ids && Object.keys(taxProfile.state_tax_ids).length > 0) completed++;
    if (taxProfile.federal_deposit_frequency) completed++;
    if (taxProfile.setup_completed) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const handleMainFormSubmit = (data: TaxSettingsForm) => {
    saveTaxProfile.mutate(data);
  };

  const handleStateFormSubmit = (data: StateIdForm) => {
    saveStateId.mutate(data);
  };

  const handleLocalFormSubmit = (data: LocalJurisdictionForm) => {
    saveLocalJurisdiction.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-48 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  const stateIds = (taxProfile?.state_tax_ids as Record<string, string>) || {};
  const sutaNumbers = (taxProfile?.suta_numbers as Record<string, string>) || {};
  const localJurisdictions = Array.isArray(taxProfile?.local_jurisdictions) 
    ? taxProfile.local_jurisdictions 
    : [];
  const setupProgress = getSetupProgress();

  return (
    <div className="space-y-6">
      {/* Setup Progress */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span><strong>Setup Progress:</strong> {setupProgress}% complete</span>
            <Badge variant={setupProgress === 100 ? "default" : "secondary"}>
              {setupProgress === 100 ? "Complete" : "In Progress"}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Federal Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Federal Tax Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleMainFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fein">Federal EIN (FEIN) *</Label>
                <Input
                  id="fein"
                  {...form.register('fein')}
                  placeholder="XX-XXXXXXX"
                  maxLength={10}
                />
                {form.formState.errors.fein && (
                  <p className="text-sm text-destructive">{form.formState.errors.fein.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="futa_number">FUTA Number</Label>
                <Input
                  id="futa_number"
                  {...form.register('futa_number')}
                  placeholder="Federal unemployment tax number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="federal_deposit_frequency">Federal Deposit Frequency</Label>
                <Select
                  value={form.watch('federal_deposit_frequency')}
                  onValueChange={(value) => form.setValue('federal_deposit_frequency', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="semi_weekly">Semi-Weekly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="efiling_provider">E-Filing Provider</Label>
                <Input
                  id="efiling_provider"
                  {...form.register('efiling_provider')}
                  placeholder="Optional e-filing provider"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="efiling_enabled"
                {...form.register('efiling_enabled')}
              />
              <Label htmlFor="efiling_enabled">Enable E-Filing</Label>
            </div>
            
            <Button type="submit" disabled={saveTaxProfile.isPending}>
              {saveTaxProfile.isPending ? "Saving..." : "Save Federal Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* State Tax IDs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>State Tax IDs & SUTA Numbers</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddState(true)}
              disabled={showAddState}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add State
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add State Form */}
          {showAddState && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <form onSubmit={stateForm.handleSubmit(handleStateFormSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state_code">State Code *</Label>
                      <Input
                        id="state_code"
                        {...stateForm.register('state_code')}
                        placeholder="CA, NY, TX, etc."
                        maxLength={2}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="deposit_frequency">Deposit Frequency</Label>
                      <Select
                        value={stateForm.watch('deposit_frequency')}
                        onValueChange={(value) => stateForm.setValue('deposit_frequency', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="semi_weekly">Semi-Weekly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="withholding_id">State Withholding ID</Label>
                      <Input
                        id="withholding_id"
                        {...stateForm.register('withholding_id')}
                        placeholder="State income tax withholding ID"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="unemployment_id">SUTA Number</Label>
                      <Input
                        id="unemployment_id"
                        {...stateForm.register('unemployment_id')}
                        placeholder="State unemployment tax ID"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" disabled={saveStateId.isPending}>
                      {saveStateId.isPending ? "Adding..." : "Add State"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowAddState(false);
                        stateForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Existing State IDs */}
          {Object.keys(stateIds).length === 0 && !showAddState ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No state tax IDs configured yet</p>
              <p className="text-sm">Add states where you have tax obligations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stateIds).map(([stateCode, withholdingId]) => (
                <div key={stateCode} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm font-medium">State:</span>
                      <p className="text-sm text-muted-foreground">{stateCode.toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Withholding ID:</span>
                      <p className="text-sm text-muted-foreground">{withholdingId || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">SUTA Number:</span>
                      <p className="text-sm text-muted-foreground">{sutaNumbers[stateCode] || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteStateId(stateCode)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Local Jurisdictions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Local Tax Jurisdictions</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddLocal(true)}
              disabled={showAddLocal}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Local
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Local Form */}
          {showAddLocal && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <form onSubmit={localForm.handleSubmit(handleLocalFormSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jurisdiction_name">Jurisdiction Name *</Label>
                      <Input
                        id="jurisdiction_name"
                        {...localForm.register('jurisdiction_name')}
                        placeholder="City of Los Angeles"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="jurisdiction_code">Jurisdiction Code *</Label>
                      <Input
                        id="jurisdiction_code"
                        {...localForm.register('jurisdiction_code')}
                        placeholder="LAX, NYC, etc."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tax_id">Tax ID *</Label>
                      <Input
                        id="tax_id"
                        {...localForm.register('tax_id')}
                        placeholder="Local tax identification number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tax_type">Tax Type</Label>
                      <Select
                        value={localForm.watch('tax_type')}
                        onValueChange={(value) => localForm.setValue('tax_type', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="city">City</SelectItem>
                          <SelectItem value="county">County</SelectItem>
                          <SelectItem value="school_district">School District</SelectItem>
                          <SelectItem value="special_district">Special District</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" disabled={saveLocalJurisdiction.isPending}>
                      {saveLocalJurisdiction.isPending ? "Adding..." : "Add Jurisdiction"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowAddLocal(false);
                        localForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Existing Local Jurisdictions */}
          {localJurisdictions.length === 0 && !showAddLocal ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No local jurisdictions configured yet</p>
              <p className="text-sm">Add cities, counties, or districts where you have tax obligations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {localJurisdictions.map((jurisdiction: any) => (
                <div key={jurisdiction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm font-medium">Name:</span>
                      <p className="text-sm text-muted-foreground">{jurisdiction.jurisdiction_name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Code:</span>
                      <p className="text-sm text-muted-foreground">{jurisdiction.jurisdiction_code}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Tax ID:</span>
                      <p className="text-sm text-muted-foreground">{jurisdiction.tax_id}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Type:</span>
                      <Badge variant="outline">{jurisdiction.tax_type}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteLocalJurisdiction(jurisdiction.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Status */}
      {setupProgress < 100 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Setup Incomplete:</strong> Complete all required tax configurations to ensure proper payroll processing and compliance.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
