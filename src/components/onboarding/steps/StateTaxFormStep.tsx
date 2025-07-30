import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface StateTaxFormStepProps {
  onboardingRecord: any;
  onboardingCode: any;
  language: 'en' | 'es';
  onStepComplete: (data: any) => void;
}

const StateTaxFormStep: React.FC<StateTaxFormStepProps> = ({
  onboardingRecord,
  onboardingCode,
  language,
  onStepComplete
}) => {
  const [loading, setLoading] = useState(false);

  const t = language === 'en' ? {
    title: 'State Tax Form',
    subtitle: 'Complete your state tax withholding information',
    save: 'Save State Tax Information'
  } : {
    title: 'Formulario de Impuestos Estatales',
    subtitle: 'Complete su información de retención de impuestos estatales',
    save: 'Guardar Información de Impuestos Estatales'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onStepComplete({});
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <Card className="p-6">
        <p>State: {onboardingCode.work_state}</p>
        <p className="text-muted-foreground mt-2">State tax form for {onboardingCode.work_state} will be displayed here.</p>
      </Card>

      <Button onClick={handleSubmit} className="w-full" size="lg" disabled={loading}>
        {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
        {t.save}
      </Button>
    </div>
  );
};

export default StateTaxFormStep;