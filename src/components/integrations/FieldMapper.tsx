import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Search, Plus, X, Save, RefreshCw, Download, Upload } from 'lucide-react';

interface FieldMapping {
  id: string;
  external_field: string;
  internal_field: string;
  field_type: string;
  is_required: boolean;
  default_value?: string;
  transformation_rules: any;
}

interface FieldMapperProps {
  integrationId: string;
  onMappingChange?: (mappings: FieldMapping[]) => void;
}

const FIELD_TYPES = [
  { value: 'string', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'object', label: 'Object' },
  { value: 'array', label: 'Array' }
];

const INTERNAL_FIELDS = [
  { value: 'employee.first_name', label: 'Employee First Name' },
  { value: 'employee.last_name', label: 'Employee Last Name' },
  { value: 'employee.email', label: 'Employee Email' },
  { value: 'employee.phone', label: 'Employee Phone' },
  { value: 'employee.department', label: 'Employee Department' },
  { value: 'employee.position', label: 'Employee Position' },
  { value: 'employee.hire_date', label: 'Employee Hire Date' },
  { value: 'employee.salary', label: 'Employee Salary' },
  { value: 'employee.employee_id', label: 'Employee ID' },
  { value: 'customer.name', label: 'Customer Name' },
  { value: 'customer.email', label: 'Customer Email' },
  { value: 'customer.company', label: 'Customer Company' },
  { value: 'invoice.number', label: 'Invoice Number' },
  { value: 'invoice.amount', label: 'Invoice Amount' },
  { value: 'invoice.date', label: 'Invoice Date' },
  { value: 'invoice.due_date', label: 'Invoice Due Date' },
  { value: 'payroll.employee_id', label: 'Payroll Employee ID' },
  { value: 'payroll.hours', label: 'Payroll Hours' },
  { value: 'payroll.rate', label: 'Payroll Rate' },
  { value: 'payroll.overtime', label: 'Payroll Overtime' }
];

export function FieldMapper({ integrationId, onMappingChange }: FieldMapperProps) {
  const { toast } = useToast();
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchExternal, setSearchExternal] = useState('');
  const [searchInternal, setSearchInternal] = useState('');
  const [newMapping, setNewMapping] = useState({
    external_field: '',
    internal_field: '',
    field_type: 'string',
    is_required: false,
    default_value: ''
  });

  useEffect(() => {
    loadFieldMappings();
  }, [integrationId]);

  const loadFieldMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('field_mappings')
        .select('*')
        .eq('integration_id', integrationId)
        .order('external_field');

      if (error) throw error;
      setMappings(data || []);
    } catch (error) {
      console.error('Error loading field mappings:', error);
      toast({
        title: "Error",
        description: "Failed to load field mappings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveMapping = async () => {
    if (!newMapping.external_field || !newMapping.internal_field) {
      toast({
        title: "Validation Error",
        description: "Please select both external and internal fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', userData.user?.id)
        .single();

      const { error } = await supabase
        .from('field_mappings')
        .insert([{
          integration_id: integrationId,
          company_id: userProfile?.company_id,
          external_field: newMapping.external_field,
          internal_field: newMapping.internal_field,
          field_type: newMapping.field_type,
          is_required: newMapping.is_required,
          default_value: newMapping.default_value || null,
          transformation_rules: {}
        }]);

      if (error) throw error;

      await loadFieldMappings();
      setNewMapping({
        external_field: '',
        internal_field: '',
        field_type: 'string',
        is_required: false,
        default_value: ''
      });

      toast({
        title: "Success",
        description: "Field mapping saved successfully",
      });

      if (onMappingChange) {
        onMappingChange(mappings);
      }
    } catch (error) {
      console.error('Error saving field mapping:', error);
      toast({
        title: "Error",
        description: "Failed to save field mapping",
        variant: "destructive",
      });
    }
  };

  const deleteMapping = async (mappingId: string) => {
    try {
      const { error } = await supabase
        .from('field_mappings')
        .delete()
        .eq('id', mappingId);

      if (error) throw error;

      await loadFieldMappings();
      toast({
        title: "Success",
        description: "Field mapping deleted successfully",
      });

      if (onMappingChange) {
        onMappingChange(mappings);
      }
    } catch (error) {
      console.error('Error deleting field mapping:', error);
      toast({
        title: "Error",
        description: "Failed to delete field mapping",
        variant: "destructive",
      });
    }
  };

  const exportMappings = () => {
    const data = JSON.stringify(mappings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-mappings-${integrationId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredInternalFields = INTERNAL_FIELDS.filter(field =>
    field.label.toLowerCase().includes(searchInternal.toLowerCase()) ||
    field.value.toLowerCase().includes(searchInternal.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Field Mapper</h3>
          <p className="text-sm text-muted-foreground">
            Map external fields to internal system fields
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportMappings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadFieldMappings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Add New Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add New Field Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="external-field">External Field</Label>
              <Input
                id="external-field"
                placeholder="e.g., firstName"
                value={newMapping.external_field}
                onChange={(e) => setNewMapping({ ...newMapping, external_field: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="internal-field">Internal Field</Label>
              <Select
                value={newMapping.internal_field}
                onValueChange={(value) => setNewMapping({ ...newMapping, internal_field: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="relative mb-2">
                      <Input
                        placeholder="Search fields..."
                        value={searchInternal}
                        onChange={(e) => setSearchInternal(e.target.value)}
                        className="pl-8"
                      />
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {filteredInternalFields.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="field-type">Type</Label>
              <Select
                value={newMapping.field_type}
                onValueChange={(value) => setNewMapping({ ...newMapping, field_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="default-value">Default Value</Label>
              <Input
                id="default-value"
                placeholder="Optional"
                value={newMapping.default_value}
                onChange={(e) => setNewMapping({ ...newMapping, default_value: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={saveMapping} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Mapping
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Mappings */}
      <div className="grid gap-4">
        {mappings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="text-muted-foreground text-center">
                <ArrowRight className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No field mappings configured</p>
                <p className="text-sm">Add your first mapping above to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          mappings.map((mapping) => (
            <Card key={mapping.id} className="group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {mapping.external_field}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="secondary" className="text-xs">
                          {mapping.internal_field}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {mapping.field_type}
                        </Badge>
                        {mapping.is_required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                        {mapping.default_value && (
                          <Badge variant="secondary" className="text-xs">
                            Default: {mapping.default_value}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMapping(mapping.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
