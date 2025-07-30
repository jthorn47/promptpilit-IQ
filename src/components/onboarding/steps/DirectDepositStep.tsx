import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

interface DirectDepositStepProps {
  onboardingRecord: any;
  onboardingCode: any;
  language: 'en' | 'es';
  onStepComplete: (data: any) => void;
  stepData: any;
  saving: boolean;
}

const DirectDepositStep: React.FC<DirectDepositStepProps> = ({ language, onStepComplete, stepData, saving }) => {
  const [loading, setLoading] = useState(false);

  const t = language === 'en' ? {
    title: 'Direct Deposit Setup',
    subtitle: 'Set up your direct deposit information',
    save: 'Save Direct Deposit Information'
  } : {
    title: 'Configuración de Depósito Directo',
    subtitle: 'Configure su información de depósito directo',
    save: 'Guardar Información de Depósito Directo'
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
        <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <Card className="p-6">
        <p className="text-muted-foreground">Direct deposit form will be displayed here.</p>
      </Card>

      <Button onClick={handleSubmit} className="w-full" size="lg" disabled={loading}>
        {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
        {t.save}
      </Button>
    </div>
  );
};

export default DirectDepositStep;