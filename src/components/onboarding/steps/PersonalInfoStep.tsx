import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { CalendarIcon, User } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PersonalInfoStepProps {
  onboardingRecord: any;
  onboardingCode: any;
  language: 'en' | 'es';
  onStepComplete: (data: any) => void;
  stepData: any;
  saving: boolean;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onboardingRecord,
  onboardingCode,
  language,
  onStepComplete,
  stepData,
  saving
}) => {
  const [formData, setFormData] = useState({
    first_name: onboardingRecord.first_name || '',
    middle_name: onboardingRecord.middle_name || '',
    last_name: onboardingRecord.last_name || '',
    email: onboardingRecord.email || onboardingCode.employee_email || '',
    phone: onboardingRecord.phone || '',
    date_of_birth: onboardingRecord.date_of_birth ? new Date(onboardingRecord.date_of_birth) : null,
    address: onboardingRecord.address || {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States'
    },
    emergency_contact: onboardingRecord.emergency_contact || {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const translations = {
    en: {
      title: 'Personal Information',
      subtitle: 'Please provide your personal details for employment records',
      firstName: 'First Name',
      middleName: 'Middle Name (Optional)',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      dateOfBirth: 'Date of Birth',
      selectDate: 'Select date',
      address: 'Address Information',
      street: 'Street Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
      country: 'Country',
      emergencyContact: 'Emergency Contact',
      contactName: 'Contact Name',
      relationship: 'Relationship',
      contactPhone: 'Contact Phone',
      contactEmail: 'Contact Email (Optional)',
      save: 'Save and Continue',
      required: 'This field is required'
    },
    es: {
      title: 'Información Personal',
      subtitle: 'Por favor proporcione sus datos personales para los registros de empleo',
      firstName: 'Primer Nombre',
      middleName: 'Segundo Nombre (Opcional)',
      lastName: 'Apellido',
      email: 'Dirección de Correo',
      phone: 'Número de Teléfono',
      dateOfBirth: 'Fecha de Nacimiento',
      selectDate: 'Seleccionar fecha',
      address: 'Información de Dirección',
      street: 'Dirección',
      city: 'Ciudad',
      state: 'Estado',
      zipCode: 'Código Postal',
      country: 'País',
      emergencyContact: 'Contacto de Emergencia',
      contactName: 'Nombre del Contacto',
      relationship: 'Relación',
      contactPhone: 'Teléfono del Contacto',
      contactEmail: 'Email del Contacto (Opcional)',
      save: 'Guardar y Continuar',
      required: 'Este campo es obligatorio'
    }
  };

  const t = translations[language];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergency_contact: {
        ...prev.emergency_contact,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const required = ['first_name', 'last_name', 'email', 'phone'];
    const addressRequired = ['street', 'city', 'state', 'zip'];
    const emergencyRequired = ['name', 'relationship', 'phone'];

    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        return false;
      }
    }

    if (!formData.date_of_birth) {
      return false;
    }

    for (const field of addressRequired) {
      if (!formData.address[field as keyof typeof formData.address]) {
        return false;
      }
    }

    for (const field of emergencyRequired) {
      if (!formData.emergency_contact[field as keyof typeof formData.emergency_contact]) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: language === 'en' ? 'Validation Error' : 'Error de Validación',
        description: language === 'en' ? 'Please fill in all required fields' : 'Por favor complete todos los campos obligatorios',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('employee_onboarding')
        .update({
          ...formData,
          date_of_birth: formData.date_of_birth?.toISOString().split('T')[0],
          personal_info_completed: true,
          current_step: Math.max(onboardingRecord.current_step, 2)
        })
        .eq('id', onboardingRecord.id);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Information Saved' : 'Información Guardada',
        description: language === 'en' ? 'Your personal information has been saved successfully' : 'Su información personal ha sido guardada exitosamente'
      });

      onStepComplete(formData);

    } catch (err) {
      console.error('Error saving personal info:', err);
      toast({
        title: language === 'en' ? 'Error' : 'Error',
        description: language === 'en' ? 'Failed to save personal information' : 'No se pudo guardar la información personal',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <User className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="firstName">{t.firstName} *</Label>
              <Input
                id="firstName"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="middleName">{t.middleName}</Label>
              <Input
                id="middleName"
                value={formData.middle_name}
                onChange={(e) => handleInputChange('middle_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lastName">{t.lastName} *</Label>
              <Input
                id="lastName"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="email">{t.email} *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">{t.phone} *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <Label>{t.dateOfBirth} *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date_of_birth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date_of_birth ? format(formData.date_of_birth, "PPP") : <span>{t.selectDate}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date_of_birth || undefined}
                  onSelect={(date) => handleInputChange('date_of_birth', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </Card>

        {/* Address */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t.address}</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="street">{t.street} *</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                required
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">{t.city} *</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">{t.state} *</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="zip">{t.zipCode} *</Label>
                <Input
                  id="zip"
                  value={formData.address.zip}
                  onChange={(e) => handleAddressChange('zip', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t.emergencyContact}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactName">{t.contactName} *</Label>
              <Input
                id="contactName"
                value={formData.emergency_contact.name}
                onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="relationship">{t.relationship} *</Label>
              <Input
                id="relationship"
                value={formData.emergency_contact.relationship}
                onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">{t.contactPhone} *</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.emergency_contact.phone}
                onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">{t.contactEmail}</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.emergency_contact.email}
                onChange={(e) => handleEmergencyContactChange('email', e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : null}
          {t.save}
        </Button>
      </form>
    </div>
  );
};

export default PersonalInfoStep;