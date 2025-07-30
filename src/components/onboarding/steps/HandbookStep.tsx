import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface HandbookStepProps {
  onboardingRecord: any;
  onboardingCode: any;
  language: 'en' | 'es';
  onStepComplete: (data: any) => void;
  stepData: any;
  saving: boolean;
}

const HandbookStep: React.FC<HandbookStepProps> = ({ language, onStepComplete, stepData, saving }) => {
  const [loading, setLoading] = useState(false);

  const t = language === 'en' ? {
    title: 'Employee Handbook',
    subtitle: 'Review and acknowledge the employee handbook',
    save: 'I Acknowledge the Handbook'
  } : {
    title: 'Manual del Empleado',
    subtitle: 'Revisar y reconocer el manual del empleado',
    save: 'Reconozco el Manual'
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
        <p className="text-muted-foreground">Employee handbook content will be displayed here.</p>
      </Card>

      <Button onClick={handleSubmit} className="w-full" size="lg" disabled={loading}>
        {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
        {t.save}
      </Button>
    </div>
  );
};

export default HandbookStep;