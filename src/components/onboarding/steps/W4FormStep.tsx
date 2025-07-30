import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface W4FormStepProps {
  onboardingRecord: any;
  onboardingCode: any;
  language: 'en' | 'es';
  onStepComplete: (data: any) => void;
}

const W4FormStep: React.FC<W4FormStepProps> = ({
  onboardingRecord,
  onboardingCode,
  language,
  onStepComplete
}) => {
  const [formData, setFormData] = useState({
    filing_status: '',
    step2_checkbox: false,
    step3_dependents: '',
    step4a_other_income: '',
    step4b_deductions: '',
    step4c_extra_withholding: '',
    multiple_jobs: false,
    spouse_works: false
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const translations = {
    en: {
      title: 'W-4 Employee\'s Withholding Certificate',
      subtitle: 'Complete your federal tax withholding information',
      step1: 'Step 1: Personal Information',
      step2: 'Step 2: Multiple Jobs or Spouse Works',
      step3: 'Step 3: Claim Dependents',
      step4: 'Step 4: Other Adjustments',
      filingStatus: 'Filing Status',
      single: 'Single or Married filing separately',
      marriedJoint: 'Married filing jointly',
      headOfHousehold: 'Head of household',
      multipleJobs: 'Complete this section if you hold more than one job at a time',
      multipleJobsCheck: 'I have multiple jobs or my spouse works',
      dependents: 'Multiply number of qualifying children under age 17 by $2,000',
      dependentsPlaceholder: 'Enter amount',
      otherIncome: 'Other income (not from jobs)',
      deductions: 'Deductions',
      extraWithholding: 'Extra withholding',
      save: 'Save W-4 Information',
      previewAndSign: 'Preview and Sign'
    },
    es: {
      title: 'W-4 Certificado de Retención del Empleado',
      subtitle: 'Complete su información de retención de impuestos federales',
      step1: 'Paso 1: Información Personal',
      step2: 'Paso 2: Múltiples Trabajos o Cónyuge Trabaja',
      step3: 'Paso 3: Reclamar Dependientes',
      step4: 'Paso 4: Otros Ajustes',
      filingStatus: 'Estado Civil',
      single: 'Soltero o Casado declarando por separado',
      marriedJoint: 'Casado declarando en conjunto',
      headOfHousehold: 'Cabeza de familia',
      multipleJobs: 'Complete esta sección si tiene más de un trabajo a la vez',
      multipleJobsCheck: 'Tengo múltiples trabajos o mi cónyuge trabaja',
      dependents: 'Multiplique el número de hijos calificados menores de 17 años por $2,000',
      dependentsPlaceholder: 'Ingrese cantidad',
      otherIncome: 'Otros ingresos (no de trabajos)',
      deductions: 'Deducciones',
      extraWithholding: 'Retención adicional',
      save: 'Guardar Información W-4',
      previewAndSign: 'Vista Previa y Firmar'
    }
  };

  const t = translations[language];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.filing_status) {
      toast({
        title: language === 'en' ? 'Validation Error' : 'Error de Validación',
        description: language === 'en' ? 'Please select your filing status' : 'Por favor seleccione su estado civil',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Save form data
      const { error: formError } = await supabase
        .from('onboarding_form_data')
        .upsert({
          employee_onboarding_id: onboardingRecord.id,
          form_type: 'w4',
          form_data: formData,
          completed_at: new Date().toISOString()
        });

      if (formError) throw formError;

      // Update onboarding record
      const { error: recordError } = await supabase
        .from('employee_onboarding')
        .update({
          w4_completed: true,
          current_step: Math.max(onboardingRecord.current_step, 3)
        })
        .eq('id', onboardingRecord.id);

      if (recordError) throw recordError;

      toast({
        title: language === 'en' ? 'W-4 Form Saved' : 'Formulario W-4 Guardado',
        description: language === 'en' ? 'Your W-4 information has been saved successfully' : 'Su información W-4 ha sido guardada exitosamente'
      });

      onStepComplete(formData);

    } catch (err) {
      console.error('Error saving W-4 form:', err);
      toast({
        title: language === 'en' ? 'Error' : 'Error',
        description: language === 'en' ? 'Failed to save W-4 form' : 'No se pudo guardar el formulario W-4',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Personal Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t.step1}</h3>
          <div>
            <Label>{t.filingStatus} *</Label>
            <Select value={formData.filing_status} onValueChange={(value) => handleInputChange('filing_status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select filing status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">{t.single}</SelectItem>
                <SelectItem value="married_jointly">{t.marriedJoint}</SelectItem>
                <SelectItem value="head_of_household">{t.headOfHousehold}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Step 2: Multiple Jobs */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t.step2}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t.multipleJobs}</p>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="multipleJobs"
              checked={formData.step2_checkbox}
              onCheckedChange={(checked) => handleInputChange('step2_checkbox', checked)}
            />
            <Label htmlFor="multipleJobs">{t.multipleJobsCheck}</Label>
          </div>
        </Card>

        {/* Step 3: Dependents */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t.step3}</h3>
          <div>
            <Label htmlFor="dependents">{t.dependents}</Label>
            <Input
              id="dependents"
              type="number"
              placeholder={t.dependentsPlaceholder}
              value={formData.step3_dependents}
              onChange={(e) => handleInputChange('step3_dependents', e.target.value)}
            />
          </div>
        </Card>

        {/* Step 4: Other Adjustments */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t.step4}</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="otherIncome">{t.otherIncome}</Label>
              <Input
                id="otherIncome"
                type="number"
                placeholder="0"
                value={formData.step4a_other_income}
                onChange={(e) => handleInputChange('step4a_other_income', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="deductions">{t.deductions}</Label>
              <Input
                id="deductions"
                type="number"
                placeholder="0"
                value={formData.step4b_deductions}
                onChange={(e) => handleInputChange('step4b_deductions', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="extraWithholding">{t.extraWithholding}</Label>
              <Input
                id="extraWithholding"
                type="number"
                placeholder="0"
                value={formData.step4c_extra_withholding}
                onChange={(e) => handleInputChange('step4c_extra_withholding', e.target.value)}
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

export default W4FormStep;