import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';

interface CAWageNoticeStepProps {
  onboardingCode: any;
  onboardingRecord: any;
  onStepComplete: (data: any) => void;
  language: 'en' | 'es';
  stepData: any;
  saving: boolean;
}

export const CAWageNoticeStep: React.FC<CAWageNoticeStepProps> = ({
  onboardingCode,
  onStepComplete,
  stepData,
  saving
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    regularRate: stepData.regularRate || '',
    overtimeRate: stepData.overtimeRate || '',
    payPeriod: stepData.payPeriod || '',
    payday: stepData.payday || '',
    acknowledged: stepData.acknowledged || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acknowledged) {
      alert(t('onboarding.steps.caWageNotice.acknowledgment'));
      return;
    }
    onStepComplete(formData);
  };

  // Only show for California employees
  if (onboardingCode.work_state !== 'CA') {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            CA Wage Notice not required for {onboardingCode.work_state} employees
          </p>
          <Button onClick={() => onStepComplete({ skipped: true })} disabled={saving}>
            {t('common.continue')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>{t('onboarding.steps.caWageNotice.title')}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('onboarding.steps.caWageNotice.description')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regularRate">{t('onboarding.steps.caWageNotice.regularRate')}</Label>
              <Input
                id="regularRate"
                type="number"
                step="0.01"
                value={formData.regularRate}
                onChange={(e) => setFormData(prev => ({ ...prev, regularRate: e.target.value }))}
                placeholder="15.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overtimeRate">{t('onboarding.steps.caWageNotice.overtime')}</Label>
              <Input
                id="overtimeRate"
                type="number"
                step="0.01"
                value={formData.overtimeRate}
                onChange={(e) => setFormData(prev => ({ ...prev, overtimeRate: e.target.value }))}
                placeholder="22.50"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payPeriod">{t('onboarding.steps.caWageNotice.payPeriod')}</Label>
              <Input
                id="payPeriod"
                value={formData.payPeriod}
                onChange={(e) => setFormData(prev => ({ ...prev, payPeriod: e.target.value }))}
                placeholder="Bi-weekly"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payday">{t('onboarding.steps.caWageNotice.payday')}</Label>
              <Input
                id="payday"
                value={formData.payday}
                onChange={(e) => setFormData(prev => ({ ...prev, payday: e.target.value }))}
                placeholder="Every other Friday"
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">{t('onboarding.steps.caWageNotice.allowances')}</h4>
            <p className="text-sm text-muted-foreground">
              Review allowances and deductions information provided by your employer.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="acknowledged"
              checked={formData.acknowledged}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acknowledged: checked as boolean }))}
              required
            />
            <Label htmlFor="acknowledged" className="text-sm">
              {t('onboarding.steps.caWageNotice.acknowledgment')} <span className="text-destructive">*</span>
            </Label>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !formData.acknowledged}>
              {saving ? 'Saving...' : t('common.continue')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CAWageNoticeStep;