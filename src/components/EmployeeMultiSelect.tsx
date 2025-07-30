import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position?: string;
}

interface EmployeeMultiSelectProps {
  selectedEmployeeIds?: string[];
  onEmployeesChange: (employeeIds: string[]) => void;
  clientId?: string;
  className?: string;
  disabled?: boolean;
}

export const EmployeeMultiSelect = ({
  selectedEmployeeIds = [],
  onEmployeesChange,
  clientId,
  className,
  disabled = false
}: EmployeeMultiSelectProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchEmployeesForClient();
    } else {
      setEmployees([]);
    }
  }, [clientId]);

  const fetchEmployeesForClient = async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      
      // First get the client's company_settings_id
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('company_settings_id')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      if (!client?.company_settings_id) {
        setEmployees([]);
        return;
      }

      // Then get employees for that company
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email, position')
        .eq('company_id', client.company_settings_id)
        .order('first_name');

      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployees = employees.filter(emp => selectedEmployeeIds.includes(emp.id));

  const handleEmployeeToggle = (employeeId: string) => {
    const newSelected = selectedEmployeeIds.includes(employeeId)
      ? selectedEmployeeIds.filter(id => id !== employeeId)
      : [...selectedEmployeeIds, employeeId];
    
    onEmployeesChange(newSelected);
  };

  const removeEmployee = (employeeId: string) => {
    onEmployeesChange(selectedEmployeeIds.filter(id => id !== employeeId));
  };

  const getEmployeeDisplayName = (employee: Employee) => {
    return `${employee.first_name} ${employee.last_name}`;
  };

  return (
    <div className={className}>
      <Label>Related Employees</Label>
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={disabled || !clientId}
            >
              {!clientId ? (
                "Select a client first"
              ) : selectedEmployeeIds.length === 0 ? (
                "Select employees..."
              ) : (
                `${selectedEmployeeIds.length} employee${selectedEmployeeIds.length > 1 ? 's' : ''} selected`
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search employees..." />
              <CommandEmpty>
                {loading ? "Loading employees..." : !clientId ? "Select a client first" : "No employees found."}
              </CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {employees.map((employee) => (
                  <CommandItem
                    key={employee.id}
                    value={`${employee.first_name} ${employee.last_name} ${employee.email}`}
                    onSelect={() => handleEmployeeToggle(employee.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedEmployeeIds.includes(employee.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{getEmployeeDisplayName(employee)}</span>
                      <span className="text-sm text-muted-foreground">
                        {employee.email}
                        {employee.position && ` • ${employee.position}`}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedEmployees.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedEmployees.map((employee) => (
              <Badge key={employee.id} variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {getEmployeeDisplayName(employee)}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeEmployee(employee.id)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};