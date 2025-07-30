import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Phone, User, Building, FileUp, Send, AlertCircle } from 'lucide-react';

// Phone number formatting and validation utilities
const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, '');
  
  // Handle different lengths
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  if (cleaned.length <= 10) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  
  // For 11+ digits, assume country code
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  }
  
  return `+${cleaned.slice(0, -10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
};

const validatePhoneNumber = (phone: string): { isValid: boolean; message?: string } => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 0) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  if (cleaned.length === 10) {
    return { isValid: true };
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return { isValid: true };
  }
  
  return { isValid: false, message: 'Please enter a valid 10-digit US phone number' };
};

const getCleanPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  // Ensure it has country code for API
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  return `+1${cleaned.slice(-10)}`; // Take last 10 digits and add +1
};

interface StartConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pulseCase?: {
    id: string;
    employee_name?: string;
    employee_phone?: string;
    client_id?: string;
    client_name?: string;
  };
}

interface Employee {
  id: string;
  name: string;
  phone_number: string;
  client_id: string;
  client_name: string;
}

interface VaultFile {
  id: string;
  file_name: string;
  file_size: number;
  content_type: string;
}

export const StartConversationModal = ({ isOpen, onClose, pulseCase }: StartConversationModalProps) => {
  const { toast } = useToast();
  const { userRoles } = useAuth();
  const queryClient = useQueryClient();

  const [phoneNumber, setPhoneNumber] = useState(pulseCase?.employee_phone || '');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [clientId, setClientId] = useState(pulseCase?.client_id || '');
  const [message, setMessage] = useState('');
  const [selectedVaultFile, setSelectedVaultFile] = useState<string>('');
  const [useManualPhone, setUseManualPhone] = useState(true); // Default to manual for easier testing
  const [phoneError, setPhoneError] = useState<string>('');

  const isSuperAdmin = userRoles?.includes('super_admin');
  const isCompanyAdmin = userRoles?.includes('company_admin');

  // Fetch employees based on user permissions
  const { data: employees, error: employeesError } = useQuery({
    queryKey: ['employees_for_sms', clientId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('employees')
          .select(`
            id,
            first_name,
            last_name,
            phone_number,
            company_id,
            company_settings!inner(id, company_name)
          `)
          .not('phone_number', 'is', null);

        // Apply client filtering based on permissions
        if (!isSuperAdmin && clientId) {
          query = query.eq('company_id', clientId);
        }

        const { data, error } = await query;
        if (error) {
          console.warn('Employee query failed, using fallback:', error);
          return [];
        }

        return data?.map(emp => ({
          id: emp.id,
          name: `${emp.first_name} ${emp.last_name}`,
          phone_number: emp.phone_number,
          client_id: emp.company_id,
          client_name: emp.company_settings?.company_name || 'Unknown'
        })) as Employee[];
      } catch (error) {
        console.warn('Failed to fetch employees:', error);
        return [];
      }
    },
    enabled: isOpen && !useManualPhone
  });

  // Fetch vault files for attachment
  const { data: vaultFiles } = useQuery({
    queryKey: ['vault_files_for_sms'],
    queryFn: async () => {
      // Mock vault files - replace with actual vault query
      return [
        { id: '1', file_name: 'Employee_Handbook.pdf', file_size: 2048000, content_type: 'application/pdf' },
        { id: '2', file_name: 'Benefits_Guide.pdf', file_size: 1536000, content_type: 'application/pdf' },
        { id: '3', file_name: 'Policy_Update.docx', file_size: 512000, content_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
      ] as VaultFile[];
    },
    enabled: isOpen
  });

  const startConversation = useMutation({
    mutationFn: async ({ phone, message, vaultFileId, employeeId }: {
      phone: string;
      message: string;
      vaultFileId?: string;
      employeeId?: string;
    }) => {
      // Call edge function to send SMS and create conversation
      const { data, error } = await supabase.functions.invoke('start-hali-conversation', {
        body: {
          phone_number: phone, // Use the properly formatted phone number with +1
          message,
          vault_file_id: vaultFileId,
          employee_id: employeeId,
          pulse_case_id: pulseCase?.id
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['hali_conversations'] });
      toast({
        title: "Conversation Started",
        description: `SMS sent successfully to ${phoneNumber}`,
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Start Conversation",
        description: error.message || "There was an error sending the SMS",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setPhoneNumber('');
    setSelectedEmployee('');
    setClientId('');
    setMessage('');
    setSelectedVaultFile('');
    setUseManualPhone(false);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
    
    // Validate phone number
    const validation = validatePhoneNumber(formatted);
    setPhoneError(validation.isValid ? '' : validation.message || '');
  };

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees?.find(emp => emp.id === employeeId);
    if (employee) {
      setSelectedEmployee(employeeId);
      setPhoneNumber(formatPhoneNumber(employee.phone_number));
      setClientId(employee.client_id);
      setPhoneError(''); // Clear any phone errors when selecting employee
    }
  };

  const handleSubmit = () => {
    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.message || 'Invalid phone number');
      toast({
        title: "Invalid Phone Number",
        description: phoneValidation.message || 'Please enter a valid phone number',
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Missing Message",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }

    // Clear any previous errors
    setPhoneError('');

    startConversation.mutate({
      phone: getCleanPhoneNumber(phoneNumber), // Use properly formatted phone number
      message: message.trim(),
      vaultFileId: selectedVaultFile && selectedVaultFile !== 'none' ? selectedVaultFile : undefined,
      employeeId: selectedEmployee || undefined
    });
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Start SMS Conversation
          </DialogTitle>
          <DialogDescription>
            Send an SMS message to an employee to start a new HALI conversation.
            {pulseCase && (
              <Badge variant="secondary" className="ml-2">
                From Pulse Case #{pulseCase.id.substring(0, 8)}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>Contact Method:</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={!useManualPhone ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseManualPhone(false)}
                >
                  Select Employee
                </Button>
                <Button
                  type="button"
                  variant={useManualPhone ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseManualPhone(true)}
                >
                  Manual Phone
                </Button>
              </div>
            </div>

            {!useManualPhone ? (
              <div>
                <Label htmlFor="employee">Employee</Label>
                <Select value={selectedEmployee} onValueChange={handleEmployeeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{employee.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {employee.phone_number} • {employee.client_name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(555) 123-4567"
                  className={phoneError ? 'border-destructive' : ''}
                />
                {phoneError && (
                  <p className="text-sm text-destructive mt-1">{phoneError}</p>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Message Content */}
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length}/160 characters
            </p>
          </div>

          {/* Vault File Attachment */}
          <div>
            <Label htmlFor="vaultFile">Attach Vault File (Optional)</Label>
            <Select value={selectedVaultFile} onValueChange={setSelectedVaultFile}>
              <SelectTrigger>
                <SelectValue placeholder="Select a file to attach..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No file attachment</SelectItem>
                {vaultFiles?.map((file) => (
                  <SelectItem key={file.id} value={file.id}>
                    <div className="flex items-center gap-2">
                      <FileUp className="h-4 w-4" />
                      <span>{file.file_name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(file.file_size)})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedVaultFile && selectedVaultFile !== 'none' && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>File link will expire after 24 hours</span>
                </div>
              </div>
            )}
          </div>

          {/* Current Details */}
          {phoneNumber && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Conversation Details:</p>
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{phoneNumber}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={startConversation.isPending || !phoneNumber || !message.trim() || !!phoneError}
          >
            {startConversation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};